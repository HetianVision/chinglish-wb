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
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 登录成功，重定向到指定页面
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // 登录失败，重定向到首页并显示错误
  return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl.origin));
}
