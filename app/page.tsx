/**
 * 首页 - 服务端组件
 * 获取热门、高风险、最新词条，传给客户端组件渲染
 */

import { createClient } from '@/lib/supabase/server';
import { getHotTerms, getRiskyTerms, getLatestTerms } from '@/lib/supabase/queries';
import { HomePageClient } from './HomePageClient';

export default async function HomePage() {
  const supabase = await createClient();

  const [hotResult, riskyResult, latestResult] = await Promise.all([
    getHotTerms(supabase, 10),
    getRiskyTerms(supabase, 10),
    getLatestTerms(supabase, 10),
  ]);

  return (
    <HomePageClient
      hotTerms={hotResult.data || []}
      riskyTerms={riskyResult.data || []}
      latestTerms={latestResult.data || []}
    />
  );
}
