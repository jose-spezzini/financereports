import * as XLSX from 'xlsx';

export interface Transaction {
    transaction_date: string;
    transaction_type: string;
    category: string;
    amount: number;
    currency: string;
    payment_method: string;
    cost_center?: string;
    vendor_customer?: string;
    type_vendor_customer?: 'vendor' | 'customer';
    invoice_number?: string;
    project?: string;
    account_code?: string;
    notes?: string;
    // Parsed
    dateObj?: Date;
    id: string; // Unique ID for React keys
}

export interface ValidationError {
    row: number;
    column: string;
    message: string;
}

const REQUIRED_COLUMNS = [
    "transaction_date",
    "transaction_type",
    "category",
    "amount",
    "currency",
    "payment_method",
    "type_vendor_customer"
];

const isValidDate = (dateStr: any): { valid: boolean, date?: Date } => {
    if (dateStr instanceof Date) return { valid: true, date: dateStr };

    // Handle Excel serial dates (if they come through as numbers)
    if (typeof dateStr === 'number') {
        const d = new Date((dateStr - 25569) * 86400 * 1000);
        if (!isNaN(d.getTime())) return { valid: true, date: d };
    }

    if (typeof dateStr !== 'string') return { valid: false };

    // Support multiple formats: DD/MM/YYYY, YYYY/MM/DD, DD-MM-YYYY, YYYY-MM-DD
    const formats = [
        { regex: /^(\d{2})[/-](\d{2})[/-](\d{4})$/, order: 'DMY' },
        { regex: /^(\d{4})[/-](\d{2})[/-](\d{2})$/, order: 'YMD' }
    ];

    for (const fmt of formats) {
        const match = dateStr.match(fmt.regex);
        if (match) {
            let day, month, year;
            if (fmt.order === 'DMY') {
                [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
            } else {
                [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
            }
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
                return { valid: true, date };
            }
        }
    }

    return { valid: false };
};

export const parseAndValidateExcel = async (file: File): Promise<{ data: Transaction[], errors: ValidationError[] }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });

                if (!workbook.SheetNames.includes('transactions_finance')) {
                    resolve({ data: [], errors: [{ row: 0, column: 'Sheet', message: 'Falta la hoja "transactions_finance". ¿Usaste el template correcto?' }] });
                    return;
                }

                const sheet = workbook.Sheets['transactions_finance'];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[];

                if (jsonData.length === 0) {
                    resolve({ data: [], errors: [{ row: 0, column: 'Data', message: 'El archivo está vacío' }] });
                    return;
                }

                const errors: ValidationError[] = [];
                const validRows: Transaction[] = [];

                jsonData.forEach((row, index) => {
                    const rowNum = index + 2; // 1-index + header
                    let hasRowError = false;

                    // Header order independence is naturally handled by sheet_to_json
                    // which uses the first row values as keys.
                    REQUIRED_COLUMNS.forEach(col => {
                        if (row[col] === undefined || row[col] === "" || row[col] === null) {
                            errors.push({ row: rowNum, column: col, message: 'Campo requerido faltante' });
                            hasRowError = true;
                        }
                    });

                    if (row.amount && isNaN(Number(row.amount))) {
                        errors.push({ row: rowNum, column: 'amount', message: 'Debe ser un valor numérico' });
                        hasRowError = true;
                    }

                    if (row.transaction_date) {
                        const { valid, date } = isValidDate(row.transaction_date);
                        if (!valid) {
                            errors.push({ row: rowNum, column: 'transaction_date', message: 'Formato inválido. Use DD/MM/YYYY o YYYY/MM/DD' });
                            hasRowError = true;
                        } else if (date) {
                            // Normalize to DD/MM/YYYY string for the rest of the app
                            const d = date.getDate().toString().padStart(2, '0');
                            const m = (date.getMonth() + 1).toString().padStart(2, '0');
                            const y = date.getFullYear();
                            row.transaction_date = `${d}/${m}/${y}`;
                            row.dateObj = date;
                        }
                    }

                    if (!hasRowError) {
                        validRows.push({
                            ...row,
                            amount: Number(row.amount),
                            id: `${rowNum}-${Date.now()}`
                        } as Transaction);
                    }
                });

                resolve({ data: validRows, errors });

            } catch (error) {
                console.error("Parse error:", error);
                resolve({ data: [], errors: [{ row: 0, column: 'File', message: 'Error al leer el archivo. Asegúrate de que no esté corrupto.' }] });
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
