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

package model

import (
	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/data/database/table"
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

type SQLParam struct {
	Value  string
	IsNull bool
}
type CustomSQLRequest struct {
	DatabaseInfoID int64
	SQL            string
	Params         []SQLParam
	IsDebugRun     bool
	UserID         string
	ConnectorID    int64
}

type Object = map[string]any

type Response struct {
	RowNumber *int64
	Objects   []Object
}

type Operator string
type ClauseRelation string

const (
	ClauseRelationAND ClauseRelation = "and"
	ClauseRelationOR  ClauseRelation = "or"
)

const (
	OperatorEqual          Operator = "="
	OperatorNotEqual       Operator = "!="
	OperatorGreater        Operator = ">"
	OperatorLesser         Operator = "<"
	OperatorGreaterOrEqual Operator = ">="
	OperatorLesserOrEqual  Operator = "<="
	OperatorIn             Operator = "in"
	OperatorNotIn          Operator = "not_in"
	OperatorIsNull         Operator = "is_null"
	OperatorIsNotNull      Operator = "is_not_null"
	OperatorLike           Operator = "like"
	OperatorNotLike        Operator = "not_like"
)

type ClauseGroup struct {
	Single *Clause
	Multi  *MultiClause
}
type Clause struct {
	Left     string
	Operator Operator
}
type MultiClause struct {
	Clauses  []*Clause
	Relation ClauseRelation
}

type ConditionStr struct {
	Left     string
	Operator Operator
	Right    any
}

type ConditionGroup struct {
	Conditions []*ConditionStr
	Relation   ClauseRelation
}

type DeleteRequest struct {
	DatabaseInfoID int64
	ConditionGroup *ConditionGroup
	IsDebugRun     bool
	UserID         string
	ConnectorID    int64
}

type QueryRequest struct {
	DatabaseInfoID int64
	SelectFields   []string
	Limit          int64
	ConditionGroup *ConditionGroup
	OrderClauses   []*OrderClause
	IsDebugRun     bool
	UserID         string
	ConnectorID    int64
}

type OrderClause struct {
	FieldID string
	IsAsc   bool
}
type UpdateRequest struct {
	DatabaseInfoID int64
	ConditionGroup *ConditionGroup
	Fields         map[string]any
	IsDebugRun     bool
	UserID         string
	ConnectorID    int64
}

type InsertRequest struct {
	DatabaseInfoID int64
	Fields         map[string]any
	IsDebugRun     bool
	UserID         string
	ConnectorID    int64
}
