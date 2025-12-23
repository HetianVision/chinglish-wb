/**
 * 榜单页面
 * 展示不同维度的Chinglish排行榜
 */

import { createClient } from '@/lib/supabase/server';
import {
  getHotTerms,
  getRiskyTerms,
  getFunnyTerms,
  getMostViewedTerms,
  getMostSharedTerms,
  getOxfordTerms,
} from '@/lib/supabase/queries';
import { RankingsPageClient } from './RankingsPageClient';

export default async function RankingsPage() {
  const supabase = await createClient();

  // 并行获取所有榜单数据（限制每个榜单20条）
  const [hotResult, riskyResult, funnyResult, viewsResult, sharesResult, oxfordResult] =
    await Promise.all([
      getHotTerms(supabase, 20),
      getRiskyTerms(supabase, 20),
      getFunnyTerms(supabase, 20),
      getMostViewedTerms(supabase, 20),
      getMostSharedTerms(supabase, 20),
      getOxfordTerms(supabase, 20),
    ]);

  return (
    <RankingsPageClient
      hotTerms={hotResult.data || []}
      riskyTerms={riskyResult.data || []}
      funnyTerms={funnyResult.data || []}
      viewsTerms={viewsResult.data || []}
      sharesTerms={sharesResult.data || []}
      oxfordTerms={oxfordResult.data || []}
    />
  );
}
