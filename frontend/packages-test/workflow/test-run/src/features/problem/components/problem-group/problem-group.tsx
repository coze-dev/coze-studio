import { ProblemEmpty } from '../problem-panel/empty';
import { type WorkflowProblem, type ProblemItem } from '../../types';
import { MyProblemGroup } from './my-problem-group';

import css from './problem-group.module.less';

interface ProblemGroupProps {
  myProblems?: WorkflowProblem;
  otherProblems: WorkflowProblem[];
  onScroll: (p: ProblemItem) => void;
  onJump: (p: ProblemItem, workflowId: string) => void;
}

export const ProblemGroup: React.FC<ProblemGroupProps> = ({
  myProblems,
  otherProblems,
  onScroll,
  onJump,
}) => {
  const isEmpty = !myProblems && !otherProblems.length;

  if (isEmpty) {
    return <ProblemEmpty />;
  }

  return (
    <div className={css['problem-group']}>
      {myProblems ? (
        <MyProblemGroup
          problems={myProblems}
          showTitle={!!otherProblems.length}
          isMine
          onClick={onScroll}
        />
      ) : null}
      {otherProblems.map(other => (
        <MyProblemGroup
          problems={other}
          showTitle={true}
          onClick={p => onJump(p, other.workflowId)}
        />
      ))}
    </div>
  );
};
