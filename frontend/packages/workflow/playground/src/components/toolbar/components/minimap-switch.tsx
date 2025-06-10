import { I18n } from '@coze-arch/i18n';
import { IconCozRectangleMap } from '@coze/coze-design/icons';
import { Tooltip, IconButton } from '@coze/coze-design';

import type { ITool } from '../type';

export const MinimapSwitch = (props: ITool) => {
  const { handlers } = props;
  const { minimapVisible, setMinimapVisible } = handlers;

  return (
    <Tooltip content={I18n.t('workflow_toolbar_minimap_tooltips')}>
      <IconButton
        icon={
          <IconCozRectangleMap
            className={minimapVisible ? undefined : 'coz-fg-primary'}
          />
        }
        color={minimapVisible ? 'highlight' : 'secondary'}
        data-testid="workflow.detail.toolbar.minimap-switch"
        onClick={() => setMinimapVisible(!minimapVisible)}
      />
    </Tooltip>
  );
};
