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

package database

import (
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/table"
)

type ExecuteSQLRequest struct {
	SQL     *string // set if OperateType is 0.
	SQLType SQLType // SQLType indicates the type of SQL: parameterized or raw SQL. It takes effect if OperateType is 0.

	DatabaseID  int64
	UserID      string
	SpaceID     int64
	ConnectorID *int64
	SQLParams   []*SQLParamVal
	TableType   table.TableType
	OperateType OperateType

	// set the following values if OperateType is not 0.
	SelectFieldList *SelectFieldList
	OrderByList     []OrderBy
	Limit           *int64
	Offset          *int64
	Condition       *ComplexCondition
	UpsertRows      []*UpsertRow
}

type ExecuteSQLResponse struct {
	// Records contains the query result, where each map represents a row.
	// The map's key is the column name, and the value is the raw data from the database.
	// The caller is responsible for type assertion and conversion to the desired format.
	// Common types returned by database drivers include:
	//   - Text:    []uint8 (can be converted to string)
	//   - Number:  int64
	//   - Float:   float64
	//   - Boolean: bool
	//   - Date:    time.Time
	Records      []map[string]any
	FieldList    []*FieldItem
	RowsAffected *int64
}

type PublishDatabaseRequest struct {
	AgentID int64
}

type PublishDatabaseResponse struct {
	OnlineDatabases []*bot_common.Database
}

type SQLParamVal struct {
	ValueType table.FieldItemType
	ISNull    bool
	Value     *string
	Name      *string
}

type OrderBy struct {
	Field     string
	Direction table.SortDirection
}

type UpsertRow struct {
	Records []*Record
}

type Record struct {
	FieldId    string
	FieldValue string
}

type SelectFieldList struct {
	FieldID    []string
	IsDistinct bool
}

type ComplexCondition struct {
	Conditions []*Condition
	// NestedConditions *ComplexCondition
	Logic Logic
}

type Condition struct {
	Left      string
	Operation Operation
	Right     string
}

type FieldItem struct {
	Name          string
	Desc          string
	Type          table.FieldItemType
	MustRequired  bool
	AlterID       int64
	IsSystemField bool
	PhysicalName  string
	// ID            int64
}

type Database struct {
	ID      int64
	IconURI string

	CreatorID int64
	SpaceID   int64

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

	AppID           int64
	IconURL         string
	TableName       string
	TableDesc       string
	Status          table.BotTableStatus
	FieldList       []*FieldItem
	ActualTableName string
	RwMode          table.BotTableRWMode
	PromptDisabled  bool
	IsVisible       bool
	DraftID         *int64
	OnlineID        *int64
	ExtraInfo       map[string]string
	IsAddedToAgent  *bool
	TableType       *table.TableType
}

func (d *Database) GetDraftID() int64 {
	if d.DraftID == nil {
		return 0
	}

	return *d.DraftID
}

func (d *Database) GetOnlineID() int64 {
	if d.OnlineID == nil {
		return 0
	}

	return *d.OnlineID
}

type DatabaseBasic struct {
	ID            int64
	TableType     table.TableType
	NeedSysFields bool
}

type DeleteDatabaseRequest struct {
	ID int64
}

type AgentToDatabase struct {
	AgentID        int64
	DatabaseID     int64
	TableType      table.TableType
	PromptDisabled bool
}

type AgentToDatabaseBasic struct {
	AgentID    int64
	DatabaseID int64
}

type BindDatabaseToAgentRequest struct {
	DraftDatabaseID int64
	AgentID         int64
}

type UnBindDatabaseToAgentRequest struct {
	DraftDatabaseID int64
	AgentID         int64
}

type MGetDatabaseRequest struct {
	Basics []*DatabaseBasic
}
type MGetDatabaseResponse struct {
	Databases []*Database
}

type GetAllDatabaseByAppIDRequest struct {
	AppID int64
}

type GetAllDatabaseByAppIDResponse struct {
	Databases []*Database // online databases
}
