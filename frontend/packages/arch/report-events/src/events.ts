import { WorkflowEvents } from './workflow-event';
import { VariableEvents } from './variable-event';
import { TemplateEvents } from './template-event';
import { SocialSceneEvents } from './social-scene-event';
import { PublishEvents } from './publish-event';
import { PluginEvents } from './plugin-event';
import { MultiAgentEvents } from './multi-agent';
import { KnowledgeEvents } from './knowledge-event';
import { InviteEvents } from './invite-event';
import { InteractionEvents } from './interaction-event';
import { FileboxEvents } from './filebox-event';
import { FeatureEvents } from './feature-event';
import { ExploreEvents } from './explore-event';
import { EditorAutosaveEvents } from './editor-autosave';
import { DatabaseEvents } from './database-event';
import { CustomPlatformEvents } from './custom-platform-event';
import { CookieBannerEvents } from './cookie-banner';
import { CommonError } from './common-error';
import { ChatRoomEvents } from './chat-room-event';
import { BotDetailEvents } from './bot-detail-event';

export type EventNames =
  | InteractionEvents
  | FeatureEvents
  | CommonError
  | KnowledgeEvents
  | FileboxEvents
  | DatabaseEvents
  | PublishEvents
  | VariableEvents
  | BotDetailEvents
  | ExploreEvents
  | InviteEvents
  | PluginEvents
  | WorkflowEvents
  | CookieBannerEvents
  | SocialSceneEvents
  | ChatRoomEvents
  | EditorAutosaveEvents
  | MultiAgentEvents
  | TemplateEvents;

export const REPORT_EVENTS = {
  ...InteractionEvents,
  ...FeatureEvents,
  ...CommonError,
  ...KnowledgeEvents,
  ...FileboxEvents,
  ...DatabaseEvents,
  ...PublishEvents,
  ...VariableEvents,
  ...BotDetailEvents,
  ...ExploreEvents,
  ...InviteEvents,
  ...PluginEvents,
  ...WorkflowEvents,
  ...CookieBannerEvents,
  ...SocialSceneEvents,
  ...ChatRoomEvents,
  ...MultiAgentEvents,
  ...EditorAutosaveEvents,
  ...CustomPlatformEvents,
  ...TemplateEvents,
};
