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
 
// 根据template_query和components拼接query
export const getQueryFromTemplate = (
  templateQuery: string,
  values: Record<string, unknown>,
) => {
  let query = templateQuery;
  // 替换模板中的{{key}}为values中key对应的值
  Object.keys(values).forEach(key => {
    query = query.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
      values[key] as string,
    );
  });

  return query;
};
