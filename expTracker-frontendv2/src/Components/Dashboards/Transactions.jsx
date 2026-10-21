import React from 'react';

const Transactions = ({
    expenses = [],
    onAddTransaction,
    onEditTransaction,
    onDeleteTransaction,
    onBulkUpload,
    currentPage = 1,
    totalPages = 1,
    onPageChange
}) => {
    return (
        <div>
            <PageHeader
                title="Transactions"
                subtitle="Add, review and manage your financial records."
            />

            <div style={styles.toolbar}>
                <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={onAddTransaction}
                >
                    + ADD TRANSACTION
                </button>

                <label style={styles.uploadButton}>
                    UPLOAD CSV
                    <input
                        type="file"
                        accept=".csv"
                        hidden
                        onChange={onBulkUpload}
                    />
                </label>
            </div>

            <section style={styles.card}>
                {expenses.length === 0 ? (
                    <p style={styles.empty}>No transactions found.</p>
                ) : (
                    expenses.map((expense) => (
                        <div
                            key={expense.expenseId}
                            style={styles.transaction}
                        >
                            <div style={styles.left}>
                                <div style={styles.icon}>
                                    {expense.icon || '💸'}
                                </div>

                                <div>
                                    <h3 style={styles.title}>
                                        {expense.title}
                                    </h3>

                                    <p style={styles.meta}>
                                        {expense.categoryName || 'UNCATEGORIZED'}
                                        {' // '}
                                        {expense.date
                                            ? new Date(expense.date).toLocaleDateString()
                                            : ''}
                                    </p>
                                </div>
                            </div>

                            <div style={styles.actions}>
                                <strong
                                    style={{
                                        color:
                                            expense.type === 'income'
                                                ? '#22d39a'
                                                : '#ffffff'
                                    }}
                                >
                                    {expense.type === 'income' ? '+' : '-'}
                                    ₹{Number(expense.amount || 0).toLocaleString('en-IN')}
                                </strong>

                                <button
                                    type="button"
                                    style={styles.actionButton}
                                    onClick={() => onEditTransaction?.(expense)}
                                >
                                    EDIT
                                </button>

                                <button
                                    type="button"
                                    style={styles.deleteButton}
                                    onClick={() => onDeleteTransaction?.(expense)}
                                >
                                    DELETE
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </section>

            <div style={styles.pagination}>
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    style={styles.pageButton}
                    onClick={() => onPageChange?.(currentPage - 1)}
                >
                    PREV
                </button>

                <span style={styles.pageText}>
                    PAGE {currentPage} OF {totalPages}
                </span>

                <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    style={styles.pageButton}
                    onClick={() => onPageChange?.(currentPage + 1)}
                >
                    NEXT
                </button>
            </div>
        </div>
    );
};

const PageHeader = ({ title, subtitle }) => (
    <div style={styles.header}>
        <p style={styles.label}>MONEY LOG</p>
        <h1 style={styles.pageTitle}>{title}</h1>
        <p style={styles.subtitle}>{subtitle}</p>
    </div>
);

const styles = {
    header: { marginBottom: '35px' },
    label: {
        color: '#7b72ff',
        fontWeight: '900',
        fontSize: '12px',
        letterSpacing: '2px'
    },
    pageTitle: { color: '#fff', fontSize: '36px', margin: '5px 0' },
    subtitle: { color: '#7188ad' },
    toolbar: {
        display: 'flex',
        gap: '15px',
        marginBottom: '25px'
    },
    primaryButton: {
        background: '#5146e5',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        padding: '16px 25px',
        fontWeight: '800',
        cursor: 'pointer'
    },
    uploadButton: {
        border: '1px solid #293750',
        color: '#a7b7d4',
        borderRadius: '12px',
        padding: '16px 25px',
        fontWeight: '800',
        cursor: 'pointer'
    },
    card: {
        background: '#111b30',
        border: '1px solid #1d2b45',
        borderRadius: '28px',
        padding: '25px'
    },
    transaction: {
        background: '#050b18',
        border: '1px solid #1d2b45',
        borderRadius: '20px',
        padding: '20px 25px',
        marginBottom: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    left: { display: 'flex', alignItems: 'center', gap: '20px' },
    icon: {
        width: '55px',
        height: '55px',
        border: '1px solid #253550',
        borderRadius: '15px',
        display: 'grid',
        placeItems: 'center',
        fontSize: '22px'
    },
    title: {
        color: '#fff',
        margin: 0,
        textTransform: 'uppercase'
    },
    meta: {
        color: '#52698e',
        fontSize: '11px',
        fontWeight: '800'
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    actionButton: {
        background: '#18233b',
        color: '#a7b7d4',
        border: 'none',
        padding: '9px 12px',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    deleteButton: {
        background: '#401326',
        color: '#ff5877',
        border: 'none',
        padding: '9px 12px',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '25px'
    },
    pageButton: {
        background: '#111b30',
        border: 'none',
        color: '#a7b7d4',
        padding: '14px 25px',
        borderRadius: '10px',
        cursor: 'pointer'
    },
    pageText: {
        color: '#7188ad',
        fontSize: '11px',
        fontWeight: '800',
        letterSpacing: '1px'
    },
    empty: { color: '#7188ad' }
};

export default Transactions;