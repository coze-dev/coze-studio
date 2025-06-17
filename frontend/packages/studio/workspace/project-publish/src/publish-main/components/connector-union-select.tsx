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
