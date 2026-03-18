'use client';

import { useState } from 'react';
import { TermEntry } from '@/lib/types';
import Link from 'next/link';

const BG = '#F5F0DC';
const INK = '#0D0D0D';
const MUTED = 'rgba(13,13,13,0.38)';
const BORDER = '1px solid #0D0D0D';

interface RankingsPageClientProps {
  hotTerms: TermEntry[];
  riskyTerms: TermEntry[];
  funnyTerms: TermEntry[];
  viewsTerms: TermEntry[];
  sharesTerms: TermEntry[];
  oxfordTerms: TermEntry[];
}

type TabKey = 'hot' | 'risky' | 'funny' | 'views' | 'shares' | 'oxford';

const TABS: { key: TabKey; label: string; sublabel: string; metric: (t: TermEntry) => string | number }[] = [
  { key: 'hot',    label: 'Popular',  sublabel: 'by global heat',   metric: (t) => t.globalHeat },
  { key: 'risky',  label: 'High Risk',sublabel: 'most dangerous',   metric: (t) => `${t.riskScore}/10` },
  { key: 'funny',  label: 'Funny',    sublabel: 'most entertaining',metric: (t) => `${t.funnyScore}/10` },
  { key: 'views',  label: 'Views',    sublabel: 'most visited',     metric: (t) => t.views > 999 ? `${(t.views / 1000).toFixed(1)}k` : t.views },
  { key: 'shares', label: 'Shares',   sublabel: 'most shared',      metric: (t) => t.shares },
  { key: 'oxford', label: 'Oxford',   sublabel: 'officially listed',metric: (t) => t.oxfordStatus === 'collected' ? '✓' : '—' },
];

export function RankingsPageClient({
  hotTerms, riskyTerms, funnyTerms, viewsTerms, sharesTerms, oxfordTerms,
}: RankingsPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('hot');

  const termsByTab: Record<TabKey, TermEntry[]> = {
    hot: hotTerms, risky: riskyTerms, funny: funnyTerms,
    views: viewsTerms, shares: sharesTerms, oxford: oxfordTerms,
  };

  const currentTab = TABS.find(t => t.key === activeTab)!;
  const currentTerms = termsByTab[activeTab];

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ borderBottom: BORDER }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ padding: '72px 0 48px', borderBottom: BORDER }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: MUTED,
              margin: '0 0 20px',
            }}>
              Rankings
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(48px, 8vw, 96px)',
              color: INK,
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              margin: 0,
            }}>
              词条榜单
            </h1>
          </div>

          {/* Tab 栏 */}
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
          }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  color: activeTab === tab.key ? BG : MUTED,
                  backgroundColor: activeTab === tab.key ? INK : 'transparent',
                  border: 'none',
                  borderRight: BORDER,
                  padding: '16px 24px',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s, color 0.1s',
                  letterSpacing: '0.01em',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: '2px',
                  alignItems: 'flex-start',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.key) e.currentTarget.style.color = INK;
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.key) e.currentTarget.style.color = MUTED;
                }}
              >
                {tab.label}
                <span style={{ fontSize: '10px', opacity: 0.55, fontWeight: 400 }}>{tab.sublabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 列表区 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {currentTerms.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center', borderBottom: BORDER }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: MUTED, marginBottom: '24px' }}>
              No terms yet in this ranking
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
          currentTerms.map((term, index) => (
            <RankingRow
              key={term.id}
              term={term}
              index={index}
              metric={currentTab.metric}
              isTop3={index < 3}
            />
          ))
        )}
      </div>
    </div>
  );
}

function RankingRow({
  term, index, metric, isTop3,
}: {
  term: TermEntry;
  index: number;
  metric: (t: TermEntry) => string | number;
  isTop3: boolean;
}) {
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
        minHeight: isTop3 ? '100px' : '72px',
      }}>
        {/* 序号 */}
        <div style={{
          width: isTop3 ? '100px' : '64px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'stretch',
          borderRight: BORDER,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: isTop3 ? '48px' : '16px',
            color: isTop3 ? 'rgba(13,13,13,0.1)' : MUTED,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* 词条内容 */}
        <div style={{
          flex: 1,
          padding: isTop3 ? '28px 40px' : '16px 32px',
          borderRight: BORDER,
          display: 'flex',
          alignItems: 'baseline',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: isTop3 ? 'clamp(24px, 3vw, 36px)' : '20px',
            color: INK,
            textDecoration: 'line-through',
            textDecorationColor: 'rgba(13,13,13,0.25)',
            letterSpacing: '-0.02em',
          }}>
            {term.chinglish}
          </span>
          <span style={{ color: MUTED, fontSize: isTop3 ? '20px' : '14px', flexShrink: 0 }}>→</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: isTop3 ? 'clamp(24px, 3vw, 36px)' : '20px',
            color: INK,
            letterSpacing: '-0.02em',
            opacity: 0.45,
          }}>
            {term.correctExpression}
          </span>
        </div>

        {/* 指标值 */}
        <div style={{
          width: isTop3 ? '140px' : '100px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'stretch',
          borderRight: BORDER,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: isTop3 ? '28px' : '18px',
            color: INK,
            letterSpacing: '-0.02em',
          }}>
            {metric(term)}
          </span>
        </div>

        {/* 箭头 */}
        <div style={{
          width: '52px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'stretch',
        }}>
          <span style={{ color: MUTED, fontSize: '14px' }}>↗</span>
        </div>
      </div>
    </Link>
  );
}
