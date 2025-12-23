/**
 * 词条详情页
 * 展示完整的Chinglish词条信息
 */

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTermById, getTerms, incrementTermViews } from '@/lib/supabase/queries';
import { TermDetailClient } from './TermDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TermDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 获取词条详情
  const termResult = await getTermById(supabase, id);

  if (termResult.error || !termResult.data) {
    notFound();
  }

  const term = termResult.data;

  // 增加浏览次数（异步，不阻塞渲染）
  incrementTermViews(supabase, id).catch(console.error);

  // 获取相关词条（同分类的其他词条）
  const relatedResult = await getTerms(supabase, {
    category: term.category[0], // 使用第一个分类
    limit: 5,
  });

  const relatedTerms = (relatedResult.data || []).filter((t) => t.id !== id).slice(0, 4);

  return <TermDetailClient term={term} relatedTerms={relatedTerms} />;
}
