/**
 * 认证对话框（统一的登录/注册对话框）
 * 包含邮箱和社交登录两种方式（主流单页面布局）
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { EmailAuthForm } from './EmailAuthForm';
import { SocialAuthButtons } from './SocialAuthButtons';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthDialog({ open, onOpenChange, defaultMode = 'login' }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  // 当 defaultMode 改变时更新 mode
  useEffect(() => {
    if (open) {
      setMode(defaultMode);
    }
  }, [defaultMode, open]);

  // 切换模式
  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  // 认证成功后关闭对话框
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === 'login' ? '🐼 欢迎回来' : '🐼 加入 Chinglish 社区'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login'
              ? '登录您的账号继续探索'
              : '创建账号，开始您的 Chinglish 之旅'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 邮箱登录/注册表单 */}
          <EmailAuthForm
            mode={mode}
            onSuccess={handleSuccess}
            onSwitchMode={handleSwitchMode}
          />

          {/* 分隔线 */}
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              或使用以下方式{mode === 'login' ? '登录' : '注册'}
            </span>
          </div>

          {/* 社交登录按钮 */}
          <SocialAuthButtons />
        </div>
      </DialogContent>
    </Dialog>
  );
}
