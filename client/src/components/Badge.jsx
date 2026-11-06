import React from 'react';

const Badge = ({ variant = 'default', children, size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  const variants = {
    available: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    borrowed: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    overdue: 'bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold animate-pulse',
    returned: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    late: 'bg-orange-50 text-orange-700 border border-orange-200/80 font-medium',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    forest: 'bg-forest-50 text-forest-800 border border-forest-200',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
    default: 'bg-gray-50 text-gray-700 border border-gray-200',
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${selectedVariant} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
