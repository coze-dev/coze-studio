import { type ComponentType } from 'react';

import {
  type GrabPluginBizContext,
  type PublicEventCenter,
  PublicEventNames,
} from './types/plugin-biz-context';

export {
  GrabNode,
  GrabElement,
  GrabElementType,
  GrabImageElement,
  GrabLinkElement,
  GrabPosition,
  GrabText,
  isGrabImage,
  isGrabLink,
  isGrabTextNode,
} from '@coze-common/text-grab';

export type CustomFloatMenu = ComponentType<{
  grabBizContext: GrabPluginBizContext;
}>;

export { GrabPluginBizContext };

export { GrabPublicMethod } from './types/public-methods';

export { PublicEventNames, PublicEventCenter };

export { useCreateGrabPlugin } from './hooks/use-grab-plugin';

export { publicEventCenter } from './create';
