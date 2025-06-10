import { isArray, isObject, get } from 'lodash-es';
import {
  FooterBtnStatus,
  type FooterControlsProps,
  type FooterControlProp,
  type FooterBtnProps,
  type FooterPrefixType,
} from '@coze-data/knowledge-resource-processor-core';
import { Button, Tooltip } from '@coze/coze-design';

import styles from './index.module.less';

interface UploadFooterProps {
  controls: FooterControlsProps;
}

/** 类型断言 入参是不是 按钮数组 */
function isBtnArray(controls: unknown): controls is FooterBtnProps[] {
  return !!controls && isArray(controls);
}

function isControlsObject(controls: unknown): controls is FooterControlProp {
  return (
    !!controls &&
    isObject(controls) &&
    !!get(controls, 'btns') &&
    !!get(controls, 'prefix')
  );
}

export const UploadFooter = (props: UploadFooterProps) => {
  const { controls } = props;
  let btns: FooterBtnProps[] = [];
  let prefix: FooterPrefixType;
  if (isBtnArray(controls)) {
    btns = controls;
  }
  if (isControlsObject(controls)) {
    ({ btns, prefix } = controls);
  }

  return (
    <div className={styles['upload-footer']}>
      {prefix}
      {btns.map(btnItem => {
        const isShowHoverContent =
          btnItem.disableHoverContent &&
          btnItem.status === FooterBtnStatus.DISABLE;
        const buttonNode = (
          <Button
            data-testid={btnItem.e2e}
            key={btnItem.text}
            disabled={btnItem.status === FooterBtnStatus.DISABLE}
            loading={btnItem.status === FooterBtnStatus.LOADING}
            color={btnItem.type || 'hgltplus'}
            // theme={btnItem.theme || 'solid'}
            onClick={btnItem.onClick}
          >
            {btnItem.text}
          </Button>
        );
        if (!isShowHoverContent) {
          return buttonNode;
        }
        return (
          <Tooltip content={btnItem.disableHoverContent}>{buttonNode}</Tooltip>
        );
      })}
    </div>
  );
};
