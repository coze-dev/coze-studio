import { useToolbarHandlers } from '../hooks';
import { Tools } from './tools';
import { Minimap } from './minimap';

import css from './tools.module.less';

export const ToolbarContainer = ({
  disableTraceAndTestRun,
}: {
  disableTraceAndTestRun?: boolean;
}) => {
  const handlers = useToolbarHandlers();

  if (disableTraceAndTestRun) {
    return <></>;
  }

  return (
    <div className={css.tools}>
      <div>
        <Minimap handlers={handlers} />
        <Tools handlers={handlers} />
      </div>
    </div>
  );
};
