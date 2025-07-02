import React, { useRef, useState } from 'react';

import { type IntelligenceData } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Modal, Search } from '@coze-arch/coze-design';

import { useIntelligenceSearch } from '../hooks/use-case/use-intelligence-search';
import { IntelligenceList } from './intelligence-list';

export interface SelectIntelligenceModalProps {
  visible: boolean;
  spaceId: string;
  onSelect?: (intelligence: IntelligenceData) => void;
  onCancel: () => void;
}

export const SelectIntelligenceModal: React.FC<
  SelectIntelligenceModalProps
> = ({ visible, onCancel, onSelect, spaceId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState('');

  const { loading, data, loadingMore, noMore } = useIntelligenceSearch({
    spaceId,
    searchValue,
    containerRef,
  });

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      width={640}
      height={588}
      className="[&_.semi-modal-header]:flex [&_.semi-modal-header]:items-center [&_.semi-modal-header]:px-3 [&_.semi-modal-content]:!px-3 [&_.semi-modal-content]:!coz-bg-max"
      footer={null}
      title={
        <div className="flex items-center justify-between w-full mr-4">
          <div className="coz-fg-plus text-[20px] font-medium">
            {I18n.t('select_agent_title')}
          </div>
          <Search
            placeholder={I18n.t('Search')}
            value={searchValue}
            onChange={setSearchValue}
            showClear
          />
        </div>
      }
    >
      <div ref={containerRef} className="max-h-[480px] h-full overflow-auto">
        <IntelligenceList
          loading={loading}
          loadingMore={loadingMore}
          noMore={noMore}
          data={data}
          searchValue={searchValue}
          onSelect={intelligenceData => {
            onSelect?.(intelligenceData);
          }}
        />
      </div>
    </Modal>
  );
};
