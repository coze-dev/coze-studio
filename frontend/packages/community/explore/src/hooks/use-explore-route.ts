import { useRouteConfig } from '@coze-arch/bot-hooks';
import { type TRouteConfigGlobal } from '@coze-arch/bot-hooks';

export interface ExploreRouteType extends TRouteConfigGlobal {
  type?: 'template' | 'plugin';
}
export const useExploreRoute = useRouteConfig<ExploreRouteType>;
