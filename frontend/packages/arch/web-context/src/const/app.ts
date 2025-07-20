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
 
// extract from apps/bot/src/constant/app.ts
export enum BaseEnum {
  Home = 'home', //首页
  Explore = 'explore', //探索
  Store = 'store', // 商店
  Model = 'model', //模型竞技场
  Space = 'space', //空间内
  Workflow = 'work_flow', //兼容 workflow 编辑页
  Invite = 'invite', // 邀请链接
  Token = 'token', // token
  Open = 'open', // 开放平台
  PluginMockSet = 'plugin_mock_set',
  Search = 'search', // 搜索
  Premium = 'premium', // 订阅服务
  User = 'user', // 个人主页
  Enterprise = 'enterprise', // 企业管理
}

export enum SpaceAppEnum {
  BOT = 'bot',
  DOUYIN_BOT = 'douyin-bot',
  DEVELOP = 'develop',
  LIBRARY = 'library',
  MODEL = 'model',
  PLUGIN = 'plugin',
  OCEAN_PROJECT = 'ocean-project',
  WORKFLOW = 'workflow',
  KNOWLEDGE = 'knowledge',
  TEAM = 'team',
  PERSONAL = 'personal',
  WIDGET = 'widget',
  EVALUATION = 'evaluation',
  EVALUATE = 'evaluate',
  SOCIAL_SCENE = 'social-scene',
  IMAGEFLOW = 'imageflow',
  DATABASE = 'database',
  PROJECT_IDE = 'project-ide',
  PUBLISH = 'publish',
}
