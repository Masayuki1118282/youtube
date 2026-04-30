// YouTube Studio風ダミーアナリティクス生成ロジック（複数チャンネル対応）
// - チャンネルIDから決定論的にスケール係数を導出（規模感がチャンネルごとに変わる）
// - 月+3%の緩やかな成長カーブ
// - 日付 × チャンネルIDのシードで±8%のノイズ
// - 同じ日・同じチャンネルなら何度開いても同じ数値

const START_DATE = new Date('2025-01-01');
const BASE_DAILY_VIEWS = 80_700;
const BASE_TOTAL_SUBSCRIBERS = 6_550;
const BASE_LIFETIME_VIEWS = 10_000_000;
const MONTHLY_GROWTH = 0.03;
const NOISE_RANGE = 0.08;
const AVG_WATCH_MINUTES = 3.2;

const CHANNEL_SCALE_OVERRIDES: Record<string, number> = {
  'mobilesuitgundamuniverceuc96': 1.0,
};

// ===== Seeded Random（mulberry32） =====
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 文字列 → 整数ハッシュ（djb2）
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i);
    h = h & 0xffffffff;
  }
  return Math.abs(h);
}

// 日付 → シード（YYYYMMDD形式の整数）
function dateToSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

// 日数差分
function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86400000);
}

// チャンネルIDからスケール係数を導出（0.2〜2.5倍）
function getChannelScale(channelId: string): number {
  if (CHANNEL_SCALE_OVERRIDES[channelId] !== undefined) {
    return CHANNEL_SCALE_OVERRIDES[channelId];
  }
  const rng = mulberry32(hashString(channelId));
  return 0.2 + rng() * 2.3;
}

// 指定日・チャンネルの日次視聴回数
function getDailyViews(date: Date, channelId: string): number {
  const monthsSinceStart = daysBetween(START_DATE, date) / 30;
  const growthMultiplier = Math.pow(1 + MONTHLY_GROWTH, monthsSinceStart);
  const rng = mulberry32(dateToSeed(date) ^ hashString(channelId));
  const noise = 1 + (rng() * 2 - 1) * NOISE_RANGE;
  const scale = getChannelScale(channelId);
  return Math.round(BASE_DAILY_VIEWS * growthMultiplier * noise * scale);
}

// 指定日時点の登録者数
function getSubscribersAt(date: Date, channelId: string): number {
  const monthsSinceStart = daysBetween(START_DATE, date) / 30;
  const subGrowth = Math.pow(1 + MONTHLY_GROWTH, monthsSinceStart);
  const scale = getChannelScale(channelId);
  const rng = mulberry32(dateToSeed(date) + 1 + hashString(channelId));
  const noise = 1 + (rng() * 2 - 1) * 0.02;
  return Math.round(BASE_TOTAL_SUBSCRIBERS * subGrowth * scale * noise);
}

// ===== 7日間アナリティクス（後方互換 / 単純用途向け） =====
export interface AnalyticsData {
  views7d: number;
  watchTimeHours7d: number;
  subscribers: number;
  viewsChangePercent: number;
  watchTimeChangePercent: number;
  subscribersChangePercent: number;
  graph7d: { date: string; views: number }[];
  realtime48h: number;
  realtimeGraph: number[];
  lifetimeViews: number;
}

export function getAnalytics(channelId: string, today: Date = new Date()): AnalyticsData {
  const last7Days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Days.push(d);
  }

  const prev7Days: Date[] = [];
  for (let i = 13; i >= 7; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    prev7Days.push(d);
  }

  const dailyViewsThisWeek = last7Days.map((d) => getDailyViews(d, channelId));
  const dailyViewsLastWeek = prev7Days.map((d) => getDailyViews(d, channelId));
  const views7d = dailyViewsThisWeek.reduce((a, b) => a + b, 0);
  const viewsLastWeek = dailyViewsLastWeek.reduce((a, b) => a + b, 0);
  const viewsChangePercent = ((views7d - viewsLastWeek) / viewsLastWeek) * 100;

  const watchTimeHours7d = Math.round((views7d * AVG_WATCH_MINUTES) / 60);
  const watchTimeLastWeek = (viewsLastWeek * AVG_WATCH_MINUTES) / 60;
  const watchTimeChangePercent =
    ((watchTimeHours7d - watchTimeLastWeek) / watchTimeLastWeek) * 100;

  const subscribers = getSubscribersAt(today, channelId);
  const lastWeekDate = new Date(today);
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const subscribersLastWeek = getSubscribersAt(lastWeekDate, channelId);
  const subscribersChangePercent =
    ((subscribers - subscribersLastWeek) / subscribersLastWeek) * 100;

  const graph7d = last7Days.map((d, i) => ({
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    views: dailyViewsThisWeek[i],
  }));

  const rtRng = mulberry32(dateToSeed(today) + 2 + hashString(channelId));
  const scale = getChannelScale(channelId);
  const realtimeGraph = Array.from({ length: 48 }, () =>
    Math.round((15 + rtRng() * 25) * scale),
  );
  const realtime48h = realtimeGraph.reduce((a, b) => a + b, 0);

  const daysSinceStart = daysBetween(START_DATE, today);
  const avgDailyNow = views7d / 7;
  const lifetimeAccumulated = Math.round(avgDailyNow * daysSinceStart * 0.51);
  const lifetimeViews = Math.round(BASE_LIFETIME_VIEWS * scale) + lifetimeAccumulated;

  return {
    views7d,
    watchTimeHours7d,
    subscribers,
    viewsChangePercent: Math.round(viewsChangePercent * 10) / 10,
    watchTimeChangePercent: Math.round(watchTimeChangePercent * 10) / 10,
    subscribersChangePercent: Math.round(subscribersChangePercent * 10) / 10,
    graph7d,
    realtime48h,
    realtimeGraph,
    lifetimeViews,
  };
}

// ===== 任意期間アナリティクス（AnalyticsTab のレンジセレクター対応） =====
export interface RangeAnalyticsData {
  viewData: number[];
  watchData: number[];     // 日次視聴分数
  subData: number[];       // 日次登録者増加数
  labels: string[];
  totalViews: number;
  totalWatchHours: number;
  viewGrowthPercent: number;
  watchGrowthPercent: number;
  subGrowthPercent: number;
  currentSubscribers: number;
  realtimeViewers: number;
  lifetimeViews: number;
}

export function getAnalyticsForRange(
  channelId: string,
  days: number,
  today: Date = new Date(),
): RangeAnalyticsData {
  const thisPeriod: Date[] = [];
  const prevPeriod: Date[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    thisPeriod.push(d);
  }
  for (let i = days * 2 - 1; i >= days; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    prevPeriod.push(d);
  }

  const viewData = thisPeriod.map((d) => getDailyViews(d, channelId));
  const prevViewData = prevPeriod.map((d) => getDailyViews(d, channelId));

  const totalViews = viewData.reduce((a, b) => a + b, 0);
  const prevTotalViews = prevViewData.reduce((a, b) => a + b, 0);
  const viewGrowthPercent =
    Math.round(((totalViews - prevTotalViews) / prevTotalViews) * 1000) / 10;

  const watchData = viewData.map((v) => Math.round(v * AVG_WATCH_MINUTES));
  const prevWatchTotal = prevViewData.reduce((a, b) => a + b, 0) * AVG_WATCH_MINUTES;
  const totalWatchMinutes = watchData.reduce((a, b) => a + b, 0);
  const totalWatchHours = Math.round(totalWatchMinutes / 60);
  const watchGrowthPercent =
    Math.round(((totalWatchMinutes - prevWatchTotal) / prevWatchTotal) * 1000) / 10;

  const currentSubscribers = getSubscribersAt(today, channelId);
  const prevPeriodStart = prevPeriod[0];
  const prevSubscribers = getSubscribersAt(prevPeriodStart, channelId);
  const subGrowthPercent =
    Math.round(((currentSubscribers - prevSubscribers) / prevSubscribers) * 1000) / 10;

  const periodStartSubs = getSubscribersAt(thisPeriod[0], channelId);
  const totalSubGain = Math.max(0, currentSubscribers - periodStartSubs);
  const avgDailyGain = totalSubGain / days;
  const subData = thisPeriod.map((d) => {
    const rng = mulberry32(dateToSeed(d) + 3 + hashString(channelId));
    return Math.max(0, Math.round(avgDailyGain * (0.5 + rng() * 1.0)));
  });

  const labels = thisPeriod.map((d) => `${d.getMonth() + 1}/${d.getDate()}`);

  const scale = getChannelScale(channelId);
  const rtRng = mulberry32(dateToSeed(today) + 2 + hashString(channelId));
  const realtimeViewers = Math.round((15 + rtRng() * 25) * scale);

  const daysSinceStart = daysBetween(START_DATE, today);
  const avgDailyNow = totalViews / days;
  const lifetimeAccumulated = Math.round(avgDailyNow * daysSinceStart * 0.51);
  const lifetimeViews = Math.round(BASE_LIFETIME_VIEWS * scale) + lifetimeAccumulated;

  return {
    viewData,
    watchData,
    subData,
    labels,
    totalViews,
    totalWatchHours,
    viewGrowthPercent,
    watchGrowthPercent,
    subGrowthPercent,
    currentSubscribers,
    realtimeViewers,
    lifetimeViews,
  };
}

// ===== フォーマッタ =====
export function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatPercent(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(0)}%`;
}
