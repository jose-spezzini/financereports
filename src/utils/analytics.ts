import type { Transaction } from './excelParser';

const getMonthName = (dateStr: string) => {
    // Assumes DD/MM/YYYY
    const Parts = dateStr.split('/');
    if (Parts.length !== 3) return dateStr;
    const date = new Date(Number(Parts[2]), Number(Parts[1]) - 1, Number(Parts[0]));
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
};

const getSortableDate = (dateStr: string) => {
    const Parts = dateStr.split('/');
    if (Parts.length !== 3) return 0;
    return new Date(Number(Parts[2]), Number(Parts[1]) - 1, Number(Parts[0])).getTime();
};

export const calculateMetrics = (data: Transaction[]) => {
    const isIncome = (t: Transaction) => t.transaction_type.toLowerCase().includes('income') || t.transaction_type.toLowerCase().includes('ingreso');
    const isExpense = (t: Transaction) => t.transaction_type.toLowerCase().includes('expense') || t.transaction_type.toLowerCase().includes('gasto');

    const income = data.filter(isIncome).reduce((sum, t) => sum + t.amount, 0);
    const expense = data.filter(isExpense).reduce((sum, t) => sum + t.amount, 0);

    return {
        income,
        expense,
        balance: income - expense,
        count: data.length
    };
};

export const getMonthlyFlow = (data: Transaction[]) => {
    const map = new Map<string, { income: number; expense: number; timestamp: number }>();

    data.forEach(t => {
        const month = getMonthName(t.transaction_date);
        if (!map.has(month)) {
            map.set(month, { income: 0, expense: 0, timestamp: getSortableDate(t.transaction_date) });
        }

        const entry = map.get(month)!;
        if (t.transaction_type.toLowerCase().includes('income') || t.transaction_type.toLowerCase().includes('ingreso')) {
            entry.income += t.amount;
        } else {
            entry.expense += t.amount;
        }
    });

    return Array.from(map.entries())
        .map(([name, val]) => ({ name, ...val }))
        .sort((a, b) => a.timestamp - b.timestamp);
};

export const getExpensesByCategory = (data: Transaction[]) => {
    const map = new Map<string, number>();

    data
        .filter(t => t.transaction_type.toLowerCase().includes('expense') || t.transaction_type.toLowerCase().includes('gasto'))
        .forEach(t => {
            const cat = t.category;
            map.set(cat, (map.get(cat) || 0) + t.amount);
        });

    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
};

export const getTransactionsByPayment = (data: Transaction[]) => {
    const map = new Map<string, number>();
    data.forEach(t => {
        const method = t.payment_method;
        map.set(method, (map.get(method) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
};

export const getTopVendors = (data: Transaction[]) => {
    const map = new Map<string, number>();
    data.forEach(t => {
        const vendor = t.vendor_customer || 'Unknown';
        map.set(vendor, (map.get(vendor) || 0) + t.amount);
    });
    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
};

export const getRecentTransactions = (data: Transaction[]) => {
    return [...data]
        .sort((a, b) => getSortableDate(b.transaction_date) - getSortableDate(a.transaction_date))
        .slice(0, 20);
};
