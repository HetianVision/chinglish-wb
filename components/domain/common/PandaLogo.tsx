/**
 * 熊猫 Logo - 黑白极简设计
 * 适用于 Header、Loading、品牌展示
 */

'use client';

import { cn } from '@/lib/utils';

interface PandaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export function PandaLogo({ size = 'md', className, animated = false }: PandaLogoProps) {
  return (
    <div className={cn(sizeMap[size], className, animated && 'animate-bounce-slow')}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* 左耳 */}
        <circle cx="25" cy="25" r="15" fill="currentColor" className="text-foreground" />

        {/* 右耳 */}
        <circle cx="75" cy="25" r="15" fill="currentColor" className="text-foreground" />

        {/* 头部 - 白色 */}
        <circle cx="50" cy="45" r="30" fill="currentColor" className="text-background" stroke="currentColor" strokeWidth="2" />

        {/* 左眼 - 黑色眼圈 */}
        <ellipse cx="38" cy="42" rx="8" ry="10" fill="currentColor" className="text-foreground" />

        {/* 右眼 - 黑色眼圈 */}
        <ellipse cx="62" cy="42" rx="8" ry="10" fill="currentColor" className="text-foreground" />

        {/* 左眼白 */}
        <circle cx="38" cy="42" r="4" fill="currentColor" className="text-background" />

        {/* 右眼白 */}
        <circle cx="62" cy="42" r="4" fill="currentColor" className="text-background" />

        {/* 左眼珠 */}
        <circle cx="39" cy="43" r="2" fill="currentColor" className="text-foreground" />

        {/* 右眼珠 */}
        <circle cx="63" cy="43" r="2" fill="currentColor" className="text-foreground" />

        {/* 鼻子 */}
        <ellipse cx="50" cy="55" rx="5" ry="4" fill="currentColor" className="text-foreground" />

        {/* 嘴巴 - 微笑曲线 */}
        <path
          d="M 42 60 Q 50 65 58 60"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          className="text-foreground"
        />
      </svg>
    </div>
  );
}

/**
 * 带文字的品牌 Logo
 */
interface PandaBrandLogoProps {
  showText?: boolean;
  className?: string;
}

export function PandaBrandLogo({ showText = true, className }: PandaBrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <PandaLogo size="md" />
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight">Chinglish</span>
          <span className="text-xs text-muted-foreground">黑白语言站</span>
        </div>
      )}
    </div>
  );
}
