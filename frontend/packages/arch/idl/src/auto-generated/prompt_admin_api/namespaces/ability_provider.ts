/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum SearchIntention {
  Unknown = 0,
  /** 联网 */
  Browsing = 1,
  /** 仅视频 */
  RichMediaMustVideo = 2,
  /** 仅图片 */
  RichMediaMustImage = 3,
  /** 视频+文字 */
  RichMediaStrongVideo = 4,
  /** 图片+文字 */
  RichMediaStrongImage = 5,
  /** 复杂搜索 */
  ComplexSearch = 6,
}
/* eslint-enable */
