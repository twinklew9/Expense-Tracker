import React, { useState } from 'react';

const Recurring = ({
    categories = [],
    recurringTransactions = [],
    onAddRecurring,
    onDeleteRecurring
}) => {
    const [form, setForm] = useState({
        title: '',
        amount: '',
        categoryId: '',
        type: 'expense',
        frequency: 'monthly',
        nextDate: ''
    });

    const updateForm = (field, value) => {
        setForm((old) => ({
            ...old,
            [field]: value
        }));
    };

    const submit = () => {
        onAddRecurring?.(form);
    };

    return (
        <div>
            <div style={styles.header}>
                <p style={styles.label}>AUTOMATION</p>
                <h1 style={styles.title}>Recurring Transactions</h1>
                <p style={styles.muted}>
                    Manage regular expenses and income.
                </p>
            </div>

            <section style={styles.card}>
                <p style={styles.label}>NEW RECURRING TRANSACTION</p>

                <div style={styles.formGrid}>
                    <input
                        style={styles.input}
                        placeholder="TITLE"
                        value={form.title}
                        onChange={(e) => updateForm('title', e.target.value)}
                    />

                    <input
                        style={styles.input}
                        type="number"
                        min="1"
                        placeholder="AMOUNT"
                        value={form.amount}
                        onChange={(e) => updateForm('amount', e.target.value)}
                    />

                    <select
                        style={styles.input}
                        value={form.categoryId}
                        onChange={(e) =>
                            updateForm('categoryId', e.target.value)
                        }
                    >
                        <option value="">CATEGORY</option>

                        {categories.map((category) => (
                            <option
                                key={category.categoryId}
                                value={category.categoryId}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        style={styles.input}
                        value={form.type}
                        onChange={(e) => updateForm('type', e.target.value)}
                    >
                        <option value="expense">EXPENSE</option>
                        <option value="income">INCOME</option>
                    </select>

                    <select
                        style={styles.input}
                        value={form.frequency}
                        onChange={(e) =>
                            updateForm('frequency', e.target.value)
                        }
                    >
                        <option value="weekly">WEEKLY</option>
                        <option value="monthly">MONTHLY</option>
                        <option value="yearly">YEARLY</option>
                    </select>

                    <input
                        style={styles.input}
                        type="date"
                        value={form.nextDate}
                        onChange={(e) =>
                            updateForm('nextDate', e.target.value)
                        }
                    />
                </div>

                <button style={styles.button} onClick={submit}>
                    ADD RECURRING TRANSACTION
                </button>
            </section>

            <section style={{ ...styles.card, marginTop: '25px' }}>
                <p style={styles.label}>ACTIVE RECURRING TRANSACTIONS</p>

                {recurringTransactions.length === 0 ? (
                    <p style={styles.muted}>
                        No recurring transactions created.
                    </p>
                ) : (
                    recurringTransactions.map((item, index) => (
                        <div
                            key={item.recurringId || index}
                            style={styles.item}
                        >
                            <div>
                                <h3 style={styles.itemTitle}>
                                    {item.title}
                                </h3>

                                <p style={styles.muted}>
                                    {item.frequency?.toUpperCase()} // NEXT {item.nextDate}
                                </p>
                            </div>

                            <div style={styles.itemRight}>
                                <strong
                                    style={{
                                        color:
                                            item.type === 'income'
                                                ? '#22d39a'
                                                : '#ff5877'
                                    }}
                                >
                                    ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                                </strong>

                                <button
                                    style={styles.deleteButton}
                                    onClick={() => onDeleteRecurring?.(item)}
                                >
                                    DELETE
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
};

const styles = {
    header: { marginBottom: '35px' },
    label: {
        color: '#7b72ff',
        fontSize: '12px',
        fontWeight: '900',
        letterSpacing: '2px'
    },
    title: { color: '#fff', fontSize: '36px', margin: '5px 0' },
    muted: { color: '#7188ad' },
    card: {
        background: '#111b30',
        border: '1px solid #1d2b45',
        borderRadius: '28px',
        padding: '35px'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
        margin: '25px 0'
    },
    input: {
        background: '#030814',
        border: '1px solid #293750',
        color: '#fff',
        padding: '18px',
        borderRadius: '12px',
        outline: 'none'
    },
    button: {
        width: '100%',
        background: '#5146e5',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        padding: '18px',
        fontWeight: '800',
        cursor: 'pointer'
    },
    item: {
        background: '#050b18',
        border: '1px solid #1d2b45',
        padding: '20px',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '15px'
    },
    itemTitle: { color: '#fff', margin: 0 },
    itemRight: { display: 'flex', gap: '20px', alignItems: 'center' },
    deleteButton: {
        background: '#401326',
        color: '#ff5877',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 14px',
        cursor: 'pointer'
    }
};

export default Recurring;