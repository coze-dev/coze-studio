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

import { useState } from 'react';

import { DiffEditor } from '@monaco-editor/react';
import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';
import { Divider, Spin, Typography } from '@coze-arch/bot-semi';
import {
  DiffStyle,
  type DiffDisplayNode,
} from '@coze-arch/bot-api/dp_manage_api';

import { transTimestampText } from '../../utils';
import { useSendDiffEvent } from '../../hooks/use-send-diff-event';

import styles from './index.module.less';

interface DiffNodeRenderProps {
  left: string;
  right: string;
  node?: DiffDisplayNode;
  type?: 'diff' | 'publish';
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const safeJSONParse = (data: any) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return '';
  }
};

export const DiffNodeRender: React.FC<DiffNodeRenderProps> = props => {
  const { left, right, node } = props;
  if (node?.diff_res?.diff_style === DiffStyle.TextDetail) {
    return <TextDiffView {...props} />;
  }
  const displayLeft = transTimestampText(left);
  const displayRight = transTimestampText(right);

  const isMultiLine = displayLeft?.includes('template_NewLine');
  const dealLineBreak = (text: string) => (
    <Typography.Text
      className={styles['multiline-text']}
      type="secondary"
      size="small"
    >
      {text.replaceAll('template_NewLine', '\n')}
    </Typography.Text>
  );
  return isMultiLine ? (
    <Typography.Text
      className={styles['multiline-container']}
      type="secondary"
      size="small"
    >
      {dealLineBreak(displayLeft ?? '')}
      <Typography.Text className="mx-2" type="secondary" size="small">
        {'->'}
      </Typography.Text>
      {dealLineBreak(displayRight ?? '')}
    </Typography.Text>
  ) : (
    <Typography.Text
      type="secondary"
      size="small"
      ellipsis={{
        showTooltip: {
          opts: {
            content: `${displayLeft} -> ${displayRight}`,
            style: { wordBreak: 'break-word' },
          },
        },
      }}
    >{`${displayLeft} -> ${displayRight}`}</Typography.Text>
  );
};

export const TextDiffView: React.FC<DiffNodeRenderProps> = ({
  node,
  type = 'diff',
}) => {
  const isDiffView = type === 'diff';
  const [visible, setVisible] = useState(false);
  const { sendViewDiffEvent } = useSendDiffEvent();
  const originText = safeJSONParse(
    safeJSONParse(node?.diff_res?.origin_left)?.OriginStr,
  );
  const modifyText = safeJSONParse(
    safeJSONParse(node?.diff_res?.origin_right)?.OriginStr,
  );
  return (
    <div>
      <Typography.Text
        link
        onClick={() => {
          setVisible(true);
          sendViewDiffEvent();
        }}
        className="text-xs"
      >
        {I18n.t('coze_bot_diff_btn_view_diff')}
      </Typography.Text>
      <Modal
        visible={visible}
        title={
          <div className="flex gap-1 items-center">
            {I18n.t('coze_bot_diff_diffdetail_pagetitle')}
          </div>
        }
        footer={null}
        width={1000}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <div className={styles['editor-container']}>
          <div className={styles['editor-header']}>
            <div className={styles['editor-title']}>
              {I18n.t(
                isDiffView
                  ? 'coze_bot_diff_diffdetail_latestversion'
                  : 'coze_bot_diff_diffdetail_onlineversion',
              )}
            </div>
            <Divider className={styles['editor-divider']} layout="vertical" />
            <div className={styles['editor-title']}>
              {I18n.t(
                isDiffView
                  ? 'coze_bot_diff_diffdetail_mydraft'
                  : 'coze_bot_diff_diffdetail_tobereleasedversion',
              )}
            </div>
          </div>
          <div className="h-[600px]">
            <DiffEditor
              theme="light"
              className={styles.editor}
              original={originText}
              modified={modifyText}
              language="text"
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                diffWordWrap: 'on',
                lineNumbers: 'on',
                readOnly: true,
                scrollBeyondLastLine: false,
                renderOverviewRuler: false,
                // You can optionally disable the resizing
                enableSplitViewResizing: false,
                unicodeHighlight: { ambiguousCharacters: false },
                suggestLineHeight: 32,
                lineHeight: 20,
                fontSize: 12,
              }}
              loading={
                <div className="h-[100%] w-[100%] flex items-center justify-center">
                  <Spin />
                </div>
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
