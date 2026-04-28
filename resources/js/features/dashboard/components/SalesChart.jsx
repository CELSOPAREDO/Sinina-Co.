import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart = ({ data }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 font-serif">Sales Performance</h3>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-black"></span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Revenue</span>
                </div>
            </div>
            <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%" aspect={2} minHeight={300}>
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} 
                            dy={10}
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return date.toLocaleDateString('en-US', { weekday: 'short' });
                            }}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} 
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '12px' }}
                            itemStyle={{ fontWeight: 800, color: '#000' }}
                            formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Revenue']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#000" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorSales)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
