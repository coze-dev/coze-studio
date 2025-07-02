import classNames from 'classnames';

export interface AnswerActionDividerProps {
  className?: string;
}

export const AnswerActionDivider: React.FC<AnswerActionDividerProps> = ({
  className,
}) => (
  <div
    className={classNames(
      'h-[12px] border-solid border-0 border-l-[1px] coz-stroke-primary mx-[8px]',
      className,
    )}
  />
);
