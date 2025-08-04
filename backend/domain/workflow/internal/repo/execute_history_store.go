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
	"errors"
	"fmt"
	"strconv"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/repo/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/repo/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type executeHistoryStoreImpl struct {
	query *query.Query
	redis cache.Cmdable
}

func (e *executeHistoryStoreImpl) CreateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution) (err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	var mode int32
	if execution.Mode == vo.ExecuteModeDebug {
		mode = 1
	} else if execution.Mode == vo.ExecuteModeRelease {
		mode = 2
	} else if execution.Mode == vo.ExecuteModeNodeDebug {
		mode = 3
	}

	var syncPattern int32
	switch execution.SyncPattern {
	case vo.SyncPatternSync:
		syncPattern = 1
	case vo.SyncPatternAsync:
		syncPattern = 2
	case vo.SyncPatternStream:
		syncPattern = 3
	default:
	}

	wfExec := &model.WorkflowExecution{
		ID:              execution.ID,
		WorkflowID:      execution.WorkflowID,
		Version:         execution.Version,
		SpaceID:         execution.SpaceID,
		Mode:            mode,
		OperatorID:      execution.Operator,
		Status:          int32(entity.WorkflowRunning),
		Input:           ptr.FromOrDefault(execution.Input, ""),
		RootExecutionID: execution.RootExecutionID,
		ParentNodeID:    ptr.FromOrDefault(execution.ParentNodeID, ""),
		AppID:           ptr.FromOrDefault(execution.AppID, 0),
		AgentID:         ptr.FromOrDefault(execution.AgentID, 0),
		ConnectorID:     execution.ConnectorID,
		ConnectorUID:    execution.ConnectorUID,
		NodeCount:       execution.NodeCount,
		SyncPattern:     syncPattern,
		CommitID:        execution.CommitID,
		LogID:           execution.LogID,
	}

	if execution.ParentNodeID == nil {
		return e.query.WorkflowExecution.WithContext(ctx).Create(wfExec)
	}

	return e.query.Transaction(func(tx *query.Query) error {
		if err := e.query.WorkflowExecution.WithContext(ctx).Create(wfExec); err != nil {
			return err
		}

		// update the parent node execution's sub execute id
		if _, err := e.query.NodeExecution.WithContext(ctx).Where(e.query.NodeExecution.ID.Eq(*execution.ParentNodeExecuteID)).
			UpdateColumn(e.query.NodeExecution.SubExecuteID, wfExec.ID); err != nil {
			return err
		}

		return nil
	})
}

func (e *executeHistoryStoreImpl) UpdateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution,
	allowedStatus []entity.WorkflowExecuteStatus) (_ int64, _ entity.WorkflowExecuteStatus, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	// Use map[string]any to explicitly specify fields for update
	updateMap := map[string]any{
		"status":          int32(execution.Status),
		"output":          ptr.FromOrDefault(execution.Output, ""),
		"duration":        execution.Duration.Milliseconds(),
		"error_code":      ptr.FromOrDefault(execution.ErrorCode, ""),
		"fail_reason":     ptr.FromOrDefault(execution.FailReason, ""),
		"resume_event_id": ptr.FromOrDefault(execution.CurrentResumingEventID, 0),
	}

	if execution.TokenInfo != nil {
		updateMap["input_tokens"] = execution.TokenInfo.InputTokens
		updateMap["output_tokens"] = execution.TokenInfo.OutputTokens
	}

	statuses := slices.Transform(allowedStatus, func(e entity.WorkflowExecuteStatus) int32 {
		return int32(e)
	})

	info, err := e.query.WorkflowExecution.WithContext(ctx).Where(e.query.WorkflowExecution.ID.Eq(execution.ID),
		e.query.WorkflowExecution.Status.In(statuses...)).Updates(updateMap)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to update workflow execution: %w", err)
	}

	if info.RowsAffected == 0 {
		wfExe, found, err := e.GetWorkflowExecution(ctx, execution.ID)
		if err != nil {
			return 0, 0, err
		}

		if !found {
			return 0, 0, fmt.Errorf("workflow execution not found for ID %d", execution.ID)
		}

		return 0, wfExe.Status, nil
	}

	return info.RowsAffected, execution.Status, nil
}

func (e *executeHistoryStoreImpl) TryLockWorkflowExecution(ctx context.Context, wfExeID, resumingEventID int64) (
	_ bool, _ entity.WorkflowExecuteStatus, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	// Update WorkflowExecution set current_resuming_event_id = resumingEventID, status = 1
	// where id = wfExeID and current_resuming_event_id = 0 and status = 5
	result, err := e.query.WorkflowExecution.WithContext(ctx).
		Where(e.query.WorkflowExecution.ID.Eq(wfExeID)).
		Where(e.query.WorkflowExecution.ResumeEventID.Eq(0)).
		Where(e.query.WorkflowExecution.Status.Eq(int32(entity.WorkflowInterrupted))).
		Updates(map[string]interface{}{
			"resume_event_id": resumingEventID,
			"status":          int32(entity.WorkflowRunning),
		})

	if err != nil {
		return false, 0, fmt.Errorf("update workflow execution lock failed: %w", err)
	}

	// If no rows were updated, the lock attempt failed
	if result.RowsAffected == 0 {
		wfExe, found, err := e.GetWorkflowExecution(ctx, wfExeID)
		if err != nil {
			return false, 0, err
		}
		if !found {
			return false, 0, fmt.Errorf("workflow execution not found for ID %d", wfExeID)
		}

		return false, wfExe.Status, nil
	}

	return true, entity.WorkflowInterrupted, nil
}

func (e *executeHistoryStoreImpl) GetWorkflowExecution(ctx context.Context, id int64) (*entity.WorkflowExecution, bool, error) {
	rootExes, err := e.query.WorkflowExecution.WithContext(ctx).
		Where(e.query.WorkflowExecution.ID.Eq(id)).
		Find()
	if err != nil {
		return nil, false, vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("failed to find workflow execution: %v", err))
	}

	if len(rootExes) == 0 {
		return nil, false, nil
	}

	rootExe := rootExes[0]
	var exeMode vo.ExecuteMode
	if rootExe.Mode == 1 {
		exeMode = vo.ExecuteModeDebug
	} else if rootExe.Mode == 2 {
		exeMode = vo.ExecuteModeRelease
	} else {
		exeMode = vo.ExecuteModeNodeDebug
	}

	var syncPattern vo.SyncPattern
	switch rootExe.SyncPattern {
	case 1:
		syncPattern = vo.SyncPatternSync
	case 2:
		syncPattern = vo.SyncPatternAsync
	case 3:
		syncPattern = vo.SyncPatternStream
	default:
	}

	exe := &entity.WorkflowExecution{
		ID:         rootExe.ID,
		WorkflowID: rootExe.WorkflowID,
		Version:    rootExe.Version,
		SpaceID:    rootExe.SpaceID,
		ExecuteConfig: vo.ExecuteConfig{
			Operator:     rootExe.OperatorID,
			Mode:         exeMode,
			AppID:        ternary.IFElse(rootExe.AppID > 0, ptr.Of(rootExe.AppID), nil),
			AgentID:      ternary.IFElse(rootExe.AgentID > 0, ptr.Of(rootExe.AgentID), nil),
			ConnectorID:  rootExe.ConnectorID,
			ConnectorUID: rootExe.ConnectorUID,
			SyncPattern:  syncPattern,
		},
		CreatedAt:  time.UnixMilli(rootExe.CreatedAt),
		LogID:      rootExe.LogID,
		NodeCount:  rootExe.NodeCount,
		Status:     entity.WorkflowExecuteStatus(rootExe.Status),
		Duration:   time.Duration(rootExe.Duration) * time.Millisecond,
		Input:      &rootExe.Input,
		Output:     &rootExe.Output,
		ErrorCode:  &rootExe.ErrorCode,
		FailReason: &rootExe.FailReason,
		TokenInfo: &entity.TokenUsage{
			InputTokens:  rootExe.InputTokens,
			OutputTokens: rootExe.OutputTokens,
		},
		UpdatedAt:              ternary.IFElse(rootExe.UpdatedAt > 0, ptr.Of(time.UnixMilli(rootExe.UpdatedAt)), nil),
		ParentNodeID:           ptr.Of(rootExe.ParentNodeID),
		ParentNodeExecuteID:    nil, // keep it nil here, query parent node execution separately
		NodeExecutions:         nil, // keep it nil here, query node executions separately
		RootExecutionID:        rootExe.RootExecutionID,
		CurrentResumingEventID: ternary.IFElse(rootExe.ResumeEventID == 0, nil, ptr.Of(rootExe.ResumeEventID)),
		CommitID:               rootExe.CommitID,
	}

	return exe, true, nil
}

func (e *executeHistoryStoreImpl) CreateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error {
	nodeExec := &model.NodeExecution{
		ID:                 execution.ID,
		ExecuteID:          execution.ExecuteID,
		NodeID:             execution.NodeID,
		NodeName:           execution.NodeName,
		NodeType:           string(execution.NodeType),
		Status:             int32(entity.NodeRunning),
		Input:              ptr.FromOrDefault(execution.Input, ""),
		CompositeNodeIndex: int64(execution.Index),
		CompositeNodeItems: ptr.FromOrDefault(execution.Items, ""),
		ParentNodeID:       ptr.FromOrDefault(execution.ParentNodeID, ""),
	}

	if execution.Extra != nil {
		m, err := sonic.MarshalString(execution.Extra)
		if err != nil {
			return vo.WrapError(errno.ErrSerializationDeserializationFail,
				fmt.Errorf("failed to marshal extra: %w", err))
		}
		nodeExec.Extra = m
	}

	return e.query.NodeExecution.WithContext(ctx).Create(nodeExec)
}

func (e *executeHistoryStoreImpl) UpdateNodeExecutionStreaming(ctx context.Context, execution *entity.NodeExecution) error {
	if execution.Output == nil {
		return nil
	}

	key := fmt.Sprintf(nodeExecOutputKey, execution.ID)

	if err := e.redis.Set(ctx, key, execution.Output, nodeExecDataExpiry).Err(); err != nil {
		return vo.WrapError(errno.ErrRedisError, err)
	}

	return nil
}

func (e *executeHistoryStoreImpl) UpdateNodeExecution(ctx context.Context, execution *entity.NodeExecution) (err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	nodeExec := &model.NodeExecution{
		Status:     int32(execution.Status),
		Input:      ptr.FromOrDefault(execution.Input, ""),
		Output:     ptr.FromOrDefault(execution.Output, ""),
		RawOutput:  ptr.FromOrDefault(execution.RawOutput, ""),
		Duration:   execution.Duration.Milliseconds(),
		ErrorInfo:  ptr.FromOrDefault(execution.ErrorInfo, ""),
		ErrorLevel: ptr.FromOrDefault(execution.ErrorLevel, ""),
	}

	if execution.TokenInfo != nil {
		nodeExec.InputTokens = execution.TokenInfo.InputTokens
		nodeExec.OutputTokens = execution.TokenInfo.OutputTokens
	}

	if execution.Extra != nil {
		m, err := sonic.MarshalString(execution.Extra)
		if err != nil {
			return fmt.Errorf("failed to marshal extra: %w", err)
		}
		nodeExec.Extra = m
	}

	if execution.SubWorkflowExecution != nil {
		nodeExec.SubExecuteID = execution.SubWorkflowExecution.ID
	}

	_, err = e.query.NodeExecution.WithContext(ctx).Where(e.query.NodeExecution.ID.Eq(execution.ID)).Updates(nodeExec)
	if err != nil {
		return fmt.Errorf("failed to update node execution: %w", err)
	}

	return nil
}

func (e *executeHistoryStoreImpl) CancelAllRunningNodes(ctx context.Context, wfExeID int64) (err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	_, err = e.query.NodeExecution.WithContext(ctx).
		Where(e.query.NodeExecution.ExecuteID.Eq(wfExeID),
			e.query.NodeExecution.Status.In(int32(entity.NodeRunning))).
		Updates(map[string]interface{}{
			"error_info":  "workflow cancel by user",
			"error_level": vo.LevelCancel,
			"status":      int32(entity.NodeFailed),
		})
	if err != nil {
		return fmt.Errorf("failed to cancel running nodes: %w", err)
	}

	_, err = e.query.WorkflowExecution.WithContext(ctx).
		Where(e.query.WorkflowExecution.RootExecutionID.Eq(wfExeID)).
		Updates(map[string]interface{}{
			"status":      int32(entity.WorkflowCancel),
			"fail_reason": "workflow cancel by user",
			"error_code":  strconv.Itoa(errno.ErrWorkflowCanceledByUser),
		})
	if err != nil {
		return fmt.Errorf("failed to cancel workflow execution: %w", err)
	}
	return nil
}

func convertNodeExecution(nodeExec *model.NodeExecution) *entity.NodeExecution {
	nodeExeEntity := &entity.NodeExecution{
		ID:                   nodeExec.ID,
		ExecuteID:            nodeExec.ExecuteID,
		NodeID:               nodeExec.NodeID,
		NodeName:             nodeExec.NodeName,
		NodeType:             entity.NodeType(nodeExec.NodeType),
		CreatedAt:            time.UnixMilli(nodeExec.CreatedAt),
		Status:               entity.NodeExecuteStatus(nodeExec.Status),
		Duration:             time.Duration(nodeExec.Duration) * time.Millisecond,
		Input:                &nodeExec.Input,
		Output:               &nodeExec.Output,
		RawOutput:            &nodeExec.RawOutput,
		ErrorInfo:            &nodeExec.ErrorInfo,
		ErrorLevel:           &nodeExec.ErrorLevel,
		TokenInfo:            &entity.TokenUsage{InputTokens: nodeExec.InputTokens, OutputTokens: nodeExec.OutputTokens},
		ParentNodeID:         ternary.IFElse(nodeExec.ParentNodeID != "", ptr.Of(nodeExec.ParentNodeID), nil),
		Index:                int(nodeExec.CompositeNodeIndex),
		Items:                ternary.IFElse(nodeExec.CompositeNodeItems != "", ptr.Of(nodeExec.CompositeNodeItems), nil),
		SubWorkflowExecution: ternary.IFElse(nodeExec.SubExecuteID > 0, &entity.WorkflowExecution{ID: nodeExec.SubExecuteID}, nil),
	}

	if nodeExec.UpdatedAt > 0 {
		nodeExeEntity.UpdatedAt = ptr.Of(time.UnixMilli(nodeExec.UpdatedAt))
	}

	if nodeExec.SubExecuteID > 0 {
		nodeExeEntity.SubWorkflowExecution = &entity.WorkflowExecution{
			ID: nodeExec.SubExecuteID,
		}
	}

	if len(nodeExec.Extra) > 0 {
		var extra entity.NodeExtra
		if err := sonic.UnmarshalString(nodeExec.Extra, &extra); err != nil {
			logs.Errorf("failed to unmarshal extra: %v", err)
		} else {
			nodeExeEntity.Extra = &extra
		}
	}

	return nodeExeEntity
}

func (e *executeHistoryStoreImpl) GetNodeExecutionsByWfExeID(ctx context.Context, wfExeID int64) (result []*entity.NodeExecution, err error) {
	nodeExecs, err := e.query.NodeExecution.WithContext(ctx).
		Where(e.query.NodeExecution.ExecuteID.Eq(wfExeID)).
		Find()
	if err != nil {
		return nil, vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("failed to find node executions: %v", err))
	}

	for _, nodeExec := range nodeExecs {
		nodeExeEntity := convertNodeExecution(nodeExec)
		// For nodes that are currently running and support streaming, their complete information needs to be retrieved from Redis.
		if nodeExeEntity.Status == entity.NodeRunning {
			meta := entity.NodeMetaByNodeType(nodeExeEntity.NodeType)
			if meta.ExecutableMeta.IncrementalOutput {
				if err := e.loadNodeExecutionFromRedis(ctx, nodeExeEntity); err != nil {
					logs.CtxErrorf(ctx, "failed to load node execution from redis: %v", err)
				}
			}
		}
		result = append(result, nodeExeEntity)
	}
	return result, nil
}

func (e *executeHistoryStoreImpl) loadNodeExecutionFromRedis(ctx context.Context, nodeExeEntity *entity.NodeExecution) error {
	key := fmt.Sprintf(nodeExecOutputKey, nodeExeEntity.ID)

	result, err := e.redis.Get(ctx, key).Result()
	if err != nil {
		if errors.Is(err, cache.Nil) {
			return nil
		}
		return vo.WrapError(errno.ErrRedisError, err)
	}

	if result != "" {
		nodeExeEntity.Output = &result
	}

	return nil
}

func (e *executeHistoryStoreImpl) GetNodeExecution(ctx context.Context, wfExeID int64, nodeID string) (*entity.NodeExecution, bool, error) {
	nodeExec, err := e.query.NodeExecution.WithContext(ctx).
		Where(e.query.NodeExecution.ExecuteID.Eq(wfExeID), e.query.NodeExecution.NodeID.Eq(nodeID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("failed to find node executions: %w", err))
	}

	nodeExeEntity := convertNodeExecution(nodeExec)

	return nodeExeEntity, true, nil
}

func (e *executeHistoryStoreImpl) GetNodeExecutionByParent(ctx context.Context, wfExeID int64, parentNodeID string) (
	[]*entity.NodeExecution, error) {
	nodeExecs, err := e.query.NodeExecution.WithContext(ctx).
		Where(e.query.NodeExecution.ExecuteID.Eq(wfExeID), e.query.NodeExecution.ParentNodeID.Eq(parentNodeID)).
		Find()
	if err != nil {
		return nil, vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("failed to find node executions: %w", err))
	}
	var result []*entity.NodeExecution
	for _, nodeExec := range nodeExecs {
		nodeExeEntity := convertNodeExecution(nodeExec)
		result = append(result, nodeExeEntity)
	}
	return result, nil
}

const (
	testRunLastExeKey   = "test_run_last_exe_id:%d:%d"
	nodeDebugLastExeKey = "node_debug_last_exe_id:%d:%s:%d"
	nodeExecDataExpiry  = 24 * time.Hour // keep it for 24 hours
	nodeExecOutputKey   = "wf:node_exec:output:%d"
)

func (e *executeHistoryStoreImpl) SetTestRunLatestExeID(ctx context.Context, wfID int64, uID int64, exeID int64) error {
	key := fmt.Sprintf(testRunLastExeKey, wfID, uID)
	err := e.redis.Set(ctx, key, exeID, 7*24*time.Hour).Err()
	if err != nil {
		return vo.WrapError(errno.ErrRedisError, err)
	}

	return nil
}

func (e *executeHistoryStoreImpl) GetTestRunLatestExeID(ctx context.Context, wfID int64, uID int64) (int64, error) {
	key := fmt.Sprintf(testRunLastExeKey, wfID, uID)
	exeIDStr, err := e.redis.Get(ctx, key).Result()
	if err != nil {
		if errors.Is(err, cache.Nil) {
			return 0, nil
		}
		return 0, vo.WrapError(errno.ErrRedisError, err)
	}
	exeID, err := strconv.ParseInt(exeIDStr, 10, 64)
	if err != nil {
		return 0, err
	}
	return exeID, nil
}

func (e *executeHistoryStoreImpl) SetNodeDebugLatestExeID(ctx context.Context, wfID int64, nodeID string, uID int64, exeID int64) error {
	key := fmt.Sprintf(nodeDebugLastExeKey, wfID, nodeID, uID)
	err := e.redis.Set(ctx, key, exeID, 7*24*time.Hour).Err()
	if err != nil {
		return vo.WrapError(errno.ErrRedisError, err)
	}
	return nil
}

func (e *executeHistoryStoreImpl) GetNodeDebugLatestExeID(ctx context.Context, wfID int64, nodeID string, uID int64) (int64, error) {
	key := fmt.Sprintf(nodeDebugLastExeKey, wfID, nodeID, uID)
	exeIDStr, err := e.redis.Get(ctx, key).Result()
	if err != nil {
		if errors.Is(err, cache.Nil) {
			return 0, nil
		}
		return 0, vo.WrapError(errno.ErrRedisError, err)
	}
	exeID, err := strconv.ParseInt(exeIDStr, 10, 64)
	if err != nil {
		return 0, err
	}
	return exeID, nil
}
