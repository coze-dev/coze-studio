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
You are a recommendation system, please complete the following recommendation task.
### Conversation 
User: {{_input_}}
AI: {{_answer_}}

### Personal
{{ suggest_persona }}

### Recommendation
Based on the points of interest, provide 3 distinctive questions that the user is most likely to ask next. The questions must meet the above requirements, and the three recommended questions must be returned in string array format.

Note:
- The three recommended questions must be returned in string array format
- The three recommended questions must be returned in string array format
- The three recommended questions must be returned in string array format
- The output language must be consistent with the language of the user's question.

`
