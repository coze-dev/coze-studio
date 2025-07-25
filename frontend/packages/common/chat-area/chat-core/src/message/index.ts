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
 
/**
 * 1. 负责规范各种类型消息创建的入参出参，减少消息创建成本
 * 2. 对于接收到的消息，针对不同消息类型，吐出指定的消息格式
 */

export { PreSendLocalMessageFactory } from './presend-local-message/presend-local-message-factory';

export { ChunkProcessor } from './chunk-processor';

export { PreSendLocalMessage } from './presend-local-message/presend-local-message';
