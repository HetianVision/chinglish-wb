'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TermEntry, CATEGORIES } from '@/lib/types';

const BG = '#F5F0DC';
const INK = '#0D0D0D';
const MUTED = 'rgba(13,13,13,0.38)';
const BORDER = '1px solid #0D0D0D';

const ALL_CATEGORIES = ['All', ...CATEGORIES] as const;

interface BrowsePageClientProps {
  category: string;
  terms: TermEntry[];
}

export default function BrowsePageClient({ category, terms }: BrowsePageClientProps) {
  const router = useRouter();

  const handleCategoryClick = (cat: string) => {
    if (cat === 'All') {
      router.push('/browse');
    } else {
      router.push(`/browse?category=${encodeURIComponent(cat)}`);
    }
  };

  const activeCategory = category || 'All';
  const displayName = activeCategory === 'All' ? 'All Terms' : activeCategory;

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', display: 'flex' }}>

      {/* 左侧边栏 */}
      <aside style={{
        width: '200px',
        flexShrink: 0,
        borderRight: BORDER,
        position: 'sticky',
        top: '52px',
        height: 'calc(100vh - 52px)',
        overflowY: 'auto',
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: MUTED,
          padding: '20px 20px 16px',
          borderBottom: BORDER,
        }}>
          Browse
        </div>
        <nav>
          {ALL_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 20px',
                  border: 'none',
                  borderBottom: '1px solid rgba(13,13,13,0.08)',
                  backgroundColor: isActive ? INK : 'transparent',
                  color: isActive ? BG : MUTED,
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'background-color 0.1s, color 0.1s',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = INK;
                    e.currentTarget.style.backgroundColor = 'rgba(13,13,13,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = MUTED;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {cat}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 右侧内容区 */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {/* 顶部标题栏 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: BORDER,
          padding: '0 40px',
          height: '64px',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '24px',
            color: INK,
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            {displayName}
          </h1>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: MUTED,
          }}>
            {terms.length} terms
          </span>
        </div>

        {/* 词条列表 */}
        {terms.length === 0 ? (
          <div style={{ padding: '80px 40px', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 700,
              color: 'rgba(13,13,13,0.15)',
              marginBottom: '24px',
            }}>
              No terms in this category yet
            </p>
            <Link href="/submit" style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: '44px',
              padding: '0 28px',
              backgroundColor: INK,
              color: BG,
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              border: BORDER,
            }}>
              Submit a term
            </Link>
          </div>
        ) : (
          terms.map((term, index) => (
            <BrowseRow key={term.id} term={term} index={index} />
          ))
        )}
      </main>
    </div>
  );
}

function BrowseRow({ term, index }: { term: TermEntry; index: number }) {
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
        minHeight: '72px',
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
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: MUTED,
          }}>
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
          gap: '4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '20px',
              color: INK,
              textDecoration: 'line-through',
              textDecorationColor: 'rgba(13,13,13,0.25)',
              letterSpacing: '-0.02em',
            }}>
              {term.chinglish}
            </span>
            <span style={{ color: MUTED, fontSize: '14px' }}>→</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '20px',
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

        {/* 分类 + 风险 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 24px',
          flexShrink: 0,
          borderRight: BORDER,
          alignSelf: 'stretch',
        }}>
          {term.category.slice(0, 2).map(cat => (
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
