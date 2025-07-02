import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozRectangleMap } from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton } from '@coze-arch/coze-design';

export const MinimapSwitch = (props: {
  minimapVisible: boolean;
  setMinimapVisible: (visible: boolean) => void;
}) => {
  const { minimapVisible, setMinimapVisible } = props;

  return (
    <Tooltip content={I18n.t('workflow_toolbar_minimap_tooltips')}>
      <IconButton
        icon={
          <IconCozRectangleMap
            className={minimapVisible ? undefined : 'coz-fg-primary'}
          />
        }
        color={minimapVisible ? 'highlight' : 'secondary'}
        onClick={() => setMinimapVisible(!minimapVisible)}
      />
    </Tooltip>
  );
};
