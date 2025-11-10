'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { OddsSnapshot } from '@/types';
import { formatTime } from '@/lib/utils';

interface OddsChartProps {
  data: OddsSnapshot[];
  horseName: string;
}

interface ChartDataPoint {
  timestamp: string;
  time: string;
  [bookmaker: string]: string | number;
}

export default function OddsChart({ data, horseName }: OddsChartProps) {
  // Group data by timestamp and bookmaker
  const chartData: ChartDataPoint[] = [];
  const bookmakers = new Set<string>();

  // Sort by timestamp
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group by timestamp
  const groupedByTime = sortedData.reduce((acc, snapshot) => {
    const time = snapshot.timestamp;
    if (!acc[time]) {
      acc[time] = {
        timestamp: time,
        time: formatTime(time),
      };
    }
    acc[time][snapshot.bookmaker] = snapshot.winOdds;
    bookmakers.add(snapshot.bookmaker);
    return acc;
  }, {} as { [key: string]: ChartDataPoint });

  Object.values(groupedByTime).forEach((point) => {
    chartData.push(point);
  });

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const bookmakerList = Array.from(bookmakers);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center">No historical data available for {horseName}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Odds Movement - {horseName}
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            label={{ value: 'Odds', angle: -90, position: 'insideLeft' }}
            domain={['auto', 'auto']}
          />
          <Tooltip />
          <Legend />
          {bookmakerList.map((bookmaker, index) => (
            <Line
              key={bookmaker}
              type="monotone"
              dataKey={bookmaker}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
