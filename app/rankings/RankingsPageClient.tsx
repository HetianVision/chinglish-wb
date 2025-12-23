/**
 * 榜单页面客户端组件 - 优化版
 * 更好的榜单展示和视觉效果
 */

'use client';

import { useState } from 'react';
import { TermCard } from '@/components/features/term/TermCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TermEntry } from '@/lib/types';

interface RankingsPageClientProps {
  hotTerms: TermEntry[];
  riskyTerms: TermEntry[];
  funnyTerms: TermEntry[];
  viewsTerms: TermEntry[];
  sharesTerms: TermEntry[];
  oxfordTerms: TermEntry[];
}

export function RankingsPageClient({
  hotTerms,
  riskyTerms,
  funnyTerms,
  viewsTerms,
  sharesTerms,
  oxfordTerms,
}: RankingsPageClientProps) {
  const [activeTab, setActiveTab] = useState('hot');

  const renderRanking = (terms: TermEntry[], emptyMessage: string) => {
    if (terms.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-secondary mb-6 border-2 border-border flex items-center justify-center mx-auto">
            <span className="text-5xl">📊</span>
          </div>
          <p className="text-2xl font-bold mb-3">{emptyMessage}</p>
          <p className="text-muted-foreground mb-6 text-lg">
            成为第一个
            <a href="/submit" className="text-foreground hover:underline font-semibold ml-1">
              投稿词条
            </a>
            的人！
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Top 3 大卡片展示 */}
        {terms.slice(0, 3).length > 0 && (
          <div className="space-y-4">
            {terms.slice(0, 3).map((term, index) => (
              <div key={term.id} className="relative">
                <div className="absolute -left-2 md:-left-20 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl z-10">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <TermCard term={term} />
              </div>
            ))}
          </div>
        )}

        {/* 4+ 名网格展示 */}
        {terms.slice(3).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {terms.slice(3).map((term, index) => (
              <div key={term.id} className="relative">
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -left-2 z-10 border-2"
                >
                  #{index + 4}
                </Badge>
                <TermCard term={term} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 py-8 md:py-12 bg-gradient-to-b from-secondary/30 to-background border-b-2 border-border">
        <h1 className="text-4xl md:text-5xl font-bold">Chinglish 榜单</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          探索最热门、最有趣、最危险的中式英语表达
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b-2 border-border mb-8 overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 flex flex-nowrap min-w-full md:grid md:grid-cols-6 md:w-full md:max-w-4xl md:mx-auto">
            <TabsTrigger
              value="hot"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-foreground rounded-none px-6 py-3 font-semibold whitespace-nowrap"
            >
              🔥 热门
            </TabsTrigger>
            <TabsTrigger
              value="risky"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-foreground rounded-none px-6 py-3 font-semibold whitespace-nowrap"
            >
              ⚠️ 风险
            </TabsTrigger>
            <TabsTrigger
              value="funny"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-foreground rounded-none px-6 py-3 font-semibold whitespace-nowrap"
            >
              😄 趣味
            </TabsTrigger>
            <TabsTrigger
              value="views"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-foreground rounded-none px-6 py-3 font-semibold whitespace-nowrap"
            >
              👀 浏览
            </TabsTrigger>
            <TabsTrigger
              value="shares"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-foreground rounded-none px-6 py-3 font-semibold whitespace-nowrap"
            >
              📤 分享
            </TabsTrigger>
            <TabsTrigger
              value="oxford"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-foreground rounded-none px-6 py-3 font-semibold whitespace-nowrap"
            >
              📖 牛津
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="hot">
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">热门榜</h2>
              <p className="text-muted-foreground text-lg">全球热度最高的Chinglish表达</p>
            </div>
            {renderRanking(hotTerms, '暂无热门词条')}
          </div>
        </TabsContent>

        <TabsContent value="risky">
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">高风险榜</h2>
              <p className="text-muted-foreground text-lg">使用这些表达可能会造成严重误解</p>
            </div>
            {renderRanking(riskyTerms, '暂无高风险词条')}
          </div>
        </TabsContent>

        <TabsContent value="funny">
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">趣味榜</h2>
              <p className="text-muted-foreground text-lg">最有趣、最搞笑的Chinglish表达</p>
            </div>
            {renderRanking(funnyTerms, '暂无趣味词条')}
          </div>
        </TabsContent>

        <TabsContent value="views">
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">浏览榜</h2>
              <p className="text-muted-foreground text-lg">最受关注的Chinglish词条</p>
            </div>
            {renderRanking(viewsTerms, '暂无浏览数据')}
          </div>
        </TabsContent>

        <TabsContent value="shares">
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">分享榜</h2>
              <p className="text-muted-foreground text-lg">最受分享的Chinglish表达</p>
            </div>
            {renderRanking(sharesTerms, '暂无分享数据')}
          </div>
        </TabsContent>

        <TabsContent value="oxford">
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">牛津收录榜</h2>
              <p className="text-muted-foreground text-lg">已被牛津词典正式收录的Chinglish</p>
            </div>
            {renderRanking(oxfordTerms, '暂无牛津收录词条')}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
