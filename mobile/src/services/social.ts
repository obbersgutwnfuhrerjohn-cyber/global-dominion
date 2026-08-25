import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface SocialServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type PostVisibility =
  | "public"
  | "friends"
  | "private";

export type ReactionType =
  | "like"
  | "love"
  | "laugh"
  | "wow"
  | "celebrate";

export interface SocialPost {
  id: string;

  authorPlayerId: PlayerId;

  authorUsername: string;

  authorDisplayName: string;

  authorProfileImageUrl: string | null;

  content: string;

  imageUrl: string | null;

  visibility: PostVisibility;

  likes: number;

  comments: number;

  shares: number;

  viewerReaction: ReactionType | null;

  createdAt: string;

  updatedAt: string;
}

export interface SocialComment {
  id: string;

  postId: string;

  authorPlayerId: PlayerId;

  authorUsername: string;

  authorDisplayName: string;

  authorProfileImageUrl: string | null;

  content: string;

  createdAt: string;
}

export interface SocialReaction {
  id: string;

  postId: string;

  playerId: PlayerId;

  type: ReactionType;

  createdAt: string;
}

export interface SocialNotification {
  id: string;

  playerId: PlayerId;

  type:
    | "friend_request"
    | "friend_accepted"
    | "post_like"
    | "post_comment"
    | "post_share"
    | "achievement"
    | "company"
    | "election"
    | "system";

  title: string;

  message: string;

  referenceId: string | null;

  read: boolean;

  createdAt: string;
}

function requirePlayer(
  options: SocialServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class SocialService {
  private readonly options: SocialServiceOptions;

  constructor(
    options: SocialServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getFeed(
    limit = 30,
  ): Promise<SocialPost[]> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<SocialPost[]>(
      `/social/feed/${encodeURIComponent(
        playerId,
      )}`,
      {
        limit,
      },
    );
  }

  public async getPost(
    postId: string,
  ): Promise<SocialPost> {
    return apiClient.get<SocialPost>(
      `/social/posts/${encodeURIComponent(
        postId,
      )}`,
    );
  }

  public async createPost(
    request: {
      content: string;

      imageUrl?: string | null;

      visibility?: PostVisibility;
    },
  ): Promise<SocialPost> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<SocialPost>(
      "/social/posts",
      {
        playerId,

        request,
      },
    );
  }

  public async updatePost(
    postId: string,
    content: string,
  ): Promise<SocialPost> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.put<SocialPost>(
      `/social/posts/${encodeURIComponent(
        postId,
      )}`,
      {
        playerId,

        content,
      },
    );
  }

  public async deletePost(
    postId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.delete(
      `/social/posts/${encodeURIComponent(
        postId,
      )}`,
      {
        playerId,
      },
    );
  }

  public async reactToPost(
    postId: string,
    type: ReactionType,
  ): Promise<SocialReaction> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<SocialReaction>(
      `/social/posts/${encodeURIComponent(
        postId,
      )}/reactions`,
      {
        playerId,

        type,
      },
    );
  }

  public async removeReaction(
    postId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.delete(
      `/social/posts/${encodeURIComponent(
        postId,
      )}/reactions`,
      {
        playerId,
      },
    );
  }

  public async getComments(
    postId: string,
  ): Promise<SocialComment[]> {
    return apiClient.get<SocialComment[]>(
      `/social/posts/${encodeURIComponent(
        postId,
      )}/comments`,
    );
  }

  public async addComment(
    postId: string,
    content: string,
  ): Promise<SocialComment> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<SocialComment>(
      `/social/posts/${encodeURIComponent(
        postId,
      )}/comments`,
      {
        playerId,

        content,
      },
    );
  }

  public async deleteComment(
    commentId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.delete(
      `/social/comments/${encodeURIComponent(
        commentId,
      )}`,
      {
        playerId,
      },
    );
  }

  public async getNotifications(): Promise<
    SocialNotification[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<SocialNotification[]>(
      `/social/notifications/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async markNotificationRead(
    notificationId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      `/social/notifications/${encodeURIComponent(
        notificationId,
      )}/read`,
      {
        playerId,
      },
    );
  }
}

export const socialService =
  new SocialService();