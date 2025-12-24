/**
 * Supabase 数据库查询函数
 * 封装常用的数据库操作
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { TermEntry, Submission, UserProfile } from '@/lib/types';

/**
 * 获取所有词条（分页）
 */
export async function getTerms(
  supabase: SupabaseClient,
  options: {
    limit?: number;
    offset?: number;
    sortBy?: 'created_at' | 'global_heat' | 'risk_score' | 'views' | 'shares';
    order?: 'asc' | 'desc';
    category?: string;
  } = {}
) {
  const { limit = 20, offset = 0, sortBy = 'created_at', order = 'desc', category } = options;

  let query = supabase
    .from('terms')
    .select('*', { count: 'exact' });

  // 添加分类过滤
  if (category) {
    query = query.contains('category', [category]);
  }

  const { data, error, count } = await query
    .order(sortBy, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching terms:', error);
    return { data: null, error, count: 0 };
  }

  // 转换数据库字段为 camelCase
  const terms: TermEntry[] = (data || []).map(transformTermFromDB);

  return { data: terms, error: null, count: count || 0 };
}

/**
 * 根据ID获取单个词条
 */
export async function getTermById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching term:', error);
    return { data: null, error };
  }

  return { data: transformTermFromDB(data), error: null };
}

/**
 * 搜索词条（全文搜索）
 */
export async function searchTerms(
  supabase: SupabaseClient,
  query: string,
  limit: number = 20
) {
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .or(`chinglish.ilike.%${query}%,correct_expression.ilike.%${query}%,wrong_example.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching terms:', error);
    return { data: null, error };
  }

  const terms: TermEntry[] = (data || []).map(transformTermFromDB);
  return { data: terms, error: null };
}

/**
 * 根据分类获取词条
 */
export async function getTermsByCategory(
  supabase: SupabaseClient,
  category: string,
  limit: number = 20
) {
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .contains('category', [category])
    .limit(limit);

  if (error) {
    console.error('Error fetching terms by category:', error);
    return { data: null, error };
  }

  const terms: TermEntry[] = (data || []).map(transformTermFromDB);
  return { data: terms, error: null };
}

/**
 * 获取热门词条（按global_heat排序）
 */
export async function getHotTerms(supabase: SupabaseClient, limit: number = 10) {
  return getTerms(supabase, { limit, sortBy: 'global_heat', order: 'desc' });
}

/**
 * 获取高风险词条（按risk_score排序）
 */
export async function getRiskyTerms(supabase: SupabaseClient, limit: number = 10) {
  return getTerms(supabase, { limit, sortBy: 'risk_score', order: 'desc' });
}

/**
 * 获取最新词条
 */
export async function getLatestTerms(supabase: SupabaseClient, limit: number = 10) {
  return getTerms(supabase, { limit, sortBy: 'created_at', order: 'desc' });
}

/**
 * 获取最有趣的词条（按funny_score排序）
 */
export async function getFunnyTerms(supabase: SupabaseClient, limit: number = 10) {
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .order('funny_score', { ascending: false })
    .order('global_heat', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching funny terms:', error);
    return { data: null, error };
  }

  const terms: TermEntry[] = (data || []).map(transformTermFromDB);
  return { data: terms, error: null };
}

/**
 * 获取浏览量最高的词条
 */
export async function getMostViewedTerms(supabase: SupabaseClient, limit: number = 10) {
  return getTerms(supabase, { limit, sortBy: 'views', order: 'desc' });
}

/**
 * 获取分享次数最多的词条
 */
export async function getMostSharedTerms(supabase: SupabaseClient, limit: number = 10) {
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .order('shares', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching most shared terms:', error);
    return { data: null, error };
  }

  const terms: TermEntry[] = (data || []).map(transformTermFromDB);
  return { data: terms, error: null };
}

/**
 * 获取牛津收录的词条
 */
export async function getOxfordTerms(supabase: SupabaseClient, limit: number = 10) {
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .eq('oxford_status', 'collected')
    .order('global_heat', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching Oxford terms:', error);
    return { data: null, error };
  }

  const terms: TermEntry[] = (data || []).map(transformTermFromDB);
  return { data: terms, error: null };
}

/**
 * 增加词条浏览次数
 */
export async function incrementTermViews(supabase: SupabaseClient, termId: string) {
  const { error } = await supabase.rpc('increment_term_views', { term_id: termId });

  if (error) {
    console.error('Error incrementing views:', error);
    return { error };
  }

  return { error: null };
}

/**
 * 增加词条分享次数
 */
export async function incrementTermShares(supabase: SupabaseClient, termId: string) {
  const { error } = await supabase.rpc('increment_term_shares', { term_id: termId });

  if (error) {
    console.error('Error incrementing shares:', error);
    return { error };
  }

  return { error: null };
}

/**
 * 提交新词条
 */
export async function submitTerm(
  supabase: SupabaseClient,
  submission: Omit<Submission, 'id' | 'status' | 'submittedAt' | 'updatedAt'>
) {
  // 转换为数据库字段格式
  const dbSubmission = {
    submitter_name: submission.submitterName,
    submitter_email: submission.submitterEmail,
    chinglish: submission.chinglish,
    wrong_example: submission.wrongExample,
    correct_expression: submission.correctExpression,
    correct_example: submission.correctExample,
    category: submission.category,
    region: submission.region,
    estimated_risk_score: submission.estimatedRiskScore,
    funny_story: submission.funnyStory,
  };

  const { data, error } = await supabase
    .from('submissions')
    .insert([dbSubmission])
    .select()
    .single();

  if (error) {
    console.error('Error submitting term:', error);
    return { data: null, error };
  }

  return { data: transformSubmissionFromDB(data), error: null };
}

/**
 * 获取待审核的投稿
 */
export async function getPendingSubmissions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending submissions:', error);
    return { data: null, error };
  }

  const submissions: Submission[] = (data || []).map(transformSubmissionFromDB);
  return { data: submissions, error: null };
}

/**
 * 审批投稿（通过）
 */
export async function approveSubmission(
  supabase: SupabaseClient,
  submissionId: string,
  reviewNote?: string
) {
  // 1. 获取投稿内容
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (fetchError || !submission) {
    return { data: null, error: fetchError };
  }

  // 2. 创建新词条
  const termData = {
    chinglish: submission.chinglish,
    wrong_example: submission.wrong_example,
    correct_expression: submission.correct_expression,
    correct_example: submission.correct_example,
    category: submission.category,
    region: submission.region,
    oxford_status: 'not_collected' as const,
    global_heat: 0,
    risk_score: submission.estimated_risk_score || 5,
    funny_score: 5,
    submitted_by: submission.submitter_name,
    approved_at: new Date().toISOString(),
  };

  const { data: newTerm, error: createError } = await supabase
    .from('terms')
    .insert([termData])
    .select()
    .single();

  if (createError) {
    return { data: null, error: createError };
  }

  // 3. 更新投稿状态
  const { error: updateError } = await supabase
    .from('submissions')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote,
    })
    .eq('id', submissionId);

  if (updateError) {
    return { data: null, error: updateError };
  }

  return { data: transformTermFromDB(newTerm), error: null };
}

/**
 * 拒绝投稿
 */
export async function rejectSubmission(
  supabase: SupabaseClient,
  submissionId: string,
  reviewNote?: string
) {
  const { error } = await supabase
    .from('submissions')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote,
    })
    .eq('id', submissionId);

  if (error) {
    return { error };
  }

  return { error: null };
}

// ========== 辅助函数：数据库字段转换 ==========

/**
 * 将数据库字段（snake_case）转换为 TypeScript 类型（camelCase）
 */
function transformTermFromDB(dbTerm: any): TermEntry {
  return {
    id: dbTerm.id,
    chinglish: dbTerm.chinglish,
    wrongExample: dbTerm.wrong_example,
    correctExpression: dbTerm.correct_expression,
    correctExample: dbTerm.correct_example,
    oxfordStatus: dbTerm.oxford_status,
    globalHeat: dbTerm.global_heat,
    riskScore: dbTerm.risk_score,
    funnyScore: dbTerm.funny_score,
    category: dbTerm.category,
    region: dbTerm.region || [],
    submittedBy: dbTerm.submitted_by,
    approvedAt: dbTerm.approved_at,
    createdAt: dbTerm.created_at,
    updatedAt: dbTerm.updated_at,
    views: dbTerm.views,
    shares: dbTerm.shares,
  };
}

/**
 * 将数据库投稿字段转换为 TypeScript 类型
 */
function transformSubmissionFromDB(dbSubmission: any): Submission {
  return {
    id: dbSubmission.id,
    status: dbSubmission.status,
    submitterName: dbSubmission.submitter_name,
    submitterEmail: dbSubmission.submitter_email,
    chinglish: dbSubmission.chinglish,
    wrongExample: dbSubmission.wrong_example,
    correctExpression: dbSubmission.correct_expression,
    correctExample: dbSubmission.correct_example,
    category: dbSubmission.category,
    region: dbSubmission.region || [],
    estimatedRiskScore: dbSubmission.estimated_risk_score,
    funnyStory: dbSubmission.funny_story,
    reviewedAt: dbSubmission.reviewed_at,
    reviewNote: dbSubmission.review_note,
    reviewedBy: dbSubmission.reviewed_by,
    submittedAt: dbSubmission.submitted_at,
    updatedAt: dbSubmission.updated_at,
  };
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }

  return { data: transformProfileFromDB(data), error: null };
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
) {
  // Transform camelCase to snake_case
  const dbUpdates: any = {};
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.username !== undefined) dbUpdates.username = updates.username;
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
  if (updates.contributionLevel !== undefined) dbUpdates.contribution_level = updates.contributionLevel;
  if (updates.badges !== undefined) dbUpdates.badges = updates.badges;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }

  return { data: transformProfileFromDB(data), error: null };
}

/**
 * Transform database profile to TypeScript UserProfile
 */
function transformProfileFromDB(dbProfile: any): UserProfile {
  return {
    id: dbProfile.id,
    email: dbProfile.email,
    username: dbProfile.username,
    avatarUrl: dbProfile.avatar_url,
    fullName: dbProfile.full_name,
    contributionLevel: dbProfile.contribution_level,
    badges: dbProfile.badges || [],
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
  };
}
