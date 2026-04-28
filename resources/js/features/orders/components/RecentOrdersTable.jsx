import React from 'react';
import { Eye, CheckCircle } from 'lucide-react';

const RecentOrdersTable = ({ orders, onMarkCompleted }) => {
    const getStatusStyles = (status) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-700 border-amber-100',
            processing: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            cancelled: 'bg-rose-50 text-rose-700 border-rose-100'
        };
        return styles[status.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-100';
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 font-serif">Recent Orders</h3>
                <button className="text-sm font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">View All</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="pb-4 px-2">Order ID</th>
                            <th className="pb-4 px-2">Customer</th>
                            <th className="pb-4 px-2">Status</th>
                            <th className="pb-4 px-2">Total</th>
                            <th className="pb-4 px-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan="5" className="py-20 text-center text-gray-400 font-medium">No orders found</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-2">
                                        <span className="font-black text-gray-900">#{order.id}</span>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{order.user?.name || 'Guest'}</p>
                                            <p className="text-gray-400 text-[11px] font-medium">{order.user?.email || order.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 font-black text-gray-900">₱{Number(order.total_price).toLocaleString()}</td>
                                    <td className="py-4 px-2 text-gray-400 text-xs font-medium">{new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentOrdersTable;
