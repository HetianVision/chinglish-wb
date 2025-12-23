/**
 * 邮箱认证表单
 * 支持登录和注册两种模式
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase/auth';

interface EmailAuthFormProps {
  mode: 'login' | 'signup';
  onSuccess?: () => void;
  onSwitchMode?: () => void;
}

export function EmailAuthForm({ mode, onSuccess, onSwitchMode }: EmailAuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const validateForm = (): boolean => {
    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }

    // 验证密码长度
    if (password.length < 6) {
      setError('密码至少需要6位');
      return false;
    }

    // 注册模式额外验证
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('两次密码输入不一致');
        return false;
      }

      if (!agreedToTerms) {
        setError('请先同意服务条款和隐私政策');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        // 登录
        const { error: signInError } = await signInWithEmail(supabase, email, password);

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('邮箱或密码错误');
          } else {
            setError(signInError.message);
          }
          return;
        }

        // 登录成功
        onSuccess?.();
      } else {
        // 注册
        const { error: signUpError } = await signUpWithEmail(supabase, email, password);

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('该邮箱已被注册，请直接登录');
          } else {
            setError(signUpError.message);
          }
          return;
        }

        // 注册成功
        alert('注册成功！正在自动登录...');
        onSuccess?.();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 错误提示 */}
      {error && (
        <div className="p-3 text-sm bg-error/10 border border-error/20 rounded-md text-error">
          {error}
        </div>
      )}

      {/* 邮箱输入 */}
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {/* 密码输入 */}
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          placeholder={mode === 'signup' ? '至少6位' : '输入密码'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {/* 注册模式：确认密码 */}
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">确认密码</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      )}

      {/* 注册模式：服务条款 */}
      {mode === 'signup' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            disabled={loading}
          />
          <label
            htmlFor="terms"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            我同意{' '}
            <a href="/terms" className="text-primary underline" target="_blank">
              服务条款
            </a>{' '}
            和{' '}
            <a href="/privacy" className="text-primary underline" target="_blank">
              隐私政策
            </a>
          </label>
        </div>
      )}

      {/* 登录模式：忘记密码 */}
      {mode === 'login' && (
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={() => alert('密码重置功能即将开放')}
          >
            忘记密码？
          </button>
        </div>
      )}

      {/* 提交按钮 */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
      </Button>

      {/* 切换模式 */}
      <div className="text-center text-sm text-muted-foreground">
        {mode === 'login' ? '还没有账号？' : '已有账号？'}
        <button
          type="button"
          className="ml-1 text-primary hover:underline"
          onClick={onSwitchMode}
          disabled={loading}
        >
          {mode === 'login' ? '注册' : '登录'}
        </button>
      </div>
    </form>
  );
}
