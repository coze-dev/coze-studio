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

package repo

import (
	"context"
	"fmt"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/alicebob/miniredis/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/repo/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/cache"
	"github.com/coze-dev/coze-studio/backend/infra/cache/impl/redis"
)

type ExecuteHistoryStoreSuite struct {
	suite.Suite
	db    *gorm.DB
	redis cache.Cmdable
	mock  sqlmock.Sqlmock
	store *executeHistoryStoreImpl
}

func (s *ExecuteHistoryStoreSuite) SetupTest() {
	var err error
	mr, err := miniredis.Run()
	assert.NoError(s.T(), err)
	s.redis = redis.NewWithAddrAndPassword(mr.Addr(), "")

	mockDB, mock, err := sqlmock.New()
	assert.NoError(s.T(), err)
	s.mock = mock

	dialector := mysql.New(mysql.Config{
		Conn:                      mockDB,
		SkipInitializeWithVersion: true,
	})
	s.db, err = gorm.Open(dialector, &gorm.Config{})
	assert.NoError(s.T(), err)

	s.store = &executeHistoryStoreImpl{
		query: query.Use(s.db),
		redis: s.redis,
	}
}

func (s *ExecuteHistoryStoreSuite) TestNodeExecutionStreaming() {
	ctx := context.Background()
	wfExeID := int64(1)
	nodeExecID := int64(12345)
	nodeExecution := &entity.NodeExecution{
		ID:        nodeExecID,
		ExecuteID: wfExeID,
		NodeID:    "54321",
		NodeName:  "Test Node",
		NodeType:  entity.NodeTypeOutputEmitter,
		Status:    entity.NodeRunning,
	}

	// 1. CreateNodeExecution
	s.mock.ExpectBegin()
	s.mock.ExpectExec(regexp.QuoteMeta(
		"INSERT INTO `node_execution` (`execute_id`,`node_id`,`node_name`,`node_type`,`created_at`,`status`,`duration`,`input`,`output`,`raw_output`,`error_info`,`error_level`,`input_tokens`,`output_tokens`,`updated_at`,`composite_node_index`,`composite_node_items`,`parent_node_id`,`sub_execute_id`,`extra`,`id`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")).
		WithArgs(nodeExecution.ExecuteID, nodeExecution.NodeID, nodeExecution.NodeName, string(nodeExecution.NodeType), sqlmock.AnyArg(), int32(entity.NodeRunning), int64(0), "", "", "", "", "", int64(0), int64(0), sqlmock.AnyArg(), int64(0), "", "", int64(0), "", nodeExecution.ID).
		WillReturnResult(sqlmock.NewResult(1, 1))
	s.mock.ExpectCommit()

	err := s.store.CreateNodeExecution(ctx, nodeExecution)
	assert.NoError(s.T(), err)

	// 2. UpdateNodeExecutionStreaming
	streamingOutput := "streaming output"
	nodeExecution.Output = &streamingOutput
	err = s.store.UpdateNodeExecutionStreaming(ctx, nodeExecution)
	assert.NoError(s.T(), err)

	val, err := s.redis.Get(ctx, fmt.Sprintf("wf:node_exec:output:%d", nodeExecID)).Result()
	assert.NoError(s.T(), err)
	assert.Equal(s.T(), streamingOutput, val)

	// 3. GetNodeExecutionsByWfExeID
	rows := sqlmock.NewRows([]string{"id", "execute_id", "node_id", "node_name", "node_type", "status", "created_at"}).
		AddRow(nodeExecution.ID, nodeExecution.ExecuteID, nodeExecution.NodeID, nodeExecution.NodeName, string(nodeExecution.NodeType), int32(entity.NodeRunning), time.Now().UnixMilli())
	s.mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT * FROM `node_execution` WHERE `node_execution`.`execute_id` = ?")).
		WithArgs(wfExeID).
		WillReturnRows(rows)

	execs, err := s.store.GetNodeExecutionsByWfExeID(ctx, wfExeID)
	assert.NoError(s.T(), err)
	assert.Len(s.T(), execs, 1)
	assert.Equal(s.T(), streamingOutput, *execs[0].Output)
}

func TestExecuteHistoryStore(t *testing.T) {
	suite.Run(t, new(ExecuteHistoryStoreSuite))
}
