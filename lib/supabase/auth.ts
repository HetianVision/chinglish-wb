/**
 * Supabase Auth 辅助函数
 * 封装所有认证相关操作
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * 邮箱注册
 */
export async function signUpWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

/**
 * 邮箱登录
 */
export async function signInWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * OAuth 社交登录
 */
export async function signInWithOAuth(
  supabase: SupabaseClient,
  provider: 'google' | 'facebook' | 'twitter'
) {
  const { data, error} = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: provider === 'google' ? {
        access_type: 'offline',
        prompt: 'consent',
      } : undefined,
    },
  });

  return { data, error };
}

/**
 * 登出
 */
export async function signOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * 发送密码重置邮件
 */
export async function resetPassword(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  return { data, error };
}
