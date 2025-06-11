// import ReactJson from 'react-json-view';

import { type CSSProperties } from 'react';

import { clsx } from 'clsx';

import { jsonParse, textWithFallback } from '../utils';
import { type I18nMapping } from '../typings/basic';
import { CustomJsonViewer, type JsonViewerProps } from '../custom-json-viewer';
import { type ObservationModules } from '../consts';
import { MessageTitle } from '../common/message-title';

import styles from './index.module.less';

export interface MessagePanelProps {
  content: string;
  category: ObservationModules;
  i18nMapping: I18nMapping;
  className?: string;
  isError?: boolean;
  onCopyClick?: (text: string) => void;
  panelStyle?: CSSProperties;
  encrypted?: boolean;
  jsonViewerProps?: Partial<JsonViewerProps<Record<string, unknown> | string>>;
}

export const MessagePanel = (props: MessagePanelProps) => {
  const {
    content,
    category,
    i18nMapping,
    isError,
    onCopyClick,
    panelStyle,
    encrypted,
    jsonViewerProps = {},
  } = props;
  const i18nInfo = i18nMapping[category];
  const inputValue = jsonParse(textWithFallback(content));

  return (
    <>
      <MessageTitle
        text={i18nInfo?.title ?? ''}
        copyContent={
          encrypted
            ? ''
            : typeof inputValue === 'string'
              ? inputValue
              : JSON.stringify(inputValue)
        }
        onCopyClick={onCopyClick}
      />
      {encrypted ? (
        <div className={styles.encryption}>
          <span>安全提示</span>
          <span className={styles['encryption-tip']}>
            当前数据已被加密，无法查看
          </span>
        </div>
      ) : (
        <div
          className={clsx(
            styles['message-panel-content'],
            isError && styles['message-panel-content_error'],
          )}
          style={panelStyle}
        >
          {typeof inputValue === 'string' ? (
            <div className={styles['message-panel-content-detail-text']}>
              {inputValue}
            </div>
          ) : (
            <div className={styles['message-panel-content-json-container']}>
              <CustomJsonViewer
                {...jsonViewerProps}
                className={styles.content}
                value={inputValue}
                defaultInspectDepth={5}
                onCopy={(_, txt) => onCopyClick?.(txt as string)}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};
