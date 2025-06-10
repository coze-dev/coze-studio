// copy from packages/arch/bot-typings/src/teamspace.ts
export interface DynamicParams extends Record<string, string | undefined> {
  space_id?: string;
  bot_id?: string;
  plugin_id?: string;
  workflow_id?: string;
  dataset_id?: string;
  doc_id?: string;
  tool_id?: string;
  invite_key?: string;
  product_id?: string;
  mock_set_id?: string;
  conversation_id: string;
  commit_version?: string;
  /** 社会场景 */
  scene_id?: string;
  post_id?: string;

  project_id?: string;
}
