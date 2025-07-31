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

import {
  type FlowNodeEntity,
  type IPoint,
} from '@flowgram-adapter/fixed-layout-editor';

export interface CustomLine {
  from: FlowNodeEntity;
  to: FlowNodeEntity;
  fromPoint: IPoint;
  toPoint: IPoint;
  activated?: boolean;
}

/**
 * Resource icon type
 */
export enum NodeType {
  WORKFLOW, // Workflow
  CHAT_FLOW, // conversation flow
  KNOWLEDGE, // Knowledge Base
  PLUGIN, // plugin
  DATABASE, // database
}

/**
 * source of resources
 */
export enum DependencyOrigin {
  LIBRARY, // resource library
  APP, // App / Project
  SHOP, // store
}

export interface EdgeItem {
  from: string;
  to: string;
  collapsed?: boolean;
}
