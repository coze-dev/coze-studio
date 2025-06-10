import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { type SelectProps } from '@coze-arch/bot-semi/Select';
import { Select } from '@coze-arch/bot-semi';

import convertMapToOptions from '@/parameters/utils/convert-map-to-options';
import { PARAM_TYPE_ALIAS_MAP, ParamTypeAlias } from '@/parameters/types';

import PopupContainer from '../popup-container';
import { type TreeNodeCustomData } from '../../type';
import { ObjectLikeTypes } from '../../constants';

import styles from './index.module.less';

interface ParamTypeProps {
  data: TreeNodeCustomData;
  level: number;
  onSelectChange?: SelectProps['onChange'];
  disabled?: boolean;
  // 不支持使用的类型
  disabledTypes?: ParamTypeAlias[];
}

export default function ParamType({
  data,
  onSelectChange,
  level,
  disabled,
  disabledTypes = [],
}: ParamTypeProps) {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const isLimited = level >= 3;

  return (
    <div className={styles.container}>
      <PopupContainer className={styles['pop-container']}>
        <Select
          placeholder={I18n.t('workflow_detail_start_variable_type')}
          disabled={disabled}
          onChange={val => {
            onSelectChange?.(val);
          }}
          className={styles['param-type']}
          optionList={convertMapToOptions(PARAM_TYPE_ALIAS_MAP, {
            computedValue: Number,
            passItem: item => item === ParamTypeAlias.List.toString(),
          }).map(item => ({
            ...item,
            disabled:
              disabledTypes?.includes(Number(item.value)) ||
              (isLimited && ObjectLikeTypes.includes(Number(item.value))),
          }))}
          value={data.type}
        />
      </PopupContainer>
    </div>
  );
}
