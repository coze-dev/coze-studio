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
 * 1. Responsible for standardizing imported parameters exported parameters of various types of message creation to reduce message creation costs
 * 2. For the received message, spit out the specified message format for different message types
 */

export { PreSendLocalMessageFactory } from './presend-local-message/presend-local-message-factory';

export { ChunkProcessor } from './chunk-processor';

export { PreSendLocalMessage } from './presend-local-message/presend-local-message';
