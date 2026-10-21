import React, { useEffect, useMemo, useState } from 'react';

const money = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
        maximumFractionDigits: 2
    })}`;

const Budgets = ({
    monthlyBudget = 0,
    monthlySpent = 0,
    categories = [],
    categoryBudgets = [],
    onSaveMonthlyBudget,
    onSaveCategoryBudget
}) => {
    const [budgetInput, setBudgetInput] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categoryAmount, setCategoryAmount] = useState('');

    const budget = Number(monthlyBudget || 0);
    const spent = Number(monthlySpent || 0);

    const percentage =
        budget > 0
            ? (spent / budget) * 100
            : 0;

    const progressPercentage = Math.min(
        percentage,
        100
    );

    const monthlyExceeded =
        budget > 0 && spent > budget;

    useEffect(() => {
        if (budget > 0) {
            setBudgetInput(String(budget));
        }
    }, [budget]);

    const normalizedCategoryBudgets = useMemo(() => {
        return (categoryBudgets || []).map((item) => {
            const budgetAmount = Number(
                item.budgetAmount ??
                item.amount ??
                item.budget ??
                0
            );

            const spentAmount = Number(
                item.spentAmount ??
                item.spent ??
                item.totalSpent ??
                0
            );

            return {
                ...item,

                categoryBudgetId:
                    item.categoryBudgetId ??
                    item.category_budget_id ??
                    item.id,

                categoryId:
                    item.categoryId ??
                    item.category_id,

                categoryName:
                    item.categoryName ??
                    item.category_name ??
                    item.name ??
                    'Unknown Category',

                budgetAmount,
                spentAmount,

                percentage:
                    budgetAmount > 0
                        ? (spentAmount / budgetAmount) * 100
                        : 0
            };
        });
    }, [categoryBudgets]);

    const saveMonthlyBudget = async () => {
        await onSaveMonthlyBudget?.(budgetInput);
    };

    const saveCategoryBudget = async () => {
        await onSaveCategoryBudget?.(
            categoryId,
            categoryAmount
        );

        setCategoryAmount('');
    };

    return (
        <div>
            <Header />

            <section style={styles.card}>
                <div style={styles.sectionHeader}>
                    <div>
                        <p style={styles.label}>
                            MONTHLY BUDGET
                        </p>

                        <h2 style={styles.amount}>
                            {money(budget)}
                        </h2>

                        <p style={styles.muted}>
                            Monthly spending limit
                        </p>
                    </div>

                    {budget > 0 && (
                        <div
                            style={{
                                ...styles.statusBadge,
                                ...(monthlyExceeded
                                    ? styles.dangerBadge
                                    : percentage >= 80
                                    ? styles.warningBadge
                                    : styles.safeBadge)
                            }}
                        >
                            {monthlyExceeded
                                ? 'BUDGET EXCEEDED'
                                : percentage >= 80
                                ? 'LIMIT ALMOST REACHED'
                                : 'UNDER BUDGET'}
                        </div>
                    )}
                </div>

                <div style={styles.spendingRow}>
                    <div>
                        <span style={styles.spendingLabel}>
                            SPENT THIS MONTH
                        </span>

                        <strong
                            style={{
                                ...styles.spendingValue,
                                color: monthlyExceeded
                                    ? '#ff5877'
                                    : '#ffffff'
                            }}
                        >
                            {money(spent)}
                        </strong>
                    </div>

                    <div style={styles.percentageBlock}>
                        <strong
                            style={{
                                ...styles.percentage,
                                color: monthlyExceeded
                                    ? '#ff5877'
                                    : percentage >= 80
                                    ? '#fbbf24'
                                    : '#7b72ff'
                            }}
                        >
                            {percentage.toFixed(0)}%
                        </strong>

                        <span style={styles.mutedSmall}>
                            of {money(budget)}
                        </span>
                    </div>
                </div>

                <div style={styles.track}>
                    <div
                        style={{
                            ...styles.progress,
                            width: `${progressPercentage}%`,
                            background: monthlyExceeded
                                ? '#ff3f63'
                                : percentage >= 80
                                ? '#f59e0b'
                                : '#6256ff'
                        }}
                    />
                </div>

                {monthlyExceeded && (
                    <div style={styles.dangerAlert}>
                        <span style={styles.alertIcon}>
                            !
                        </span>

                        <div>
                            <strong style={styles.alertTitle}>
                                MONTHLY BUDGET EXCEEDED
                            </strong>

                            <p style={styles.alertText}>
                                You have spent{' '}
                                {money(spent - budget)} more than
                                your monthly limit of {money(budget)}.
                            </p>
                        </div>
                    </div>
                )}

                {!monthlyExceeded &&
                    budget > 0 &&
                    percentage >= 80 && (
                        <div style={styles.warningAlert}>
                            <span style={styles.warningIcon}>
                                !
                            </span>

                            <div>
                                <strong style={styles.warningTitle}>
                                    BUDGET ALMOST USED
                                </strong>

                                <p style={styles.alertText}>
                                    You have used{' '}
                                    {percentage.toFixed(0)}% of your
                                    monthly budget.
                                </p>
                            </div>
                        </div>
                    )}

                <div style={styles.formRow}>
                    <input
                        style={styles.input}
                        type="number"
                        min="1"
                        placeholder="MONTHLY LIMIT"
                        value={budgetInput}
                        onChange={(event) =>
                            setBudgetInput(event.target.value)
                        }
                    />

                    <button
                        type="button"
                        style={styles.button}
                        onClick={saveMonthlyBudget}
                    >
                        SAVE BUDGET
                    </button>
                </div>
            </section>

            <section
                style={{
                    ...styles.card,
                    marginTop: '25px'
                }}
            >
                <div>
                    <p style={styles.label}>
                        CATEGORY BUDGETS
                    </p>

                    <h2 style={styles.cardTitle}>
                        Category Spending Limits
                    </h2>

                    <p style={styles.muted}>
                        Set individual limits and track category
                        spending.
                    </p>
                </div>

                <div style={styles.categoryForm}>
                    <select
                        style={styles.input}
                        value={categoryId}
                        onChange={(event) =>
                            setCategoryId(event.target.value)
                        }
                    >
                        <option value="">
                            SELECT CATEGORY
                        </option>

                        {categories.map((category) => {
                            const id =
                                category.categoryId ??
                                category.category_id;

                            return (
                                <option
                                    key={id}
                                    value={id}
                                >
                                    {category.name}
                                </option>
                            );
                        })}
                    </select>

                    <input
                        style={styles.input}
                        type="number"
                        min="1"
                        placeholder="BUDGET AMOUNT"
                        value={categoryAmount}
                        onChange={(event) =>
                            setCategoryAmount(
                                event.target.value
                            )
                        }
                    />

                    <button
                        type="button"
                        style={styles.button}
                        onClick={saveCategoryBudget}
                    >
                        SET BUDGET
                    </button>
                </div>

                <div style={styles.budgetList}>
                    {normalizedCategoryBudgets.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p style={styles.muted}>
                                No category budgets created.
                            </p>
                        </div>
                    ) : (
                        normalizedCategoryBudgets.map(
                            (item, index) => {
                                const exceeded =
                                    item.budgetAmount > 0 &&
                                    item.spentAmount >
                                        item.budgetAmount;

                                const almostReached =
                                    !exceeded &&
                                    item.percentage >= 80;

                                const width = Math.min(
                                    item.percentage,
                                    100
                                );

                                return (
                                    <div
                                        key={
                                            item.categoryBudgetId ??
                                            `${item.categoryName}-${index}`
                                        }
                                        style={{
                                            ...styles.categoryBudgetCard,
                                            borderColor: exceeded
                                                ? '#7f1d36'
                                                : '#1d2b45'
                                        }}
                                    >
                                        <div
                                            style={
                                                styles.rowBetween
                                            }
                                        >
                                            <div>
                                                <strong
                                                    style={
                                                        styles.categoryName
                                                    }
                                                >
                                                    {
                                                        item.categoryName
                                                    }
                                                </strong>

                                                <p
                                                    style={
                                                        styles.categoryNumbers
                                                    }
                                                >
                                                    {money(
                                                        item.spentAmount
                                                    )}{' '}
                                                    spent of{' '}
                                                    {money(
                                                        item.budgetAmount
                                                    )}
                                                </p>
                                            </div>

                                            <div
                                                style={
                                                    styles.categoryRight
                                                }
                                            >
                                                <strong
                                                    style={{
                                                        ...styles.categoryPercentage,
                                                        color: exceeded
                                                            ? '#ff5877'
                                                            : almostReached
                                                            ? '#fbbf24'
                                                            : '#7b72ff'
                                                    }}
                                                >
                                                    {item.percentage.toFixed(
                                                        0
                                                    )}
                                                    %
                                                </strong>

                                                {exceeded && (
                                                    <span
                                                        style={
                                                            styles.exceededText
                                                        }
                                                    >
                                                        EXCEEDED BY{' '}
                                                        {money(
                                                            item.spentAmount -
                                                                item.budgetAmount
                                                        )}
                                                    </span>
                                                )}

                                                {almostReached && (
                                                    <span
                                                        style={
                                                            styles.almostText
                                                        }
                                                    >
                                                        LIMIT ALMOST
                                                        REACHED
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            style={
                                                styles.categoryTrack
                                            }
                                        >
                                            <div
                                                style={{
                                                    ...styles.progress,
                                                    width: `${width}%`,
                                                    background: exceeded
                                                        ? '#ff3f63'
                                                        : almostReached
                                                        ? '#f59e0b'
                                                        : '#6256ff'
                                                }}
                                            />
                                        </div>

                                        {exceeded && (
                                            <div
                                                style={
                                                    styles.categoryDanger
                                                }
                                            >
                                                Budget exceeded. You
                                                have crossed the{' '}
                                                {item.categoryName}{' '}
                                                limit by{' '}
                                                {money(
                                                    item.spentAmount -
                                                        item.budgetAmount
                                                )}
                                                .
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        )
                    )}
                </div>
            </section>
        </div>
    );
};

const Header = () => (
    <div style={styles.header}>
        <p style={styles.label}>
            FINANCIAL PLANNING
        </p>

        <h1 style={styles.title}>
            Budgets
        </h1>

        <p style={styles.muted}>
            Set spending limits and keep your expenses under control.
        </p>
    </div>
);

const styles = {
    header: {
        marginBottom: '35px'
    },

    title: {
        color: '#fff',
        fontSize: '36px',
        margin: '5px 0'
    },

    label: {
        color: '#7b72ff',
        fontSize: '12px',
        fontWeight: '900',
        letterSpacing: '2px'
    },

    muted: {
        color: '#7188ad'
    },

    mutedSmall: {
        color: '#7188ad',
        fontSize: '13px'
    },

    card: {
        background: '#111b30',
        border: '1px solid #1d2b45',
        borderRadius: '28px',
        padding: '35px'
    },

    cardTitle: {
        color: '#ffffff',
        margin: '8px 0',
        fontSize: '24px'
    },

    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px'
    },

    amount: {
        color: '#fff',
        fontSize: '40px',
        margin: '10px 0 5px'
    },

    statusBadge: {
        padding: '12px 18px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '900',
        letterSpacing: '1px'
    },

    dangerBadge: {
        background: '#4c1022',
        color: '#ff5877',
        border: '1px solid #7f1d36'
    },

    warningBadge: {
        background: '#422d0b',
        color: '#fbbf24',
        border: '1px solid #713f12'
    },

    safeBadge: {
        background: '#063c31',
        color: '#22d39a',
        border: '1px solid #065f46'
    },

    spendingRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: '35px'
    },

    spendingLabel: {
        display: 'block',
        color: '#7188ad',
        fontSize: '11px',
        fontWeight: '800',
        letterSpacing: '1px',
        marginBottom: '8px'
    },

    spendingValue: {
        display: 'block',
        fontSize: '27px'
    },

    percentageBlock: {
        textAlign: 'right'
    },

    percentage: {
        display: 'block',
        fontSize: '25px'
    },

    track: {
        background: '#030814',
        height: '14px',
        borderRadius: '20px',
        overflow: 'hidden',
        margin: '25px 0'
    },

    categoryTrack: {
        background: '#030814',
        height: '10px',
        borderRadius: '20px',
        overflow: 'hidden',
        marginTop: '18px'
    },

    progress: {
        height: '100%',
        borderRadius: '20px',
        transition: 'width 0.3s ease'
    },

    dangerAlert: {
        display: 'flex',
        gap: '15px',
        alignItems: 'flex-start',
        background: '#310b18',
        border: '1px solid #7f1d36',
        padding: '18px',
        borderRadius: '16px'
    },

    warningAlert: {
        display: 'flex',
        gap: '15px',
        alignItems: 'flex-start',
        background: '#332309',
        border: '1px solid #713f12',
        padding: '18px',
        borderRadius: '16px'
    },

    alertIcon: {
        background: '#ff3f63',
        color: '#ffffff',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontWeight: '900'
    },

    warningIcon: {
        background: '#f59e0b',
        color: '#ffffff',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontWeight: '900'
    },

    alertTitle: {
        color: '#ff5877',
        fontSize: '13px'
    },

    warningTitle: {
        color: '#fbbf24',
        fontSize: '13px'
    },

    alertText: {
        color: '#a7b7d4',
        margin: '6px 0 0',
        fontSize: '13px'
    },

    formRow: {
        display: 'flex',
        gap: '15px',
        marginTop: '30px'
    },

    categoryForm: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 220px',
        gap: '15px',
        marginTop: '30px'
    },

    input: {
        background: '#030814',
        border: '1px solid #293750',
        color: '#fff',
        padding: '17px',
        borderRadius: '12px',
        outline: 'none',
        flex: 1
    },

    button: {
        background: '#5146e5',
        border: 'none',
        color: '#fff',
        padding: '17px 30px',
        borderRadius: '12px',
        fontWeight: '800',
        cursor: 'pointer'
    },

    budgetList: {
        marginTop: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },

    emptyState: {
        background: '#050b18',
        border: '1px solid #1d2b45',
        padding: '25px',
        borderRadius: '16px'
    },

    categoryBudgetCard: {
        background: '#050b18',
        border: '1px solid #1d2b45',
        padding: '22px',
        borderRadius: '16px'
    },

    rowBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px'
    },

    categoryName: {
        color: '#ffffff',
        textTransform: 'uppercase',
        fontSize: '16px'
    },

    categoryNumbers: {
        color: '#7188ad',
        margin: '8px 0 0',
        fontSize: '13px'
    },

    categoryRight: {
        textAlign: 'right'
    },

    categoryPercentage: {
        display: 'block',
        fontSize: '20px'
    },

    exceededText: {
        display: 'block',
        color: '#ff5877',
        fontSize: '11px',
        fontWeight: '900',
        marginTop: '6px'
    },

    almostText: {
        display: 'block',
        color: '#fbbf24',
        fontSize: '11px',
        fontWeight: '900',
        marginTop: '6px'
    },

    categoryDanger: {
        background: '#310b18',
        color: '#ff7890',
        padding: '12px 14px',
        borderRadius: '10px',
        marginTop: '15px',
        fontSize: '12px',
        fontWeight: '700'
    }
};

export default Budgets;