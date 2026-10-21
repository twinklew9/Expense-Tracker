import React, {
    useEffect,
    useMemo,
    useState
} from 'react';

import axios from 'axios';

const API = 'http://localhost:8082';

const MONTHS = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC'
];

const FinanceFeatures = ({
    categories = []
}) => {

    const currentYear =
        new Date().getFullYear();

    const [overview, setOverview] = useState({
        monthlyBudget: 0,
        spentThisMonth: 0,
        remaining: 0,
        budgetPercentage: 0,
        categoryBudgets: []
    });

    const [
        monthlyBudgetInput,
        setMonthlyBudgetInput
    ] = useState('');

    const [
        categoryBudget,
        setCategoryBudget
    ] = useState({
        categoryId: '',
        amount: ''
    });

    const [
        selectedYear,
        setSelectedYear
    ] = useState(currentYear);

    const [
        yearlyCashFlow,
        setYearlyCashFlow
    ] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const money = (value) =>
        Number(value || 0).toLocaleString(
            'en-IN',
            {
                maximumFractionDigits: 2
            }
        );

    const getErrorMessage = (error) =>
        error.response?.data?.Value ||
        error.response?.data?.error ||
        'Something went wrong';

    const normalizeBudget = (item) => ({
        categoryBudgetId:
            item.categoryBudgetId ??
            item.category_budget_id ??
            item.categorybudgetid,

        categoryId:
            item.categoryId ??
            item.category_id ??
            item.categoryid,

        categoryName:
            item.categoryName ??
            item.category_name ??
            item.categoryname ??
            'Category',

        budgetAmount: Number(
            item.budgetAmount ??
            item.budget_amount ??
            item.budgetamount ??
            item.amount ??
            0
        ),

        spentAmount: Number(
            item.spentAmount ??
            item.spent_amount ??
            item.spentamount ??
            0
        )
    });

    const fetchOverview = async () => {

        try {

            setLoading(true);

            const response = await axios.get(
                `${API}/finance/overview`,
                {
                    withCredentials: true
                }
            );

            const data =
                response.data || {};

            setOverview({
                ...data,

                monthlyBudget:
                    Number(
                        data.monthlyBudget || 0
                    ),

                spentThisMonth:
                    Number(
                        data.spentThisMonth || 0
                    ),

                remaining:
                    Number(
                        data.remaining || 0
                    ),

                budgetPercentage:
                    Number(
                        data.budgetPercentage || 0
                    ),

                categoryBudgets:
                    (
                        data.categoryBudgets || []
                    ).map(normalizeBudget)
            });

            setMonthlyBudgetInput(
                Number(
                    data.monthlyBudget || 0
                ) > 0
                    ? String(data.monthlyBudget)
                    : ''
            );

        } catch (error) {

            console.error(
                'Finance overview error:',
                error
            );

        } finally {

            setLoading(false);
        }
    };

    const fetchYearlyCashFlow = async (
        year
    ) => {

        try {

            const response = await axios.get(
                `${API}/finance/yearly-spending`,
                {
                    params: {
                        year
                    },
                    withCredentials: true
                }
            );

            const rows =
                response.data || [];

            const completeYear =
                MONTHS.map(
                    (month, index) => {

                        const found =
                            rows.find(
                                (item) =>
                                    Number(
                                        item.monthNumber
                                    ) === index + 1
                            );

                        return {
                            monthNumber:
                                index + 1,

                            month,

                            income:
                                Number(
                                    found?.income || 0
                                ),

                            expense:
                                Number(
                                    found?.expense ??
                                    found?.totalAmount ??
                                    0
                                )
                        };
                    }
                );

            setYearlyCashFlow(
                completeYear
            );

        } catch (error) {

            console.error(
                'Yearly cash flow error:',
                error
            );

            setYearlyCashFlow(
                MONTHS.map(
                    (month, index) => ({
                        monthNumber:
                            index + 1,
                        month,
                        income: 0,
                        expense: 0
                    })
                )
            );
        }
    };

    useEffect(() => {

        fetchOverview();

    }, []);

    useEffect(() => {

        fetchYearlyCashFlow(
            selectedYear
        );

    }, [selectedYear]);

    const saveMonthlyBudget = async (
        event
    ) => {

        event.preventDefault();

        const amount =
            Number(monthlyBudgetInput);

        if (amount <= 0) {

            alert(
                'Enter a valid monthly limit'
            );

            return;
        }

        try {

            await axios.put(
                `${API}/finance/monthly-budget`,
                {
                    amount
                },
                {
                    withCredentials: true
                }
            );

            await fetchOverview();

        } catch (error) {

            alert(
                getErrorMessage(error)
            );
        }
    };

    const saveCategoryBudget = async (
        event
    ) => {

        event.preventDefault();

        if (!categoryBudget.categoryId) {

            alert(
                'Select a category'
            );

            return;
        }

        const amount =
            Number(categoryBudget.amount);

        if (amount <= 0) {

            alert(
                'Enter a valid category budget'
            );

            return;
        }

        try {

            await axios.put(
                `${API}/finance/category-budget`,
                {
                    categoryId:
                        Number(
                            categoryBudget.categoryId
                        ),

                    amount
                },
                {
                    withCredentials: true
                }
            );

            setCategoryBudget({
                categoryId: '',
                amount: ''
            });

            await fetchOverview();

        } catch (error) {

            alert(
                getErrorMessage(error)
            );
        }
    };

    const deleteCategoryBudget = async (
        id
    ) => {

        if (
            !window.confirm(
                'Remove this category budget?'
            )
        ) {
            return;
        }

        try {

            await axios.delete(
                `${API}/finance/category-budget/${id}`,
                {
                    withCredentials: true
                }
            );

            await fetchOverview();

        } catch (error) {

            alert(
                getErrorMessage(error)
            );
        }
    };

    const budget =
        Number(
            overview.monthlyBudget || 0
        );

    const spent =
        Number(
            overview.spentThisMonth || 0
        );

    const budgetUsed =
        budget > 0
            ? (spent / budget) * 100
            : 0;

    const monthlyStatus = useMemo(() => {

        if (budget <= 0) {

            return {
                label: 'NO LIMIT SET',

                text:
                    'Set a monthly limit to start budget tracking.',

                className:
                    'text-slate-400 bg-slate-800/60 border-slate-700'
            };
        }

        if (budgetUsed >= 100) {

            return {
                label:
                    'BUDGET EXCEEDED',

                text:
                    `You are ₹${money(
                        spent - budget
                    )} over your monthly limit.`,

                className:
                    'text-rose-300 bg-rose-500/10 border-rose-500/30'
            };
        }

        if (budgetUsed >= 80) {

            return {
                label:
                    'NEAR LIMIT',

                text:
                    `Only ₹${money(
                        budget - spent
                    )} remains this month.`,

                className:
                    'text-amber-300 bg-amber-500/10 border-amber-500/30'
            };
        }

        return {
            label:
                'ON TRACK',

            text:
                `₹${money(
                    budget - spent
                )} is still available this month.`,

            className:
                'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
        };

    }, [
        budget,
        spent,
        budgetUsed
    ]);

    const chartMax = Math.max(
        1,

        ...yearlyCashFlow.flatMap(
            (item) => [
                item.income,
                item.expense
            ]
        )
    );

    const years = Array.from(
        {
            length: 11
        },

        (_, index) =>
            currentYear - 8 + index
    );

    if (loading) {

        return (
            <section className="mb-12">

                <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 text-slate-400">

                    Loading budgets...

                </div>

            </section>
        );
    }

    return (
        <section className="mb-12">

            <div className="mb-7">

                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em]">

                    Finance Control

                </p>

                <h2 className="text-3xl font-black text-white mt-2">

                    Budgets & Yearly Cash Flow

                </h2>

                <p className="text-slate-500 text-sm mt-2">

                    Track limits, warnings and every month of the selected year.

                </p>

            </div>


            {/* MONTHLY BUDGET */}

            <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-6 md:p-8 mb-6">

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">

                    <div>

                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.22em]">

                            Monthly Budget

                        </p>

                        <div className="flex flex-wrap items-end gap-3 mt-4">

                            <p className="text-4xl font-black text-white">

                                ₹{money(spent)}

                            </p>

                            <p className="text-slate-500 text-sm pb-1">

                                spent of ₹{money(budget)}

                            </p>

                        </div>

                    </div>

                    <div
                        className={`
                            border
                            rounded-2xl
                            px-5
                            py-4
                            ${monthlyStatus.className}
                        `}
                    >

                        <p className="text-[10px] font-black tracking-[0.2em]">

                            {monthlyStatus.label}

                        </p>

                        <p className="text-xs mt-2">

                            {monthlyStatus.text}

                        </p>

                    </div>

                </div>


                <div className="mt-7">

                    <div className="flex justify-between text-xs font-black mb-3">

                        <span className="text-slate-500">

                            MONTHLY LIMIT USAGE

                        </span>

                        <span
                            className={
                                budgetUsed >= 100
                                    ? 'text-rose-400'
                                    : budgetUsed >= 80
                                    ? 'text-amber-400'
                                    : 'text-indigo-400'
                            }
                        >

                            {budgetUsed.toFixed(0)}%

                        </span>

                    </div>


                    <div className="h-4 bg-[#030712] border border-slate-800 rounded-full overflow-hidden">

                        <div
                            className={`
                                h-full
                                rounded-full
                                transition-all
                                duration-500
                                ${
                                    budgetUsed >= 100
                                        ? 'bg-rose-500'
                                        : budgetUsed >= 80
                                        ? 'bg-amber-500'
                                        : 'bg-indigo-500'
                                }
                            `}
                            style={{
                                width:
                                    `${Math.min(
                                        budgetUsed,
                                        100
                                    )}%`
                            }}
                        />

                    </div>

                </div>


                <form
                    onSubmit={
                        saveMonthlyBudget
                    }
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mt-7"
                >

                    <input
                        type="number"
                        min="1"
                        value={
                            monthlyBudgetInput
                        }
                        onChange={(event) =>
                            setMonthlyBudgetInput(
                                event.target.value
                            )
                        }
                        placeholder="ENTER MONTHLY LIMIT"
                        className="bg-[#030712] border border-slate-700 p-5 rounded-2xl text-white text-sm font-bold outline-none focus:border-indigo-500"
                    />

                    <button className="px-9 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black tracking-widest">

                        SAVE LIMIT

                    </button>

                </form>

            </div>


            {/* 12 MONTH GRAPH */}

            <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-6 md:p-8 mb-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                    <div>

                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.22em]">

                            Cash Flow

                        </p>

                        <h3 className="text-2xl font-black text-white mt-2">

                            12-Month Income vs Expense

                        </h3>

                        <p className="text-slate-500 text-xs mt-2">

                            JAN to DEC always stays visible. Change the year anytime.

                        </p>

                    </div>


                    <select
                        value={selectedYear}
                        onChange={(event) =>
                            setSelectedYear(
                                Number(
                                    event.target.value
                                )
                            )
                        }
                        className="bg-[#030712] border border-slate-700 px-5 py-4 rounded-2xl text-white text-sm font-black outline-none focus:border-indigo-500"
                    >

                        {years.map(
                            (year) => (

                                <option
                                    key={year}
                                    value={year}
                                >

                                    {year}

                                </option>

                            )
                        )}

                    </select>

                </div>


                <div className="flex gap-5 mt-7 text-[10px] font-black uppercase tracking-wider">

                    <span className="text-emerald-400">

                        ● Income

                    </span>

                    <span className="text-rose-400">

                        ● Expense

                    </span>

                </div>


                <div className="overflow-x-auto mt-6 pb-2">

                    <div className="min-w-[980px] h-[340px] grid grid-cols-12 gap-3">

                        {yearlyCashFlow.map(
                            (item) => {

                                const incomeHeight =
                                    (
                                        item.income /
                                        chartMax
                                    ) * 230;

                                const expenseHeight =
                                    (
                                        item.expense /
                                        chartMax
                                    ) * 230;

                                return (

                                    <div
                                        key={
                                            item.monthNumber
                                        }
                                        className="h-full flex flex-col justify-end"
                                    >

                                        <div className="h-[255px] flex items-end justify-center gap-2 border-b border-slate-800">

                                            <div className="h-full flex flex-col justify-end items-center">

                                                {item.income > 0 && (

                                                    <span className="text-[8px] text-emerald-400 font-bold mb-2">

                                                        ₹{money(
                                                            item.income
                                                        )}

                                                    </span>

                                                )}

                                                <div
                                                    title={
                                                        `${item.month} income ₹${money(
                                                            item.income
                                                        )}`
                                                    }
                                                    className="w-5 bg-emerald-500 rounded-t-lg transition-all duration-500"
                                                    style={{
                                                        height:
                                                            `${Math.max(
                                                                incomeHeight,
                                                                item.income > 0
                                                                    ? 5
                                                                    : 0
                                                            )}px`
                                                    }}
                                                />

                                            </div>


                                            <div className="h-full flex flex-col justify-end items-center">

                                                {item.expense > 0 && (

                                                    <span className="text-[8px] text-rose-400 font-bold mb-2">

                                                        ₹{money(
                                                            item.expense
                                                        )}

                                                    </span>

                                                )}

                                                <div
                                                    title={
                                                        `${item.month} expense ₹${money(
                                                            item.expense
                                                        )}`
                                                    }
                                                    className="w-5 bg-rose-500 rounded-t-lg transition-all duration-500"
                                                    style={{
                                                        height:
                                                            `${Math.max(
                                                                expenseHeight,
                                                                item.expense > 0
                                                                    ? 5
                                                                    : 0
                                                            )}px`
                                                    }}
                                                />

                                            </div>

                                        </div>


                                        <p className="text-center text-[10px] font-black text-slate-400 mt-4 tracking-wider">

                                            {item.month}

                                        </p>

                                    </div>

                                );
                            }
                        )}

                    </div>

                </div>

            </div>


            {/* CATEGORY BUDGET */}

            <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-6 md:p-8">

                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.22em]">

                    Category Budgets

                </p>


                <form
                    onSubmit={
                        saveCategoryBudget
                    }
                    className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-3 mt-6"
                >

                    <select
                        value={
                            categoryBudget.categoryId
                        }
                        onChange={(event) =>
                            setCategoryBudget({
                                ...categoryBudget,
                                categoryId:
                                    event.target.value
                            })
                        }
                        className="bg-[#030712] border border-slate-700 p-5 rounded-2xl text-white text-sm font-bold outline-none focus:border-indigo-500"
                    >

                        <option value="">

                            SELECT CATEGORY

                        </option>

                        {categories.map(
                            (category) => (

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

                            )
                        )}

                    </select>


                    <input
                        type="number"
                        min="1"
                        value={
                            categoryBudget.amount
                        }
                        onChange={(event) =>
                            setCategoryBudget({
                                ...categoryBudget,
                                amount:
                                    event.target.value
                            })
                        }
                        placeholder="BUDGET AMOUNT"
                        className="bg-[#030712] border border-slate-700 p-5 rounded-2xl text-white text-sm font-bold outline-none focus:border-indigo-500"
                    />


                    <button className="px-9 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black tracking-widest">

                        SET BUDGET

                    </button>

                </form>


                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-7">

                    {overview.categoryBudgets.length === 0 ? (

                        <div className="xl:col-span-2 border border-dashed border-slate-700 rounded-2xl p-8 text-center">

                            <p className="text-slate-500 text-xs">

                                No category budgets created.

                            </p>

                        </div>

                    ) : (

                        overview.categoryBudgets.map(
                            (item) => {

                                const used =
                                    item.budgetAmount > 0
                                        ? (
                                            item.spentAmount /
                                            item.budgetAmount
                                        ) * 100
                                        : 0;

                                const exceeded =
                                    used >= 100;

                                const warning =
                                    used >= 80 &&
                                    used < 100;

                                return (

                                    <div
                                        key={
                                            item.categoryBudgetId
                                        }
                                        className={`
                                            border
                                            rounded-3xl
                                            p-6
                                            ${
                                                exceeded
                                                    ? 'bg-rose-500/10 border-rose-500/30'
                                                    : warning
                                                    ? 'bg-amber-500/10 border-amber-500/30'
                                                    : 'bg-[#030712] border-slate-800'
                                            }
                                        `}
                                    >

                                        <div className="flex justify-between gap-4">

                                            <div>

                                                <p className="text-white text-sm font-black uppercase">

                                                    {item.categoryName}

                                                </p>

                                                <p className="text-slate-400 text-xs mt-2">

                                                    ₹{money(
                                                        item.spentAmount
                                                    )} spent of ₹{money(
                                                        item.budgetAmount
                                                    )}

                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteCategoryBudget(
                                                        item.categoryBudgetId
                                                    )
                                                }
                                                className="text-slate-600 hover:text-rose-400"
                                            >

                                                ✕

                                            </button>

                                        </div>


                                        <div className="h-3 bg-slate-950 rounded-full overflow-hidden mt-5">

                                            <div
                                                className={`
                                                    h-full
                                                    rounded-full
                                                    ${
                                                        exceeded
                                                            ? 'bg-rose-500'
                                                            : warning
                                                            ? 'bg-amber-500'
                                                            : 'bg-emerald-500'
                                                    }
                                                `}
                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            used,
                                                            100
                                                        )}%`
                                                }}
                                            />

                                        </div>


                                        <div className="flex justify-between items-center mt-4">

                                            <span
                                                className={`
                                                    text-[10px]
                                                    font-black
                                                    tracking-widest
                                                    ${
                                                        exceeded
                                                            ? 'text-rose-400'
                                                            : warning
                                                            ? 'text-amber-400'
                                                            : 'text-emerald-400'
                                                    }
                                                `}
                                            >

                                                {
                                                    exceeded
                                                        ? `BUDGET EXCEEDED BY ₹${money(
                                                            item.spentAmount -
                                                            item.budgetAmount
                                                        )}`
                                                        : warning
                                                        ? 'WARNING — NEAR LIMIT'
                                                        : 'ON TRACK'
                                                }

                                            </span>


                                            <span className="text-xs font-black text-white">

                                                {used.toFixed(0)}%

                                            </span>

                                        </div>

                                    </div>

                                );
                            }
                        )

                    )}

                </div>

            </div>

        </section>
    );
};

export default FinanceFeatures;