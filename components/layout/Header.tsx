/**
 * 页面头部组件 - 熊猫黑白极简设计
 * 包含导航、Panda Logo 和用户认证状态
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { UserMenu } from '@/components/features/auth/UserMenu';
import { AuthDialog } from '@/components/features/auth/AuthDialog';
import { PandaBrandLogo } from '@/components/domain/common/PandaLogo';

export function Header() {
  const { user, loading, signOut } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleOpenAuthDialog = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          {/* Panda Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <PandaBrandLogo />
          </Link>

          {/* 导航 */}
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/">首页</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/rankings">榜单</Link>
            </Button>
            <Button className="bg-foreground text-background hover:bg-foreground/90" asChild>
              <Link href="/submit">投稿</Link>
            </Button>

            {/* 认证状态 */}
            {!loading && (
              <>
                {user ? (
                  // 已登录：显示用户菜单
                  <UserMenu user={user} onSignOut={signOut} />
                ) : (
                  // 未登录：显示登录/注册按钮
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleOpenAuthDialog('login')}
                    >
                      登录
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenAuthDialog('signup')}
                    >
                      注册
                    </Button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 认证对话框 */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultMode={authMode}
      />
    </>
  );
}
