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

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
)

func TestDefaultParameter(t *testing.T) {
	dps := []*modelmgr.Parameter{
		{
			Name: "temperature",
			Label: &modelmgr.MultilingualText{
				ZH: "生成随机性",
				EN: "Temperature",
			},
			Desc: &modelmgr.MultilingualText{
				ZH: "- **temperature**: 调高温度会使得模型的输出更多样性和创新性，反之，降低温度会使输出内容更加遵循指令要求但减少多样性。建议不要与“Top p”同时调整。",
				EN: "**Temperature**:\\n\\n- When you increase this value, the model outputs more diverse and innovative content; when you decrease it, the model outputs less diverse content that strictly follows the given instructions.\\n- It is recommended not to adjust this value with \\\"Top p\\\" at the same time.",
			},
			Type:      modelmgr.ValueTypeFloat,
			Min:       "0",
			Max:       "1",
			Precision: 1,
			DefaultVal: modelmgr.DefaultValue{
				modelmgr.DefaultTypeDefault:  "1.0",
				modelmgr.DefaultTypeCreative: "1",
				modelmgr.DefaultTypeBalance:  "0.8",
				modelmgr.DefaultTypePrecise:  "0.3",
			},
			Style: modelmgr.DisplayStyle{
				Widget: modelmgr.WidgetSlider,
				Label: &modelmgr.MultilingualText{
					ZH: "生成多样性",
					EN: "Generation diversity",
				},
			},
		},
		{
			Name: "max_tokens",
			Label: &modelmgr.MultilingualText{
				ZH: "最大回复长度",
				EN: "Response max length",
			},
			Desc: &modelmgr.MultilingualText{
				ZH: "控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于 150 个中文汉字。",
				EN: "You can specify the maximum length of the tokens output through this value. Typically, 100 tokens are approximately equal to 150 Chinese characters.",
			},
			Type:      modelmgr.ValueTypeInt,
			Min:       "1",
			Max:       "12288",
			Precision: 0,
			DefaultVal: modelmgr.DefaultValue{
				modelmgr.DefaultTypeDefault: "4096",
			},
			Style: modelmgr.DisplayStyle{
				Widget: modelmgr.WidgetSlider,
				Label: &modelmgr.MultilingualText{
					ZH: "输入及输出设置",
					EN: "Input and output settings",
				},
			},
		},
	}

	data, err := json.Marshal(dps)
	assert.NoError(t, err)

	t.Logf("default parameters: %s", string(data))
}
