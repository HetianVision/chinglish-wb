'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TermEntry } from '@/lib/types';

const BG = '#F5F0DC';
const INK = '#0D0D0D';
const MUTED = 'rgba(13,13,13,0.38)';
const BORDER = '1px solid #0D0D0D';

interface SearchPageClientProps {
  query: string;
  results: TermEntry[];
}

export default function SearchPageClient({ query, results }: SearchPageClientProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(query);

  const handleSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push('/search');
      }
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch(inputValue);
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh' }}>

      {/* 搜索栏 sticky */}
      <div style={{
        position: 'sticky',
        top: '52px',
        backgroundColor: BG,
        borderBottom: BORDER,
        zIndex: 10,
        display: 'flex',
        alignItems: 'stretch',
        height: '60px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          flex: 1,
        }}>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Search terms, e.g. "add oil"'
            autoFocus
            style={{
              flex: 1,
              height: '100%',
              border: 'none',
              borderRight: BORDER,
              padding: '0 24px',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              color: INK,
              backgroundColor: 'transparent',
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleSearch(inputValue)}
            style={{
              height: '100%',
              padding: '0 28px',
              backgroundColor: INK,
              color: BG,
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              flexShrink: 0,
              transition: 'opacity 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Search
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>

        {/* 无搜索词 */}
        {!query.trim() && (
          <div style={{ padding: '120px 0', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(32px, 5vw, 56px)',
              color: 'rgba(13,13,13,0.1)',
              letterSpacing: '-0.03em',
              lineHeight: 0.9,
              margin: 0,
            }}>
              Type to search
            </p>
          </div>
        )}

        {/* 有词有结果 */}
        {query.trim() && results.length > 0 && (
          <>
            <div style={{
              padding: '24px 0 16px',
              borderBottom: BORDER,
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: MUTED,
            }}>
              <span style={{ fontWeight: 700, color: INK }}>{results.length}</span> results for{' '}
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: INK }}>
                &ldquo;{query}&rdquo;
              </span>
            </div>
            {results.map((term, index) => (
              <SearchRow key={term.id} term={term} index={index} />
            ))}
          </>
        )}

        {/* 有词无结果 */}
        {query.trim() && results.length === 0 && (
          <div style={{ padding: '80px 0', borderBottom: BORDER }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: INK,
              letterSpacing: '-0.03em',
              marginBottom: '16px',
            }}>
              No results for &ldquo;{query}&rdquo;
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: MUTED,
              marginBottom: '32px',
            }}>
              This term hasn&apos;t been added yet. Want to contribute?
            </p>
            <Link
              href="/submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '48px',
                padding: '0 28px',
                backgroundColor: INK,
                color: BG,
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                border: BORDER,
                transition: 'opacity 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Submit this term ↗
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

function SearchRow({ term, index }: { term: TermEntry; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/term/${term.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: BORDER,
        backgroundColor: hovered ? 'rgba(13,13,13,0.04)' : 'transparent',
        transition: 'background-color 0.1s',
        minHeight: '80px',
      }}>
        {/* 序号 */}
        <div style={{
          width: '64px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'stretch',
          borderRight: BORDER,
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: MUTED }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* 词条主体 */}
        <div style={{
          flex: 1,
          padding: '16px 32px',
          borderRight: BORDER,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '22px',
              color: INK,
              textDecoration: 'line-through',
              textDecorationColor: 'rgba(13,13,13,0.25)',
              letterSpacing: '-0.02em',
            }}>
              {term.chinglish}
            </span>
            <span style={{ color: MUTED, fontSize: '16px' }}>→</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '22px',
              color: INK,
              letterSpacing: '-0.02em',
              opacity: 0.45,
            }}>
              {term.correctExpression}
            </span>
          </div>
          {term.wrongExample && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontStyle: 'italic',
              color: MUTED,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {term.wrongExample}
            </p>
          )}
        </div>

        {/* 右侧元信息 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 24px',
          flexShrink: 0,
          borderRight: BORDER,
          alignSelf: 'stretch',
        }}>
          {term.category.slice(0, 1).map(cat => (
            <span key={cat} style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: MUTED,
              border: '1px solid rgba(13,13,13,0.2)',
              padding: '2px 8px',
              letterSpacing: '0.04em',
            }}>
              {cat}
            </span>
          ))}
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            color: term.riskScore >= 7 ? '#B91C1C' : MUTED,
          }}>
            {term.riskScore}/10
          </span>
        </div>

        {/* 箭头 */}
        <div style={{
          width: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'stretch',
          flexShrink: 0,
        }}>
          <span style={{ color: MUTED, fontSize: '14px' }}>↗</span>
        </div>
      </div>
    </Link>
  );
}
