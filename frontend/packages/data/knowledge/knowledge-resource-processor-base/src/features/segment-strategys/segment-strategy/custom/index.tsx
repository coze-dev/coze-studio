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

import classNames from 'classnames';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import {
  Checkbox,
  Select,
  CozInputNumber,
  Form,
  Input,
  CheckboxGroup,
  Radio,
  type SelectProps,
} from '@coze-arch/coze-design';

import {
  PreProcessRule,
  SeperatorType,
  type CustomSegmentRule,
  SegmentMode,
} from '@/types';
import { getSeperatorOptionList } from '@/constants';

const SEGMENT_MIN = 100;
const SEGMENT_MAX = 5000;
const OVERLAP_MAX = 90;
const OVERLAP_MIN = 0;

interface CustomSegmentProps {
  segmentMode: SegmentMode;
  segmentRule: CustomSegmentRule;
  onChange: (params: {
    segmentMode?: SegmentMode;
    segmentRule?: CustomSegmentRule;
  }) => void;
}

function getMaxTokens(maxTokens: number): number {
  if (maxTokens < SEGMENT_MIN) {
    return SEGMENT_MIN;
  }
  if (maxTokens > SEGMENT_MAX) {
    return SEGMENT_MAX;
  }
  return maxTokens;
}

const CustomSegmentContent = ({
  segmentRule,
  onChange,
}: {
  segmentRule: CustomSegmentRule;
  onChange: (segmentRule: CustomSegmentRule) => void;
}) => {
  const { separator, maxTokens, preProcessRules, overlap } = segmentRule;

  const handleSelectChange: SelectProps['onChange'] = value => {
    if (typeof value === 'string') {
      onChange({
        ...segmentRule,
        separator: {
          type: value as SeperatorType,
          customValue: separator.customValue,
        },
      });
    }
  };

  return (
    <div className="flex flex-col gap-[12px] mt-12px">
      <div data-testid={KnowledgeE2e.ResegmentCustomIdentifierSelect}>
        <Form.Label required>{I18n.t('datasets_Custom_segmentID')}</Form.Label>
        <Select
          placeholder={I18n.t('datasets_custom_segmentID_placeholder')}
          optionList={getSeperatorOptionList()}
          className="w-full"
          value={separator.type}
          onChange={handleSelectChange}
        />
        {separator.type === SeperatorType.CUSTOM ? (
          <Input
            className="w-full mt-[4px]"
            value={separator.customValue}
            onChange={(v: string) => {
              onChange({
                ...segmentRule,
                separator: {
                  type: separator.type,
                  customValue: v,
                },
              });
            }}
            placeholder={I18n.t('datasets_custom_segmentID_placeholder')}
          />
        ) : null}
      </div>
      <div data-testid={KnowledgeE2e.ResegmentCustomMaxLenInput}>
        <Form.Label required>{I18n.t('datasets_Custom_maxLength')}</Form.Label>
        <CozInputNumber
          value={maxTokens}
          onChange={v => {
            onChange({
              ...segmentRule,
              maxTokens: getMaxTokens(Number(v)),
            });
          }}
          className="w-full"
          min={SEGMENT_MIN}
          max={SEGMENT_MAX}
        />
      </div>
      <div>
        <Form.Label required>{I18n.t('kl_write_014')}</Form.Label>
        <CozInputNumber
          value={overlap}
          onChange={v => {
            onChange({
              ...segmentRule,
              overlap: Number(v),
            });
          }}
          className="w-full"
          max={OVERLAP_MAX}
          min={OVERLAP_MIN}
        />
      </div>
      <div data-testid={KnowledgeE2e.ResegmentCustomRuleText}>
        <Form.Label>{I18n.t('datasets_Custom_rule')}</Form.Label>
        <CheckboxGroup
          value={preProcessRules}
          className="w-full gap-[4px]"
          aria-label={I18n.t('datasets_Custom_rule')}
          onChange={(v: PreProcessRule[]) => {
            onChange({
              ...segmentRule,
              preProcessRules: v,
            });
          }}
        >
          <Checkbox value={PreProcessRule.REMOVE_SPACES}>
            {I18n.t('datasets_Custom_rule_replace')}
          </Checkbox>
          <Checkbox value={PreProcessRule.REMOVE_EMAILS}>
            {I18n.t('datasets_Custom_rule_delete')}
          </Checkbox>
        </CheckboxGroup>
      </div>
    </div>
  );
};

export const CustomSegment = ({
  segmentMode,
  segmentRule,
  onChange,
}: CustomSegmentProps) => (
  <Radio
    data-testid={KnowledgeE2e.CreateUnitResegmentCustomRadio}
    className={classNames(
      segmentMode === SegmentMode.CUSTOM ? 'custom-wrapper' : '',
    )}
    value={SegmentMode.CUSTOM}
    extra={
      <>
        {I18n.t('datasets_createFileModel_step3_customDescription')}
        {segmentMode === SegmentMode.CUSTOM && (
          <CustomSegmentContent
            segmentRule={segmentRule}
            onChange={newSegmentRule => {
              onChange({ segmentRule: newSegmentRule });
            }}
          />
        )}
      </>
    }
  >
    {I18n.t('datasets_createFileModel_step3_custom')}
  </Radio>
);
