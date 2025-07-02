import React from 'react';

import {
  IconMobileCollect,
  IconMobileCollectFill,
} from '@coze-arch/bot-icons';

export const FavoriteIconMobile = (props: { isFavorite?: boolean }) => {
  const { isFavorite } = props;
  return <>{isFavorite ? <IconMobileCollectFill /> : <IconMobileCollect />}</>;
};
