import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, subValue, change, icon: Icon, color = "var(--ink)" }) => {
    const isPositive = change >= 0;

    return (
        <div className="dashboard-stat-card">
            <div className="stat-card-header" style={{ marginBottom: '1rem' }}>
                <p className="stat-label">{title}</p>

            </div>
            <div className="stat-card-body">
                <h2 className="stat-value">{value}</h2>
                {subValue && <p className="stat-subvalue">{subValue}</p>}
            </div>
        </div>
    );
};

export default StatCard;
