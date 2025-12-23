/**
 * 社交登录按钮组
 * Google (已配置) / Facebook (预留) / Twitter (预留)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { signInWithOAuth } from '@/lib/supabase/auth';

interface SocialProvider {
  name: string;
  provider: 'google' | 'facebook' | 'twitter';
  icon: string;
  color: string;
  bgColor: string;
  enabled: boolean;
}

const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    name: 'Google',
    provider: 'google',
    icon: '🔵',
    color: 'text-white',
    bgColor: 'bg-[#4285F4] hover:bg-[#357AE8]',
    enabled: true,
  },
  {
    name: 'Facebook',
    provider: 'facebook',
    icon: '🔷',
    color: 'text-white',
    bgColor: 'bg-[#1877F2] hover:bg-[#0C63D4]',
    enabled: false, // 预留待配置
  },
  {
    name: 'Twitter',
    provider: 'twitter',
    icon: '⚫',
    color: 'text-white',
    bgColor: 'bg-[#000000] hover:bg-[#333333]',
    enabled: false, // 预留待配置
  },
];

export function SocialAuthButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setLoading(provider);

    try {
      const { error } = await signInWithOAuth(supabase, provider);

      if (error) {
        console.error(`${provider} login error:`, error);
        alert(`${provider} 登录失败，请重试`);
      }
      // 成功会自动重定向，无需处理
    } catch (err) {
      console.error('Social login error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {SOCIAL_PROVIDERS.map((social) => (
        <Button
          key={social.provider}
          type="button"
          variant="outline"
          className={`w-full ${
            social.enabled
              ? `${social.bgColor} ${social.color} border-0`
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          onClick={() => social.enabled && handleSocialLogin(social.provider)}
          disabled={!social.enabled || loading === social.provider}
        >
          <span className="mr-2">{social.icon}</span>
          {loading === social.provider ? (
            `正在连接 ${social.name}...`
          ) : social.enabled ? (
            `使用 ${social.name} 继续`
          ) : (
            `${social.name} (即将开放)`
          )}
        </Button>
      ))}
    </div>
  );
}
