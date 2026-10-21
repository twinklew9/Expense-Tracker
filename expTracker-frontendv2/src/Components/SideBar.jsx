import React from 'react';

const Sidebar = ({ activePage, setActivePage, user, onSignOut }) => {
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: '◈' },
        { id: 'transactions', label: 'Transactions', icon: '↕' },
        { id: 'budgets', label: 'Budgets', icon: '▣' },
        { id: 'recurring', label: 'Recurring', icon: '↻' },
        { id: 'reports', label: 'Reports', icon: '▤' },
        { id: 'categories', label: 'Categories', icon: '⊞' }
    ];

    return (
        <aside style={styles.sidebar}>
            <div>
                <div style={styles.logo}>
                    <span style={styles.logoWhite}>EXPENSE</span>
                    <span style={styles.logoPurple}>TRACKER</span>
                </div>

                <p style={styles.userText}>
                    USER // {user?.username?.toUpperCase() || 'USER'}
                </p>

                <nav style={styles.navigation}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setActivePage(item.id)}
                            style={{
                                ...styles.menuButton,
                                ...(activePage === item.id
                                    ? styles.activeButton
                                    : {})
                            }}
                        >
                            <span style={styles.icon}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <button
                type="button"
                onClick={onSignOut}
                style={styles.signOutButton}
            >
                SIGN OUT
            </button>
        </aside>
    );
};

const styles = {
    sidebar: {
        width: '270px',
        minWidth: '270px',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: '#080d1a',
        borderRight: '1px solid #1c2940',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        zIndex: 100
    },

    logo: {
        fontSize: '25px',
        fontWeight: '900',
        letterSpacing: '-1px'
    },

    logoWhite: {
        color: '#ffffff'
    },

    logoPurple: {
        color: '#6256ff'
    },

    userText: {
        color: '#7188ad',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '2px',
        marginTop: '8px'
    },

    navigation: {
        marginTop: '60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },

    menuButton: {
        width: '100%',
        border: 'none',
        background: 'transparent',
        color: '#7188ad',
        padding: '16px 18px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        fontSize: '13px',
        fontWeight: '800',
        letterSpacing: '1px',
        cursor: 'pointer',
        textAlign: 'left'
    },

    activeButton: {
        background: '#5146e5',
        color: '#ffffff'
    },

    icon: {
        width: '22px',
        fontSize: '20px',
        textAlign: 'center'
    },

    signOutButton: {
        border: '1px solid #293750',
        background: 'transparent',
        color: '#ff5877',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: '800',
        letterSpacing: '2px',
        cursor: 'pointer'
    }
};

export default Sidebar;