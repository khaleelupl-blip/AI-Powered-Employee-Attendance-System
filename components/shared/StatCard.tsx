import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'indigo' | 'green' | 'red' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    const colorClasses = {
        indigo: 'from-indigo-500 to-indigo-600',
        green: 'from-green-500 to-green-600',
        red: 'from-red-500 to-red-600',
        yellow: 'from-yellow-500 to-yellow-600',
        purple: 'from-purple-500 to-purple-600',
    };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} text-white p-6 rounded-xl shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider opacity-80">{title}</p>
          <p className="text-4xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl opacity-50">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;