import { Children, useMemo, type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { AbilityScope } from '@coze-agent-ide/tool-config';
import { Spin } from '@coze-arch/coze-design';
import { PlacementEnum, useLayoutContext } from '@coze-arch/bot-hooks';

import { ToolContainer } from '../tool-container';
import { useSubscribeToolStore } from '../../hooks/public/store/use-tool-store';
import { useRegisterToolKey } from '../../hooks/builtin/use-register-tool-key';
import { useRegisterToolGroup } from '../../hooks/builtin/use-register-tool-group';
import { useAbilityAreaContext } from '../../context/ability-area-context';

type IProps = Record<string, unknown>;

export const ToolView: FC<PropsWithChildren<IProps>> = ({ children }) => {
  const {
    store: { useToolAreaStore },
  } = useAbilityAreaContext();
  const registerToolKey = useRegisterToolKey();
  const registerToolGroup = useRegisterToolGroup();
  useSubscribeToolStore(AbilityScope.TOOL);

  const { isInitialed, isModeSwitching } = useToolAreaStore(state => ({
    isInitialed: state.isInitialed,
    isModeSwitching: state.isModeSwitching,
  }));

  const { placement } = useLayoutContext();

  const newChildren = useMemo(() => {
    const allChildren = Array.isArray(children) ? children : [children];

    if (!isInitialed) {
      return isModeSwitching ? null : (
        <div
          className={classNames('w-full flex items-center justify-center', {
            'h-auto': placement === PlacementEnum.LEFT,
            'h-full': placement === PlacementEnum.CENTER,
          })}
        >
          <Spin spinning />
        </div>
      );
    }

    // 遍历 GroupingContainer 的所有子元素
    return Children.map(allChildren, childLevel1 => {
      if (Children.count(childLevel1?.props?.children)) {
        return {
          ...childLevel1,
          props: {
            ...childLevel1.props,
            // 子元素都套一层 ToolContainer
            children: Children.map(childLevel1.props.children, childLevel2 => {
              const { toolKey, title: toolTitle } = childLevel2?.props ?? {};
              const { toolGroupKey, title: groupTitle } =
                childLevel1?.props ?? {};

              if (!toolKey || !toolTitle || !toolGroupKey || !groupTitle) {
                return childLevel2;
              }

              registerToolGroup({
                toolGroupKey,
                groupTitle,
              });

              registerToolKey({
                toolKey,
                toolGroupKey,
                toolTitle,
                hasValidData: false,
              });

              return (
                <ToolContainer scope={AbilityScope.TOOL} toolKey={toolKey}>
                  {childLevel2}
                </ToolContainer>
              );
            }),
          },
        };
      } else {
        return childLevel1;
      }
    });
  }, [children, isInitialed]);

  return newChildren;
};
