import { Radio, Typography } from '@coze-arch/coze-design';

interface KnowledgeSourceRadioProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  e2e?: string;
  key?: string;
  value?: string;
}

export const KnowledgeSourceRadio = (props: KnowledgeSourceRadioProps) => {
  const { title, description, icon, e2e, key, value } = props;
  return (
    <Radio
      key={key}
      value={value}
      extra={
        <Typography.Text
          type="tertiary"
          ellipsis={{
            showTooltip: {
              opts: { content: description },
            },
          }}
          style={{ lineHeight: '20px', width: 180 }}
        >
          {description}
        </Typography.Text>
      }
      className="flex-[0_0_49%]"
      data-testid={e2e}
    >
      {icon ? <div className="flex items-center mr-2">{icon}</div> : null}
      {title}
    </Radio>
  );
};
