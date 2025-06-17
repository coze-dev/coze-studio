import React from 'react';

import classNames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import { IconCozEdit } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';

import styles from '../index.module.less';
import { JsonExpandEditor } from './json-expand-editor';

interface JSONImportProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  customClassNames?: string;
  testId?: string;
  disabled?: boolean;
  readonly?: boolean;
  disabledTooltip?: string;
}

export const JsonImport = ({
  value,
  onChange,
  customClassNames,
  testId,
  disabled,
  disabledTooltip,
}: JSONImportProps) => {
  const { getNodeSetterId } = useNodeTestId();

  const { setFullscreenPanel } = useNodeFormPanelState();

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFullscreenPanel(
      <JsonExpandEditor
        value={value}
        onChange={onChange}
        onClose={() => {
          setFullscreenPanel(null);
        }}
        id={'import-json'}
      />,
    );
  };

  return (
    <div
      className={classNames({
        [customClassNames as string]: customClassNames,
      })}
      data-testid={testId}
    >
      <Tooltip content={disabled ? disabledTooltip : 'Edit JSON'}>
        <IconButton
          data-testid={getNodeSetterId('body-json-import-btn')}
          className={classNames('!block', {
            [styles.importButton]: true,
            [styles.importButtonDisabled]: disabled,
          })}
          size="small"
          color="highlight"
          disabled={disabled}
          icon={<IconCozEdit className={styles.buttonIcon} />}
          onClick={handleOnClick}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              lineHeight: '16px',
            }}
          >
            Edit JSON
          </span>
        </IconButton>
      </Tooltip>
    </div>
  );
};
