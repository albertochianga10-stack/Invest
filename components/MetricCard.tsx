
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, trend, description }) => {
  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between transition-transform hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
        <i className={`${icon} applemar-gold text-xl opacity-80`}></i>
      </div>
      <div>
        <h3 className="text-2xl font-bold applemar-gold">{value}</h3>
        {description && <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">{description}</p>}
      </div>
      {trend && (
        <div className={`mt-4 text-xs font-medium flex items-center ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-gray-400'}`}>
          <i className={`fas fa-caret-${trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'right'} mr-1`}></i>
          {trend === 'up' ? 'Positivo' : trend === 'down' ? 'Abaixo do esperado' : 'Estável'}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
