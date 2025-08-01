export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  photo_profile: string | null;
  bio: string | null;
}

export interface Thread {
  id: number;
  content: string;
  image: string | null;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
  user?: User;
  likes: Like[];
  _count: {
    likes: number;
    replies: number;
  };
}

export interface Like {
  user_id: number;
  thread_id: number;
  created_at: Date;
  user: User;
}

export interface Reply {
  id: number;
  content: string;
  user_id: number;
  thread_id: number;
  image: string | null;
  created_at: Date;
  user: User;
}

export interface Following {
  id: number;
  following_id: number;
  follower_id: number;
  following: {
    id: number;
    username: string;
    full_name: string;
    photo_profile: string | null;
  };
  follower: {
    id: number;
    username: string;
    full_name: string;
    photo_profile: string | null;
  };
}