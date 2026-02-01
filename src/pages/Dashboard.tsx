import React, { useMemo, useState, useRef } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, Cell
} from 'recharts';
import { Download, ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity, Upload, Image as ImageIcon, Info } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import type { Transaction } from '../utils/excelParser';
import {
    calculateMetrics, getMonthlyFlow, getExpensesByCategory,
    getTransactionsByPayment, getTopVendors, getRecentTransactions
} from '../utils/analytics';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useCurrency } from '../context/CurrencyContext';

const Dashboard: React.FC = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const { format } = useCurrency();
    const data = location.state?.data as Transaction[];
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for filters
    const [selectedYear, setSelectedYear] = useState<string>(() => {
        const currentYear = new Date().getFullYear().toString();
        const hasYear = data.some(t => t.transaction_date.split('/')[2] === currentYear);
        return hasYear ? currentYear : 'all';
    });
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const currentYear = new Date().getFullYear().toString();
        const hasMonth = data.some(t => {
            const [, m, y] = t.transaction_date.split('/');
            return m === currentMonth && y === currentYear;
        });
        return hasMonth ? currentMonth : 'all';
    });
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);

    if (!data || data.length === 0) {
        return <Navigate to="/upload" replace />;
    }

    // Extract filter options from data
    const years = useMemo(() => {
        const set = new Set(data.map(t => t.transaction_date.split('/')[2]));
        return Array.from(set).sort();
    }, [data]);

    const months = [
        { val: '01', name: 'January' }, { val: '02', name: 'February' }, { val: '03', name: 'March' },
        { val: '04', name: 'April' }, { val: '05', name: 'May' }, { val: '06', name: 'June' },
        { val: '07', name: 'July' }, { val: '08', name: 'August' }, { val: '09', name: 'September' },
        { val: '10', name: 'October' }, { val: '11', name: 'November' }, { val: '12', name: 'December' }
    ];

    const categories = useMemo(() => {
        const set = new Set(data.map(t => t.category));
        return Array.from(set).sort();
    }, [data]);

    // Filtering logic
    const filteredData = useMemo(() => {
        return data.filter(t => {
            const [, m, y] = t.transaction_date.split('/');
            const matchesYear = selectedYear === 'all' || y === selectedYear;
            const matchesMonth = selectedMonth === 'all' || m === selectedMonth;
            const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
            const matchesType = selectedType === 'all' || t.type_vendor_customer === selectedType;
            return matchesYear && matchesMonth && matchesCategory && matchesType;
        });
    }, [data, selectedYear, selectedMonth, selectedCategory, selectedType]);

    // Special filtered data for "Expenses by Category" chart (must NOT be affected by category filter)
    const dataForCategoryChart = useMemo(() => {
        return data.filter(t => {
            const [, m, y] = t.transaction_date.split('/');
            const matchesYear = selectedYear === 'all' || y === selectedYear;
            const matchesMonth = selectedMonth === 'all' || m === selectedMonth;
            const matchesType = selectedType === 'all' || t.type_vendor_customer === selectedType;
            return matchesYear && matchesMonth && matchesType;
        });
    }, [data, selectedYear, selectedMonth, selectedType]);

    const metrics = useMemo(() => calculateMetrics(filteredData), [filteredData]);
    const monthlyFlow = useMemo(() => getMonthlyFlow(filteredData), [filteredData]);
    const categoryExpenses = useMemo(() => getExpensesByCategory(dataForCategoryChart), [dataForCategoryChart]);
    const paymentMethods = useMemo(() => getTransactionsByPayment(filteredData), [filteredData]);
    const topVendors = useMemo(() => getTopVendors(filteredData), [filteredData]);

    // Recent transactions filtered by selected month/year
    const actualFilteredTransactions = useMemo(() => {
        return getRecentTransactions(filteredData);
    }, [filteredData]);

    // Cash flow summary analysis
    const cashFlowSummary = useMemo(() => {
        if (monthlyFlow.length === 0) return null;

        const expenseGrowthMonths = monthlyFlow
            .filter((val, i, arr) => i > 0 && val.expense > arr[i - 1].expense)
            .map(v => v.name);

        const highIncomeMonths = monthlyFlow
            .filter((val, i, arr) => i > 0 && val.income > arr[i - 1].income)
            .map(v => v.name);

        return t('dashboard.summary.increase', {
            months: expenseGrowthMonths.slice(-2).join(', '),
            incomeMonths: highIncomeMonths.slice(-2).join(', ')
        });
    }, [monthlyFlow, t]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompanyLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const exportPDF = () => {
        const input = document.getElementById('dashboard-content');
        if (input) {
            // Create a temporary summary element to include in the capture
            const summaryEl = document.createElement('div');
            summaryEl.style.padding = '20px';
            summaryEl.style.backgroundColor = '#f8fafc';
            summaryEl.style.borderBottom = '2px solid #e2e8f0';
            summaryEl.style.marginBottom = '20px';
            summaryEl.style.borderRadius = '8px';

            const monthName = selectedMonth === 'all' ? t('dashboard.filters.all') : months.find(m => m.val === selectedMonth)?.name;
            const summaryText = `Documento filtrado con Fecha: ${selectedYear} / ${monthName}, Categoría: ${selectedCategory}, Tipo: ${selectedType}`;

            summaryEl.innerHTML = `
                <h2 style="margin: 0 0 10px 0; color: #1e293b; font-size: 18px; font-weight: bold;">Reporte Financiero</h2>
                <p style="margin: 0; color: #64748b; font-size: 14px;">${summaryText}</p>
                <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">Generado el: ${new Date().toLocaleString(i18n.language)}</p>
            `;

            input.prepend(summaryEl);

            html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`FinanceReport_${selectedYear}_${selectedMonth}.pdf`);

                // Remove temporary summary
                input.removeChild(summaryEl);
            });
        }
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header Actions */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/upload">
                            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                                {t('common.uploadAnother')}
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            leftIcon={companyLogo ? <ImageIcon className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        >
                            {companyLogo ? t('dashboard.logo.change') : t('dashboard.logo.upload')}
                        </Button>
                        <Button onClick={exportPDF} size="sm" leftIcon={<Download className="w-4 h-4" />}>
                            {t('common.downloadPDF')}
                        </Button>
                    </div>
                </div>
            </div>

            <div id="dashboard-content" className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-gray-50">

                {/* Logo and Report Info */}
                <div className="flex justify-between items-start">
                    {companyLogo && (
                        <div className="mb-4">
                            <img src={companyLogo} alt="Company Logo" className="h-16 object-contain" />
                        </div>
                    )}
                    <div className="text-right text-sm text-gray-500">
                        <p>{new Date().toLocaleDateString(i18n.language)}</p>
                        <p>{t('dashboard.title')}</p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-4 bg-white border-none shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('dashboard.filters.year')}</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">{t('dashboard.filters.all')}</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('dashboard.filters.month')}</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">{t('dashboard.filters.all')}</option>
                                {months.map(m => <option key={m.val} value={m.val}>{t(`dashboard.months.${m.name.toLowerCase()}`, m.name)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('dashboard.filters.category')}</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">{t('dashboard.filters.all')}</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('dashboard.filters.type')}</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">{t('dashboard.filters.all')}</option>
                                <option value="vendor">{t('dashboard.filters.vendor')}</option>
                                <option value="customer">{t('dashboard.filters.customer')}</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t('dashboard.metrics.totalIncome')}</p>
                                <p className="text-2xl font-bold text-gray-900">{format(metrics.income)}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-l-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t('dashboard.metrics.totalExpenses')}</p>
                                <p className="text-2xl font-bold text-gray-900">{format(metrics.expense)}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-full">
                                <TrendingDown className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-l-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t('dashboard.metrics.netBalance')}</p>
                                <p className={`text-2xl font-bold ${metrics.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {format(metrics.balance)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-l-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t('dashboard.metrics.transactions')}</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.count}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Cash Flow Analysis Dialog/Box */}
                {cashFlowSummary && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Info className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-blue-900 mb-1">{t('dashboard.summary.title')}</h3>
                            <p className="text-blue-800 text-sm leading-relaxed">{cashFlowSummary}</p>
                        </div>
                    </div>
                )}

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-6">{t('dashboard.charts.cashFlow')}</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyFlow}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tickFormatter={(value) => format(Number(value)).split(',')[0]} tick={{ fontSize: 10 }} width={60} />
                                    <Tooltip formatter={(value) => format(Number(value))} />
                                    <Legend />
                                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name={t('dashboard.charts.income')} />
                                    <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} name={t('dashboard.charts.expense')} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-6">{t('dashboard.charts.expensesByCategory')}</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={categoryExpenses}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" tickFormatter={(value) => format(Number(value)).split(',')[0]} tick={{ fontSize: 10 }} />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(value) => format(Number(value))} />
                                    <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                                        {categoryExpenses.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="p-6 lg:col-span-1">
                        <h3 className="text-lg font-semibold mb-6">{t('dashboard.charts.paymentMethods')}</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentMethods}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                        {paymentMethods.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card className="p-6 lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-6">{t('dashboard.charts.topEntities')}</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topVendors}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tickFormatter={(value) => format(Number(value)).split(',')[0]} tick={{ fontSize: 10 }} width={60} />
                                    <Tooltip formatter={(value) => format(Number(value))} />
                                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Recent Transactions Table */}
                <Card className="overflow-hidden border-none shadow-sm">
                    <div className="p-6 border-b border-gray-100 bg-white">
                        <h3 className="text-lg font-semibold">{t('dashboard.table.title')}</h3>
                    </div>
                    <div className="overflow-x-auto bg-white">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold tracking-wider">{t('dashboard.table.date')}</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">{t('dashboard.table.type')}</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">{t('dashboard.table.category')}</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">{t('dashboard.table.entity')}</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-right">{t('dashboard.table.amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {actualFilteredTransactions.map((t_row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{t_row.transaction_date}</td>
                                        <td className="px-6 py-4 capitalize whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t_row.transaction_type.toLowerCase().includes('income') || t_row.transaction_type.toLowerCase().includes('ingreso')
                                                ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {t_row.transaction_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{t_row.category}</td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap truncate max-w-[200px]">{t_row.vendor_customer}</td>
                                        <td className={`px-6 py-4 text-right font-bold tabular-nums ${t_row.transaction_type.toLowerCase().includes('income') || t_row.transaction_type.toLowerCase().includes('ingreso')
                                            ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {format(t_row.amount)}
                                        </td>
                                    </tr>
                                ))}
                                {actualFilteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                            No se encontraron transacciones para estos filtros
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default Dashboard;
