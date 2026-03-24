export type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  channelId: number | null;
};

export type Video = {
  id: number;
  title: string;
  views: number;
  likes: number;
  comments: number;
  date: string;
  thumbnail: string;
  duration: string;
  revenue: number;
};

export type Channel = {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  avatarColor: string;
  subscribers: number;
  totalViews: number;
  revenue: number;
  joinDate: string;
  videos: Video[];
  analytics: {
    daily: number[];
    labels: string[];
  };
};
