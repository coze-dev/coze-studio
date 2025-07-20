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
 
import {
  type CSSProperties,
  type PropsWithChildren,
  type ReactNode,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ForwardedRef,
} from 'react';

import { useShallow } from 'zustand/react/shallow';
import { isBoolean } from 'lodash-es';
import classNames from 'classnames';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { Collapsible } from '@coze-arch/coze-design';
import {
  type OpenBlockEvent,
  handleEvent,
  removeEvent,
  skillKeyToApiStatusKeyTransformer,
} from '@coze-arch/bot-utils';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { Image } from '@coze-arch/bot-semi';
import {
  IconInfo,
  IconChevronRight,
  IconChevronDown,
} from '@coze-arch/bot-icons';
import { useLayoutContext } from '@coze-arch/bot-hooks';
import { TabStatus } from '@coze-arch/bot-api/developer_api';

import { ToolTooltip } from '../tool-tooltip';
import { ToolPopover } from '../tool-popover';
import { ModelCapabilityTips } from '../model-capability-tips';
import { toolKeyToApiStatusKeyTransformer } from '../../utils/tool-content-block';
import { EventCenterEventName } from '../../typings/scoped-events';
import { type IToggleContentBlockEventParams } from '../../typings/event';
import { useRegisterCollapse } from '../../hooks/tool/use-tool-toggle-collapse';
import { useEvent } from '../../hooks/event/use-event';
import { useAbilityConfig } from '../../hooks/builtin/use-ability-config';
import { openBlockEventToToolKey } from '../../constants/tool-content-block';

import s from './index.module.less';

interface ToolContentBlockProps {
  contentClassName?: string;
  header?: ReactNode;
  icon?: string;
  actionButton?: ReactNode;
  tooltip?: ReactNode;
  setting?: ReactNode;
  maxContentHeight?: number;
  showBottomBorder?: boolean;
  showBorderTopRadius?: boolean;
  className?: string;
  style?: CSSProperties;
  collapsible?: boolean;
  defaultExpand?: boolean;
  onRef?: ForwardedRef<ToolContentRef>;
  /**
   * @deprecated tool 插件化改造后无需传入 (如果保留老式event则需要传入)
   */
  blockEventName?: OpenBlockEvent;
  tooltipType?: 'tooltip' | 'popOver';
  childNodeWrapClassName?: string;
  headerClassName?: string;
}

interface ToolContentRef {
  setOpen?: (isOpen: boolean) => void;
}

/* eslint @coze-arch/max-line-per-function: ["error", {"max": 250}] */
export const ToolContentBlock: React.FC<
  PropsWithChildren<ToolContentBlockProps>
> = ({
  children,
  icon,
  header,
  actionButton,
  maxContentHeight,
  tooltip,
  tooltipType = 'popOver',
  setting,
  className,
  style,
  collapsible = true,
  defaultExpand,
  onRef,
  blockEventName,
  childNodeWrapClassName,
  headerClassName,
}) => {
  /** 后续长期使用的ToolKey */
  const { abilityKey } = useAbilityConfig();

  const { registerCollapse } = useRegisterCollapse();

  useEffect(() => {
    if (!abilityKey) {
      return;
    }

    return registerCollapse(isExpand => setIsOpen(isExpand), abilityKey);
  }, [abilityKey]);

  const isReadonly = useBotDetailIsReadonly();
  const { botId } = useBotInfoStore(
    useShallow(store => ({
      botId: store.botId,
    })),
  );
  const { editable, setBotSkillBlockCollapsibleState } = usePageRuntimeStore(
    useShallow(store => ({
      editable: store.editable,
      setBotSkillBlockCollapsibleState: store.setBotSkillBlockCollapsibleState,
    })),
  );

  // 容器在页面中的展示位置，不同位置样式有区别
  const { placement } = useLayoutContext();
  const [isOpen, setIsOpen] = useState(false);
  const initialized = useRef<boolean>(false);
  const childNode = (
    <div
      className={classNames(s.content, childNodeWrapClassName)}
      style={{ maxHeight: maxContentHeight ? maxContentHeight : 'unset' }}
    >
      {children}
    </div>
  );
  const setOpen = ($isOpen: boolean) => {
    setIsOpen($isOpen);
    // 记录用户使用状态
    if (editable && !isReadonly && (abilityKey || blockEventName)) {
      if (blockEventName) {
        const blockKey = openBlockEventToToolKey[blockEventName];

        blockKey &&
          setBotSkillBlockCollapsibleState({
            [skillKeyToApiStatusKeyTransformer(blockKey)]: $isOpen
              ? TabStatus.Open
              : TabStatus.Close,
          });
      } else if (abilityKey) {
        setBotSkillBlockCollapsibleState({
          [toolKeyToApiStatusKeyTransformer(abilityKey)]: $isOpen
            ? TabStatus.Open
            : TabStatus.Close,
        });
      }
    }
    // 尚未完成初始化时如果用户手动展开/收起，则马上完成初始化
    if (!initialized.current) {
      initialized.current = true;
    }
  };
  useImperativeHandle(onRef, () => ({
    setOpen,
  }));

  const onEvent = useCallback(() => {
    setOpen(true);
  }, [
    blockEventName,
    botId,
    editable,
    isReadonly,
    openBlockEventToToolKey,
    abilityKey,
  ]);

  const onEventNew = useCallback(
    ({ abilityKey: _abilityKey, isExpand }: IToggleContentBlockEventParams) => {
      if (_abilityKey === abilityKey) {
        setOpen(isExpand);
      }
    },
    [abilityKey, setOpen],
  );

  const { on } = useEvent();

  useEffect(() => {
    blockEventName && handleEvent(blockEventName, onEvent);
    const offEvent =
      abilityKey &&
      on<IToggleContentBlockEventParams>(
        EventCenterEventName.ToggleContentBlock,
        onEventNew,
      );
    return () => {
      blockEventName && removeEvent(blockEventName, onEvent);
      offEvent?.();
    };
  }, [onEvent]);

  useEffect(() => {
    // 传入默认值之后才能初始化
    if (isBoolean(defaultExpand)) {
      // 初始化完成后忽略 defaultExpand 变化
      if (!initialized.current) {
        setIsOpen(defaultExpand);
        initialized.current = true;
      }
    } else {
      setIsOpen(false);
      initialized.current = false;
    }
  }, [defaultExpand]);

  const content = useMemo(() => {
    // 初始化成功之后才能开始渲染 Collapsible 组件
    if (!initialized.current) {
      return null;
    }
    if (collapsible) {
      return (
        <Collapsible keepDOM isOpen={isOpen || !collapsible}>
          {childNode}
        </Collapsible>
      );
    } else {
      return childNode;
    }
  }, [collapsible, isOpen, childNode]);

  const onToggle = () => {
    if (collapsible) {
      setOpen(!isOpen);
    }
  };

  const isFromStore = usePageRuntimeStore(
    state => state.pageFrom === BotPageFromEnum.Store,
  );

  return (
    <div
      className={classNames(
        s['content-block'],
        s[placement],
        {
          [s.isOpen || '']: isOpen,
        },
        className,
      )}
      style={style}
    >
      <header
        className={classNames(s['header-content'], headerClassName, {
          [s.collapsible || '']: collapsible,
        })}
      >
        <div className={s.header} onClick={onToggle}>
          {collapsible ? (
            <div className={s['header-icon-arrow']}>
              {isOpen ? <IconChevronDown /> : <IconChevronRight />}
            </div>
          ) : null}
          {icon ? (
            <Image preview={false} className={s['header-icon']} src={icon} />
          ) : null}
          <div className="shrink-0">{header}</div>
          {tooltip && tooltipType === 'popOver' ? (
            <ToolPopover
              content={<div onClick={e => e.stopPropagation()}>{tooltip}</div>}
            >
              <IconInfo className={s.icon} />
            </ToolPopover>
          ) : null}
          {tooltip && tooltipType === 'tooltip' ? (
            <ToolTooltip content={<div>{tooltip}</div>}>
              <IconInfo className={s.icon} />
            </ToolTooltip>
          ) : null}
          {!isFromStore ? <ModelCapabilityTips /> : null}
        </div>
        <div
          className={classNames(
            s['action-button'],
            'grid grid-flow-row gap-x-[2px]',
          )}
        >
          {!!setting && <div className={s.setting}>{setting}</div>}
          {actionButton}
        </div>
      </header>
      {content}
    </div>
  );
};
