

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Correspondence } from '../../types';

interface DocsPerDeptChartProps {
    data: Correspondence[];
}

const DocsPerDeptChart: React.FC<DocsPerDeptChartProps> = ({ data }) => {
    const deptCounts = data.reduce((acc, doc) => {
        const dept = doc.department;
        const existing = acc.find(item => item.name === dept);
        if (existing) {
            existing.documents += 1;
        } else {
            acc.push({ name: dept, documents: 1 });
        }
        return acc;
    }, [] as { name: string; documents: number }[]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={deptCounts}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke="#a0aec0" />
                <YAxis allowDecimals={false} stroke="#a0aec0" />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(4px)'
                    }} 
                />
                <Legend wrapperStyle={{ color: '#e2e8f0' }}/>
                <Bar dataKey="documents" fill="#0d9488" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DocsPerDeptChart;