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

import {
  useState,
  useRef,
  type ForwardedRef,
  forwardRef,
  useImperativeHandle,
} from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/bot-semi';
import { MAX_SUBMIT_LENGTH, calcStringSize } from '@coze-studio/mockset-shared';
import {
  type EditorActions,
  MockDataEditor,
  type MockDataEditorMarkerInfo,
  type MockDataEditorProps,
} from '@coze-studio/mockset-editor';

import s from './index.module.less';

export interface MocksetEditorProps
  extends Omit<MockDataEditorProps, 'onValidate'> {
  onValidate?: (isValid: boolean[]) => void;
  isCreateScene?: boolean;
  onGenerationStatusChange?: (value: boolean) => void;

  environment: {
    spaceId?: string;
    mockSetId?: string;
    basicParams: unknown;
  };
}

interface EditDataConfig {
  current: number;
  valid: boolean[];
  data: string[];
}

export interface EditorAreaActions {
  getValue: () => string[];
  forceStartGenerate?: (...params: unknown[]) => void;
}

export const MocksetEditor = forwardRef(
  (props: MocksetEditorProps, ref: ForwardedRef<EditorAreaActions>) => {
    const {
      onValidate,
      mockInfo,
      environment,
      isCreateScene,
      className,
      ...rest
    } = props;
    const editorsRef = useRef<(EditorActions | null)[]>([]);

    const [currentEditConfig, setCurrentEditConfig] = useState<EditDataConfig>({
      current: 0,
      valid: [true],
      data: mockInfo.mergedResultExample ? [mockInfo.mergedResultExample] : [],
    });

    const validateHandler = (
      markers: MockDataEditorMarkerInfo[],
      index: number,
    ) => {
      const isDataValid = currentEditConfig.valid.slice();
      isDataValid[index] = !markers.length;
      setCurrentEditConfig({
        ...currentEditConfig,
        valid: isDataValid,
      });
      onValidate?.(isDataValid);
    };

    const pasteHandler = (index: number) => {
      const value = editorsRef.current[index]?.getValue();
      const size = value ? calcStringSize(value) : 0;
      if (size > MAX_SUBMIT_LENGTH) {
        Toast.error(I18n.t('mockset_toast_data_size_limit'));
        return false;
      }
    };

    const getValue = () =>
      editorsRef.current
        ?.slice(0, currentEditConfig.data.length)
        .map(editor => editor?.getValue() || '');

    useImperativeHandle(ref, () => ({
      getValue,
    }));

    return (
      <div className={classNames(className, s['mock-tab-container'])}>
        <div className={s['mock-tab-panels']}>
          {currentEditConfig.data.map((item, index) => (
            <MockDataEditor
              key={index}
              className={classNames(
                index === currentEditConfig.current
                  ? s['mock-tab-panel_visible']
                  : s['mock-tab-panel_invisible'],
                index === 0
                  ? s['mock-tab-panel_static']
                  : s['mock-tab-panel_absolute'],
              )}
              mockInfo={{
                ...mockInfo,
                mergedResultExample: item,
              }}
              ref={ele => (editorsRef.current[index] = ele)}
              onValidate={markers => validateHandler(markers, index)}
              onEditorPaste={() => pasteHandler(index)}
              {...rest}
            />
          ))}
        </div>
      </div>
    );
  },
);
