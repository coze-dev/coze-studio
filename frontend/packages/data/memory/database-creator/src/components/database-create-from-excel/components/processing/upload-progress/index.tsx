import { Typography } from '@coze-arch/bot-semi';

import { ImportFileTaskStatus } from '../../../datamodel';

import s from './index.module.less';

interface DatasetProgressProps {
  className?: string | undefined;
  style?: React.CSSProperties;
  text: string;
  percent: number;
  format?: (percent: number) => React.ReactNode;
  status?: ImportFileTaskStatus;
  statusDesc?: string;
}

export const UploadProgress: React.FC<DatasetProgressProps> = ({
  className,
  style,
  text,
  percent,
  format,
  status,
  statusDesc,
}) => {
  const SUCCESSIVE_PROCESSING = 100;

  return (
    <div className={`${s['dataset-progress-wrap']}`}>
      <div className={`${s['dataset-progress']} ${className}`} style={style}>
        <div className={s['dataset-progress-content']}>
          <Typography.Text
            className={s.text}
            strong
            ellipsis={{
              showTooltip: {
                opts: { content: text },
              },
            }}
            style={{ color: '#4D53E8' }}
          >
            {text}
          </Typography.Text>
          <div className={s['progress-bar']} style={{ width: `${percent}%` }}>
            <Typography.Text
              className={s.text}
              strong
              ellipsis={
                percent === SUCCESSIVE_PROCESSING
                  ? {
                      showTooltip: {
                        opts: { content: text },
                      },
                    }
                  : false
              }
              style={{ color: '#fff', width: '100%' }}
            >
              {text}
            </Typography.Text>
          </div>
        </div>
        <div className={s['dataset-progress-format']}>{format?.(percent)}</div>
      </div>
      {status && statusDesc && status === ImportFileTaskStatus.Failed ? (
        <div className={s['dataset-progress-error']}>
          <span>{statusDesc}</span>
        </div>
      ) : null}
    </div>
  );
};
