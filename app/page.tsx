/**
 * 首页
 * 展示搜索栏和热门词条
 */

import { createClient } from '@/lib/supabase/server';
import { getHotTerms, getRiskyTerms, getLatestTerms } from '@/lib/supabase/queries';
import { HomePageClient } from './HomePageClient';

export default async function HomePage() {
  const supabase = await createClient();

  // 获取初始数据（限制数量以提高性能）
  const [hotResult, riskyResult, latestResult] = await Promise.all([
    getHotTerms(supabase, 12),
    getRiskyTerms(supabase, 12),
    getLatestTerms(supabase, 12),
  ]);

  // 提取数据（如果有错误则使用空数组）
  const hotTermsData = hotResult.data || [];
  const riskyTermsData = riskyResult.data || [];
  const latestTermsData = latestResult.data || [];

  // 合并所有数据用于搜索
  const allTermsMap = new Map();
  [...hotTermsData, ...riskyTermsData, ...latestTermsData].forEach(term => {
    allTermsMap.set(term.id, term);
  });
  const allTerms = Array.from(allTermsMap.values());

  return (
    <HomePageClient
      hotTerms={hotTermsData}
      riskyTerms={riskyTermsData}
      latestTerms={latestTermsData}
      allTerms={allTerms}
    />
  );
}
