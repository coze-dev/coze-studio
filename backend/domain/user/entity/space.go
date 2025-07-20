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

type SpaceType int32

const (
	SpaceTypePersonal SpaceType = 1
	SpaceTypeTeam     SpaceType = 2
)

type Space struct {
	ID          int64
	Name        string
	Description string
	IconURL     string
	SpaceType   SpaceType
	OwnerID     int64
	CreatorID   int64
	CreatedAt   int64
	UpdatedAt   int64
}
