import { createClient } from '@/lib/supabase/server';
import { searchTerms } from '@/lib/supabase/queries';
import { TermEntry } from '@/lib/types';
import SearchPageClient from './SearchPageClient';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const supabase = await createClient();

  let results: TermEntry[] = [];
  if (query.trim()) {
    const { data } = await searchTerms(supabase, query, 30);
    results = data || [];
  }

  return <SearchPageClient query={query} results={results} />;
}
