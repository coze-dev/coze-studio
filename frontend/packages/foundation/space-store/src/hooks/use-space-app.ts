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
 
import { useLocation } from 'react-router-dom';

/**
 * 从URL上获取工作空间子模块
 * @param pathname
 * @returns 工作子模块字符串，如果不匹配则返回 undefined
 */
const getSpaceApp = (pathname: string): string | undefined => {
  // 以 /space/ 开头，后面跟 spaceId，再跟子模块（只允许字母、数字、-、_）
  const match = pathname.match(/^\/space\/[^/]+\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : undefined;
};

export const useSpaceApp = () => {
  const { pathname } = useLocation();

  const spaceApp = getSpaceApp(pathname);

  return spaceApp;
};
