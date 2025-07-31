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

import { type FC, useEffect } from 'react';

import { type FeedbackStatus } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { Previewer } from '@coze-workflow/code-editor-adapter';
import { I18n } from '@coze-arch/i18n';
import { IconCozExpand } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';
import { useGlobalState } from '@/hooks';

import { useFitViewport } from '../../hooks';
import { FormCard } from '../../components/form-card';
import { useBizIDEState } from '../../../hooks/use-biz-ide-state';
import { type CodeEditorValue } from './types';
import {
  type InputParams,
  type OutputParams,
} from './hooks/use-ide-input-output-type';
import { getLanguageTemplates } from './defaults';
import { CodeSetterContext, useCodeSetterContext } from './context';
import { LANG_CODE_NAME_MAP, LanguageEnum } from './constants';
import { BizIDE } from './biz-ide-panel/biz-ide';

import s from './index.module.less';

export interface ContentRef {
  enterFullscreen?: () => void;
}

interface ValueProps {
  value: CodeEditorValue;
  onChange: (value?: CodeEditorValue) => void;
}

export interface CodeProps extends ValueProps {
  tooltip?: string;
  inputParams?: InputParams;
  outputParams?: OutputParams;
  outputPath: string;
  feedbackText?: string;
  feedbackStatus?: FeedbackStatus;
}

export const CodeEditorWithBizIDE: FC<CodeProps> = (props: CodeProps) => {
  const {
    value,
    onChange,
    inputParams,
    outputParams,
    outputPath,
    feedbackText,
    feedbackStatus,
  } = props;

  const codeSetterContext = useCodeSetterContext();

  const node = useCurrentEntity();
  const uniqueId = `${node.id}.code_editor`;
  const { readonly } = useCodeSetterContext();

  const { isBindDouyin } = useGlobalState(false);

  const {
    forceCloseBizIDE,
    isBizIDEOpen,
    uniqueId: bizIDEUniqueId,
  } = useBizIDEState();

  const { setFullscreenPanel } = useNodeFormPanelState();

  useFitViewport({
    enable: isBizIDEOpen && uniqueId === bizIDEUniqueId,
    nodeId: node.id,
  });

  useEffect(
    () => () => {
      forceCloseBizIDE();
    },
    [],
  );

  const languageTemplates = getLanguageTemplates({
    isBindDouyin,
  });

  return (
    <>
      <div className={s.container}>
        <FormCard
          defaultExpand
          showBottomBorder
          header={I18n.t('workflow_detail_code_code')}
          tooltip={props.tooltip}
          maxContentHeight={218}
          feedbackText={feedbackText}
          feedbackStatus={feedbackStatus}
          noPadding
        >
          <div className={s['code-content']} style={{ minHeight: 178 }}>
            <Previewer
              content={value?.code ?? ''}
              language={
                LANG_CODE_NAME_MAP.get(
                  value?.language ?? LanguageEnum.NODE_JS,
                ) ?? 'javascript'
              }
              height={178}
            />
          </div>
        </FormCard>
        {/* Why not use FormCard's extra instead of absolute positioning?
            Because MonacoEditor is absolutely positioned, the hierarchy will cover the hierarchy of the previous button. If you add zIndex to the button, it will be higher than the zIndex of the canvas, so put it here for absolute positioning.
          */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 10,
            right: 12,
          }}
        >
          <IconButton
            color="highlight"
            size="small"
            icon={
              readonly ? null : <IconCozExpand className={s.editInIDEIcon} />
            }
            // onClick={() => openBizIDE(uniqueId)}
            onClick={() => {
              setFullscreenPanel(
                <CodeSetterContext.Provider value={codeSetterContext}>
                  <BizIDE
                    value={value}
                    onChange={onChange}
                    inputParams={inputParams}
                    outputParams={outputParams}
                    outputPath={outputPath}
                    languageTemplates={languageTemplates}
                    onClose={() => setFullscreenPanel(null)}
                  />
                </CodeSetterContext.Provider>,
              );
            }}
          >
            {readonly
              ? I18n.t('workflow_detail_code_view_in_ide')
              : I18n.t('workflow_detail_code_edit_in_ide')}
          </IconButton>
        </div>
      </div>
    </>
  );
};
