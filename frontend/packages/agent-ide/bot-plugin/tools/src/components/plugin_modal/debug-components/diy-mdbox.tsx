import copy from 'copy-to-clipboard';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Space, Toast } from '@coze-arch/bot-semi';
import { MdBoxLazy } from '@coze-arch/bot-md-box/lazy';
import { IconCopy } from '@coze-arch/bot-icons';

import s from './index.module.less';
export enum HeadingType {
  Request = 1,
  Response = 2,
}
interface MdBoxProps {
  markDown: string;
  headingType: HeadingType;
  rawResponse?: string;
  showRaw: boolean;
}

const MAX_LENGTH = 30000;

export const DiyMdBox = ({
  markDown,
  headingType,
  rawResponse,
  showRaw,
}: MdBoxProps) => {
  const getContent = () => {
    if (!rawResponse) {
      return '{}';
    }
    if (rawResponse.length < MAX_LENGTH) {
      return rawResponse;
    }
    return `${rawResponse.slice(0, MAX_LENGTH)}...`;
  };
  return (
    <div className={s['mb-content']}>
      <div className={s['mb-header']}>
        <Space spacing={8}>
          <span>Json</span>
          <IconCopy
            className={s['icon-copy']}
            onClick={() => {
              copy(markDown);
              Toast.success(I18n.t('copy_success'));
            }}
          ></IconCopy>
        </Space>
      </div>
      <div className={s['mb-main']}>
        <div
          className={classNames(s['mb-left'], {
            [s['half-width']]: showRaw && headingType === HeadingType.Response,
          })}
        >
          <MdBoxLazy markDown={`\`\`\`json\n${markDown}\n\`\`\``} />
        </div>
        {showRaw && headingType === HeadingType.Response ? (
          <div className={s['mb-right']}>
            <MdBoxLazy markDown={`\`\`\`json\n${getContent()}\n\`\`\``} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
