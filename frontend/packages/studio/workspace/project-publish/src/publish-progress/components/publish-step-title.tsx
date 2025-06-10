import { Tag, type TagProps, Typography } from '@coze/coze-design';

export interface PublishStepTitleProps {
  title: string;
  tag?: string;
  color?: TagProps['color'];
}

export function PublishStepTitle({ title, tag, color }: PublishStepTitleProps) {
  return (
    <div className="flex items-center gap-[4px]">
      <Typography.Text className="leading-[20px] font-normal">
        {title}
      </Typography.Text>
      {typeof tag === 'string' ? (
        <Tag size="mini" color={color}>
          {tag}
        </Tag>
      ) : null}
    </div>
  );
}
