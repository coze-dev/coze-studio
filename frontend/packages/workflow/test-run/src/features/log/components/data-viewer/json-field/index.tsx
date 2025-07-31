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

import React, { useEffect, useMemo } from 'react';

import { isString, last } from 'lodash-es';
import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowRight, IconCozEye } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { type Field } from '../types';
import { useExpand, useValue } from '../hooks';
import { LogObjSpecialKey, LogValueStyleType } from '../constants';
import { isPreviewMarkdown } from '../../../utils/markdown';
import { useTestRunReporterService } from '../../../../../hooks';

import styles from './json-field.module.less';

const SPACE_WIDTH = 14;

/* JSON type data rendering */
const FieldValue: React.FC<{
  value: Field['value'];
  /** Is it in markdown format? */
  isMarkdown?: boolean;
  onMarkdownPreview?: () => void;
}> = ({ value, isMarkdown, onMarkdownPreview }) => {
  const { value: current, type } = useValue(value);

  return (
    <span className={styles['field-value']}>
      <span
        data-testid="json-viewer-field-value"
        className={cls({
          [styles['field-value-number']]: type === LogValueStyleType.Number,
          [styles['field-value-boolean']]: type === LogValueStyleType.Boolean,
        })}
      >
        {current}
      </span>
      {/* preview */}
      {isMarkdown ? (
        <Button
          className={styles['value-button']}
          size="mini"
          color="primary"
          icon={<IconCozEye />}
          onClick={onMarkdownPreview}
        >
          {I18n.t('creat_project_use_template_preview')}
        </Button>
      ) : null}
    </span>
  );
};

const JsonField: React.FC<{
  field: Field;
  mdPreview: boolean;
  onPreview: (value: string, path: string[]) => void;
}> = ({ field, mdPreview, onPreview }) => {
  const reporter = useTestRunReporterService();
  const { lines, children, path, isObj } = field;
  const echoLines = useMemo(() => lines.slice(1), [lines]);

  const pathStr = useMemo(() => path.join('.'), [path]);

  const isError = useMemo(() => pathStr === LogObjSpecialKey.Error, [pathStr]);
  const isWarning = useMemo(
    () => pathStr === LogObjSpecialKey.Warning,
    [pathStr],
  );

  const key = useMemo(() => last(path), [path]);
  const keyWithColon = useMemo(() => {
    if (isError) {
      return I18n.t('workflow_detail_testrun_error_front');
    }
    if (isWarning) {
      return I18n.t('workflow_detail_testrun_warning_front');
    }
    return key ? `${key} : ` : '';
  }, [key, isError, isWarning]);

  const isCanRenderMarkdown = useMemo(
    () => !isObj && !isError && !isWarning && isPreviewMarkdown(field.value),
    [isObj, isError, isWarning, field.value],
  );

  const isRenderMarkdown = useMemo(
    () => mdPreview && isCanRenderMarkdown,
    [isCanRenderMarkdown, mdPreview],
  );

  const { expand, toggle } = useExpand(path.join('.'));

  const handleMarkdownPreview = () => {
    if (isString(field.value)) {
      onPreview(field.value, path);
      reporter.logOutputMarkdown({ action_type: 'preview' });
    }
  };

  useEffect(() => {
    if (isRenderMarkdown) {
      reporter.logOutputMarkdown({ action_type: 'render' });
    }
  }, [isRenderMarkdown]);

  return (
    <>
      <div className={styles['json-viewer-field']}>
        <div
          className={styles['field-space']}
          style={{ width: `${echoLines.length * SPACE_WIDTH}px` }}
        />
        <div
          data-testid="json-viewer-field-content"
          className={cls('field-content', styles['field-content'], {
            [styles['is-error']]: isError,
            [styles['is-warning']]: isWarning,
          })}
          onClick={isObj ? toggle : undefined}
        >
          {isObj ? (
            <>
              <span
                data-testid="json-viewer-json-field-expander"
                className={cls('field-icon', styles['field-icon'], {
                  [styles.expand]: expand,
                })}
              >
                <IconCozArrowRight />
              </span>
              <span className={cls('field-key', styles['field-key'])}>
                {key}
              </span>
              <span className={cls('field-len', styles['field-len'])}>
                {` {${children.length}}`}
              </span>
            </>
          ) : (
            <>
              {keyWithColon ? (
                <span className={cls('field-key', styles['field-key'])}>
                  {keyWithColon}
                </span>
              ) : null}
              <FieldValue
                value={field.value}
                isMarkdown={isRenderMarkdown}
                onMarkdownPreview={handleMarkdownPreview}
              />
            </>
          )}
        </div>
      </div>
      {expand
        ? children.map(i => (
            <JsonField
              mdPreview={mdPreview}
              onPreview={onPreview}
              field={i}
              key={i.path.join('.')}
            />
          ))
        : null}
    </>
  );
};

export { JsonField };
