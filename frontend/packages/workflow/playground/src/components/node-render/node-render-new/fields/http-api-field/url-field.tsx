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

import React, { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import {
  type WorkflowVariable,
  useGetWorkflowVariableByKeyPath,
  GlobalVariableKey,
  useAvailableWorkflowVariables,
} from '@coze-workflow/variable';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozWarningCircleFillPalette,
  IconCozFolder,
  IconCozPeople,
  IconCozSetting,
} from '@coze-arch/coze-design/icons';
import { Tag } from '@coze-arch/coze-design';

import { useVariableWithNodeInfo } from '@/node-registries/http/fields/hooks/use-variable-with-node';
import { useNodeServiceAndRefreshForTitleChange } from '@/form-extensions/hooks/use-node-available-variables';

import { useHttpUrlVariables } from '../../hooks/use-http-url-variables';

import styles from './index.module.less';

interface UrlFieldProps {
  apiUrl: string;
  allVariables?: WorkflowVariable[];
  isTooltips?: boolean;
  setTipsVisible?: (visible: boolean) => void;
}

const globalVariableIconMap = {
  [GlobalVariableKey.App]: <IconCozFolder />,
  [GlobalVariableKey.User]: <IconCozPeople />,
  [GlobalVariableKey.System]: <IconCozSetting />,
};

export const UrlField = (props: UrlFieldProps, ref) => {
  const { apiUrl, isTooltips = false, setTipsVisible } = props;

  const allVariables = useAvailableWorkflowVariables();

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isHeightOver, setHeightOver] = useState<boolean>(false);

  const getVariableByKeyPath = useGetWorkflowVariableByKeyPath();
  const { getNodeInfoInVariableMeta } =
    useNodeServiceAndRefreshForTitleChange();
  const availableVariables = useVariableWithNodeInfo(
    allVariables,
    getNodeInfoInVariableMeta,
  );

  const { urlVariables = [], splitedUrl = [] } = useHttpUrlVariables({
    urlExpressionString: apiUrl,
    availableVariables,
    getVariableByKeyPath,
  });

  useEffect(() => {
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const innerHeight = entries[0].contentRect.height;
      const outerHeight = wrapperRef.current?.clientHeight ?? 0;

      setHeightOver(innerHeight > outerHeight);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [apiUrl]);

  useEffect(() => {
    if (isTooltips) {
      return;
    }
    setTipsVisible?.(isHeightOver);
  }, [isHeightOver, isTooltips]);

  return (
    <div className="relative overflow-hidden">
      <div
        ref={wrapperRef}
        style={{
          maxHeight: isTooltips ? 'auto' : '87px',
        }}
      >
        <div ref={containerRef} className={styles.container}>
          {splitedUrl?.map(urlPart => {
            if (!urlPart.isVariable) {
              return <span className="inline">{urlPart.content}</span>;
            }
            const curVariableInfo = urlVariables.find(
              variable => urlPart.content === variable.content,
            );
            if (curVariableInfo?.isVariableExist) {
              return (
                <span
                  className={classNames({
                    [styles['wrapper-error']]: !curVariableInfo?.isValid,
                    [styles.nodeGlobal]: curVariableInfo?.globalVariableKey,
                  })}
                >
                  <Tag
                    color="primary"
                    className={classNames(styles.node, {
                      [styles.nodeError]: !curVariableInfo?.isValid,
                    })}
                    prefixIcon={
                      curVariableInfo?.globalVariableKey
                        ? globalVariableIconMap[
                            curVariableInfo?.globalVariableKey
                          ]
                        : null
                    }
                  >
                    {!!curVariableInfo?.iconUrl && (
                      <img
                        src={curVariableInfo.iconUrl}
                        className="w-[14px] mr-[4px]"
                      />
                    )}
                    <span className={styles['node-title']}>
                      {curVariableInfo.nodeTitle}
                    </span>
                    <span className={styles.split}>-</span>
                    <span
                      className={classNames(styles.content, 'max-w-[160px]', {
                        '!text-[#E53241]': !curVariableInfo?.isValid,
                      })}
                    >
                      {curVariableInfo.parsedKeyPath}
                    </span>
                  </Tag>
                </span>
              );
            }

            return (
              <span className={styles['deleted-variable']}>
                <Tag prefixIcon={<IconCozWarningCircleFillPalette />}>
                  {I18n.t('node_http_var_infer_delete', {}, '变量失效')}
                </Tag>
              </span>
            );
          })}
        </div>
      </div>

      {isHeightOver ? <div className={styles['text-subfix']} /> : null}
    </div>
  );
};
