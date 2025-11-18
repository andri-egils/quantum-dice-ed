import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function Distribution({ data }: { data: any }) {
  const keys = Object.keys(data).filter((k) => k !== '_rejected').sort((a, b) => Number(a) - Number(b));
  const arr = keys.map((k) => ({ name: k, value: Number(data[k]) }));
  if (data._rejected) arr.push({ name: '_rejected', value: Number(data._rejected) });

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={arr}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
