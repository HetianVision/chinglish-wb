/**
 * 投稿页面 - 优化版
 * 更好的表单布局和视觉效果
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES, REGIONS } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { submitTerm } from '@/lib/supabase/queries';

export default function SubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 表单状态
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
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证必填字段
    if (
      !formData.chinglish ||
      !formData.wrongExample ||
      !formData.correctExpression ||
      !formData.correctExample ||
      selectedCategories.length === 0
    ) {
      setError('请填写所有必填字段（Chinglish表达、错误示例、正确表达、正确示例、至少一个分类）');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // 提交到Supabase
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

      if (result.error) {
        throw new Error(result.error.message || '提交失败，请稍后重试');
      }

      setSubmitSuccess(true);

      // 3秒后跳转到首页
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      console.error('提交失败：', err);
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-8xl mb-8">🎉</div>
        <h1 className="text-4xl font-bold mb-4">投稿成功！</h1>
        <p className="text-xl text-muted-foreground mb-8">
          感谢您的贡献！您的投稿将在审核后上线。
        </p>
        <p className="text-base text-muted-foreground animate-pulse">
          即将跳转到首页...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          📝 投稿新词条
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          发现了新的Chinglish？和全球社区一起分享吧！
        </p>
      </section>

      {/* 表单 */}
      <form onSubmit={handleSubmit}>
        <Card className="border-2 rounded-2xl">
          <CardHeader className="p-8 md:p-10">
            <CardTitle className="text-2xl">词条信息</CardTitle>
            <CardDescription className="text-base">
              请填写完整的词条信息，标记<span className="text-error font-semibold">*</span>的为必填项
            </CardDescription>
            {error && (
              <div className="mt-4 p-4 bg-error/10 border-2 border-error rounded-xl text-error text-sm font-medium">
                {error}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-8 p-8 md:p-10">
            {/* Chinglish表达 + 正确表达 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="chinglish" className="text-base font-semibold">
                  Chinglish 表达 <span className="text-error">*</span>
                </Label>
                <Input
                  id="chinglish"
                  placeholder="例如：add oil"
                  value={formData.chinglish}
                  onChange={(e) =>
                    setFormData({ ...formData, chinglish: e.target.value })
                  }
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correctExpression" className="text-base font-semibold">
                  正确表达 <span className="text-error">*</span>
                </Label>
                <Input
                  id="correctExpression"
                  placeholder="例如：cheer up / keep going"
                  value={formData.correctExpression}
                  onChange={(e) =>
                    setFormData({ ...formData, correctExpression: e.target.value })
                  }
                  required
                  className="h-12 text-base"
                />
              </div>
            </div>

            {/* 错误示例 */}
            <div className="space-y-2">
              <Label htmlFor="wrongExample" className="text-base font-semibold">
                错误示例 <span className="text-error">*</span>
              </Label>
              <Textarea
                id="wrongExample"
                placeholder="例如：You need to add oil to finish this project!"
                value={formData.wrongExample}
                onChange={(e) =>
                  setFormData({ ...formData, wrongExample: e.target.value })
                }
                required
                rows={3}
                className="text-base"
              />
            </div>

            {/* 正确示例 */}
            <div className="space-y-2">
              <Label htmlFor="correctExample" className="text-base font-semibold">
                正确示例 <span className="text-error">*</span>
              </Label>
              <Textarea
                id="correctExample"
                placeholder="例如：You need to keep going to finish this project!"
                value={formData.correctExample}
                onChange={(e) =>
                  setFormData({ ...formData, correctExample: e.target.value })
                }
                required
                rows={3}
                className="text-base"
              />
            </div>

            {/* 分类标签 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                分类标签 <span className="text-error">*</span> <span className="text-muted-foreground font-normal">(至少选择一个)</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                    className={`cursor-pointer border-2 px-4 py-2 text-sm font-medium transition-all ${selectedCategories.includes(category) ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 地区 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">使用地区 <span className="text-muted-foreground font-normal">(可选)</span></Label>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((region) => (
                  <Badge
                    key={region}
                    variant={selectedRegions.includes(region) ? 'default' : 'outline'}
                    className={`cursor-pointer border-2 px-4 py-2 text-sm font-medium transition-all ${selectedRegions.includes(region) ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}
                    onClick={() => handleRegionToggle(region)}
                  >
                    {region}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 风险指数 */}
            <div className="space-y-3">
              <Label htmlFor="riskScore" className="text-base font-semibold">
                预估风险指数 (0-10)
              </Label>
              <div className="flex items-center gap-6">
                <Input
                  id="riskScore"
                  type="range"
                  min="0"
                  max="10"
                  value={formData.estimatedRiskScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedRiskScore: parseInt(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span className="text-2xl font-bold w-12 text-center text-error">
                  {formData.estimatedRiskScore}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                0 = 无风险，10 = 高风险（可能造成严重误解）
              </p>
            </div>

            {/* 趣事分享 */}
            <div className="space-y-2">
              <Label htmlFor="funnyStory" className="text-base font-semibold">
                趣事分享 <span className="text-muted-foreground font-normal">(可选)</span>
              </Label>
              <Textarea
                id="funnyStory"
                placeholder="分享一个与这个Chinglish相关的有趣故事..."
                value={formData.funnyStory}
                onChange={(e) =>
                  setFormData({ ...formData, funnyStory: e.target.value })
                }
                rows={4}
                className="text-base"
              />
            </div>

            <hr className="border-border" />

            {/* 提交者信息 */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold">提交者信息 <span className="text-muted-foreground font-normal">(可选)</span></h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">昵称</Label>
                  <Input
                    id="name"
                    placeholder="您的昵称"
                    value={formData.submitterName}
                    onChange={(e) =>
                      setFormData({ ...formData, submitterName: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.submitterEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, submitterEmail: e.target.value })
                    }
                    className="h-12"
                  />
                  <p className="text-sm text-muted-foreground">
                    用于接收审核结果通知，不会公开
                  </p>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                size="lg"
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 h-14 text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : '提交词条'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="border-2 h-14 text-lg font-semibold"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* 提示信息 */}
      <Card className="border-2 bg-secondary/30 rounded-2xl">
        <CardHeader className="p-6">
          <CardTitle className="text-xl">📌 投稿须知</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm md:text-base p-6 pt-0">
          <p>1. 请确保提交的内容真实、准确，并且是常见的Chinglish表达</p>
          <p>2. 所有投稿将经过人工审核，通过后才会公开展示</p>
          <p>3. 请勿提交含有歧视、暴力、色情等不当内容</p>
          <p>4. 提交即表示您同意将内容以 CC BY-SA 4.0 协议分享</p>
        </CardContent>
      </Card>
    </div>
  );
}
