import classNames from 'classnames';
import { IconCozKnowledgeFill } from '@coze-arch/coze-design/icons';

interface SiderCategoryProps {
  label: string;
  selected: boolean;

  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const SiderCategory = ({ label, onClick, selected }: SiderCategoryProps) => (
  <div
    onClick={onClick}
    className={classNames([
      'flex items-center gap-[8px] px-[12px]',
      'px-[12px] py-[6px] rounded-[8px]',
      'cursor-pointer',
      'hover:text-[var(--light-usage-text-color-text-0,#1c1f23)]',
      'hover:bg-[var(--light-usage-fill-color-fill-0,rgba(46,50,56,5%))]',
      selected &&
        'text-[var(--light-usage-text-color-text-0,#1c1d23)] bg-[var(--light-usage-fill-color-fill-0,rgba(46,47,56,5%))]',
    ])}
  >
    <IconCozKnowledgeFill />
    {label}
  </div>
);

export default SiderCategory;
