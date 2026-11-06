import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200/90 p-5 shadow-subtle hover:shadow-card transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center text-forest-700">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          {value !== undefined ? value : '—'}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.positive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
