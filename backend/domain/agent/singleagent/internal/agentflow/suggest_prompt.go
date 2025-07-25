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

package agentflow

const (
	placeholderOfChaAnswer = "_answer_"
	placeholderOfChaInput  = "_input_"
)

const SUGGESTION_PROMPT_JINJA2 = `
你是一个推荐系统，请完成下面的推荐任务。
### 对话 
用户: {{_input_}}
AI: {{_answer_}}

personal: {{ suggest_persona }}

围绕兴趣点给出3个用户紧接着最有可能问的几个具有区分度的不同问题，问题需要满足上面的问题要求，推荐的三个问题必须以字符串数组形式返回。

注意：
- 推荐的三个问题必须以字符串数组形式返回
- 推荐的三个问题必须以字符串数组形式返回
- 推荐的三个问题必须以字符串数组形式返回

`
