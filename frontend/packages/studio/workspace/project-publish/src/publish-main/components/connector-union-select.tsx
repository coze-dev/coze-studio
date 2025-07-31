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

import { useShallow } from 'zustand/react/shallow';
import { type PublishConnectorInfo } from '@coze-arch/idl/intelligence_api';
import { FormSelect } from '@coze-arch/coze-design';
import { IconCozArrowDown } from '@coze-arch/bot-icons';

import { useProjectPublishStore } from '@/store';

interface UnionSelectProps {
  record: PublishConnectorInfo;
}

export const UnionSelect = ({ record }: UnionSelectProps) => {
  const { connectorUnionMap, unions, setProjectPublishInfo } =
    useProjectPublishStore(
      useShallow(state => ({
        connectorUnionMap: state.connectorUnionMap,
        unions: state.unions,
        setProjectPublishInfo: state.setProjectPublishInfo,
      })),
    );
  const unionId = record.connector_union_id ?? '';
  const unionConnectors = connectorUnionMap[unionId]?.connector_options ?? [];
  const unionOptionList = unionConnectors.map(c => ({
    label: c.show_name,
    value: c.connector_id,
  }));

  const onSelectUnion = (selectedId: string) => {
    setProjectPublishInfo({
      unions: {
        ...unions,
        [unionId]: selectedId,
      },
    });
  };

  return (
    <div className="flex" onClick={e => e.stopPropagation()}>
      <FormSelect
        noLabel
        field={`union_select_${unionId}`}
        fieldClassName="w-[172px]"
        className="w-full"
        optionList={unionOptionList}
        initValue={unions[unionId]}
        arrowIcon={<IconCozArrowDown />}
        onSelect={(val: unknown) => onSelectUnion(val as string)}
      />
    </div>
  );
};
