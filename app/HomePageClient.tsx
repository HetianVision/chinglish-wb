/**
 * 首页客户端组件 - 优化版
 * 参考有道风格，更好的布局和视觉效果
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/features/search/SearchBar';
import { TermCard } from '@/components/features/term/TermCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TermEntry } from '@/lib/types';
import { PandaLogo } from '@/components/domain/common/PandaLogo';

interface HomePageClientProps {
  hotTerms: TermEntry[];
  riskyTerms: TermEntry[];
  latestTerms: TermEntry[];
  allTerms: TermEntry[];
}

export function HomePageClient({
  hotTerms,
  riskyTerms,
  latestTerms,
  allTerms,
}: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('hot');

  // 搜索过滤
  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    return allTerms.filter(
      (term) =>
        term.chinglish.toLowerCase().includes(query) ||
        term.correctExpression.toLowerCase().includes(query) ||
        term.wrongExample.toLowerCase().includes(query) ||
        term.correctExample.toLowerCase().includes(query)
    );
  }, [searchQuery, allTerms]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - 大搜索框 */}
      <section className="relative bg-gradient-to-b from-secondary/30 to-background border-b-2 border-border">
        <div className="container max-w-5xl mx-auto px-4 py-12 md:py-20">
          {/* Logo + 标题 */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <PandaLogo size="xl" animated />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Chinglish 黑白语言站
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              全球学习者共建的中式英语数据库 · 让语言进化被看见
            </p>
          </div>

          {/* 大搜索框 */}
          <div className="max-w-3xl mx-auto">
            <SearchBar onSearch={handleSearch} placeholder="输入 Chinglish 或正确表达..." />

            {/* 热门搜索标签 */}
            {!searchQuery && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">热门：</span>
                {['add oil', 'long time no see', 'people mountain people sea'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-secondary hover:bg-foreground hover:text-background transition-all duration-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 主内容区域 */}
      <section className="py-8 md:py-12">
        <div className="container max-w-6xl mx-auto px-4">
          {searchQuery.trim() ? (
            // 搜索结果
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-border pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  搜索结果
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  找到 <span className="text-foreground font-bold text-lg">{filteredTerms.length}</span> 个词条
                </p>
              </div>

              {filteredTerms.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">未找到相关词条</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    试试其他关键词，或者分享你发现的 Chinglish
                  </p>
                  <Link href="/submit">
                    <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8">
                      投稿新词条
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredTerms.map((term) => (
                    <TermCard key={term.id} term={term} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // 默认展示榜单
            <div className="space-y-8">
              {/* Tab 导航 */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b-2 border-border mb-8">
                  <TabsList className="bg-transparent h-auto p-0 gap-2">
                    <TabsTrigger
                      value="hot"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none px-6 py-3 font-semibold text-base"
                    >
                      🔥 热门榜
                    </TabsTrigger>
                    <TabsTrigger
                      value="risky"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none px-6 py-3 font-semibold text-base"
                    >
                      ⚠️ 高风险榜
                    </TabsTrigger>
                    <TabsTrigger
                      value="latest"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none px-6 py-3 font-semibold text-base"
                    >
                      🆕 最新榜
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="hot" className="mt-0">
                  {hotTerms.length === 0 ? (
                    <EmptyState
                      icon="🔥"
                      title="还没有热门词条"
                      description="成为第一个投稿的人"
                    />
                  ) : (
                    <div className="grid gap-4">
                      {hotTerms.map((term, index) => (
                        <div key={term.id} className="relative">
                          {index < 3 && (
                            <div className="absolute -left-2 md:-left-16 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl z-10">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </div>
                          )}
                          <TermCard term={term} />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="risky" className="mt-0">
                  <div className="mb-6 p-5 bg-error/5 rounded-xl border-l-4 border-error">
                    <p className="text-sm md:text-base text-foreground">
                      💡 这些表达可能会造成<span className="font-bold text-error">严重误解</span>，使用时需要特别注意
                    </p>
                  </div>

                  {riskyTerms.length === 0 ? (
                    <EmptyState
                      icon="⚠️"
                      title="暂无高风险词条"
                      description="安全第一"
                    />
                  ) : (
                    <div className="grid gap-4">
                      {riskyTerms.map((term) => (
                        <TermCard key={term.id} term={term} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="latest" className="mt-0">
                  {latestTerms.length === 0 ? (
                    <EmptyState
                      icon="🆕"
                      title="等待新内容"
                      description="快来投稿吧"
                    />
                  ) : (
                    <div className="grid gap-4">
                      {latestTerms.map((term) => (
                        <TermCard key={term.id} term={term} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="bg-secondary/50 border-t-2 border-border py-16 mt-20">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            发现新的 Chinglish？
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            和全球 10-40岁 的英语学习者一起共建数据库
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/submit">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 h-14 px-10 text-lg font-semibold w-full sm:w-auto">
                立即投稿
              </Button>
            </Link>
            <Link href="/rankings">
              <Button size="lg" variant="outline" className="border-2 h-14 px-10 text-lg font-semibold w-full sm:w-auto">
                完整榜单
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// 空状态组件
function EmptyState({
  icon,
  title,
  description
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6 text-lg">{description}</p>
      <Link href="/submit">
        <Button variant="outline" className="border-2 h-12 px-8 text-base font-semibold">
          投稿词条
        </Button>
      </Link>
    </div>
  );
}
