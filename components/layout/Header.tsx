'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { UserMenu } from '@/components/features/auth/UserMenu';
import { AuthDialog } from '@/components/features/auth/AuthDialog';

export function Header() {
  const { user, loading, signOut } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const pathname = usePathname();

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/browse', label: 'Browse' },
    { href: '/rankings', label: 'Rankings' },
    { href: '/submit', label: 'Submit' },
  ];

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#F5F0DC',
        borderBottom: '1px solid #0D0D0D',
        height: '52px',
        display: 'flex',
        alignItems: 'stretch',
      }}>
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'stretch',
        }}>
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              borderRight: '1px solid #0D0D0D',
              flexShrink: 0,
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '15px',
              color: '#0D0D0D',
              letterSpacing: '-0.01em',
            }}>
              Chinglish
            </span>
            <sup style={{
              fontFamily: 'var(--font-body)',
              fontSize: '9px',
              color: '#0D0D0D',
              opacity: 0.4,
              marginLeft: '2px',
              fontWeight: 400,
            }}>TM</sup>
          </Link>

          {/* 导航 */}
          <nav style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#F5F0DC' : '#0D0D0D',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    backgroundColor: isActive ? '#0D0D0D' : 'transparent',
                    borderRight: '1px solid #0D0D0D',
                    transition: 'background-color 0.1s, color 0.1s',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(13,13,13,0.06)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 认证区 */}
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            borderLeft: '1px solid #0D0D0D',
            marginLeft: 'auto',
          }}>
            {!loading && (
              <>
                {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                    <UserMenu user={user} onSignOut={signOut} />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleOpenAuth('login')}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        color: '#0D0D0D',
                        background: 'none',
                        border: 'none',
                        borderRight: '1px solid #0D0D0D',
                        padding: '0 20px',
                        cursor: 'pointer',
                        letterSpacing: '0.01em',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(13,13,13,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleOpenAuth('signup')}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#F5F0DC',
                        backgroundColor: '#0D0D0D',
                        border: 'none',
                        padding: '0 20px',
                        cursor: 'pointer',
                        letterSpacing: '0.01em',
                        transition: 'opacity 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      Sign up
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
    </>
  );
}
