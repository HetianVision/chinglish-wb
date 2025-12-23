/**
 * 搜索栏组件 - 优化版
 * 更大的搜索框，更好的视觉效果
 */

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = '输入 Chinglish 或正确表达...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // 实时搜索：当输入超过 2 个字符时自动触发搜索
    if (value.length >= 2) {
      onSearch(value);
    } else if (value.length === 0) {
      onSearch('');
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`
        relative flex items-center gap-3
        p-2 rounded-2xl border-2
        transition-all duration-300
        ${isFocused
          ? 'border-foreground shadow-lg bg-background'
          : 'border-border shadow-md bg-background hover:border-foreground/50'
        }
      `}>
        {/* 搜索图标 */}
        <div className="pl-4 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* 输入框 */}
        <Input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 h-14 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
        />

        {/* 清空按钮 */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* 搜索按钮 */}
        <Button
          type="submit"
          size="lg"
          className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 rounded-xl font-semibold"
        >
          搜索
        </Button>
      </div>
    </form>
  );
}
