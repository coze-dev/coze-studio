import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozKnowledgeFill } from '@coze-arch/coze-design/icons';

export enum SkillKnowledgeSiderCategory {
  Library = 'library',
  Project = 'project',
}

interface Props {
  projectId?: string;
  category?: string;
  setCategory?: (category: SkillKnowledgeSiderCategory) => void;
}

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

export const SkillKnowledgeSider: React.FC<Props> = ({
  projectId,
  category = SkillKnowledgeSiderCategory.Library,
  setCategory,
}) => (
  <>
    <SiderCategory
      label={I18n.t('project_resource_modal_library_resources', {
        resource: I18n.t('resource_type_knowledge'),
      })}
      onClick={() => {
        setCategory?.(SkillKnowledgeSiderCategory.Library);
      }}
      selected={category === SkillKnowledgeSiderCategory.Library}
    />
    {projectId ? (
      <SiderCategory
        label={I18n.t('project_resource_modal_project_resources', {
          resource: I18n.t('resource_type_knowledge'),
        })}
        onClick={() => {
          setCategory?.(SkillKnowledgeSiderCategory.Project);
        }}
        selected={category === SkillKnowledgeSiderCategory.Project}
      />
    ) : null}
  </>
);
