import { forwardRef, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { IconCozTeamFill } from '@coze-arch/coze-design/icons';
import {
  Avatar,
  type CommonFieldProps,
  Select,
  type SelectProps,
  type SemiSelect,
  Tag,
  Typography,
  withField,
} from '@coze-arch/coze-design';
import { type BotSpace, SpaceType } from '@coze-arch/bot-api/developer_api';
import { useSpaceStore, useRefreshSpaces } from '@coze-foundation/space-store';

const { Text } = Typography;

export const BaseSpaceFormSelect = withField(
  forwardRef<SemiSelect, Omit<SelectProps, 'renderSelectedItem'>>(
    (props, ref) => {
      useRefreshSpaces();
      const { currentOptionalSpace, list } = useSpaceStore(
        useShallow(state => {
          const { space, spaceList } = state;
          return {
            currentOptionalSpace: !space.hide_operation ? space : undefined,
            list: spaceList,
          };
        }),
      );

      const operationalSpaceList = list.filter(t => !t.hide_operation);

      const fixedInitValue =
        currentOptionalSpace?.id || operationalSpaceList.at(0)?.id;

      useEffect(() => {
        if (!fixedInitValue) {
          return;
        }

        // 需要触发表单 onChange 事件 否则上层响应不到数据变化的事件
        props.onChange?.(fixedInitValue);
      }, [fixedInitValue]);

      return (
        <Select
          {...props}
          ref={ref}
          renderSelectedItem={(optionNode: BotSpace) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={optionNode.icon_url}
                size="extra-extra-small"
                style={{ flexShrink: 0 }}
              >
                {optionNode.name}
              </Avatar>
              <span className="ml-[6px] font-semibold">{optionNode.name}</span>
            </div>
          )}
        >
          {operationalSpaceList.map(item => (
            <Select.Option value={item.id} {...item} key={item.id}>
              {item.icon_url ? (
                <Avatar size="extra-small" src={item.icon_url} />
              ) : (
                <IconCozTeamFill />
              )}
              <div className="ml-[12px] mr-16px font-semibold">
                <Text
                  ellipsis={{
                    showTooltip: false,
                  }}
                  style={{
                    maxWidth: '340px',
                  }}
                >
                  {item.name}
                </Text>
              </div>
              {item.space_type === SpaceType.Team && (
                <Tag color="brand">{I18n.t('develop_team_team')}</Tag>
              )}
            </Select.Option>
          ))}
        </Select>
      );
    },
  ),
);

export const SpaceFormSelect = forwardRef<
  SemiSelect,
  Omit<
    SelectProps & CommonFieldProps,
    | 'className'
    | 'label'
    | 'initValue'
    | 'placeholder'
    | 'noErrorMessage'
    | 'rules'
    | 'renderSelectedItem'
  >
>((props, ref) => (
  <BaseSpaceFormSelect
    {...props}
    ref={ref}
    className="w-full"
    label={I18n.t('duplicate_select_workspace')}
    placeholder={I18n.t('select_team')}
    noErrorMessage
    rules={[{ required: true }]}
  />
));
