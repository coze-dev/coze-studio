import { type FC } from 'react';

import {
  ViewVariableType,
  type InputVariable,
} from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import { IconCozImage, IconCozString } from '@coze/coze-design/icons';
import { Tag } from '@coze/coze-design';

import {
  type FabricObjectWithCustomProps,
  type IRefPosition,
} from '../../typings';
import { useGlobalContext } from '../../context';

const PADDING = 4;
interface IProps {
  visible?: boolean;
  offsetX?: number;
  offsetY?: number;
}

type Positions = IRefPosition & {
  zIndex: number;
  active: boolean;
  unused: boolean;
  variable?: InputVariable;
};

export const RefTitle: FC<IProps> = props => {
  const { visible, offsetX, offsetY } = props;

  const {
    allObjectsPositionInScreen,
    customVariableRefs,
    variables,
    activeObjects,
  } = useGlobalContext();

  const refsPosition: Positions[] =
    allObjectsPositionInScreen
      ?.filter(obj => customVariableRefs?.map(v => v.objectId).includes(obj.id))
      ?.map((obj, i) => {
        const ref = customVariableRefs?.find(v => v.objectId === obj.id);
        const variable = variables?.find(d => d.id === ref?.variableId);
        return {
          ...obj,
          active: !!activeObjects?.find(
            o => (o as FabricObjectWithCustomProps).customId === obj.id,
          ),
          unused: !variable,
          zIndex: i + 1,
          variable,
        };
      }) ?? [];

  return (
    <div
      className={`relative w-full ${visible ? '' : 'hidden'}`}
      style={{
        top: offsetY ?? 0,
        left: offsetX ?? 0,
      }}
    >
      {refsPosition?.map(d => (
        <div
          key={d.id}
          style={{
            zIndex: d.active ? 999 : d.zIndex,
            position: 'absolute',
            width: 'fit-content',
            top: `${d.top - PADDING}px`,
            left: `${d.left}px`,
            transform: `${'translateY(-100%)'} rotate(${d.angle}deg) scale(1)`,
            transformOrigin: `0 calc(100% + ${PADDING}px)`,
            opacity: d.active ? 1 : 0.3,
            maxWidth: '200px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
          className="flex items-center gap-[3px]"
        >
          {d.unused ? (
            <Tag className="w-full" color="yellow">
              <div className="truncate w-full overflow-hidden">
                {I18n.t('imageflow_canvas_var_delete', {}, '变量被删除')}
              </div>
            </Tag>
          ) : (
            <Tag
              className="w-full"
              color="primary"
              prefixIcon={
                d.variable?.type === ViewVariableType.Image ? (
                  <IconCozImage className="coz-fg-dim" />
                ) : (
                  <IconCozString className="coz-fg-dim" />
                )
              }
            >
              <div className="truncate w-full overflow-hidden">
                {d.variable?.name}
              </div>
            </Tag>
          )}
        </div>
      )) ?? undefined}
    </div>
  );
};
