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
 
import { type CSSProperties, useState, useRef, useEffect } from 'react';

import { debounce } from 'lodash-es';
import cls from 'classnames';
import { useInViewport } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import {
  type RenderSingleSelectedItemFn,
  type SelectProps,
} from '@coze-arch/bot-semi/Select';
import { Select, UIModal } from '@coze-arch/bot-semi';
import { IconSearchInput } from '@coze-arch/bot-icons';
import { debuggerApi } from '@coze-arch/bot-api';

import {
  TestsetEditSideSheet,
  type TestsetEditState,
} from '../testset-edit-sidesheet';
import { AutoLoadMore } from '../auto-load-more';
import { type TestsetData } from '../../types';
import { useTestsetManageStore, useTestsetOptions } from '../../hooks';
import {
  SelectedTestsetOptionItem,
  TestsetOptionItem,
} from './testset-option-item';

import s from './index.module.less';

export interface TestsetSelectProps {
  /** 当前testset */
  testset: TestsetData | undefined;
  placeholder?: string;
  /** 是否有workflow编辑权限，也挂放在外层的 TestsetManageProvider上，组件上的editable优先级更高 */
  editable?: boolean;
  /** 编辑面板mask */
  editSideSheetMask?: boolean;
  onSelect: (v?: TestsetData) => void;
  className?: string;
  style?: CSSProperties;
}

const DEBOUNCE_DELAY = 200;

/** option key, 更新 name、incompatible、input时都要重新渲染 */
function getOptionKey({ caseBase, schemaIncompatible }: TestsetData) {
  return `${caseBase?.caseID}_${caseBase?.name}_${caseBase?.input}_${
    schemaIncompatible ? 0 : 1
  }`;
}

/**
 * Testset下拉选择组件
 * 需配合`TestsetManageProvider`一起使用
 * @example
 * ``` tsx
 * <TestsetManageProvider
 *   // 一些必填参数 bizCtx bizComponentSubject editable formRenders
 * >
 *   <TestsetSideSheet visible={visible} onClose={() => setVisible(false)} />
 * </TestsetManageProvider>
 * ```
 */
// eslint-disable-next-line @coze-arch/max-line-per-function -- complicated!
export function TestsetSelect({
  testset,
  placeholder = I18n.t('workflow_debug_testset_placeholder'),
  editable,
  editSideSheetMask = false,
  className,
  style,
  onSelect,
}: TestsetSelectProps) {
  const { editable: editableInStore, bizCtx } = useTestsetManageStore(
    store => store,
  );
  const innerEditable = editable ?? editableInStore;
  const selectRef = useRef<Select>(null);
  const editRef = useRef<boolean>(false);
  const [pending, setPending] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [loadMoreInView] = useInViewport(loadMoreRef.current);
  const {
    loading,
    loadOptions,
    loadingMore,
    loadMoreOptions,
    optionsData,
    updateOption,
  } = useTestsetOptions();
  const [testsetEditState, setTestsetEditState] = useState<TestsetEditState>(
    {},
  );

  // 首次加载
  useEffect(() => {
    (async () => {
      setPending(true);
      const list = await loadOptions();
      if (list.length) {
        setPending(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!optionsData.hasNext || !loadMoreInView || loading || loadingMore) {
      return;
    }

    loadMoreOptions();
  }, [loadMoreInView]);

  const onSearch = (input: string) => {
    loadOptions(input);
  };

  const onEditTestset = (data: TestsetData) => {
    editRef.current = true;
    if (!innerEditable) {
      return;
    }

    selectRef.current?.close();

    setTestsetEditState({ visible: true, testset: data, mode: 'edit' });
  };

  const onEditTestsetSuccess = (val?: TestsetData) => {
    // 1. check if selected
    if (val?.caseBase?.caseID === testset?.caseBase?.caseID) {
      // onChange new one
      onSelect(val);
    }
    // 2. refresh list
    updateOption(val);
    // 3. close edit side sheet
    closeTestsetEdit();
  };

  // 选中Testset
  const onSelectTestset = (val: SelectProps['value']) => {
    if (typeof val !== 'string' || editRef.current) {
      return;
    }

    const selectedTestset = optionsData.list.find(
      op => op.caseBase?.caseID === val,
    );

    // 不兼容的不可选中
    if (!selectedTestset || selectedTestset.schemaIncompatible) {
      return;
    }

    onSelect(selectedTestset);
  };

  const onDeleteTestset = (data: TestsetData) => {
    editRef.current = true;
    if (!innerEditable || !data.caseBase?.caseID) {
      return;
    }

    selectRef.current?.close();

    const deleteId = data.caseBase?.caseID;
    const deleteTestset = async () => {
      editRef.current = false;
      // 1. request to delete
      await debuggerApi.DeleteCaseData({
        bizCtx,
        caseIDs: [deleteId],
      });
      // 2. check if selected
      if (deleteId === testset?.caseBase?.caseID) {
        onSelect(undefined);
      }
      // 3. reload list
      await loadOptions();
    };

    const cancelDelete = () => {
      editRef.current = false;
    };

    UIModal.error({
      title: I18n.t('workflow_testset_delete_title'),
      content: I18n.t('workflow_testset_delete_tip'),
      cancelText: I18n.t('workflow_testset_delete_cancel'),
      okText: I18n.t('workflow_testset_delete_confirm'),
      onOk: deleteTestset,
      onCancel: cancelDelete,
    });
  };

  const closeTestsetEdit = () => {
    editRef.current = false;
    setTestsetEditState({});
  };

  const onDropdownVisibleChange = (visible: boolean) => {
    if (visible) {
      loadOptions();
    }
  };

  // 自定义选中选项
  const renderSelectedItem: RenderSingleSelectedItemFn = () =>
    testset ? <SelectedTestsetOptionItem data={testset} /> : null;

  // testset为空的时候，不展示下拉选项（对大部分来说可能不需要看到这个下拉）
  if (pending) {
    return null;
  }

  return (
    <>
      <Select
        className={cls(s.select, className)}
        dropdownClassName={s.dropdown}
        style={style}
        prefix={<IconSearchInput className={s.prefix} />}
        filter={true}
        value={testset?.caseBase?.caseID}
        remote={true}
        onDropdownVisibleChange={onDropdownVisibleChange}
        onSelect={onSelectTestset}
        emptyContent={I18n.t('workflow_testset_search_empty')}
        placeholder={placeholder}
        ref={selectRef}
        onSearch={debounce(onSearch, DEBOUNCE_DELAY)}
        innerBottomSlot={
          <div
            ref={loadMoreRef}
            className={cls({ hidden: !optionsData.hasNext })}
          >
            <AutoLoadMore noMore={false} loadingMore={true} />
          </div>
        }
        renderSelectedItem={renderSelectedItem}
      >
        {optionsData.list.map(data => (
          <Select.Option
            value={data.caseBase?.caseID}
            // disabled的option编辑/删除唤起其他浮层后，select不会自动失焦
            // 用样式模拟disabled，并修改onSelect选中不兼容testset的逻辑
            className={cls(data.schemaIncompatible && s['incompatible-option'])}
            key={getOptionKey(data)}
          >
            <TestsetOptionItem
              data={data}
              editable={innerEditable}
              onEdit={() => onEditTestset(data)}
              onDelete={() => onDeleteTestset(data)}
            />
          </Select.Option>
        ))}
      </Select>
      <TestsetEditSideSheet
        {...testsetEditState}
        mask={editSideSheetMask}
        onSuccess={onEditTestsetSuccess}
        onClose={closeTestsetEdit}
      />
    </>
  );
}
