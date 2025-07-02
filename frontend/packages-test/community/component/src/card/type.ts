import { type explore } from '@coze-studio/api-schema';
import { type UserInfo as ProductUserInfo } from '@coze-arch/bot-api/product_api';
type UserInfo = explore.product_common.UserInfo;

export interface CardInfoProps {
  title?: string;
  imgSrc?: string;
  description?: string;
  userInfo?: UserInfo | ProductUserInfo;
}
