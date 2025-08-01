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

import React, { useMemo } from 'react';

import { last } from 'lodash-es';
import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconTreeTriangleRight } from '@douyinfe/semi-icons';

import { Line } from '../line';
import { type Field } from '../../types';
import { useValue } from '../../hooks/use-value';
import { useExpand } from '../../hooks';
import { LogObjSpecialKey, LogValueStyleType } from '../../constants';

import styles from './json-field.module.less';

/* JSON type data rendering */
const FieldValue: React.FC<{
  value: Field['value'];
}> = ({ value }) => {
  const { value: current, type } = useValue(value);
  return (
    <span
      data-testid="json-viewer-field-value"
      className={cls({
        [styles['field-value-number']]: type === LogValueStyleType.Number,
        [styles['field-value-boolean']]: type === LogValueStyleType.Boolean,
      })}
    >
      {current}
    </span>
  );
};

const JsonField: React.FC<{ field: Field }> = ({ field }) => {
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

  const { expand, onChange } = useExpand(path.join('.'));

  return (
    <>
      <div className={styles['json-viewer-field']}>
        {echoLines.map((l, idx) => (
          <Line status={l} key={idx} />
        ))}
        <div
          data-testid="json-viewer-field-content"
          className={cls('field-content', styles['field-content'], {
            [styles['is-error']]: isError,
            [styles['is-warning']]: isWarning,
          })}
          onClick={isObj ? onChange : undefined}
        >
          {isObj ? (
            <>
              <span
                data-testid="json-viewer-json-field-expander"
                className={cls('field-icon', styles['field-icon'], {
                  [styles.expand]: expand,
                })}
              >
                <IconTreeTriangleRight size="inherit" />
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
              <span
                className={cls('field-block', styles['field-block'])}
              ></span>
              {keyWithColon ? (
                <span className={cls('field-key', styles['field-key'])}>
                  {keyWithColon}
                </span>
              ) : null}
              <span
                className={cls('field-value', styles['field-value'], {
                  'whitespace-pre-wrap': !isObj,
                })}
              >
                <FieldValue value={field.value} />
              </span>
            </>
          )}
        </div>
      </div>
      {expand
        ? children.map(i => <JsonField field={i} key={i.path.join('.')} />)
        : null}
    </>
  );
};

export { JsonField };
