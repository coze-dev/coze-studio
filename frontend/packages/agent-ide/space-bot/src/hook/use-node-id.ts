import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

/**
 * 获取当前节点 id，若返回 undefined 则代表不在 multi 模式的节点上下文
 *
 * Q1：这个 hook 应该放到 multi-agent 模块下？
 * A1：multi-agent 模块下已有类似 hook。
 *    单独提出来是为了避免某些在 single 和 multi 都会复用的组件要使用 node id 时，产生不合理的 import 路径
 *
 * Q2：在 single 和 multi 都复用的组件，应该由调用方传入 node id？
 * A2：太理想了。有些组件业务逻辑过于复杂，由调用方传入的话会导致层层传参的深度略显夸张，比如 bot 的 workflow 弹窗。
 */
export function useCurrentNodeId() {
  let nodeId: string | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- 并未条件性调用 hook
    nodeId = useCurrentEntity().id;
    // eslint-disable-next-line @coze-arch/use-error-in-catch -- SDK 符合预期的报错，无需额外处理
  } catch {
    nodeId = undefined;
  }
  return nodeId;
}
