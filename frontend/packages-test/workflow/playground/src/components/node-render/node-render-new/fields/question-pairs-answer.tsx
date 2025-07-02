import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';

import { LabelWithTooltip } from './label-with-tooltip';
import { FieldEmpty } from './field-empty';

import styles from './question-pairs.module.less';

export const AnswerItem = ({
  label,
  content,
  showLabel = true,
  maxWidth = 148,
}) => (
  <div className={'flex items-center w-full h-[20px]'}>
    {showLabel ? (
      <div
        className={classnames(
          styles.tagItem,
          'px-1 py-0.5 gap-0.5 w-[50px] mr-[6px] flex items-center justify-center',
        )}
        style={{
          flex: '0 0 50px',
        }}
      >
        <span className={styles.tagItemLabel}>{label ?? ''}</span>
      </div>
    ) : null}
    {!content ? (
      <FieldEmpty
        fieldName={I18n.t('workflow_ques_ans_type_option_content', {}, '内容')}
      />
    ) : (
      <LabelWithTooltip
        customClassName={styles.question_pairs_content}
        maxWidth={maxWidth}
        content={content ?? ''}
      />
    )}
  </div>
);
