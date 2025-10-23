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

package convert

import (
	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
)

var pluginTypes = map[common.PluginType]consts.PluginType{
	common.PluginType_PLUGIN: consts.PluginTypeOfCloud,
}

func ToPluginType(typ common.PluginType) (consts.PluginType, bool) {
	_type, ok := pluginTypes[typ]
	return _type, ok
}

var thriftPluginTypes = func() map[consts.PluginType]common.PluginType {
	types := make(map[consts.PluginType]common.PluginType, len(pluginTypes))
	for k, v := range pluginTypes {
		types[v] = k
	}
	return types
}()

func ToThriftPluginType(typ consts.PluginType) (common.PluginType, bool) {
	_type, ok := thriftPluginTypes[typ]
	return _type, ok
}
