import { I18n } from '@coze-arch/i18n';
import { IconCozCopy } from '@coze-arch/coze-design/icons';
import {
  IconButton,
  Space,
  Tooltip,
  Typography,
} from '@coze-arch/coze-design';

const doRenderTooltip = (content, children) => (
  <Tooltip content={content}>{children}</Tooltip>
);

const IdWithCopy = ({
  id,
  doCopy,
}: {
  id: string;
  doCopy?: (id: string) => void;
}) => (
  <Space spacing={4}>
    <Typography.Text
      className="text-[12px] font-medium leading-[16px] w-[80px]"
      ellipsis={{
        showTooltip: {
          renderTooltip: doRenderTooltip,
        },
      }}
    >
      {id}
    </Typography.Text>
    <Tooltip content={I18n.t('copy')}>
      <IconButton
        onClick={() => doCopy?.(id)}
        color="secondary"
        icon={<IconCozCopy className="text-base" />}
        size="mini"
      />
    </Tooltip>
  </Space>
);

export { IdWithCopy };
