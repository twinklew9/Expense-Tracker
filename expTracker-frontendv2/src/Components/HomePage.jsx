import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import OverviewDashboard from './Dashboards/Overview';
import TransactionsDashboard from './Dashboards/Transactions';
import BudgetsDashboard from './Dashboards/Budgets';
import RecurringDashboard from './Dashboards/Recurring';
import ReportsDashboard from './Dashboards/Reports';
import CategoriesDashboard from './Dashboards/Categories';

const API = 'http://localhost:8082';

const HomePage = () => {
    const navigate = useNavigate();

    const [activeDashboard, setActiveDashboard] = useState('overview');

    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);

    const [analytics, setAnalytics] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categorySpending: [],
        monthlyTrend: []
    });

    const [financeOverview, setFinanceOverview] = useState({
        monthlyBudget: 0,
        spentThisMonth: 0,
        remaining: 0,
        budgetPercentage: 0,
        categoryBudgets: [],
        insights: [],
        recurringTransactions: []
    });

    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        description: '',
        date: '',
        categoryId: '',
        icon: '💸',
        type: 'expense'
    });

    const [editingId, setEditingId] = useState(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const user = (() => {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        if (!user) {
            localStorage.removeItem('user');
            navigate('/login');
            return;
        }

        loadPage();
    }, []);

    const getErrorMessage = (error) => {
        return (
            error.response?.data?.Value ||
            error.response?.data?.error ||
            error.response?.data?.message ||
            'Something went wrong'
        );
    };

    const loadPage = async () => {
        await Promise.all([
            fetchCategories(),
            fetchExpenses(1),
            fetchAnalytics(),
            fetchFinanceOverview()
        ]);
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(
                `${API}/get-categories`,
                {
                    withCredentials: true
                }
            );

            setCategories(response.data || []);
        } catch (error) {
            console.error('Category fetch error:', error);
        }
    };

    const fetchExpenses = async (page = currentPage) => {
        try {
            const response = await axios.get(
                `${API}/get-expenses`,
                {
                    params: {
                        pageNumber: page,
                        numberOfRecordsPerPage: recordsPerPage
                    },
                    withCredentials: true
                }
            );

            setExpenses(response.data.expenses || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Expense fetch error:', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(
                `${API}/analytics`,
                {
                    withCredentials: true
                }
            );

            const data = response.data || {};

            const normalizedCategories = (
                data.categorySpending || []
            ).map((item) => ({
                categoryName:
                    item.categoryName ||
                    item.category ||
                    item.name ||
                    'Uncategorized',

                amount: Number(
                    item.totalAmount ??
                    item.amount ??
                    item.total ??
                    0
                )
            }));

            setAnalytics({
                totalIncome: Number(data.totalIncome) || 0,
                totalExpense: Number(data.totalExpense) || 0,
                balance: Number(data.balance) || 0,
                categorySpending: normalizedCategories,
                monthlyTrend: data.monthlyTrend || []
            });
        } catch (error) {
            console.error('Analytics fetch error:', error);
        }
    };

    const fetchFinanceOverview = async () => {
        try {
            const response = await axios.get(
                `${API}/finance/overview`,
                {
                    withCredentials: true
                }
            );

            setFinanceOverview({
                monthlyBudget:
                    Number(response.data.monthlyBudget) || 0,

                spentThisMonth:
                    Number(response.data.spentThisMonth) || 0,

                remaining:
                    Number(response.data.remaining) || 0,

                budgetPercentage:
                    Number(response.data.budgetPercentage) || 0,

                categoryBudgets:
                    response.data.categoryBudgets || [],

                insights:
                    response.data.insights || [],

                recurringTransactions:
                    response.data.recurringTransactions || []
            });
        } catch (error) {
            console.error('Finance overview error:', error);
        }
    };

    const refreshFinancialData = async () => {
        await Promise.all([
            fetchExpenses(currentPage),
            fetchAnalytics(),
            fetchFinanceOverview()
        ]);
    };

    const getCurrentDateTime = () => {
        const now = new Date();

        return new Date(
            now.getTime() - now.getTimezoneOffset() * 60000
        )
            .toISOString()
            .slice(0, 16);
    };

    const openAddTransaction = () => {
        setEditingId(null);

        setExpenseForm({
            title: '',
            amount: '',
            description: '',
            date: '',
            categoryId: '',
            icon: '💸',
            type: 'expense'
        });

        setShowTransactionModal(true);
    };

    const handleEditTransaction = (expense) => {
        setEditingId(
            expense.expenseId ||
            expense.expense_id
        );

        setExpenseForm({
            title: expense.title || '',
            amount: expense.amount || '',
            description: expense.description || '',
            date: expense.date
                ? expense.date.substring(0, 16)
                : '',
            categoryId:
                expense.categoryId ||
                expense.category_id ||
                '',
            icon: expense.icon || '💸',
            type:
                expense.type?.toLowerCase() ||
                'expense'
        });

        setShowTransactionModal(true);
    };

    const closeTransactionModal = () => {
        setEditingId(null);
        setShowTransactionModal(false);

        setExpenseForm({
            title: '',
            amount: '',
            description: '',
            date: '',
            categoryId: '',
            icon: '💸',
            type: 'expense'
        });
    };

    const handleSubmitTransaction = async (event) => {
        event.preventDefault();

        if (!expenseForm.title.trim()) {
            alert('Enter transaction title');
            return;
        }

        if (
            !expenseForm.amount ||
            Number(expenseForm.amount) <= 0
        ) {
            alert('Enter a valid amount');
            return;
        }

        if (!expenseForm.date) {
            alert('Select transaction date');
            return;
        }

        const selectedDate = new Date(expenseForm.date);
        const currentDate = new Date();

        if (selectedDate > currentDate) {
            alert('Future transactions are not allowed');
            return;
        }

        if (!expenseForm.categoryId) {
            alert('Select a category');
            return;
        }

        const payload = {
            ...expenseForm,
            amount: Number(expenseForm.amount),
            categoryId: Number(expenseForm.categoryId)
        };

        try {
            if (editingId) {
                await axios.put(
                    `${API}/update-expense`,
                    {
                        ...payload,
                        expenseId: editingId
                    },
                    {
                        withCredentials: true
                    }
                );
            } else {
                await axios.post(
                    `${API}/add-expense`,
                    payload,
                    {
                        withCredentials: true
                    }
                );
            }

            alert(
                editingId
                    ? 'Transaction updated'
                    : 'Transaction added'
            );

            closeTransactionModal();

            setCurrentPage(1);

            await Promise.all([
                fetchExpenses(1),
                fetchAnalytics(),
                fetchFinanceOverview()
            ]);
        } catch (error) {
            alert(getErrorMessage(error));
        }
    };

    const handleDeleteTransaction = async (expense) => {
        const expenseId =
            expense.expenseId ||
            expense.expense_id;

        const confirmed = window.confirm(
            'Are you sure you want to delete this transaction?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(
                `${API}/delete-expense/${expenseId}`,
                {
                    withCredentials: true
                }
            );

            await refreshFinancialData();
        } catch (error) {
            alert(getErrorMessage(error));
        }
    };

    const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    const formData = new FormData();

    // "file" MUST match @RequestParam("file") in Spring Boot.
    formData.append("file", file);

    try {
        const response = await axios.post(
            "http://localhost:8082/upload-csv",
            formData,
            {
                withCredentials: true
            }
        );

        console.log("CSV upload response:", response.data);

        alert("CSV uploaded successfully");

        // Refresh transactions after successful upload.
        fetchExpenses(
            fromDate,
            toDate,
            currentPage,
            recordsPerPage
        );

    } catch (error) {
        console.error("CSV UPLOAD ERROR:", error);
        console.error("RESPONSE:", error.response);
        console.error("BACKEND DATA:", error.response?.data);

        const backendData = error.response?.data;

        const message =
            typeof backendData === "string"
                ? backendData
                : backendData?.message ||
                  backendData?.Value ||
                  error.message ||
                  "Something went wrong";

        alert(message);
    }

    // Allows the same CSV file to be selected again.
    event.target.value = "";
};

    const handlePageChange = async (page) => {
        if (page < 1 || page > totalPages) {
            return;
        }

        setCurrentPage(page);
        await fetchExpenses(page);
    };

    const handleSaveMonthlyBudget = async (amount) => {
        if (!amount || Number(amount) <= 0) {
            alert('Enter a valid monthly budget');
            return;
        }

        try {
            await axios.put(
                `${API}/finance/monthly-budget`,
                {
                    amount: Number(amount)
                },
                {
                    withCredentials: true
                }
            );

            alert('Monthly budget saved');

            await fetchFinanceOverview();
        } catch (error) {
            alert(getErrorMessage(error));
        }
    };

    const handleSaveCategoryBudget = async (
        categoryId,
        amount
    ) => {
        if (!categoryId) {
            alert('Select a category');
            return;
        }

        if (!amount || Number(amount) <= 0) {
            alert('Enter a valid budget amount');
            return;
        }

        try {
            await axios.put(
                `${API}/finance/category-budget`,
                {
                    categoryId: Number(categoryId),
                    amount: Number(amount)
                },
                {
                    withCredentials: true
                }
            );

            alert('Category budget saved');

            await fetchFinanceOverview();
        } catch (error) {
            alert(getErrorMessage(error));
        }
    };

    const handleAddRecurring = async (form) => {
        if (!form.title?.trim()) {
            alert('Enter a title');
            return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            alert('Enter a valid amount');
            return;
        }

        if (!form.categoryId) {
            alert('Select a category');
            return;
        }

        if (!form.nextDate) {
            alert('Select the next transaction date');
            return;
        }

        try {
            await axios.post(
                `${API}/finance/recurring`,
                {
                    title: form.title,
                    amount: Number(form.amount),
                    categoryId: Number(form.categoryId),
                    type: form.type,
                    frequency: form.frequency.toUpperCase(),
                    nextRunDate: form.nextDate
                },
                {
                    withCredentials: true
                }
            );

            alert('Recurring transaction added');

            await fetchFinanceOverview();
        } catch (error) {
            alert(getErrorMessage(error));
        }
    };

    const handleDeleteRecurring = async (item) => {
        const recurringId =
            item.recurringId ||
            item.recurring_id;

        const confirmed = window.confirm(
            'Stop this recurring transaction?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(
                `${API}/finance/recurring/${recurringId}`,
                {
                    withCredentials: true
                }
            );

            await fetchFinanceOverview();
        } catch (error) {
            alert(getErrorMessage(error));
        }
    };

    const handleDownloadPdf = async (reportMonth) => {
        if (!reportMonth) {
            alert('Select a month');
            return;
        }

        const [year, month] = reportMonth
            .split('-')
            .map(Number);

        try {
            const response = await axios.get(
                `${API}/finance/report`,
                {
                    params: {
                        year,
                        month
                    },
                    responseType: 'blob',
                    withCredentials: true
                }
            );

            const file = new Blob(
                [response.data],
                {
                    type: 'application/pdf'
                }
            );

            const fileUrl =
                window.URL.createObjectURL(file);

            const link =
                document.createElement('a');

            link.href = fileUrl;
            link.download =
                `expense-report-${year}-${month}.pdf`;

            document.body.appendChild(link);

            link.click();
            link.remove();

            window.URL.revokeObjectURL(fileUrl);
        } catch (error) {
            console.error(error);
            alert('Could not generate monthly report');
        }
    };

    const handleAddCategory = async (name) => {
        if (!name?.trim()) {
            alert('Enter category name');
            return;
        }

        try {
            await axios.post(
                `${API}/add-category`,
                {
                    name: name.trim()
                },
                {
                    withCredentials: true
                }
            );

            alert('Category added');

            await fetchCategories();
        } catch (error) {
            alert(getErrorMessage(error));
        }
    };

    const handleDeleteCategory = async (category) => {
        const categoryId =
            category.categoryId ||
            category.category_id;

        const confirmed = window.confirm(
            'Delete this category?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(
                `${API}/delete-category/${categoryId}`,
                {
                    withCredentials: true
                }
            );

            await fetchCategories();
        } catch (error) {
            alert(getErrorMessage(error));
        }
    };

    const handleLogout = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to sign out?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await axios.post(
                `${API}/logout`,
                {},
                {
                    withCredentials: true
                }
            );
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const renderDashboard = () => {
    switch (activeDashboard) {
        case 'overview':
            return (
                <OverviewDashboard
                    analytics={analytics}
                />
            );

        case 'transactions':
            return (
                <TransactionsDashboard
                    expenses={expenses}
                    onAddTransaction={openAddTransaction}
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onBulkUpload={handleBulkUpload}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            );

        case 'budgets':
            return (
                <BudgetsDashboard
                    monthlyBudget={
                        financeOverview.monthlyBudget
                    }
                    monthlySpent={
                        financeOverview.spentThisMonth
                    }
                    categories={categories}
                    categoryBudgets={
                        financeOverview.categoryBudgets
                    }
                    onSaveMonthlyBudget={
                        handleSaveMonthlyBudget
                    }
                    onSaveCategoryBudget={
                        handleSaveCategoryBudget
                    }
                />
            );

        case 'recurring':
            return (
                <RecurringDashboard
                    categories={categories}
                    recurringTransactions={
                        financeOverview.recurringTransactions
                    }
                    onAddRecurring={
                        handleAddRecurring
                    }
                    onDeleteRecurring={
                        handleDeleteRecurring
                    }
                />
            );

        case 'reports':
            return (
                <ReportsDashboard
                    analytics={analytics}
                    onDownloadPdf={handleDownloadPdf}
                />
            );

        case 'categories':
            return (
                <CategoriesDashboard
                    categories={categories}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={
                        handleDeleteCategory
                    }
                />
            );

        default:
            return (
                <OverviewDashboard
                    analytics={analytics}
                />
            );
    }
};

    const menuItems = [
        {
            id: 'overview',
            icon: '⌂',
            label: 'Overview'
        },
        {
            id: 'transactions',
            icon: '↕',
            label: 'Transactions'
        },
        {
            id: 'budgets',
            icon: '◎',
            label: 'Budgets'
        },
        {
            id: 'recurring',
            icon: '↻',
            label: 'Recurring'
        },
        {
            id: 'reports',
            icon: '▤',
            label: 'Reports'
        },
        {
            id: 'categories',
            icon: '◫',
            label: 'Categories'
        }
    ];

    return (
        <div className="min-h-screen bg-[#030712] text-slate-300">
            <aside className="fixed left-0 top-0 h-screen w-64 bg-[#080e1c] border-r border-slate-800 z-40 flex flex-col">
                <div className="px-7 py-8">
                    <h1 className="text-2xl font-black text-white tracking-tighter">
                        EXPENSE
                        <span className="text-indigo-500">
                            TRACKER
                        </span>
                    </h1>

                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.25em] mt-2">
                        USER // {user?.name}
                    </p>
                </div>

                <nav className="px-4 mt-5 flex-1">
                    <p className="px-4 mb-4 text-[9px] text-slate-600 font-black tracking-[0.25em] uppercase">
                        Workspace
                    </p>

                    <div className="space-y-2">
                        {menuItems.map((item) => {
                            const active =
                                activeDashboard === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveDashboard(
                                            item.id
                                        )
                                    }
                                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all ${
                                        active
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                                    }`}
                                >
                                    <span className="text-lg">
                                        {item.icon}
                                    </span>

                                    <span className="text-[11px] font-black uppercase tracking-wider">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-4">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-4 text-left rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            ⇥ Sign Out
                        </span>
                    </button>
                </div>
            </aside>

            <main className="ml-64 min-h-screen">
                <div className="max-w-[1500px] mx-auto p-10">
                    {renderDashboard()}
                </div>
            </main>

            {showTransactionModal && (
                <div className="fixed inset-0 bg-[#030712]/90 backdrop-blur-md flex items-center justify-center z-50 p-5">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-7">
                            <div>
                                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    Money Log
                                </p>

                                <h2 className="text-2xl text-white font-bold mt-2">
                                    {editingId
                                        ? 'Edit Transaction'
                                        : 'Add Transaction'}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeTransactionModal}
                                className="text-slate-500 hover:text-white text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmitTransaction}
                            className="space-y-5"
                        >
                            <div className="flex bg-[#030712] p-1.5 rounded-2xl border border-slate-800">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setExpenseForm({
                                            ...expenseForm,
                                            type: 'expense'
                                        })
                                    }
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest ${
                                        expenseForm.type ===
                                        'expense'
                                            ? 'bg-rose-900/40 text-rose-400 border border-rose-500/20'
                                            : 'text-slate-600'
                                    }`}
                                >
                                    EXPENSE
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setExpenseForm({
                                            ...expenseForm,
                                            type: 'income'
                                        })
                                    }
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest ${
                                        expenseForm.type ===
                                        'income'
                                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20'
                                            : 'text-slate-600'
                                    }`}
                                >
                                    INCOME
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    maxLength="2"
                                    className="w-20 bg-[#030712] border border-slate-800 p-4 rounded-2xl text-center text-xl text-white"
                                    value={expenseForm.icon}
                                    onChange={(event) =>
                                        setExpenseForm({
                                            ...expenseForm,
                                            icon: event.target.value
                                        })
                                    }
                                />

                                <input
                                    type="text"
                                    required
                                    placeholder="TITLE"
                                    className="flex-1 bg-[#030712] border border-slate-800 p-4 rounded-2xl text-white text-xs font-bold uppercase"
                                    value={expenseForm.title}
                                    onChange={(event) =>
                                        setExpenseForm({
                                            ...expenseForm,
                                            title: event.target.value
                                        })
                                    }
                                />
                            </div>

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                                placeholder="AMOUNT"
                                className="w-full bg-[#030712] border border-slate-800 p-4 rounded-2xl text-white text-xs font-bold"
                                value={expenseForm.amount}
                                onChange={(event) =>
                                    setExpenseForm({
                                        ...expenseForm,
                                        amount: event.target.value
                                    })
                                }
                            />

                            <input
                                type="datetime-local"
                                required
                                max={getCurrentDateTime()}
                                className="w-full bg-[#030712] border border-slate-800 p-4 rounded-2xl text-white [color-scheme:dark] text-xs font-bold"
                                value={expenseForm.date}
                                onChange={(event) =>
                                    setExpenseForm({
                                        ...expenseForm,
                                        date: event.target.value
                                    })
                                }
                            />

                            <select
                                required
                                className="w-full bg-[#030712] border border-slate-800 p-4 rounded-2xl text-slate-300 text-[10px] font-black uppercase"
                                value={expenseForm.categoryId}
                                onChange={(event) =>
                                    setExpenseForm({
                                        ...expenseForm,
                                        categoryId:
                                            event.target.value
                                    })
                                }
                            >
                                <option value="">
                                    SELECT CATEGORY
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={
                                            category.categoryId ||
                                            category.category_id
                                        }
                                        value={
                                            category.categoryId ||
                                            category.category_id
                                        }
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <textarea
                                placeholder="DESCRIPTION (OPTIONAL)"
                                className="w-full bg-[#030712] border border-slate-800 p-4 rounded-2xl text-white text-xs min-h-24 resize-none"
                                value={expenseForm.description}
                                onChange={(event) =>
                                    setExpenseForm({
                                        ...expenseForm,
                                        description:
                                            event.target.value
                                    })
                                }
                            />

                            <button
                                type="submit"
                                className={`w-full py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] text-white ${
                                    editingId
                                        ? 'bg-amber-600'
                                        : expenseForm.type ===
                                          'income'
                                        ? 'bg-emerald-600'
                                        : 'bg-indigo-600'
                                }`}
                            >
                                {editingId
                                    ? 'UPDATE TRANSACTION'
                                    : 'ADD TRANSACTION'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;