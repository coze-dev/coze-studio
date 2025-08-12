/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable @typescript-eslint/no-magic-numbers */
import { useMemo, useState, type CSSProperties } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDown } from '@coze-arch/coze-design/icons';
import { Dropdown, Divider } from '@coze-arch/coze-design';
import { usePlaygroundTools } from '@flowgram-adapter/free-layout-editor';
import { usePlayground } from '@flowgram-adapter/free-layout-editor';

export const Zoom = () => {
  const tools = usePlaygroundTools();
  const playground = usePlayground();
  const [selected, setSelected] = useState(false);
  const zoom = useMemo(() => {
    const zoomValue = tools.zoom * 100;
    return zoomValue.toFixed(0);
  }, [tools.zoom]);
  // In order to override the style of the cozed design, you cannot use tailwind css.
  const zoomOptionStyle: CSSProperties = {
    padding: '8px',
    lineHeight: '16px',
  };
  return (
    <Dropdown
      clickToHide
      position="top"
      trigger="custom"
      visible={selected}
      onClickOutSide={() => setSelected(false)}
      onVisibleChange={setSelected}
      render={
        <Dropdown.Menu>
          <Dropdown.Item
            data-testid="workflow.detail.toolbar.zoom.out"
            style={zoomOptionStyle}
            onClick={() => tools.zoomout()}
          >
            {I18n.t('workflow_toolbar_zoom_out')}
          </Dropdown.Item>
          <Dropdown.Item
            data-testid="workflow.detail.toolbar.zoom.in"
            style={zoomOptionStyle}
            onClick={() => tools.zoomin()}
          >
            {I18n.t('workflow_toolbar_zoom_in')}
          </Dropdown.Item>
          <Dropdown.Item
            data-testid="workflow.detail.toolbar.zoom.fit"
            style={zoomOptionStyle}
            onClick={() => tools.fitView()}
          >
            {I18n.t('workflow_toolbar_zoom_fit')}
          </Dropdown.Item>
          <Divider className="m-[4px] w-[108px]" />
          <Dropdown.Item
            data-testid="workflow.detail.toolbar.zoom.50"
            style={zoomOptionStyle}
            onClick={() => {
              playground.config.updateZoom(0.5);
            }}
          >
            {I18n.t('workflow_toolbar_zoom_to')} 50%
          </Dropdown.Item>
          <Dropdown.Item
            data-testid="workflow.detail.toolbar.zoom.100"
            style={zoomOptionStyle}
            onClick={() => {
              playground.config.updateZoom(1);
            }}
          >
            {I18n.t('workflow_toolbar_zoom_to')} 100%
          </Dropdown.Item>
          <Dropdown.Item
            data-testid="workflow.detail.toolbar.zoom.150"
            style={zoomOptionStyle}
            onClick={() => {
              playground.config.updateZoom(1.5);
            }}
          >
            {I18n.t('workflow_toolbar_zoom_to')} 150%
          </Dropdown.Item>
          <Dropdown.Item
            data-testid="workflow.detail.toolbar.zoom.200"
            style={zoomOptionStyle}
            onClick={() => {
              playground.config.updateZoom(2);
            }}
          >
            {I18n.t('workflow_toolbar_zoom_to')} 200%
          </Dropdown.Item>
        </Dropdown.Menu>
      }
    >
      <div
        className="workflow-toolbar-zoom flex justify-start items-center w-[70px] h-[24px] p-[2px] rounded-small border border-solid border-[var(--coz-stroke-plus)] cursor-pointer select-none"
        data-testid="workflow.detail.toolbar.zoom"
        onClick={() => setSelected(!selected)}
        style={{
          borderColor: selected
            ? 'var(--coz-stroke-hglt)'
            : 'var(--coz-stroke-plus)',
        }}
      >
        <p className="text-[12px] flex items-center mx-[4px] w-[40px] h-[20px]">
          {zoom}%
        </p>
        <div
          className="flex items-center justify-center pr-[2px] color-[var(--coz-fg-secondary)]"
          style={{
            color: 'var(--coz-fg-secondary)',
          }}
        >
          <IconCozArrowDown />
        </div>
      </div>
    </Dropdown>
  );
};
