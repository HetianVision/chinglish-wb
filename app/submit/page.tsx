'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, REGIONS } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { submitTerm } from '@/lib/supabase/queries';

const BG = '#F5F0DC';
const INK = '#0D0D0D';
const MUTED = 'rgba(13,13,13,0.38)';
const BORDER = '1px solid #0D0D0D';
const FIELD_BG = 'rgba(13,13,13,0.04)';

export default function SubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    chinglish: '',
    wrongExample: '',
    correctExpression: '',
    correctExample: '',
    submitterName: '',
    submitterEmail: '',
    estimatedRiskScore: 5,
    funnyStory: '',
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.chinglish || !formData.wrongExample || !formData.correctExpression ||
        !formData.correctExample || selectedCategories.length === 0) {
      setError('Please fill in all required fields and select at least one category.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const result = await submitTerm(supabase, {
        chinglish: formData.chinglish,
        wrongExample: formData.wrongExample,
        correctExpression: formData.correctExpression,
        correctExample: formData.correctExample,
        category: selectedCategories,
        region: selectedRegions.length > 0 ? selectedRegions : undefined,
        submitterName: formData.submitterName || undefined,
        submitterEmail: formData.submitterEmail || undefined,
        estimatedRiskScore: formData.estimatedRiskScore,
        funnyStory: formData.funnyStory || undefined,
      });

      if (result.error) throw new Error(result.error.message || 'Submission failed');
      setSubmitSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div style={{ backgroundColor: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(48px, 8vw, 96px)',
            color: INK,
            letterSpacing: '-0.04em',
            lineHeight: 0.9,
            marginBottom: '32px',
          }}>
            Submitted ✓
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: MUTED }}>
            Thanks for contributing! Your term will go live after review.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: MUTED, marginTop: '8px' }}>
            Redirecting to home...
          </p>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    border: BORDER,
    backgroundColor: FIELD_BG,
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    color: INK,
    padding: '0 16px',
    outline: 'none',
    transition: 'background-color 0.1s',
    borderRadius: 0,
    boxSizing: 'border-box',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    border: BORDER,
    backgroundColor: FIELD_BG,
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    color: INK,
    padding: '14px 16px',
    outline: 'none',
    resize: 'vertical' as const,
    lineHeight: 1.6,
    borderRadius: 0,
    boxSizing: 'border-box',
    minHeight: '96px',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: MUTED,
    display: 'block',
    marginBottom: '8px',
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ borderBottom: BORDER }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
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
              Contribute
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
              投稿词条
            </h1>
          </div>
        </div>
      </div>

      {/* 表单 */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px' }}>
        <form onSubmit={handleSubmit}>

          {/* 错误提示 */}
          {error && (
            <div style={{
              borderBottom: BORDER,
              padding: '20px 0',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: '#B91C1C',
            }}>
              {error}
            </div>
          )}

          {/* 区块一：核心词条 */}
          <SectionHeader label="Core term info" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: BORDER }}>
            <div style={{ padding: '24px 32px 24px 0', borderRight: BORDER }}>
              <label style={labelStyle}>
                Chinglish expression <Required />
              </label>
              <input
                type="text"
                value={formData.chinglish}
                onChange={e => setFormData({ ...formData, chinglish: e.target.value })}
                placeholder='e.g. "add oil"'
                required
                style={inputStyle}
              />
            </div>
            <div style={{ padding: '24px 0 24px 32px' }}>
              <label style={labelStyle}>
                Correct expression <Required />
              </label>
              <input
                type="text"
                value={formData.correctExpression}
                onChange={e => setFormData({ ...formData, correctExpression: e.target.value })}
                placeholder='e.g. "cheer up / keep going"'
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: BORDER }}>
            <div style={{ padding: '24px 32px 24px 0', borderRight: BORDER }}>
              <label style={labelStyle}>
                Wrong example <Required />
              </label>
              <textarea
                value={formData.wrongExample}
                onChange={e => setFormData({ ...formData, wrongExample: e.target.value })}
                placeholder='e.g. "You need to add oil to finish this project!"'
                required
                style={textareaStyle}
              />
            </div>
            <div style={{ padding: '24px 0 24px 32px' }}>
              <label style={labelStyle}>
                Correct example <Required />
              </label>
              <textarea
                value={formData.correctExample}
                onChange={e => setFormData({ ...formData, correctExample: e.target.value })}
                placeholder='e.g. "You need to keep going to finish this project!"'
                required
                style={textareaStyle}
              />
            </div>
          </div>

          {/* 区块二：分类与风险 */}
          <SectionHeader label="Categories & risk" />

          <div style={{ padding: '24px 0', borderBottom: BORDER }}>
            <label style={labelStyle}>
              Categories <Required />
              <span style={{ fontWeight: 400, textTransform: 'none' as const, marginLeft: '6px' }}>— select at least one</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    style={{
                      padding: '6px 16px',
                      border: BORDER,
                      backgroundColor: isSelected ? INK : 'transparent',
                      color: isSelected ? BG : MUTED,
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                      transition: 'background-color 0.1s, color 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.color = INK; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.color = MUTED; }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '24px 0', borderBottom: BORDER }}>
            <label style={labelStyle}>
              Regions
              <span style={{ fontWeight: 400, textTransform: 'none' as const, marginLeft: '6px' }}>— optional</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {REGIONS.map(region => {
                const isSelected = selectedRegions.includes(region);
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => handleRegionToggle(region)}
                    style={{
                      padding: '6px 16px',
                      border: BORDER,
                      backgroundColor: isSelected ? INK : 'transparent',
                      color: isSelected ? BG : MUTED,
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                      transition: 'background-color 0.1s, color 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.color = INK; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.color = MUTED; }}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '24px 0', borderBottom: BORDER }}>
            <label style={labelStyle}>
              Risk score estimate
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 800,
                color: INK,
                marginLeft: '12px',
                letterSpacing: '-0.02em',
              }}>
                {formData.estimatedRiskScore}
              </span>
              <span style={{ fontWeight: 400, textTransform: 'none' as const, marginLeft: '4px', fontSize: '11px' }}>/ 10</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.estimatedRiskScore}
              onChange={e => setFormData({ ...formData, estimatedRiskScore: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: INK, height: '2px' }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '6px',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: MUTED,
            }}>
              <span>0 · No risk</span>
              <span>10 · High risk</span>
            </div>
          </div>

          {/* 区块三：附加信息 */}
          <SectionHeader label="Additional info (optional)" />

          <div style={{ padding: '24px 0', borderBottom: BORDER }}>
            <label style={labelStyle}>Funny story</label>
            <textarea
              value={formData.funnyStory}
              onChange={e => setFormData({ ...formData, funnyStory: e.target.value })}
              placeholder="Share a funny story related to this Chinglish..."
              style={textareaStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: BORDER }}>
            <div style={{ padding: '24px 32px 24px 0', borderRight: BORDER }}>
              <label style={labelStyle}>Nickname</label>
              <input
                type="text"
                value={formData.submitterName}
                onChange={e => setFormData({ ...formData, submitterName: e.target.value })}
                placeholder="Your nickname"
                style={inputStyle}
              />
            </div>
            <div style={{ padding: '24px 0 24px 32px' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={formData.submitterEmail}
                onChange={e => setFormData({ ...formData, submitterEmail: e.target.value })}
                placeholder="your@email.com"
                style={inputStyle}
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: BORDER }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                height: '64px',
                backgroundColor: isSubmitting ? 'rgba(13,13,13,0.4)' : INK,
                color: BG,
                border: 'none',
                borderRight: BORDER,
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.1s',
              }}
              onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit term ↗'}
            </button>
            <div style={{
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: MUTED,
              maxWidth: '280px',
              lineHeight: 1.5,
            }}>
              All submissions are reviewed before going live.
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: 'var(--font-body)',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      color: MUTED,
      padding: '20px 0 16px',
      borderBottom: BORDER,
    }}>
      {label}
    </div>
  );
}

function Required() {
  return <span style={{ color: '#B91C1C', marginLeft: '2px' }}>*</span>;
}
