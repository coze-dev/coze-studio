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

import { useRef, type RefObject } from 'react';

import cls from 'classnames';
import { usePlayground } from '@flowgram-adapter/free-layout-editor';
import { Divider } from '@coze-arch/coze-design';

import { useTemplateService } from '@/hooks/use-template-service';

import type { ITool } from '../type';
import { StartTestRunButton } from '../../test-run/test-run-button/start-test-run-button';
import { OpenTraceButton } from '../../test-run/test-run-button/open-trace-button';
import { RoleButton } from '../../flow-role';
import { useGlobalState } from '../../../hooks';
import { Zoom } from './zoom';
import { MinimapSwitch } from './minimap-switch';
import { Interactive } from './interactive';
import { Comment } from './comment';
import { AutoLayout } from './auto-layout';
import { AddNode } from './add-node';

import css from './tools.module.less';

export const Tools = (props: ITool) => {
  const templateState = useTemplateService();

  const playground = usePlayground();
  const { isChatflow } = useGlobalState();
  const enableAddNode = !playground.config.readonly;
  const toolbarRef = useRef<HTMLDivElement>();
  return (
    <div
      className={cls(
        css['tools-wrap'],
        templateState.templateVisible ? 'bottom-[2px]' : 'bottom-[16px]',
      )}
      ref={toolbarRef as RefObject<HTMLDivElement>}
    >
      <div className={css['tools-section']}>
        <Interactive />
        <Zoom />
        <Comment />
        <AutoLayout />
        <MinimapSwitch {...props} />
        {enableAddNode ? (
          <>
            <Divider layout="vertical" style={{ height: '16px' }} margin={3} />
            <AddNode {...props} toolbarRef={toolbarRef} />
          </>
        ) : null}
      </div>
      <div className={cls(css['tools-section'], css['test-run'])}>
        {isChatflow ? <RoleButton /> : null}
        {/* The operation and maintenance platform does not need debugging and practice running, just need to view the information to troubleshoot problems */}
        {IS_BOT_OP ? (
          <OpenTraceButton />
        ) : (
          <>
            {isChatflow ? (
              <Divider
                layout="vertical"
                style={{ height: '16px' }}
                margin={3}
              />
            ) : null}
            {/* will support soon */}
            {!IS_OPEN_SOURCE && <OpenTraceButton />}
            <StartTestRunButton />
          </>
        )}
      </div>
    </div>
  );
};
