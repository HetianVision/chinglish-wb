/**
 * 空状态组件 - 熊猫黑白极简设计
 * 用于展示无数据、无搜索结果等空状态
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = '🔍',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-20', className)}>
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6 border-2 border-border">
        <span className="text-4xl">{icon}</span>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {/* Action Button */}
      {(actionLabel && (actionHref || onAction)) && (
        <>
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="outline" className="border-2">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              className="border-2"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
