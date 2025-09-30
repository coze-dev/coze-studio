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

package modelmgr

import "github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"

type I18nText struct {
	ZH string `json:"zh,omitempty" yaml:"zh,omitempty"`
	EN string `json:"en,omitempty" yaml:"en,omitempty"`
}

type ModelProvider struct {
	Name        I18nText                 `json:"name,omitempty"`
	IconURI     string                   `json:"icon_uri,omitempty"`
	ModelClass  developer_api.ModelClass `json:"model_class,omitempty"`
	Description I18nText                 `json:"description,omitempty"`
}
