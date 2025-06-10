import { useEffect, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze/coze-design';
import { usePlaygroundTools } from '@flowgram-adapter/free-layout-editor';
import { type InteractiveType as IdeInteractiveType } from '@flowgram-adapter/free-layout-editor';
import {
  GuidingPopover,
  InteractiveType,
  MousePadSelector,
  getPreferInteractiveType,
  setPreferInteractiveType,
} from '@coze-common/mouse-pad-selector';

export const Interactive = () => {
  const tools = usePlaygroundTools();

  const [interactiveType, setInteractiveType] = useState<InteractiveType>(
    () => getPreferInteractiveType() as InteractiveType,
  );

  const [showInteractivePanel, setShowInteractivePanel] = useState(false);

  const mousePadTooltip = I18n.t(
    interactiveType === InteractiveType.Mouse
      ? 'workflow_mouse_friendly'
      : 'workflow_pad_friendly',
  );

  useEffect(() => {
    tools.setMouseScrollDelta(zoom => zoom / 20);

    // 从缓存读取交互模式，应用生效
    const preferInteractiveType = getPreferInteractiveType();
    tools.setInteractiveType(preferInteractiveType as IdeInteractiveType);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init
  }, []);

  return (
    <GuidingPopover>
      <Tooltip
        content={mousePadTooltip}
        style={{ display: showInteractivePanel ? 'none' : 'block' }}
      >
        <div
          className="workflow-toolbar-interactive"
          data-testid="workflow.detail.toolbar.interactive"
        >
          <MousePadSelector
            value={interactiveType}
            onChange={value => {
              setInteractiveType(value);
              setPreferInteractiveType(value);
              tools.setInteractiveType(value as unknown as IdeInteractiveType);
            }}
            onPopupVisibleChange={setShowInteractivePanel}
            containerStyle={{
              border: 'none',
              height: '24px',
              width: '38px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2px',
              padding: '4px',
              paddingTop: '1px',
              borderRadius: 'var(--small, 6px)',
            }}
            iconStyle={{
              margin: '0',
              width: '16px',
              height: '16px',
            }}
            arrowStyle={{
              width: '12px',
              height: '12px',
            }}
          />
        </div>
      </Tooltip>
    </GuidingPopover>
  );
};
