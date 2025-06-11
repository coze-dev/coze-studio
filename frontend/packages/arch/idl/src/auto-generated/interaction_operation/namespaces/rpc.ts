/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_marketplace_interaction_common from './flow_marketplace_interaction_common';

export type Int64 = string;

export enum SearchField {
  /** 仅更新部分字段
帖子相关 */
  PostStatus = 1,
  PostCommentCount = 2,
  /** 帖子评分 */
  PostEvaluationScore = 3,
  /** 评论相关 */
  CommentStatus = 10,
  /** 评论评分 */
  CommentEvaluationScore = 11,
}

export enum SyncSearchDataType {
  Full = 1,
  Partial = 2,
}

export interface CommentInfo {
  BotID?: Int64;
  Content?: string;
  CommentID?: Int64;
  Resource?: Record<string, flow_marketplace_interaction_common.Resource>;
  /** user_id 和 bot_id 二选一 */
  AuthorUserID?: Int64;
  CreatedAt?: Int64;
  BotReplyStatus?: flow_marketplace_interaction_common.CommentBotReplyStatus;
  Status?: flow_marketplace_interaction_common.CommentStatus;
  AuthorType?: flow_marketplace_interaction_common.AuthorType;
}

export interface PostInfo {
  ID?: Int64;
  CommentCount?: number;
  Title?: string;
  Label?: flow_marketplace_interaction_common.PostLabel;
  AuthorUserID?: Int64;
  /** uri -> 资源的映射 */
  Resource?: Record<string, flow_marketplace_interaction_common.Resource>;
  Content?: string;
  CreatedAt?: Int64;
}

export interface UserBehavior {
  BehaviorType?: flow_marketplace_interaction_common.UserBehaviorType;
  ItemID?: Int64;
  ItemType?: flow_marketplace_interaction_common.InteractionItemType;
  ProductEntityType?: number;
  CreatedAt?: Int64;
  UserID?: Int64;
  UpdatedAt?: Int64;
}

export interface UserReaction {
  ReactionType?: flow_marketplace_interaction_common.ReactionType;
  ItemID?: Int64;
  ItemType?: flow_marketplace_interaction_common.InteractionItemType;
  CreatedAt?: Int64;
  UserID?: Int64;
}
/* eslint-enable */
