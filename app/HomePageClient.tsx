'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TermEntry } from '@/lib/types';

interface HomePageClientProps {
  hotTerms: TermEntry[];
  riskyTerms: TermEntry[];
  latestTerms: TermEntry[];
}

const BG = '#F5F0DC';
const INK = '#0D0D0D';
const MUTED = 'rgba(13,13,13,0.38)';
const BORDER = '1px solid #0D0D0D';

export function HomePageClient({ hotTerms, riskyTerms, latestTerms }: HomePageClientProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<'hot' | 'risky' | 'latest'>('hot');

  const submit = (val: string) => {
    if (val.trim()) router.push(`/search?q=${encodeURIComponent(val.trim())}`);
  };

  const tabTerms =
    activeTab === 'hot' ? hotTerms :
    activeTab === 'risky' ? riskyTerms :
    latestTerms;

  const tabs = [
    { key: 'hot' as const, label: 'Popular', count: hotTerms.length },
    { key: 'risky' as const, label: 'High Risk', count: riskyTerms.length },
    { key: 'latest' as const, label: 'New', count: latestTerms.length },
  ];

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh' }}>

      {/* ━━━ HERO ━━━ */}
      <section style={{ borderBottom: BORDER }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

          {/* 大标题区 */}
          <div style={{
            padding: '72px 0 48px',
            borderBottom: BORDER,
          }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(64px, 11vw, 140px)',
              color: INK,
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              margin: '0 0 40px',
            }}>
              中式英语<br />
              <span style={{ color: 'rgba(13,13,13,0.18)' }}>词典</span>
            </h1>

            {/* 搜索栏 */}
            <div style={{
              display: 'flex',
              alignItems: 'stretch',
              border: BORDER,
              maxWidth: '600px',
            }}>
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit(searchValue)}
                placeholder={'Search terms, e.g. "add oil"'}
                style={{
                  flex: 1,
                  height: '52px',
                  padding: '0 20px',
                  fontSize: '15px',
                  color: INK,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <button
                onClick={() => submit(searchValue)}
                style={{
                  height: '52px',
                  padding: '0 28px',
                  backgroundColor: INK,
                  color: BG,
                  border: 'none',
                  borderLeft: BORDER,
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

          {/* 统计信息行 */}
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: BORDER,
          }}>
            {[
              { num: '500+', label: 'Terms collected' },
              { num: '8', label: 'Categories' },
              { num: '10', label: 'Risk levels' },
              { num: 'Global', label: 'Contributors' },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: '20px 32px',
                borderRight: i < 3 ? BORDER : 'none',
                flex: 1,
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '24px',
                  color: INK,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}>{stat.num}</div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: MUTED,
                  letterSpacing: '0.02em',
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 词条列表 ━━━ */}
      <section>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

          {/* Tab 栏 */}
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: BORDER,
          }}>
            {tabs.map(tab => (
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
                  padding: '14px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.1s, color 0.1s',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.color = INK;
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.color = MUTED;
                  }
                }}
              >
                {tab.label}
                <span style={{
                  fontSize: '11px',
                  opacity: 0.5,
                  fontWeight: 400,
                }}>{tab.count}</span>
              </button>
            ))}

            {/* 右侧：查看全部 */}
            <Link
              href="/rankings"
              style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: MUTED,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                borderLeft: BORDER,
                transition: 'color 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = INK)}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              View all →
            </Link>
          </div>

          {/* 词条列表 */}
          {tabTerms.length === 0 ? (
            <EmptyState />
          ) : (
            tabTerms.map((term, i) => (
              <TermRow key={term.id} term={term} index={i} />
            ))
          )}
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section style={{ borderTop: BORDER, marginTop: '0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: BORDER,
          }}>
            {/* 左：大标题 */}
            <div style={{
              flex: 1,
              padding: '64px 0',
              borderRight: BORDER,
              paddingRight: '48px',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                color: MUTED,
                marginBottom: '20px',
              }}>Contribute</p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(36px, 5vw, 64px)',
                color: INK,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                margin: '0 0 20px',
              }}>
                发现了新的<br />Chinglish？
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: MUTED,
                lineHeight: 1.6,
                margin: 0,
              }}>
                和全球英语学习者一起记录语言的进化
              </p>
            </div>

            {/* 右：按钮 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column' as const,
              justifyContent: 'center',
              padding: '64px 0 64px 48px',
              gap: '12px',
              flexShrink: 0,
            }}>
              <Link
                href="/submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '52px',
                  padding: '0 40px',
                  backgroundColor: INK,
                  color: BG,
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  border: BORDER,
                  transition: 'opacity 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Submit a term
              </Link>
              <Link
                href="/browse"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '52px',
                  padding: '0 40px',
                  backgroundColor: 'transparent',
                  color: INK,
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 400,
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  border: BORDER,
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(13,13,13,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Browse all
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

// ━━━ 词条行组件 ━━━
function TermRow({ term, index }: { term: TermEntry; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/term/${term.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        borderBottom: BORDER,
        backgroundColor: hovered ? 'rgba(13,13,13,0.04)' : 'transparent',
        transition: 'background-color 0.1s',
        padding: '0 0',
      }}>
        {/* 主行 */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0',
          minHeight: '80px',
        }}>
          {/* 序号 */}
          <div style={{
            width: '64px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'stretch',
            borderRight: BORDER,
            justifyContent: 'center',
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
            padding: '20px 32px',
            borderRight: BORDER,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '6px',
          }}>
            {/* Chinglish → 正确表达 */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(22px, 3vw, 32px)',
                color: INK,
                textDecoration: 'line-through',
                textDecorationColor: 'rgba(13,13,13,0.3)',
                textDecorationThickness: '2px',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                {term.chinglish}
              </span>
              <span style={{ color: MUTED, fontSize: '18px', flexShrink: 0 }}>→</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(22px, 3vw, 32px)',
                color: INK,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                opacity: hovered ? 1 : 0.55,
                transition: 'opacity 0.15s',
              }}>
                {term.correctExpression}
              </span>
            </div>

            {/* 例句对比 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginTop: '4px',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontStyle: 'italic',
                color: MUTED,
                margin: 0,
                lineHeight: 1.5,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
              }}>
                ✗ {term.wrongExample}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontStyle: 'italic',
                color: MUTED,
                margin: 0,
                lineHeight: 1.5,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
              }}>
                ✓ {term.correctExample}
              </p>
            </div>
          </div>

          {/* 右侧元信息 */}
          <div style={{
            width: '200px',
            flexShrink: 0,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
            alignSelf: 'stretch',
            gap: '8px',
          }}>
            {/* 分类 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
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
            </div>

            {/* 数据指标 */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: MUTED }}>风险</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: term.riskScore >= 7 ? '#B91C1C' : INK,
                }}>
                  {term.riskScore}<span style={{ fontWeight: 400, color: MUTED, fontSize: '11px' }}>/10</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: MUTED }}>热度</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: INK }}>
                  {term.globalHeat}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: MUTED }}>浏览</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: INK }}>
                  {term.views > 9999 ? `${(term.views / 1000).toFixed(0)}k` : term.views}
                </span>
              </div>
            </div>

            {/* 牛津收录 */}
            {term.oxfordStatus === 'collected' && (
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: INK,
                border: BORDER,
                padding: '3px 8px',
                display: 'inline-block',
              }}>
                Oxford
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div style={{
      padding: '80px 0',
      textAlign: 'center',
      borderBottom: BORDER,
    }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        color: MUTED,
        marginBottom: '24px',
      }}>No terms yet</p>
      <Link
        href="/submit"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: '44px',
          padding: '0 28px',
          backgroundColor: INK,
          color: BG,
          fontSize: '13px',
          fontWeight: 600,
          textDecoration: 'none',
          fontFamily: 'var(--font-body)',
          border: BORDER,
        }}
      >
        Submit a term
      </Link>
    </div>
  );
}
