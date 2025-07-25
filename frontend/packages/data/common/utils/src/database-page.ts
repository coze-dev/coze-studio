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
 
interface DatabasePageQuery {
  page_mode?: 'modal' | 'normal';
  from?: 'bot' | 'workflow' | 'library' | 'create';
  bot_id?: string;
  workflow_id?: string;
}

export const isDatabasePathname = (): boolean => {
  const databasePagePathReg = new RegExp('/space/[0-9]+/database(/[0-9]+)*');
  return databasePagePathReg.test(location.pathname);
};

export const getDatabasePageQuery = (): DatabasePageQuery => {
  const queryParams = new URLSearchParams(location.search);
  return {
    page_mode: queryParams.get('page_mode') as DatabasePageQuery['page_mode'],
    from: queryParams.get('from') as DatabasePageQuery['from'],
    bot_id: queryParams.get('bot_id') || '',
    workflow_id: queryParams.get('workflow_id') || '',
  };
};

/** 获取 databse 页面模式，如果等于 'modal' 则需要使用全屏形态 */
export const getDatabasePageMode = (): DatabasePageQuery['page_mode'] => {
  if (isDatabasePathname()) {
    return getDatabasePageQuery()?.page_mode;
  }
  return 'normal';
};

/** 当前 Database 页面模式是弹窗（全屏）形式 */
export const databasePageModeIsModal = (): boolean =>
  getDatabasePageMode() === 'modal';
