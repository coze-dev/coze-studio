import { type FlamethreadProps } from '../flamethread';
import { type DataSource } from '../../typings/graph';
import {
  type SpanStatusConfigMap,
  type SpanTypeConfigMap,
} from '../../typings/config';

export type TraceFlamethreadProps = {
  dataSource: DataSource;
  selectedSpanId?: string;
  spanTypeConfigMap?: SpanTypeConfigMap;
  spanStatusConfigMap?: SpanStatusConfigMap;
} & Pick<
  FlamethreadProps,
  | 'rectStyle'
  | 'labelStyle'
  | 'globalStyle'
  | 'rowHeight'
  | 'visibleColumnCount'
  // | 'valuePerColumn'
  | 'datazoomDecimals'
  | 'axisLabelSuffix'
  | 'disableViewScroll'
  | 'enableAutoFit'
  | 'onClick'
>;
