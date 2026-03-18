'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0D0D0D',
      padding: '48px 0 32px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* 大标题 */}
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '32px',
          marginBottom: '32px',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(48px, 8vw, 96px)',
            color: '#F5F0DC',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            Chinglish
          </span>
        </div>

        {/* 底部两栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'rgba(245,240,220,0.35)',
            margin: 0,
            lineHeight: 1.6,
            maxWidth: '360px',
          }}>
            全球英语学习者共同参与构建的中式英语文化数据库
          </p>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {[
              { href: '/', label: 'Home' },
              { href: '/browse', label: 'Browse' },
              { href: '/rankings', label: 'Rankings' },
              { href: '/submit', label: 'Submit' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'rgba(245,240,220,0.3)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,240,220,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,220,0.3)')}
              >
                {item.label}
              </Link>
            ))}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(245,240,220,0.15)' }}>
              © 2024
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
