import React, { useState } from 'react';

const Reports = ({
    analytics,
    onDownloadPdf
}) => {
    const [month, setMonth] = useState(
        new Date().toISOString().slice(0, 7)
    );

    return (
        <div>
            <div style={styles.header}>
                <p style={styles.label}>FINANCIAL DOCUMENTS</p>
                <h1 style={styles.title}>Reports</h1>
                <p style={styles.muted}>
                    Review and export your monthly financial summary.
                </p>
            </div>

            <section style={styles.card}>
                <div>
                    <p style={styles.label}>MONTHLY FINANCIAL REPORT</p>
                    <h2 style={styles.reportTitle}>
                        Export your financial summary as PDF
                    </h2>
                </div>

                <div style={styles.actions}>
                    <input
                        style={styles.input}
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    />

                    <button
                        style={styles.button}
                        onClick={() => onDownloadPdf?.(month)}
                    >
                        DOWNLOAD PDF
                    </button>
                </div>
            </section>

            <div style={styles.summaryGrid}>
                <Summary
                    label="TOTAL INCOME"
                    value={analytics?.totalIncome}
                    color="#22d39a"
                />

                <Summary
                    label="TOTAL EXPENSE"
                    value={analytics?.totalExpense}
                    color="#ff5877"
                />

                <Summary
                    label="CURRENT BALANCE"
                    value={
                        Number(analytics?.totalIncome || 0) -
                        Number(analytics?.totalExpense || 0)
                    }
                    color="#ffffff"
                />
            </div>
        </div>
    );
};

const Summary = ({ label, value, color }) => (
    <div style={styles.summary}>
        <p style={styles.label}>{label}</p>

        <h2 style={{ ...styles.summaryValue, color }}>
            ₹{Number(value || 0).toLocaleString('en-IN')}
        </h2>
    </div>
);

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
        padding: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    reportTitle: { color: '#fff', fontSize: '25px' },
    actions: { display: 'flex', gap: '15px' },
    input: {
        background: '#030814',
        color: '#fff',
        border: '1px solid #293750',
        padding: '16px',
        borderRadius: '12px'
    },
    button: {
        background: '#0da47a',
        color: '#fff',
        border: 'none',
        padding: '16px 25px',
        borderRadius: '12px',
        fontWeight: '800',
        cursor: 'pointer'
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '25px',
        marginTop: '25px'
    },
    summary: {
        background: '#111b30',
        border: '1px solid #1d2b45',
        borderRadius: '22px',
        padding: '30px'
    },
    summaryValue: { fontSize: '28px' }
};

export default Reports;