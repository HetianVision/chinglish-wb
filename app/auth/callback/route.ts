/**
 * OAuth 回调处理路由
 * 处理 Google/Facebook/Twitter 登录后的回调
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // 同步用户信息到 profiles 表
      try {
        const { error: profileError } = await supabase.rpc('upsert_user_profile', {
          user_id: data.user.id,
          user_email: data.user.email || '',
          user_full_name: data.user.user_metadata?.full_name || null,
          user_avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
        });

        if (profileError) {
          console.error('Failed to sync user profile:', profileError);
          // 不阻断登录流程，仅记录错误
        }
      } catch (syncError) {
        console.error('Profile sync error:', syncError);
        // 不阻断登录流程
      }

      // 登录成功，重定向到指定页面
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // 登录失败，重定向到首页并显示错误
  return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl.origin));
}
