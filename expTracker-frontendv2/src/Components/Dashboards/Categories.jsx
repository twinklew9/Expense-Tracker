import React, { useState } from 'react';

const Categories = ({
    categories = [],
    onAddCategory,
    onDeleteCategory
}) => {
    const [categoryName, setCategoryName] = useState('');

    const addCategory = () => {
        if (!categoryName.trim()) {
            alert('Enter category name');
            return;
        }

        onAddCategory?.(categoryName.trim());
        setCategoryName('');
    };

    return (
        <div>
            <div style={styles.header}>
                <p style={styles.label}>ORGANIZATION</p>
                <h1 style={styles.title}>Categories</h1>
                <p style={styles.muted}>
                    Organize transactions into meaningful groups.
                </p>
            </div>

            <section style={styles.addCard}>
                <input
                    style={styles.input}
                    placeholder="NEW CATEGORY NAME"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                />

                <button
                    type="button"
                    style={styles.button}
                    onClick={addCategory}
                >
                    + ADD CATEGORY
                </button>
            </section>

            <section style={styles.grid}>
                {categories.length === 0 ? (
                    <p style={styles.muted}>No categories created.</p>
                ) : (
                    categories.map((category) => (
                        <div
                            key={category.categoryId}
                            style={styles.categoryCard}
                        >
                            <div>
                                <p style={styles.label}>CATEGORY</p>
                                <h2 style={styles.categoryName}>
                                    {category.name}
                                </h2>
                            </div>

                            <button
                                type="button"
                                style={styles.deleteButton}
                                onClick={() => onDeleteCategory?.(category)}
                            >
                                DELETE
                            </button>
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
        fontSize: '11px',
        fontWeight: '900',
        letterSpacing: '2px'
    },
    title: { color: '#fff', fontSize: '36px', margin: '5px 0' },
    muted: { color: '#7188ad' },
    addCard: {
        background: '#111b30',
        border: '1px solid #1d2b45',
        borderRadius: '22px',
        padding: '25px',
        display: 'flex',
        gap: '15px',
        marginBottom: '25px'
    },
    input: {
        flex: 1,
        background: '#030814',
        color: '#fff',
        border: '1px solid #293750',
        borderRadius: '12px',
        padding: '17px',
        outline: 'none'
    },
    button: {
        background: '#5146e5',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        padding: '17px 25px',
        fontWeight: '800',
        cursor: 'pointer'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
    },
    categoryCard: {
        background: '#111b30',
        border: '1px solid #1d2b45',
        borderRadius: '22px',
        padding: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    categoryName: {
        color: '#fff',
        textTransform: 'uppercase'
    },
    deleteButton: {
        background: '#401326',
        color: '#ff5877',
        border: 'none',
        borderRadius: '8px',
        padding: '10px',
        cursor: 'pointer'
    }
};

export default Categories;