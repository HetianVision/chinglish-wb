// 基础类型定义

export interface TermEntry {
  id: string;
  chinglish: string;
  wrongExample: string;
  correctExpression: string;
  correctExample: string;

  // 评分数据
  oxfordStatus: "collected" | "not_collected";
  globalHeat: number; // 0-100
  riskScore: number; // 0-10
  funnyScore: number; // 0-10

  // 分类标签
  category: string[];
  region?: string[];

  // 元数据
  submittedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;

  // 统计
  views: number;
  shares: number;
}

export interface Submission {
  id: string;
  status: "pending" | "approved" | "rejected";

  // 投稿者信息
  submitterName?: string;
  submitterEmail?: string;

  // 投稿内容
  chinglish: string;
  wrongExample: string;
  correctExpression: string;
  correctExample: string;
  category: string[];
  region?: string[];

  // 可选字段
  estimatedRiskScore?: number;
  funnyStory?: string;

  // 审核信息
  reviewedAt?: string;
  reviewNote?: string;
  reviewedBy?: string;

  // 时间戳
  submittedAt: string;
  updatedAt: string;
}

export interface TermStat {
  id: string;
  termId: string;
  statType: "view" | "share" | "like";
  userFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  createdAt: string;
}

// 常量定义
export const CATEGORIES = [
  "商务",
  "日常",
  "学术",
  "网络",
  "口语",
  "书面",
  "旅游",
  "恋爱",
] as const;

export const REGIONS = ["北方", "南方", "港澳台", "海外"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Region = (typeof REGIONS)[number];

// User Profile Interface
export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  fullName: string | null;
  contributionLevel: number;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}
