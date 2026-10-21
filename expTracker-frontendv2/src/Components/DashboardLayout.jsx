import React from 'react';
import Sidebar from './SideBar';

const DashboardLayout = ({
    activePage,
    setActivePage,
    user,
    onSignOut,
    children
}) => {
    return (
        <div style={styles.app}>
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                user={user}
                onSignOut={onSignOut}
            />

            <main style={styles.mainContent}>
                {children}
            </main>
        </div>
    );
};

const styles = {
    app: {
        minHeight: '100vh',
        background: '#030814'
    },

    mainContent: {
        marginLeft: '270px',
        minHeight: '100vh',
        padding: '45px 55px',
        boxSizing: 'border-box'
    }
};

export default DashboardLayout;