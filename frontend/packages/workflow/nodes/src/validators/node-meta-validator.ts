/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

  // Add Node Name Duplicate Validation
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
