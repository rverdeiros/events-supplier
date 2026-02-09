'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  href?: string;
  isLoading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'info';
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  href,
  isLoading = false,
  variant = 'default',
  description,
}) => {
  const variants = {
    default: 'border-gray-200',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    info: 'border-blue-200 bg-blue-50',
  };

  const content = (
    <Card className={cn('h-full transition-shadow hover:shadow-md', variants[variant])}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {Icon && <Icon className="w-5 h-5 text-gray-400" />}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loading variant="inline" size="sm" />
        ) : (
          <>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
