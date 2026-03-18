import { createClient } from '@/lib/supabase/server';
import { getTermsByCategory, getTerms } from '@/lib/supabase/queries';
import { TermEntry } from '@/lib/types';
import BrowsePageClient from './BrowsePageClient';

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category || '';
  const supabase = await createClient();

  let terms: TermEntry[] = [];
  if (category) {
    const { data } = await getTermsByCategory(supabase, category, 30);
    terms = data || [];
  } else {
    const { data } = await getTerms(supabase, { limit: 30 });
    terms = data || [];
  }

  return <BrowsePageClient category={category} terms={terms} />;
}
