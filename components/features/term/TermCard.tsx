/**
 * 词条卡片组件 - 优化版
 * 清晰的信息层级，更好的视觉效果
 */

import { TermEntry } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TermCardProps {
  term: TermEntry;
  className?: string;
}

export function TermCard({ term, className }: TermCardProps) {
  return (
    <Link href={`/term/${term.id}`}>
      <div
        className={cn(
          'group relative p-6 md:p-8 bg-background border-2 border-border rounded-xl hover:border-foreground hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden',
          className
        )}
      >
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-error/20 via-warning/20 to-success/20" />

        {/* 主要内容区 */}
        <div className="space-y-4">
          {/* 头部：Chinglish + 正确表达 */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {/* Chinglish 表达 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-2xl md:text-3xl font-bold text-error group-hover:text-error/90 transition-colors">
                    {term.chinglish}
                  </h3>
                  {term.oxfordStatus === 'collected' && (
                    <Badge className="bg-foreground text-background text-xs font-semibold px-2.5 py-0.5">
                      牛津收录
                    </Badge>
                  )}
                </div>

                {/* 正确表达 */}
                <div className="flex items-center gap-2">
                  <span className="text-success text-lg">✓</span>
                  <p className="text-xl md:text-2xl font-semibold text-success">
                    {term.correctExpression}
                  </p>
                </div>
              </div>

              {/* 风险指数徽章 */}
              {term.riskScore >= 7 && (
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-error/10 border-2 border-error/30 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">风险</span>
                    <span className="text-2xl font-bold text-error">{term.riskScore}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 例句对比 - 紧凑展示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 错误示例 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-error font-medium text-sm">错误</span>
                <div className="h-px flex-1 bg-error/20" />
              </div>
              <p className="text-sm text-foreground/70 italic line-clamp-2 pl-2 border-l-2 border-error/30">
                &ldquo;{term.wrongExample}&rdquo;
              </p>
            </div>

            {/* 正确示例 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-success font-medium text-sm">正确</span>
                <div className="h-px flex-1 bg-success/20" />
              </div>
              <p className="text-sm text-foreground/70 italic line-clamp-2 pl-2 border-l-2 border-success/30">
                &ldquo;{term.correctExample}&rdquo;
              </p>
            </div>
          </div>

          {/* 底部元信息 */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            {/* 分类标签 */}
            <div className="flex flex-wrap gap-1.5">
              {term.category.slice(0, 3).map((cat, index) => (
                <span
                  key={`${term.id}-${cat}-${index}`}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-secondary text-foreground/80 hover:bg-foreground hover:text-background transition-colors"
                >
                  {cat}
                </span>
              ))}
              {term.category.length > 3 && (
                <span className="px-2.5 py-1 text-xs text-muted-foreground">
                  +{term.category.length - 3}
                </span>
              )}
            </div>

            {/* 统计信息 */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="text-warning">🔥</span>
                {term.globalHeat}
              </span>
              <span className="flex items-center gap-1">
                <span>👀</span>
                {term.views > 999 ? `${(term.views / 1000).toFixed(1)}k` : term.views}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
