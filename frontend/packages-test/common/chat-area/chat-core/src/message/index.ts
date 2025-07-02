/**
 * 1. 负责规范各种类型消息创建的入参出参，减少消息创建成本
 * 2. 对于接收到的消息，针对不同消息类型，吐出指定的消息格式
 */

export { PreSendLocalMessageFactory } from './presend-local-message/presend-local-message-factory';

export { ChunkProcessor } from './chunk-processor';

export { PreSendLocalMessage } from './presend-local-message/presend-local-message';
