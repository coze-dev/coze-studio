import { useRef, type RefObject } from 'react';

import cls from 'classnames';
import { Divider } from '@coze-arch/coze-design';
import { usePlayground } from '@flowgram-adapter/free-layout-editor';

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
        {/* 运维平台不需要调试和试运行，只需要查看信息排查问题 */}
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
            <OpenTraceButton />
            <StartTestRunButton />
          </>
        )}
      </div>
    </div>
  );
};
