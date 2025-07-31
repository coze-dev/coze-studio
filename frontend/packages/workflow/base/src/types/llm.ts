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

// The agreement agreed with the backend is not perceived by the workflow backend. Corresponding to the key response.data modal_list [*] .model_params [*] .default in the api/bot/get_type_list interface
export enum GenerationDiversity {
  Customize = 'default_val',
  Creative = 'creative',
  Balance = 'balance',
  Precise = 'precise',
}

export const RESPONSE_FORMAT_NAME = 'response_format';
