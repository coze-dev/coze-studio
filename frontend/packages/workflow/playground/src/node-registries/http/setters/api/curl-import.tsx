import React from 'react';

import classNames from 'classnames';
import { PublicScopeProvider } from '@coze-workflow/variable';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozImport } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';

import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';

import { CurlExpandEditor } from './curl-expand-editor';

import styles from './index.module.less';

export const CurlImport = ({
  onChange,
  customClassNames = '',
  testId,
  disabled,
  disabledTooltip = I18n.t('node_http_import_curl', {}, '导入 cURL'),
}) => {
  const { getNodeSetterId } = useNodeTestId();

  const { setFullscreenPanel } = useNodeFormPanelState();

  const handleOnClick = () => {
    setFullscreenPanel(
      <PublicScopeProvider>
        <CurlExpandEditor
          onChange={onChange}
          onClose={() => {
            setFullscreenPanel(null);
          }}
          id={'import-curl'}
        />
      </PublicScopeProvider>,
    );
  };

  return (
    <div
      className={classNames({
        [customClassNames]: customClassNames,
      })}
      data-testid={testId}
    >
      <Tooltip
        content={
          disabled
            ? disabledTooltip
            : I18n.t('node_http_import_curl', {}, '导入 cURL')
        }
      >
        <IconButton
          data-testid={getNodeSetterId('apiInfo-import-curl-btn')}
          className={classNames('!block', {
            [styles.importButton]: true,
            [styles.importButtonDisabled]: disabled,
          })}
          size="small"
          color="highlight"
          disabled={disabled}
          icon={<IconCozImport className={styles.buttonIcon} />}
          onClick={handleOnClick}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              lineHeight: '16px',
            }}
          >
            {I18n.t('node_http_import_curl', {}, '导入 cURL')}
          </span>
        </IconButton>
      </Tooltip>
    </div>
  );
};
