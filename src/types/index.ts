export type Profile = {
  id: string;
  name: string;
  email: string;
};

export type Channel = {
  id: string;
  user_id: string;
  youtube_channel_id: string;
  channel_name: string;
  handle: string | null;
  thumbnail_url: string | null;
  subscribers: number;
  total_views: number;
  monthly_revenue?: MonthlyRevenue[];
};

export type MonthlyRevenue = {
  id: string;
  channel_id: string;
  year: number;
  month: number;
  revenue: number;
};

export type YoutubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
};
