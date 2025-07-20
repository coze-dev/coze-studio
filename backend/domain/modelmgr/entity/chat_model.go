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

package entity

import "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"

type Model struct {
	*modelmgr.Model
}

type ModelMeta = modelmgr.ModelMeta

type ModelMetaStatus = modelmgr.ModelMetaStatus

func (m *Model) FindParameter(name modelmgr.ParameterName) (*modelmgr.Parameter, bool) {
	if len(m.DefaultParameters) == 0 {
		return nil, false
	}

	for _, param := range m.DefaultParameters {
		if param.Name == name {
			return param, true
		}
	}

	return nil, false
}
