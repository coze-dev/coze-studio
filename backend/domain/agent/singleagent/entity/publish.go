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
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

var PublishConnectorIDWhiteList = map[int64]bool{
	consts.WebSDKConnectorID: true,
	consts.APIConnectorID:    true,
}

type PublishConnectorData struct {
	PublishConnectorList []*developer_api.PublishConnectorInfo
	// SubmitBotMarketOption *developer_api.SubmitBotMarketOption
	// LastSubmitConfig      *developer_api.SubmitBotMarketConfig
	// ConnectorBrandInfoMap map[int64]*developer_api.ConnectorBrandInfo
	// PublishTips           *developer_api.PublishTips
}

type PublishInfo struct {
	AgentID                 int64
	LastPublishTimeMS       int64
	ConnectorID2PublishTime map[int64]int64
}
