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

type VerboseInfo struct {
	MessageType string `json:"msg_type"`
	Data        string `json:"data"`
}

type VerboseData struct {
	Chunks     []RecallDataInfo `json:"chunks"`
	OriReq     string           `json:"ori_req"`
	StatusCode int              `json:"status_code"`
}

type RecallDataInfo struct {
	Slice string   `json:"slice"`
	Score float64  `json:"score"`
	Meta  MetaInfo `json:"meta"`
}

type MetaInfo struct {
	Dataset  DatasetInfo  `json:"dataset"`
	Document DocumentInfo `json:"document"`
	Link     LinkInfo     `json:"link"`
	Card     CardInfo     `json:"card"`
}

type DatasetInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type DocumentInfo struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	FormatType int32  `json:"format_type"`
	SourceType int32  `json:"source_type"`
}

type LinkInfo struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

type CardInfo struct {
	Title string `json:"title"`
	Con   string `json:"con"`
	Index string `json:"index"`
}
