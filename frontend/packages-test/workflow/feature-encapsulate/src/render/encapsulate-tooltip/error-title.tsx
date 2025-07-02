import { type FC } from 'react';

import classNames from 'classnames';
import { Typography } from '@coze-arch/coze-design';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  usePlayground,
  useService,
  WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';

import { type EncapsulateValidateError } from '../../validate';

import styles from './index.module.less';

interface Props {
  error: EncapsulateValidateError;
}

export const ErrorTitle: FC<Props> = ({ error }) => {
  const selectServices = useService<WorkflowSelectService>(
    WorkflowSelectService,
  );

  const playground = usePlayground();

  if (!error?.sourceName && !error.sourceIcon) {
    return <div></div>;
  }

  const scrollToNode = async (nodeId: string) => {
    let success = false;
    const node = playground.entityManager.getEntityById<FlowNodeEntity>(nodeId);

    if (node) {
      await selectServices.selectNodeAndScrollToView(node, true);
      success = true;
    }
    return success;
  };

  return (
    <div
      className="flex items-center gap-1 cursor-pointer max-w-[120px]"
      onClick={() => {
        if (error.source) {
          scrollToNode(error.source);
        }
      }}
    >
      {error.sourceIcon ? (
        <img
          width={18}
          height={18}
          src={error.sourceIcon}
          className="w-4.5 h-4.5 rounded-[4px]"
        />
      ) : null}
      {error.sourceName ? (
        <Typography.Paragraph
          className={classNames(
            'font-medium coz-fg-primary',
            styles['error-name'],
          )}
          ellipsis={{
            rows: 1,
            showTooltip: {
              type: 'tooltip',
              opts: {
                style: {
                  width: '100%',
                  wordBreak: 'break-word',
                },
              },
            },
          }}
        >
          {error.sourceName}
        </Typography.Paragraph>
      ) : null}
    </div>
  );
};
