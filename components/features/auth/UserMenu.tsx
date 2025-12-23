/**
 * 用户菜单组件
 * 显示用户头像和下拉菜单
 */

'use client';

import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  user: User;
  onSignOut: () => Promise<void>;
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const router = useRouter();

  // 获取用户头像
  const getAvatarUrl = () => {
    // 1. Google OAuth 头像
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    // 2. 默认头像（可以用 Gravatar 或其他服务）
    return null;
  };

  // 获取用户显示名称
  const getDisplayName = () => {
    // 1. 用户元数据中的名称
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    // 2. 邮箱前缀
    if (user.email) {
      return user.email.split('@')[0];
    }
    return '用户';
  };

  // 获取头像文字（首字母）
  const getAvatarFallback = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const handleSignOut = async () => {
    if (confirm('确定要退出登录吗？')) {
      await onSignOut();
      router.push('/');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={getAvatarUrl() || undefined} alt={getDisplayName()} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getAvatarFallback()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push('/profile')}
          className="cursor-pointer"
        >
          👤 我的资料
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push('/my-submissions')}
          className="cursor-pointer"
        >
          📝 我的投稿
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          className="cursor-pointer"
        >
          ⚙️ 设置
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-error focus:text-error"
        >
          🚪 退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
