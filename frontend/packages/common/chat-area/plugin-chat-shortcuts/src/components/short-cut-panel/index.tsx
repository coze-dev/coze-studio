import { type FC } from 'react';

import { useIsSendMessageLock } from '@coze-common/chat-area';

import { type DSL } from '../../types';
import { ChatAreaStateContext } from '../../context/chat-area-state/context';
import { type DSLContext } from './widgets/types';
import { DSLWidgetsMap } from './widgets';

const getChildrenIds = (item: DSL['elements'][string]): string[] =>
  item.children ??
  ((item.props?.Columns ?? []) as { children: string[] }[])?.reduce<string[]>(
    (res, column) => {
      if (column.children) {
        res.push(...column.children);
      }
      return res;
    },
    [],
  );

const DSLRender: FC<
  {
    elementId: string;
  } & IShortCutPanelProps
> = ({ elementId, ...context }) => {
  const { dsl } = context;
  const item = dsl?.elements[elementId];
  const itemType = item?.type || '';
  const Component = itemType in DSLWidgetsMap ? DSLWidgetsMap[itemType] : null;
  const childrenIds = item && getChildrenIds(item);

  if (!Component) {
    // TODO slardar report
    return null;
  }
  return (
    <Component context={context} props={item?.props}>
      {childrenIds?.map(childrenId => (
        <div className="flex-1 overflow-hidden">
          <DSLRender key={childrenId} elementId={childrenId} {...context} />
        </div>
      ))}
    </Component>
  );
};

export type IShortCutPanelProps = DSLContext;

export const ShortCutPanel: FC<IShortCutPanelProps> = ({ dsl, ...context }) => {
  const isSendMessageLock = useIsSendMessageLock();

  return (
    <ChatAreaStateContext.Provider value={{ isSendMessageLock }}>
      <DSLRender elementId={dsl.rootID} dsl={dsl} {...context} />
    </ChatAreaStateContext.Provider>
  );
};
