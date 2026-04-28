import React from 'react';

const TopSellingProducts = ({ products }) => {
    return (
        <div className="dashboard-list-card">
            <div className="card-header">
                <h3>Best Sellers</h3>
            </div>
            <div className="card-body">
                {products.length === 0 ? (
                    <p className="empty-msg">No sales data yet</p>
                ) : (
                    products.map((product, index) => (
                        <div key={product.id} className="list-item">
                            <div className="item-rank">{index + 1}</div>
                            <div className="item-image">
                                {product.image ? (
                                    <img src={`/storage/${product.image}`} alt={product.name} />
                                ) : (
                                    <div className="no-image">NA</div>
                                )}
                            </div>
                            <div className="item-info">
                                <p className="item-name">{product.name}</p>
                                <p className="item-meta">Total Sold: {product.total_sold}</p>
                            </div>
                            <div className="item-action">
                                <span className="trend-badge">Top</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TopSellingProducts;
