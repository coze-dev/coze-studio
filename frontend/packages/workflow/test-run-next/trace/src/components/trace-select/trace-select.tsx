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

import { useCallback, useMemo } from 'react';

import { useMemoizedFn } from 'ahooks';
import { Select } from '@coze-arch/coze-design';

import { getTimeFromSpan } from '../../utils';
import { useTraceListStore } from '../../contexts';
import { useOptions } from './use-options';
import { StatusSelect } from './status-select';
import { SelectOption } from './select-option';
import { DatePicker } from './date-picker';

import css from './trace-select.module.less';

export const TraceSelect: React.FC = () => {
  const { span, workflowId, patch } = useTraceListStore(store => ({
    span: store.span,
    workflowId: store.workflowId,
    patch: store.patch,
  }));

  const {
    date,
    status,
    setStatus,
    options,
    optionsCacheRef,
    fetch,
    onDateChange,
  } = useOptions(workflowId);

  const optionList = useMemo(() => {
    const temp = options.map(i => ({
      ...i,
      value: i.log_id,
      label: <SelectOption span={i} />,
    }));
    return temp;
  }, [options]);

  const handleChange = useCallback(
    (v: any) => {
      patch({
        span:
          v && optionsCacheRef.current.has(v)
            ? optionsCacheRef.current.get(v)
            : null,
      });
    },
    [optionsCacheRef, patch],
  );

  const handleDropdownVisibleChange = useMemoizedFn((v: boolean) => {
    if (v) {
      fetch();
    }
  });

  return (
    <div className={css['trace-select']}>
      <div className={css['trace-filter']}>
        <DatePicker value={date} onChange={onDateChange} />
        <StatusSelect value={status} onChange={setStatus} />
      </div>

      <Select
        className={css['main-select']}
        optionList={optionList}
        value={span?.log_id}
        onChange={handleChange}
        renderSelectedItem={e => {
          const current = optionsCacheRef.current.get(e.value);
          return current ? getTimeFromSpan(current) : '-';
        }}
        onDropdownVisibleChange={handleDropdownVisibleChange}
      />
    </div>
  );
};
