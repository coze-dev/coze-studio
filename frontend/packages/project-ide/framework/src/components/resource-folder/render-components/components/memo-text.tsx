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

import React, { memo } from 'react';

import { Typography, Highlight } from '@coze-arch/coze-design';

import {
  type CommonRenderProps,
  // ResourceTypeEnum,
  // type ResourceStatusType,
  type ResourceType,
} from '../../type';
import { COLOR_CONFIG } from '../../constant';

const { Text: BaseText } = Typography;

// const ResourceBadge = (props: {
//   resource: ResourceType;
//   status?: ResourceStatusType;
// }) => {
//   const { resource, status = {} } = props;
//   const badgeTextArr: string[] = [];

//   if (status.problem?.number) {
//     badgeTextArr.push(`${status?.problem?.number}`);
//   }
//   if (status.draft) {
//     badgeTextArr.push('M');
//   }
//   const badgeText = badgeTextArr.join(', ');
//   const level =
//     status.problem?.status && status.problem.status !== 'normal'
//       ? status.problem.status
//       : status.draft
//       ? 'warning'
//       : '';

//   return badgeText ? (
//     <span
//       style={{
//         marginRight: 4,
//         opacity: '0.75',
//         color:
//           level === 'error'
//             ? 'rgba(var(--blockwise-error-color))'
//             : 'rgba(var(--blockwise-warning-color))',
//       }}
//     >
//       {resource.type !== ResourceTypeEnum.Folder ? (
//         badgeText
//       ) : (
//         <Badge countStyle={{ backgroundColor: 'yellow' }} type="mini" />
//       )}
//     </span>
//   ) : (
//     <></>
//   );
// };

const Text = ({
  name,
  resource,
  searchConfig,
  isSelected,
  tooltipSpace,
  textRender,
}: {
  name: string;
  resource: ResourceType;
  searchConfig?: {
    searchKey?: string;
    highlightStyle?: React.CSSProperties;
  };
  isSelected?: boolean;
  tooltipSpace?: number;
  textRender?: (v: CommonRenderProps) => React.ReactElement | undefined;
}) => {
  const color = (() => {
    if (resource.problem?.status === 'error') {
      return COLOR_CONFIG.textErrorColor;
    } else if (resource.problem?.status === 'warning') {
      return COLOR_CONFIG.textWarningColor;
    } else if (isSelected) {
      return COLOR_CONFIG.textSelectedColor;
    }
    return COLOR_CONFIG.textNormalColor;
  })();

  return (
    <span
      style={{
        flex: 1,
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        fontSize: 12,
      }}
    >
      <BaseText
        style={{ flex: 1 }}
        ellipsis={{
          showTooltip: {
            opts: {
              content: `${name}`,
              style: { wordBreak: 'break-all' },
              position: 'right',
              spacing: 8 + (tooltipSpace || 0),
            },
          },
        }}
      >
        {textRender ? (
          textRender({ resource, isSelected })
        ) : (
          <span
            style={{
              color,
            }}
          >
            <Highlight
              sourceString={name}
              searchWords={[searchConfig?.searchKey || '']}
              highlightStyle={{
                ...searchConfig?.highlightStyle,
                backgroundColor: 'transparent',
                color: 'var(--semi-color-primary)',
              }}
            />
          </span>
        )}
      </BaseText>
    </span>
  );
};

const MemoText = memo(Text, (pre, cur) => {
  if (
    pre.name !== cur.name ||
    pre.searchConfig?.searchKey !== cur.searchConfig?.searchKey ||
    pre.resource !== cur.resource ||
    pre.isSelected !== cur.isSelected
  ) {
    return false;
  }
  return true;
});

export { MemoText };
