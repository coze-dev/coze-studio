import { Space, Image, Typography, Tooltip } from '@coze-arch/coze-design';

const doRenderTooltip = (content, children) => (
  <Tooltip content={content}>{children}</Tooltip>
);

const NameWithIcon = ({ name, icon }: { name: string; icon: string }) => (
  <Space spacing={8}>
    <Image src={icon} width={32} height={32} preview={false}></Image>
    <Typography.Text
      className="text-[12px] font-medium leading-[16px] w-[70px]"
      ellipsis={{
        showTooltip: {
          renderTooltip: doRenderTooltip,
        },
      }}
    >
      {name}
    </Typography.Text>
  </Space>
);

export { NameWithIcon };
