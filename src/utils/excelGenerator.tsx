import * as XLSX from 'xlsx-js-style';

export const downloadTemplate = () => {
    const headers = [
        "transaction_date",
        "transaction_type",
        "category",
        "amount",
        "currency",
        "payment_method",
        "type_vendor_customer",
        "cost_center",
        "vendor_customer",
        "invoice_number",
        "project",
        "account_code",
        "notes"
    ];

    const mandatoryFields = [
        "transaction_date",
        "transaction_type",
        "category",
        "amount",
        "currency",
        "payment_method",
        "type_vendor_customer"
    ];

    const data = [
        {
            transaction_date: "15/01/2026",
            transaction_type: "income",
            category: "Sales",
            amount: 5000,
            currency: "USD",
            payment_method: "Wire Transfer",
            type_vendor_customer: "customer",
            cost_center: "Revenue",
            vendor_customer: "Acme Corp",
            invoice_number: "INV-2024-001",
            project: "Q1 Campaign",
            account_code: "4000",
            notes: "January Retainer"
        },
        {
            transaction_date: "18/01/2026",
            transaction_type: "expense",
            category: "Software",
            amount: 450,
            currency: "USD",
            payment_method: "Credit Card",
            type_vendor_customer: "vendor",
            cost_center: "IT",
            vendor_customer: "AWS",
            invoice_number: "AWS-jan",
            project: "Infrastructure",
            account_code: "6000",
            notes: "Cloud hosting"
        },
        {
            transaction_date: "20/01/2026",
            transaction_type: "expense",
            category: "Office Supplies",
            amount: 125.50,
            currency: "USD",
            payment_method: "Credit Card",
            type_vendor_customer: "vendor",
            cost_center: "Admin",
            vendor_customer: "Staples",
            invoice_number: "ST-889",
            project: "",
            account_code: "6100",
            notes: "Paper and ink"
        }
    ];

    // Create worksheet with data and headers
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });

    // Apply styles to headers
    const range = XLSX.utils.decode_range(ws['!ref'] || "A1:M1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!ws[address]) continue;

        const headerName = ws[address].v;
        const isMandatory = mandatoryFields.includes(headerName);

        ws[address].s = {
            fill: {
                fgColor: { rgb: isMandatory ? "FFFF00" : "FFFFFF" }
            },
            font: {
                bold: true,
                color: { rgb: "000000" }
            },
            alignment: {
                horizontal: "center",
                vertical: "center"
            },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            }
        };
    }

    // Set column widths
    const wscols = headers.map(() => ({ wch: 20 }));
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "transactions_finance");

    XLSX.writeFile(wb, "FinanceReports_Template.xlsx");
};
