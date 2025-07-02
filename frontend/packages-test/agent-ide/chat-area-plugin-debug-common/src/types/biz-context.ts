import { type Scene } from '@coze-common/chat-area';

export interface PluginBizContext {
  botId: string;
  scene: Scene;
  methods: {
    refreshTaskList: () => void;
  };
}
