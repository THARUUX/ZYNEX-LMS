// components/BarGraph.js
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BarGraph = ({ data }) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  return (
    <div style={{ width: '100%' , height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
            layout="vertical"  // 👈 This makes it vertical
            data={data}
            margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            barSize={20}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Marks" fill="#314158" background={{ fill: '#eee' }} />
        </BarChart>
        </ResponsiveContainer>

    </div>
  );
};

export default BarGraph;
