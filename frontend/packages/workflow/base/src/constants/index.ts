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
 
/** 空方法 */
export const EmptyFunction = () => {
  /** 空方法 */
};
export const EmptyAsyncFunction = () => Promise.resolve();

/** 公共空间 ID */
export const PUBLIC_SPACE_ID = '999999';

/** BOT_USER_INPUT 变量名 */
export const BOT_USER_INPUT = 'BOT_USER_INPUT';

/** USER_INPUT 参数，新版 BOT_USER_INPUT 参数，作用和 BOT_USER_INPUT 相同，Coze2.0 Chatflow 需求引入 */
export const USER_INPUT = 'USER_INPUT';

/** CONVERSATION_NAME 变量名，start 节点会话名称入参 */
export const CONVERSATION_NAME = 'CONVERSATION_NAME';

/**
 * workflow 名称最大字符数
 */
export const WORKFLOW_NAME_MAX_LEN = 30;

/**
 * 工作流命名正则
 */
export const WORKFLOW_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;

/**
 * 节点测试ID前缀
 */
export const NODE_TEST_ID_PREFIX = 'playground.node';
