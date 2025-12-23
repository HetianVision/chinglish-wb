/**
 * 词条详情页客户端组件 - 优化版
 * 更好的信息展示和视觉层级
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TermEntry } from '@/lib/types';
import Link from 'next/link';

interface TermDetailClientProps {
  term: TermEntry;
  relatedTerms: TermEntry[];
}

export function TermDetailClient({ term, relatedTerms }: TermDetailClientProps) {
  const router = useRouter();

  const handleShare = () => {
    alert('分享功能开发中...');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 返回导航条 */}
      <div className="border-b-2 border-border bg-background sticky top-16 z-40">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-secondary font-semibold"
          >
            ← 返回
          </Button>
        </div>
      </div>

      {/* 主内容区域 - 响应式左右分栏 */}
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* 左侧：主要内容 */}
          <div className="space-y-8">
            {/* 词条标题卡片 */}
            <Card className="border-2 p-8 md:p-10 rounded-2xl">
              <div className="space-y-6">
                {/* Chinglish 表达 */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-4xl md:text-5xl font-bold text-error leading-tight">
                      {term.chinglish}
                    </h1>
                    {term.oxfordStatus === 'collected' && (
                      <Badge className="bg-foreground text-background text-sm px-4 py-1.5 font-semibold whitespace-nowrap">
                        牛津收录
                      </Badge>
                    )}
                  </div>

                  {/* 正确表达 */}
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-success text-2xl">✓</span>
                    <p className="text-3xl md:text-4xl font-semibold text-success">
                      {term.correctExpression}
                    </p>
                  </div>
                </div>

                {/* 分类标签 */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                  {term.category.map((cat, index) => (
                    <span key={`${term.id}-${cat}-${index}`} className="px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-foreground hover:bg-foreground hover:text-background transition-colors">
                      {cat}
                    </span>
                  ))}
                  {term.region && term.region.map((reg, index) => (
                    <span key={`${term.id}-region-${reg}-${index}`} className="px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-foreground/80">
                      🌍 {reg}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* 例句对比卡片 */}
            <Card className="border-2 p-8 md:p-10 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">例句对比</h2>

              <div className="space-y-6">
                {/* 错误示例 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-error text-2xl">✗</span>
                    <h3 className="font-bold text-lg text-foreground">错误示例</h3>
                  </div>
                  <div className="ml-9 p-6 bg-error/5 border-l-4 border-error rounded-r-xl">
                    <p className="text-base md:text-lg italic text-foreground">&ldquo;{term.wrongExample}&rdquo;</p>
                  </div>
                </div>

                {/* 正确示例 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-success text-2xl">✓</span>
                    <h3 className="font-bold text-lg text-foreground">正确示例</h3>
                  </div>
                  <div className="ml-9 p-6 bg-success/5 border-l-4 border-success rounded-r-xl">
                    <p className="text-base md:text-lg italic text-foreground">&ldquo;{term.correctExample}&rdquo;</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleShare}
                size="lg"
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 h-14 text-lg font-semibold"
              >
                分享词条
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 h-14 text-lg font-semibold"
                onClick={() => router.push('/submit')}
              >
                我也要投稿
              </Button>
            </div>

            {/* 相关词条 */}
            {relatedTerms.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">相关词条</h2>
                <div className="grid gap-4">
                  {relatedTerms.slice(0, 3).map((relatedTerm) => (
                    <Link key={relatedTerm.id} href={`/term/${relatedTerm.id}`}>
                      <div className="p-6 border-2 border-border rounded-xl hover:border-foreground hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-error">
                            {relatedTerm.chinglish}
                          </h3>
                          <p className="text-lg font-semibold text-success">
                            {relatedTerm.correctExpression}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                            <span>🔥 {relatedTerm.globalHeat}</span>
                            <span>⚠️ {relatedTerm.riskScore}/10</span>
                            <span>👀 {relatedTerm.views > 999 ? `${(relatedTerm.views / 1000).toFixed(1)}k` : relatedTerm.views}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：侧边栏信息 */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* 数据统计卡片 */}
            <Card className="border-2 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-5 text-foreground">数据统计</h3>
              <div className="space-y-4">
                <StatItem label="全球热度" value={term.globalHeat} emoji="🔥" color="text-warning" />
                <Separator />
                <StatItem label="风险指数" value={`${term.riskScore}/10`} emoji="⚠️" color="text-error" />
                <Separator />
                <StatItem label="趣味指数" value={`${term.funnyScore}/10`} emoji="😄" color="text-info" />
                <Separator />
                <StatItem label="浏览量" value={term.views.toLocaleString()} emoji="👀" color="text-foreground" />
                <Separator />
                <StatItem label="分享次数" value={term.shares} emoji="📤" color="text-foreground" />
              </div>
            </Card>

            {/* 词条信息卡片 */}
            <Card className="border-2 p-6 rounded-2xl bg-secondary/30">
              <h3 className="font-bold text-lg mb-4 text-foreground">词条信息</h3>
              <div className="space-y-3 text-sm">
                {term.submittedBy && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">提交者</span>
                    <span className="font-medium text-foreground">{term.submittedBy}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">收录时间</span>
                  <span className="font-medium text-foreground">
                    {new Date(term.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </Card>

            {/* 提示卡片 */}
            <Card className="border-2 border-info/30 p-6 rounded-2xl bg-info/5">
              <div className="space-y-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  温馨提示
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  发现更多有趣的 Chinglish？
                  <Link href="/submit" className="text-foreground hover:underline font-semibold ml-1">
                    立即投稿
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// 统计项组件
function StatItem({ label, value, emoji, color }: { label: string; value: string | number; emoji: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        {label}
      </span>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
