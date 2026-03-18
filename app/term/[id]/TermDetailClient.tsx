'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TermEntry } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { incrementTermViews } from '@/lib/supabase/queries';
import Link from 'next/link';

const BG = '#F5F0DC';
const INK = '#0D0D0D';
const MUTED = 'rgba(13,13,13,0.38)';
const BORDER = '1px solid #0D0D0D';

interface TermDetailClientProps {
  term: TermEntry;
  relatedTerms: TermEntry[];
}

export function TermDetailClient({ term, relatedTerms }: TermDetailClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    incrementTermViews(supabase, term.id).catch(console.error);
  }, [term.id]);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `"${term.chinglish}" → "${term.correctExpression}"`;
    if (navigator.share) {
      try {
        await navigator.share({ title: term.chinglish, text, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh' }}>

      {/* 面包屑 sticky bar */}
      <div style={{
        position: 'sticky',
        top: '52px',
        zIndex: 40,
        backgroundColor: BG,
        borderBottom: BORDER,
        display: 'flex',
        alignItems: 'stretch',
        height: '44px',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: MUTED,
            background: 'none',
            border: 'none',
            borderRight: BORDER,
            cursor: 'pointer',
            padding: '0 20px',
            transition: 'color 0.1s',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = INK)}
          onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
        >
          ← Back
        </button>
        <Link href="/" style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: MUTED,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderRight: BORDER,
          transition: 'color 0.1s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = INK)}
          onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
        >
          Home
        </Link>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: INK,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
        }}>
          Term
        </span>
      </div>

      {/* 主内容 */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>

        {/* Hero 区 */}
        <div style={{ borderBottom: BORDER, padding: '64px 0 48px' }}>

          {/* 分类标签行 */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {term.category.map((cat, i) => (
              <span key={`${term.id}-cat-${i}`} style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: MUTED,
                border: '1px solid rgba(13,13,13,0.2)',
                padding: '3px 10px',
              }}>
                {cat}
              </span>
            ))}
            {term.oxfordStatus === 'collected' && (
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: INK,
                border: BORDER,
                padding: '3px 10px',
              }}>
                Oxford ✓
              </span>
            )}
          </div>

          {/* 大标题：Chinglish → Correct */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px', flexWrap: 'wrap', marginBottom: '0' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(48px, 8vw, 96px)',
              color: INK,
              textDecoration: 'line-through',
              textDecorationColor: 'rgba(13,13,13,0.25)',
              textDecorationThickness: '3px',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              margin: 0,
            }}>
              {term.chinglish}
            </h1>
            <span style={{ fontSize: '40px', color: MUTED, flexShrink: 0 }}>→</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(48px, 8vw, 96px)',
              color: INK,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              margin: 0,
              opacity: 0.55,
            }}>
              {term.correctExpression}
            </h2>
          </div>
        </div>

        {/* 例句区 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: BORDER,
        }}>
          {/* 错误例句 */}
          <div style={{ padding: '40px 40px 40px 0', borderRight: BORDER }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: MUTED,
              marginBottom: '20px',
            }}>
              ✗ Wrong usage
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              fontStyle: 'italic',
              color: INK,
              lineHeight: 1.7,
              margin: 0,
              opacity: 0.6,
            }}>
              {term.wrongExample}
            </p>
          </div>

          {/* 正确例句 */}
          <div style={{ padding: '40px 0 40px 40px' }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: MUTED,
              marginBottom: '20px',
            }}>
              ✓ Correct usage
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              fontStyle: 'italic',
              color: INK,
              lineHeight: 1.7,
              margin: 0,
            }}>
              {term.correctExample}
            </p>
          </div>
        </div>

        {/* 数据指标行 */}
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          borderBottom: BORDER,
        }}>
          {[
            { label: 'Global Heat', value: String(term.globalHeat) },
            { label: 'Risk Score', value: `${term.riskScore}/10` },
            { label: 'Funny Score', value: `${term.funnyScore}/10` },
            { label: 'Views', value: term.views > 9999 ? `${(term.views / 1000).toFixed(0)}k` : String(term.views) },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1,
              padding: '28px 32px',
              borderRight: i < 3 ? BORDER : 'none',
            }}>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: MUTED,
                marginBottom: '8px',
              }}>
                {stat.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '32px',
                color: INK,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* 操作按钮行 */}
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          borderBottom: BORDER,
        }}>
          <button
            onClick={handleShare}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              color: BG,
              backgroundColor: INK,
              border: 'none',
              borderRight: BORDER,
              padding: '0 28px',
              height: '52px',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'opacity 0.1s',
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {copied ? 'Copied ✓' : 'Share ↗'}
          </button>
          <Link
            href="/submit"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: MUTED,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              padding: '0 28px',
              borderRight: BORDER,
              transition: 'color 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = INK)}
            onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
          >
            Submit a term
          </Link>
          <Link
            href="/browse"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: MUTED,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              padding: '0 28px',
              transition: 'color 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = INK)}
            onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
          >
            Browse all
          </Link>
        </div>

        {/* 相关词条 */}
        {relatedTerms.length > 0 && (
          <div style={{ padding: '48px 0 80px' }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: MUTED,
              marginBottom: '0',
              paddingBottom: '0',
              borderBottom: BORDER,
              paddingTop: '0',
            }}>
              <span style={{ display: 'block', borderBottom: 'none', padding: '0 0 16px' }}>Related Terms</span>
            </div>
            <div>
              {relatedTerms.slice(0, 5).map((rt) => (
                <RelatedRow key={rt.id} term={rt} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function RelatedRow({ term }: { term: TermEntry }) {
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
        gap: '16px',
        padding: '20px 0',
        borderBottom: BORDER,
        backgroundColor: hovered ? 'rgba(13,13,13,0.03)' : 'transparent',
        transition: 'background-color 0.1s',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '20px',
          color: INK,
          letterSpacing: '-0.02em',
          textDecoration: 'line-through',
          textDecorationColor: 'rgba(13,13,13,0.25)',
          flex: 1,
        }}>
          {term.chinglish}
        </span>
        <span style={{ color: MUTED, fontSize: '16px', flexShrink: 0 }}>→</span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '20px',
          color: INK,
          letterSpacing: '-0.02em',
          opacity: 0.55,
          flex: 1,
        }}>
          {term.correctExpression}
        </span>
        <span style={{ color: MUTED, fontSize: '14px', flexShrink: 0 }}>↗</span>
      </div>
    </Link>
  );
}
