import { isObject } from 'lodash-es';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import { NodeExeStatus } from '@coze-arch/bot-api/workflow_api';
import { IconCozWarningCircle } from '@coze/coze-design/icons';
import { SegmentTab, Tag, Typography, Tooltip } from '@coze/coze-design';

import { LogWrap } from '../log-wrap';
import { DataViewer } from '../../data-viewer';
import { type OutputLog } from '../../../types';
import { useOutputLog, TabValue } from './use-output-log';
import { SyncOutputToNode } from './sync-output-to-node';

import css from './output-log-parser.module.less';

const MockInfo: React.FC<{ log: OutputLog }> = ({ log }) => {
  const { mockInfo } = log;

  if (!mockInfo?.isHit) {
    return null;
  }
  return (
    <Tag size="mini" style={{ maxWidth: '100px' }}>
      <Typography.Text ellipsis={{ showTooltip: true }} size="small">
        {I18n.t('mockset')}:{mockInfo?.mockSetName}
      </Typography.Text>
    </Tag>
  );
};

const LLMTabTooltip = () => (
  <Tooltip
    content={
      <>
        <Typography.Text fontSize="14px">
          {I18n.t('wf_testrun_log_md_llm_diff_tooltip')}
        </Typography.Text>
        <Typography.Text
          fontSize="14px"
          link={{
            href: '/open/docs/guides/llm_node#f1e97a47',
            target: '_blank',
          }}
        >
          &nbsp;{I18n.t('wf_testrun_log_md_llm_diff_tooltip_a')}
        </Typography.Text>
      </>
    }
  >
    <IconCozWarningCircle />
  </Tooltip>
);

export const OutputLogParser: React.FC<{
  log: OutputLog;
  node?: FlowNodeEntity;
  nodeStatus?: NodeExeStatus;
  onPreview?: (value: string, path: string[]) => void;
}> = ({ log, node, nodeStatus, onPreview }) => {
  const { showRawOutput, tab, data, options, setTab } = useOutputLog(log);

  const isLLM = log.nodeType === 'LLM';

  const showCodeSync =
    node?.flowNodeType === StandardNodeType.Code &&
    nodeStatus === NodeExeStatus.Success &&
    isObject(log.rawOutput?.data);

  const isFinished =
    nodeStatus === NodeExeStatus.Success || nodeStatus === NodeExeStatus.Fail;

  return (
    <LogWrap
      label={log.label}
      source={data}
      copyTooltip={log.copyTooltip}
      labelExtra={<MockInfo log={log} />}
      extra={
        <div className={css.extra}>
          {showCodeSync ? (
            <SyncOutputToNode
              node={node}
              output={log.rawOutput?.data as object}
            />
          ) : null}
        </div>
      }
    >
      <div className={css['output-log']}>
        {showRawOutput ? (
          <SegmentTab
            size="small"
            value={tab}
            onChange={e => {
              setTab(e.target.value);
            }}
          >
            {options.map(i => (
              <SegmentTab.Tab value={i.value}>
                <span className={css.tab}>
                  {i.label}
                  {isLLM && i.value === TabValue.RawOutput ? (
                    <LLMTabTooltip />
                  ) : null}
                </span>
              </SegmentTab.Tab>
            ))}
          </SegmentTab>
        ) : null}
        <DataViewer
          data={data}
          mdPreview={isFinished}
          onPreview={onPreview}
          className="!min-h-[100px]"
        />
      </div>
    </LogWrap>
  );
};
