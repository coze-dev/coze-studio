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

const (
	BotIconURI        = "default_icon/user_default_icon.png"
	UserIconURI       = "default_icon/user_default_icon.png"
	PluginIconURI     = "default_icon/plugin_default_icon.png"
	DatasetIconURI    = "default_icon/plugin_default_icon.png"
	WorkflowIconURI   = "default_icon/plugin_default_icon.png"
	ImageflowIconURI  = "default_icon/plugin_default_icon.png"
	SocietyIconURI    = "default_icon/plugin_default_icon.png"
	ConnectorIconURI  = "default_icon/plugin_default_icon.png"
	ChatFlowIconURI   = "default_icon/plugin_default_icon.png"
	VoiceIconURI      = "default_icon/plugin_default_icon.png"
	EnterpriseIconURI = "default_icon/team_default_icon.png"
	ModelIconURI      = "default_icon/team_default_icon.png"
)

func GetDefaultShortcutIconURI() []string {
	return []string{
		"default_icon/shortcut_1coz_ai.png",
		"default_icon/shortcut_2icon_ai_writing.png",
		"default_icon/shortcut_3coz_imageflow.png",
		"default_icon/shortcut_4icon_aisearch.png",
		"default_icon/shortcut_5icon_summary.png",
		"default_icon/shortcut_6icon_digest.png",
		"default_icon/shortcut_7icon_video.png",
		"default_icon/shortcut_8icon_audio.png",
		"default_icon/shortcut_9coz_variables.png",
		"default_icon/shortcut_10coz_folder.png",
		"default_icon/shortcut_11coz_trans_switch.png",
		"default_icon/shortcut_12coz_location.png",
		"default_icon/shortcut_13coz_link.png",
		"default_icon/shortcut_14coz_clock.png",
	}
}
