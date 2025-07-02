import { DataViewer } from '../data-viewer';
import { type BaseLog } from '../../types';
import { LogWrap } from './log-wrap';

export const NormalLogParser: React.FC<{ log: BaseLog }> = ({ log }) => (
  <LogWrap label={log.label} source={log.data} copyTooltip={log.copyTooltip}>
    <DataViewer data={log.data} emptyPlaceholder={log.emptyPlaceholder} />
  </LogWrap>
);
