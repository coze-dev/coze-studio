import { z } from 'zod';
import { I18n } from '@coze-arch/i18n';
import { type ValidatorProps } from '@flowgram-adapter/free-layout-editor';

const NodeMetaSchema = z.object({
  title: z
    .string({
      required_error: I18n.t('workflow_detail_node_name_error_empty'),
    })
    .min(1, I18n.t('workflow_detail_node_name_error_empty'))
    // .regex(
    //   /^[a-zA-Z][a-zA-Z0-9_-]{0,}$/,
    //   I18n.t('workflow_detail_node_error_format'),
    // )
    .regex(
      /^.{0,63}$/,
      I18n.t('workflow_derail_node_detail_title_max', {
        max: '63',
      }),
    ),
  icon: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
});

type NodeMeta = z.infer<typeof NodeMetaSchema>;

export const nodeMetaValidator = ({
  value,
  context,
}: ValidatorProps<NodeMeta>) => {
  const { playgroundContext } = context;
  function isTitleRepeated(title: string) {
    if (!title) {
      return false;
    }

    const { nodesService } = playgroundContext;
    const nodes = nodesService
      .getAllNodes()
      .filter(node => nodesService.getNodeTitle(node) === title);

    return nodes?.length > 1;
  }

  // 增加节点名重复校验
  const schema = NodeMetaSchema.refine(
    ({ title }: NodeMeta) => !isTitleRepeated(title),
    {
      message: I18n.t('workflow_node_title_duplicated'),
      path: ['title'],
    },
  );
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    return JSON.stringify((parsed as any).error);
  }

  return true;
};
