import { useState } from 'react';

import { useDataNavigate, useKnowledgeStore } from '@coze-data/knowledge-stores';
import { OptType } from '@coze-data/knowledge-resource-processor-core';
import { getKnowledgeIDEQuery } from '@coze-data/knowledge-common-services/use-case';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDown } from '@coze-arch/bot-icons';
import { FormatType } from '@coze-arch/bot-api/knowledge';
import { IconCozArrowUp } from '@coze/coze-design/icons';
import { Button, Tooltip } from '@coze/coze-design';

import { ImportKnowledgeSourceMenu } from '@/features/import-knowledge-source-menu';

import { type ImportKnowledgeSourceButtonProps } from '../module';
import {
  createBtnDisableToolTip,
  getTableFormatTooltip,
  getDefaultFormatTooltip,
} from './services/use-case/disabled-tooltip';

export const ImportKnowledgeSourceButton = ({
  disabledTooltip: disabledTooltipProp,
  onSourceChange,
}: ImportKnowledgeSourceButtonProps) => {
  const documentList = useKnowledgeStore(state => state.documentList);
  const dataSetDetail = useKnowledgeStore(state => state.dataSetDetail);
  const [visible, setVisible] = useState<boolean>(false);
  const resourceNavigate = useDataNavigate();
  const disabledTooltip =
    disabledTooltipProp || createBtnDisableToolTip(dataSetDetail, documentList);
  const query = getKnowledgeIDEQuery() as Record<string, string>;
  if (disabledTooltip) {
    return (
      <Tooltip
        content={disabledTooltip}
        arrowPointAtCenter={false}
        position="top"
      >
        <Button
          data-testid={KnowledgeE2e.SegmentDetailAddBtn}
          color="hgltplus"
          disabled
          iconPosition="right"
          icon={<IconCozArrowDown className={'text-[12px]'} />}
        >
          {I18n.t('knowledg_unit_add_segments')}
        </Button>
      </Tooltip>
    );
  }
  return (
    <ImportKnowledgeSourceMenu
      onVisibleChange={dropVisible => {
        setVisible(dropVisible);
      }}
      onChange={unitType => {
        if (onSourceChange) {
          onSourceChange(unitType);
          return;
        }
        /** 默认跳转到upload */
        const formatType = dataSetDetail?.format_type;
        const docID = documentList?.[0]?.document_id;
        const params: Record<string, string> = {
          type: unitType,
          ...query,
        };
        if (formatType === FormatType.Table && docID) {
          params.opt = OptType.INCREMENTAL;
          params.doc_id = docID;
        }
        resourceNavigate.upload?.(params);
      }}
      triggerComponent={
        <Button
          data-testid={KnowledgeE2e.SegmentDetailAddBtn}
          iconPosition="right"
          icon={
            visible ? (
              <IconCozArrowUp className={'text-[12px]'} />
            ) : (
              <IconCozArrowDown className={'text-[12px]'} />
            )
          }
        >
          {I18n.t('knowledg_unit_add_segments')}
        </Button>
      }
    />
  );
};

export {
  getTableFormatTooltip,
  getDefaultFormatTooltip,
  createBtnDisableToolTip,
};
