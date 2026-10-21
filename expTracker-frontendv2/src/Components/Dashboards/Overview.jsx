import React, { useMemo, useState } from 'react';

const money = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
        maximumFractionDigits: 2
    })}`;

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

const Overview = ({
    analytics,
    financeOverview
}) => {
    const totalIncome = Number(
        analytics?.totalIncome || 0
    );

    const totalExpense = Number(
        analytics?.totalExpense || 0
    );

    const balance = totalIncome - totalExpense;

    const categories =
        analytics?.categorySpending || [];

    const monthlyTrend =
        analytics?.monthlyTrend || [];

    const monthlyBudget = Number(
        financeOverview?.monthlyBudget || 0
    );

    const spentThisMonth = Number(
        financeOverview?.spentThisMonth || 0
    );

    const categoryBudgets =
        financeOverview?.categoryBudgets || [];

    const availableYears = useMemo(() => {
        const years = monthlyTrend
            .map((item) => {
                const monthValue =
                    item.month ||
                    item.monthName ||
                    item.date ||
                    '';

                const match = String(monthValue).match(
                    /^(\d{4})/
                );

                return match
                    ? Number(match[1])
                    : null;
            })
            .filter(Boolean);

        const currentYear =
            new Date().getFullYear();

        return [
            ...new Set([
                currentYear,
                ...years
            ])
        ].sort((a, b) => b - a);
    }, [monthlyTrend]);

    const [selectedYear, setSelectedYear] =
        useState(() => {
            const currentYear =
                new Date().getFullYear();

            const hasCurrentYear =
                monthlyTrend.some((item) =>
                    String(item.month || '').startsWith(
                        String(currentYear)
                    )
                );

            if (hasCurrentYear) {
                return currentYear;
            }

            const years = monthlyTrend
                .map((item) =>
                    Number(
                        String(
                            item.month || ''
                        ).substring(0, 4)
                    )
                )
                .filter(Number.isFinite);

            return years.length > 0
                ? Math.max(...years)
                : currentYear;
        });

    const yearlyTrend = useMemo(() => {
        const monthMap = {};

        monthlyTrend.forEach((item) => {
            const rawMonth = String(
                item.month ||
                item.monthName ||
                item.date ||
                ''
            );

            const match = rawMonth.match(
                /^(\d{4})-(\d{1,2})/
            );

            if (!match) {
                return;
            }

            const year = Number(match[1]);
            const monthNumber = Number(match[2]);

            if (
                year !== Number(selectedYear) ||
                monthNumber < 1 ||
                monthNumber > 12
            ) {
                return;
            }

            monthMap[monthNumber] = {
                income: Number(item.income || 0),
                expense: Number(item.expense || 0)
            };
        });

        return MONTHS.map((month, index) => ({
            month,
            monthNumber: index + 1,
            income:
                monthMap[index + 1]?.income || 0,
            expense:
                monthMap[index + 1]?.expense || 0
        }));
    }, [monthlyTrend, selectedYear]);

    const maxCategory = Math.max(
        ...categories.map((item) =>
            Number(item.amount || 0)
        ),
        1
    );

    const maxTrend = Math.max(
        ...yearlyTrend.flatMap((item) => [
            Number(item.income || 0),
            Number(item.expense || 0)
        ]),
        1
    );

    const monthlyExceeded =
        monthlyBudget > 0 &&
        spentThisMonth > monthlyBudget;

    const exceededCategoryBudgets = useMemo(() => {
        return categoryBudgets
            .map((item) => {
                const budgetAmount = Number(
                    item.budgetAmount ??
                    item.amount ??
                    0
                );

                const spentAmount = Number(
                    item.spentAmount ??
                    item.spent ??
                    0
                );

                return {
                    categoryName:
                        item.categoryName ??
                        item.category_name ??
                        'Category',
                    budgetAmount,
                    spentAmount
                };
            })
            .filter(
                (item) =>
                    item.budgetAmount > 0 &&
                    item.spentAmount >
                        item.budgetAmount
            );
    }, [categoryBudgets]);

    return (
        <div>
            <Header
                title="Overview"
                subtitle="A quick look at your financial activity."
            />

            {monthlyExceeded && (
                <div style={styles.budgetAlert}>
                    <div style={styles.alertSymbol}>
                        !
                    </div>

                    <div>
                        <strong style={styles.alertTitle}>
                            MONTHLY BUDGET EXCEEDED
                        </strong>

                        <p style={styles.alertMessage}>
                            You spent {money(spentThisMonth)} against
                            a monthly budget of{' '}
                            {money(monthlyBudget)}. You are{' '}
                            {money(
                                spentThisMonth - monthlyBudget
                            )}{' '}
                            over budget.
                        </p>
                    </div>
                </div>
            )}

            {exceededCategoryBudgets.map(
                (item, index) => (
                    <div
                        key={`${item.categoryName}-${index}`}
                        style={styles.categoryAlert}
                    >
                        <strong>
                            {item.categoryName.toUpperCase()} BUDGET
                            EXCEEDED
                        </strong>

                        <span>
                            {money(
                                item.spentAmount -
                                    item.budgetAmount
                            )}{' '}
                            over the {money(item.budgetAmount)} limit
                        </span>
                    </div>
                )
            )}

            <div style={styles.summaryGrid}>
                <SummaryCard
                    label="TOTAL BALANCE"
                    value={money(balance)}
                    highlight
                />

                <SummaryCard
                    label="NET INCOME"
                    value={money(totalIncome)}
                    valueColor="#22d39a"
                />

                <SummaryCard
                    label="NET EXPENSES"
                    value={money(totalExpense)}
                    valueColor="#ff5877"
                />
            </div>

            <div style={styles.dashboardGrid}>
                <section style={styles.card}>
                    <p style={styles.sectionLabel}>
                        ANALYTICS
                    </p>

                    <h2 style={styles.cardTitle}>
                        Where Your Money Goes
                    </h2>

                    <p style={styles.description}>
                        Expense breakdown by category.
                    </p>

                    <div style={styles.categoryList}>
                        {categories.length === 0 && (
                            <EmptyText text="No expense data available." />
                        )}

                        {categories.map(
                            (item, index) => {
                                const amount = Number(
                                    item.amount || 0
                                );

                                const width =
                                    (amount / maxCategory) *
                                    100;

                                return (
                                    <div
                                        key={`${item.categoryName}-${index}`}
                                    >
                                        <div
                                            style={
                                                styles.rowBetween
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.categoryName
                                                }
                                            >
                                                {item.categoryName ||
                                                    'Uncategorized'}
                                            </span>

                                            <strong>
                                                {money(amount)}
                                            </strong>
                                        </div>

                                        <div
                                            style={styles.track}
                                        >
                                            <div
                                                style={{
                                                    ...styles.progress,
                                                    width: `${width}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </section>

                <section style={styles.card}>
                    <div style={styles.chartHeader}>
                        <div>
                            <p style={styles.sectionLabel}>
                                CASH FLOW
                            </p>

                            <h2 style={styles.cardTitle}>
                                Monthly Income vs Expense
                            </h2>

                            <p style={styles.description}>
                                January to December financial activity.
                            </p>
                        </div>

                        <select
                            style={styles.yearSelect}
                            value={selectedYear}
                            onChange={(event) =>
                                setSelectedYear(
                                    Number(event.target.value)
                                )
                            }
                        >
                            {availableYears.map((year) => (
                                <option
                                    key={year}
                                    value={year}
                                >
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.legend}>
                        <span style={{ color: '#22d39a' }}>
                            ● INCOME
                        </span>

                        <span style={{ color: '#ff5877' }}>
                            ● EXPENSE
                        </span>
                    </div>

                    <div style={styles.chart}>
                        {yearlyTrend.map((item) => {
                            const incomeHeight =
                                item.income > 0
                                    ? Math.max(
                                          (item.income /
                                              maxTrend) *
                                              210,
                                          5
                                      )
                                    : 0;

                            const expenseHeight =
                                item.expense > 0
                                    ? Math.max(
                                          (item.expense /
                                              maxTrend) *
                                              210,
                                          5
                                      )
                                    : 0;

                            return (
                                <div
                                    key={item.month}
                                    style={styles.chartGroup}
                                >
                                    <div style={styles.bars}>
                                        <div
                                            title={`${item.month} ${selectedYear} Income: ${money(
                                                item.income
                                            )}`}
                                            style={{
                                                ...styles.incomeBar,
                                                height: `${incomeHeight}px`
                                            }}
                                        />

                                        <div
                                            title={`${item.month} ${selectedYear} Expense: ${money(
                                                item.expense
                                            )}`}
                                            style={{
                                                ...styles.expenseBar,
                                                height: `${expenseHeight}px`
                                            }}
                                        />
                                    </div>

                                    <span style={styles.month}>
                                        {item.month}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

const Header = ({ title, subtitle }) => (
    <div style={styles.header}>
        <p style={styles.sectionLabel}>
            DASHBOARD
        </p>

        <h1 style={styles.pageTitle}>
            {title}
        </h1>

        <p style={styles.description}>
            {subtitle}
        </p>
    </div>
);

const SummaryCard = ({
    label,
    value,
    highlight,
    valueColor
}) => (
    <div
        style={{
            ...styles.summaryCard,
            ...(highlight
                ? styles.highlightCard
                : {})
        }}
    >
        <p style={styles.summaryLabel}>
            {label}
        </p>

        <h2
            style={{
                ...styles.summaryValue,
                color: valueColor || '#ffffff'
            }}
        >
            {value}
        </h2>
    </div>
);

const EmptyText = ({ text }) => (
    <p style={styles.emptyText}>
        {text}
    </p>
);

const styles = {
    header: {
        marginBottom: '35px'
    },

    pageTitle: {
        color: '#fff',
        fontSize: '36px',
        margin: '5px 0'
    },

    sectionLabel: {
        color: '#7b72ff',
        fontSize: '12px',
        fontWeight: '900',
        letterSpacing: '2px'
    },

    description: {
        color: '#7188ad',
        fontSize: '14px'
    },

    budgetAlert: {
        display: 'flex',
        gap: '18px',
        alignItems: 'center',
        background: '#310b18',
        border: '1px solid #7f1d36',
        padding: '20px 24px',
        borderRadius: '18px',
        marginBottom: '18px'
    },

    alertSymbol: {
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        background: '#ff3f63',
        color: '#ffffff',
        display: 'grid',
        placeItems: 'center',
        fontSize: '20px',
        fontWeight: '900'
    },

    alertTitle: {
        color: '#ff5877',
        fontSize: '13px',
        letterSpacing: '1px'
    },

    alertMessage: {
        color: '#a7b7d4',
        margin: '6px 0 0',
        fontSize: '13px'
    },

    categoryAlert: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        background: '#26101a',
        color: '#ff7890',
        border: '1px solid #5f1c31',
        padding: '14px 20px',
        borderRadius: '14px',
        marginBottom: '12px',
        fontSize: '12px'
    },

    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '25px',
        marginBottom: '30px'
    },

    summaryCard: {
        background: '#111b30',
        border: '1px solid #1d2b45',
        borderRadius: '28px',
        padding: '30px'
    },

    highlightCard: {
        background: '#5146e5'
    },

    summaryLabel: {
        color: '#a7b7d4',
        fontSize: '12px',
        fontWeight: '800',
        letterSpacing: '2px'
    },

    summaryValue: {
        fontSize: '32px',
        margin: '12px 0 0'
    },

    dashboardGrid: {
        display: 'grid',
        gridTemplateColumns: '0.9fr 1.4fr',
        gap: '25px'
    },

    card: {
        background: '#111b30',
        border: '1px solid #1d2b45',
        borderRadius: '28px',
        padding: '35px',
        minHeight: '460px'
    },

    cardTitle: {
        color: '#fff',
        margin: '8px 0',
        fontSize: '24px'
    },

    categoryList: {
        marginTop: '35px',
        display: 'flex',
        flexDirection: 'column',
        gap: '25px'
    },

    rowBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        color: '#fff'
    },

    categoryName: {
        textTransform: 'uppercase',
        fontWeight: '800'
    },

    track: {
        height: '9px',
        background: '#030814',
        borderRadius: '20px',
        marginTop: '10px',
        overflow: 'hidden'
    },

    progress: {
        height: '100%',
        background: '#6256ff',
        borderRadius: '20px'
    },

    chartHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        alignItems: 'flex-start'
    },

    yearSelect: {
        background: '#030814',
        color: '#ffffff',
        border: '1px solid #293750',
        padding: '12px 18px',
        borderRadius: '12px',
        outline: 'none',
        fontWeight: '800',
        cursor: 'pointer'
    },

    legend: {
        display: 'flex',
        gap: '20px',
        fontSize: '11px',
        fontWeight: '800',
        marginTop: '25px'
    },

    chart: {
        height: '290px',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        alignItems: 'end',
        gap: '5px',
        marginTop: '20px'
    },

    chartGroup: {
        height: '260px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        minWidth: 0
    },

    bars: {
        height: '220px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '3px'
    },

    incomeBar: {
        width: '11px',
        background: '#15bd8a',
        borderRadius: '5px 5px 0 0',
        transition: 'height 0.3s ease'
    },

    expenseBar: {
        width: '11px',
        background: '#ff3f63',
        borderRadius: '5px 5px 0 0',
        transition: 'height 0.3s ease'
    },

    month: {
        color: '#7188ad',
        fontSize: '9px',
        fontWeight: '800',
        marginTop: '12px'
    },

    emptyText: {
        color: '#7188ad'
    }
};

export default Overview;