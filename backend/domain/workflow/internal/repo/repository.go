package repo

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/bytedance/sonic"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/redis/go-redis/v9"
	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas/adaptor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	model2 "code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
)

type RepositoryImpl struct {
	idGen idgen.IDGenerator
	query *query.Query
	redis *redis.Client
	tos   storage.Storage
}

func NewRepository(idgen idgen.IDGenerator, db *gorm.DB, redis *redis.Client, tos storage.Storage) workflow.Repository {
	return &RepositoryImpl{
		idGen: idgen,
		query: query.Use(db),
		redis: redis,
		tos:   tos,
	}
}

func (r *RepositoryImpl) GetSubWorkflowCanvas(ctx context.Context, parent *vo.Node) (*vo.Canvas, error) {
	idStr := parent.Data.Inputs.WorkflowID
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse workflow id: %w", err)
	}

	version := parent.Data.Inputs.WorkflowVersion
	if version == "" {
		draft, err := r.GetWorkflowDraft(ctx, id)
		if err != nil {
			return nil, err
		}

		var canvas vo.Canvas
		err = sonic.UnmarshalString(draft.Canvas, &canvas)
		if err != nil {
			return nil, err
		}

		return &canvas, nil
	}

	versionInfo, err := r.GetWorkflowVersion(ctx, id, version)
	if err != nil {
		return nil, err
	}
	var canvas vo.Canvas
	err = sonic.UnmarshalString(versionInfo.Canvas, &canvas)
	if err != nil {
		return nil, err
	}
	return &canvas, nil
}

func (r *RepositoryImpl) MGetWorkflowCanvas(ctx context.Context, entities []*entity.WorkflowIdentity) (map[int64]*vo.Canvas, error) {
	draftIDs := make([]int64, 0, len(entities))
	versionEntities := make([]*entity.WorkflowIdentity, 0, len(entities))
	result := make(map[int64]*vo.Canvas)
	for _, e := range entities {
		if e.Version == "" {
			draftIDs = append(draftIDs, e.ID)
		} else {
			versionEntities = append(versionEntities, e)
		}
	}

	if len(draftIDs) > 0 {
		draftVersions, err := r.MGetWorkflowDraft(ctx, draftIDs)
		if err != nil {
			return nil, err
		}
		for id, v := range draftVersions {
			c := &vo.Canvas{}
			err = sonic.UnmarshalString(v.Canvas, c)
			if err != nil {
				return nil, err
			}
			result[id] = c
		}
	}
	if len(versionEntities) > 0 {
		for _, v := range versionEntities {
			version, err := r.GetWorkflowVersion(ctx, v.ID, v.Version)
			if err != nil {
				return nil, err
			}
			c := &vo.Canvas{}
			err = sonic.UnmarshalString(version.Canvas, c)
			if err != nil {
				return nil, err
			}

			result[v.ID] = c
		}

	}

	return result, nil
}

func (r *RepositoryImpl) GenID(ctx context.Context) (int64, error) {
	return r.idGen.GenID(ctx)
}

func (r *RepositoryImpl) CreateWorkflowMeta(ctx context.Context, wf *entity.Workflow, ref *entity.WorkflowReference) (int64, error) {
	id, err := r.GenID(ctx)
	if err != nil {
		return 0, err
	}
	wfMeta := &model2.WorkflowMeta{
		ID:          id,
		Name:        wf.Name,
		Description: wf.Desc,
		IconURI:     wf.IconURI,
		ContentType: int32(wf.ContentType),
		Mode:        int32(wf.Mode),
		CreatorID:   wf.CreatorID,
		AuthorID:    wf.AuthorID,
		SpaceID:     wf.SpaceID,
		DeletedAt:   gorm.DeletedAt{Valid: false},
	}

	if wf.Tag != nil {
		wfMeta.Tag = int32(*wf.Tag)
	}

	if wf.SourceID != nil {
		wfMeta.SourceID = *wf.SourceID
	}

	if wf.ProjectID != nil {
		wfMeta.ProjectID = *wf.ProjectID
	}

	if ref == nil {
		if err = r.query.WorkflowMeta.Create(wfMeta); err != nil {
			return 0, fmt.Errorf("create workflow meta: %w", err)
		}

		return id, nil
	}

	wfRef := &model2.WorkflowReference{
		ID:               id,
		SpaceID:          wfMeta.SpaceID,
		ReferringID:      ref.ReferringID,
		ReferType:        int32(ref.ReferType),
		ReferringBizType: int32(ref.ReferringBizType),
		CreatorID:        wfMeta.CreatorID,
		Stage:            int32(entity.StageDraft),
	}

	if err = r.query.Transaction(func(tx *query.Query) error {
		if err = tx.WorkflowMeta.Create(wfMeta); err != nil {
			return fmt.Errorf("create workflow meta: %w", err)
		}
		if err = tx.WorkflowReference.WithContext(ctx).Create(wfRef); err != nil {
			return fmt.Errorf("create workflow reference: %w", err)
		}
		return nil
	}); err != nil {
		return 0, err
	}

	return id, nil
}

func (r *RepositoryImpl) CreateWorkflowVersion(ctx context.Context, wfID int64, v *vo.VersionInfo) (int64, error) {
	var err error

	// 1. save new version
	err = r.query.WorkflowVersion.WithContext(ctx).Create(&model2.WorkflowVersion{
		ID:                 wfID,
		Version:            v.Version,
		VersionDescription: v.VersionDescription,
		Canvas:             v.Canvas,
		InputParams:        v.InputParams,
		OutputParams:       v.OutputParams,
		CreatorID:          v.CreatorID,
	})
	if err != nil {
		return 0, fmt.Errorf("create workflow version: %w", err)
	}

	// 2. update workflow draft modify set false & test run success set true
	_, err = r.query.WorkflowDraft.WithContext(ctx).Where(r.query.WorkflowDraft.ID.Eq(wfID)).UpdateColumnSimple(
		r.query.WorkflowDraft.Modified.Value(false),
		r.query.WorkflowDraft.TestRunSuccess.Value(true),
	)
	if err != nil {
		return 0, fmt.Errorf("update workflow draft failed: %w", err)
	}

	// 3. update workflow meta status
	_, err = r.query.WorkflowMeta.WithContext(ctx).Where(r.query.WorkflowMeta.ID.Eq(wfID)).UpdateColumnSimple(
		r.query.WorkflowMeta.Status.Value(1),
	)
	if err != nil {
		return 0, fmt.Errorf("update workflow meta failed: %w", err)
	}

	return wfID, nil
}

func (r *RepositoryImpl) CreateOrUpdateDraft(ctx context.Context, id int64, canvas string, inputParams, outputParams string, resetTestRun bool) error {
	d := &model2.WorkflowDraft{
		ID:           id,
		Canvas:       canvas,
		InputParams:  inputParams,
		OutputParams: outputParams,
		Modified:     true,
	}

	workflowDraftDao := r.query.WorkflowDraft.WithContext(ctx)
	if !resetTestRun { // 不需要重置 test run 状态
		workflowDraftDao = workflowDraftDao.Omit(r.query.WorkflowDraft.TestRunSuccess)
	} else {
		// 需要重置test run 状态
		d.TestRunSuccess = false
	}
	if err := workflowDraftDao.Save(d); err != nil {
		return fmt.Errorf("save workflow draft: %w", err)
	}
	return nil
}

func (r *RepositoryImpl) UpdateWorkflowDraftTestRunSuccess(ctx context.Context, id int64) error {
	if _, err := r.query.WorkflowDraft.WithContext(ctx).Where(r.query.WorkflowDraft.ID.Eq(id)).UpdateColumnSimple(r.query.WorkflowDraft.TestRunSuccess.Value(true)); err != nil {
		return fmt.Errorf("update workflow draft test run success failed: %w", err)
	}

	return nil
}

func (r *RepositoryImpl) DeleteWorkflow(ctx context.Context, id int64) error {
	return r.query.Transaction(func(tx *query.Query) error {
		// Delete from workflow_meta
		_, err := tx.WorkflowMeta.WithContext(ctx).Where(tx.WorkflowMeta.ID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete workflow meta: %w", err)
		}

		_, err = tx.WorkflowDraft.WithContext(ctx).Where(tx.WorkflowDraft.ID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete workflow draft: %w", err)
		}

		_, err = tx.WorkflowVersion.WithContext(ctx).Where(tx.WorkflowVersion.ID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete workflow versions: %w", err)
		}

		_, err = tx.WorkflowReference.WithContext(ctx).Where(tx.WorkflowReference.ID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete workflow references: %w", err)
		}

		_, err = tx.WorkflowReference.WithContext(ctx).Where(tx.WorkflowReference.ReferringID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete incoming workflow references: %w", err)
		}

		return nil
	})
}

func (r *RepositoryImpl) GetWorkflowMeta(ctx context.Context, id int64) (*entity.Workflow, error) {
	meta, err := r.query.WorkflowMeta.WithContext(ctx).Where(r.query.WorkflowMeta.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("workflow meta not found for ID %d: %w", id, err)
		}
		return nil, fmt.Errorf("failed to get workflow meta for ID %d: %w", id, err)
	}

	url, err := r.tos.GetObjectUrl(ctx, meta.IconURI)
	if err != nil {
		return nil, fmt.Errorf("failed to get url for workflow id %d, icon uri %s: %w", id, meta.IconURI, err)
	}
	// Initialize the result entity
	wf := &entity.Workflow{
		WorkflowIdentity: entity.WorkflowIdentity{
			ID: id,
		},
		Name:        meta.Name,
		Desc:        meta.Description,
		IconURI:     meta.IconURI,
		IconURL:     url,
		ContentType: entity.ContentType(meta.ContentType),
		Mode:        entity.Mode(meta.Mode),
		CreatorID:   meta.CreatorID,
		AuthorID:    meta.AuthorID,
		SpaceID:     meta.SpaceID,
		CreatedAt:   time.UnixMilli(meta.CreatedAt),
	}
	if meta.Tag != 0 {
		tag := entity.Tag(meta.Tag)
		wf.Tag = &tag
	}
	if meta.SourceID != 0 {
		wf.SourceID = &meta.SourceID
	}
	if meta.ProjectID != 0 {
		wf.ProjectID = &meta.ProjectID
	}
	if meta.UpdatedAt > 0 {
		wf.UpdatedAt = ptr.Of(time.UnixMilli(meta.UpdatedAt))
	}
	if meta.Status > 0 {
		wf.HasPublished = true
	}

	return wf, nil
}

func (r *RepositoryImpl) UpdateWorkflowMeta(ctx context.Context, wf *entity.Workflow) error {

	_, err := r.query.WorkflowMeta.WithContext(ctx).Where(r.query.WorkflowMeta.ID.Eq(wf.ID)).UpdateColumnSimple(
		r.query.WorkflowMeta.Name.Value(wf.Name),
		r.query.WorkflowMeta.Description.Value(wf.Desc),
		r.query.WorkflowMeta.IconURI.Value(wf.IconURI),
	)
	if err != nil {
		return fmt.Errorf("update workflow meta: %w", err)
	}

	return nil
}

func (r *RepositoryImpl) GetWorkflowVersion(ctx context.Context, id int64, version string) (*vo.VersionInfo, error) {
	wfVersion, err := r.query.WorkflowVersion.WithContext(ctx).
		Where(r.query.WorkflowVersion.ID.Eq(id), r.query.WorkflowVersion.Version.Eq(version)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("workflow version %s not found for ID %d: %w", version, id, err)
		}
		return nil, fmt.Errorf("failed to get workflow version %s for ID %d: %w", version, id, err)
	}

	return &vo.VersionInfo{
		Version:            version,
		VersionDescription: wfVersion.VersionDescription,
		Canvas:             wfVersion.Canvas,
		InputParams:        wfVersion.InputParams,
		OutputParams:       wfVersion.OutputParams,
		CreatorID:          wfVersion.CreatorID,
		CreatedAt:          wfVersion.CreatedAt,
		UpdaterID:          wfVersion.UpdaterID,
		UpdatedAt:          wfVersion.UpdatedAt,
	}, nil
}

func (r *RepositoryImpl) GetWorkflowDraft(ctx context.Context, id int64) (*vo.DraftInfo, error) {
	draft, err := r.query.WorkflowDraft.WithContext(ctx).Where(r.query.WorkflowDraft.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("workflow draft not found for ID %d: %w", id, err)
		}
		return nil, fmt.Errorf("failed to get workflow draft for ID %d: %w", id, err)
	}
	return &vo.DraftInfo{
		Canvas:         draft.Canvas,
		TestRunSuccess: draft.TestRunSuccess,
		Modified:       draft.Modified,
		InputParams:    draft.InputParams,
		OutputParams:   draft.OutputParams,
		CreatedAt:      draft.CreatedAt,
		UpdatedAt:      draft.UpdatedAt,
	}, nil
}

func (r *RepositoryImpl) MGetWorkflowDraft(ctx context.Context, ids []int64) (map[int64]*vo.DraftInfo, error) {
	drafts, err := r.query.WorkflowDraft.WithContext(ctx).Where(r.query.WorkflowDraft.ID.In(ids...)).Find()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return map[int64]*vo.DraftInfo{}, nil
		}
		return nil, fmt.Errorf("failed to get workflow draft for IDs %v: %w", ids, err)
	}

	result := make(map[int64]*vo.DraftInfo, len(drafts))
	for _, draft := range drafts {
		result[draft.ID] = &vo.DraftInfo{
			Canvas:         draft.Canvas,
			TestRunSuccess: draft.TestRunSuccess,
			Modified:       draft.Modified,
			InputParams:    draft.InputParams,
			OutputParams:   draft.OutputParams,
			CreatedAt:      draft.CreatedAt,
			UpdatedAt:      draft.UpdatedAt,
		}
	}
	return result, nil
}

func (r *RepositoryImpl) GetWorkflowReference(ctx context.Context, id int64) ([]*entity.WorkflowReference, error) {
	// Query workflow_reference table for records matching the ID
	refs, err := r.query.WorkflowReference.WithContext(ctx).Where(r.query.WorkflowReference.ID.Eq(id)).Find()
	if err != nil {
		// Don't treat RecordNotFound as an error, just return an empty slice
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return []*entity.WorkflowReference{}, nil
		}
		return nil, fmt.Errorf("failed to query workflow references for ID %d: %w", id, err)
	}

	// Convert model objects to entity objects
	result := make([]*entity.WorkflowReference, 0, len(refs))
	for _, ref := range refs {
		result = append(result, &entity.WorkflowReference{
			ID:               ref.ID,
			SpaceID:          ref.SpaceID,
			ReferringID:      ref.ReferringID,
			ReferType:        entity.ReferType(ref.ReferType),
			ReferringBizType: entity.ReferringBizType(ref.ReferringBizType),
			CreatorID:        ref.CreatorID,
			Stage:            entity.Stage(ref.Stage),
			CreatedAt:        time.UnixMilli(ref.CreatedAt),
			UpdatedAt:        ptr.Of(time.UnixMilli(ref.UpdatedAt)),
		})
	}

	return result, nil
}

func (r *RepositoryImpl) CreateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution) error {
	wfExec := &model2.WorkflowExecution{
		ID:              execution.ID,
		WorkflowID:      execution.WorkflowIdentity.ID,
		Version:         execution.WorkflowIdentity.Version,
		SpaceID:         execution.SpaceID,
		Mode:            0, // TODO: how to know whether it's a debug run or release run? Version alone is not sufficient.
		OperatorID:      0, // TODO: fill operator information
		Status:          int32(entity.WorkflowRunning),
		Input:           ptr.FromOrDefault(execution.Input, ""),
		RootExecutionID: execution.RootExecutionID,
		ParentNodeID:    ptr.FromOrDefault(execution.ParentNodeID, ""),
		ProjectID:       ptr.FromOrDefault(execution.ProjectID, 0),
		NodeCount:       execution.NodeCount,
	}

	if execution.ParentNodeID == nil {
		return r.query.WorkflowExecution.WithContext(ctx).Create(wfExec)
	}

	return r.query.Transaction(func(tx *query.Query) error {
		if err := r.query.WorkflowExecution.WithContext(ctx).Create(wfExec); err != nil {
			return err
		}

		// update the parent node execution's sub execute id
		if _, err := r.query.NodeExecution.WithContext(ctx).Where(r.query.NodeExecution.ID.Eq(*execution.ParentNodeExecuteID)).
			UpdateColumn(r.query.NodeExecution.SubExecuteID, wfExec.ID); err != nil {
			return err
		}

		return nil
	})
}

func (r *RepositoryImpl) UpdateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution,
	allowedStatus []entity.WorkflowExecuteStatus) (int64, entity.WorkflowExecuteStatus, error) {
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

	info, err := r.query.WorkflowExecution.WithContext(ctx).Where(r.query.WorkflowExecution.ID.Eq(execution.ID),
		r.query.WorkflowExecution.Status.In(statuses...)).Updates(updateMap)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to update workflow execution: %w", err)
	}

	if info.RowsAffected == 0 {
		wfExe, found, err := r.GetWorkflowExecution(ctx, execution.ID)
		if err != nil {
			return 0, 0, err
		}

		if !found {
			return 0, 0, fmt.Errorf("workflow execution not found for ID %d", execution.ID)
		}

		return 0, wfExe.Status, nil
	}

	return info.RowsAffected, entity.WorkflowSuccess, nil
}

func (r *RepositoryImpl) TryLockWorkflowExecution(ctx context.Context, wfExeID, resumingEventID int64) (bool, entity.WorkflowExecuteStatus, error) {
	// Update WorkflowExecution set current_resuming_event_id = resumingEventID, status = 1
	// where id = wfExeID and current_resuming_event_id = 0 and status = 5
	result, err := r.query.WorkflowExecution.WithContext(ctx).
		Where(r.query.WorkflowExecution.ID.Eq(wfExeID)).
		Where(r.query.WorkflowExecution.ResumeEventID.Eq(0)).
		Where(r.query.WorkflowExecution.Status.Eq(int32(entity.WorkflowInterrupted))).
		Updates(map[string]interface{}{
			"resume_event_id": resumingEventID,
			"status":          int32(entity.WorkflowRunning),
		})

	if err != nil {
		return false, 0, fmt.Errorf("update workflow execution lock failed: %w", err)
	}

	// If no rows were updated, the lock attempt failed
	if result.RowsAffected == 0 {
		wfExe, found, err := r.GetWorkflowExecution(ctx, wfExeID)
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

func (r *RepositoryImpl) GetWorkflowExecution(ctx context.Context, id int64) (*entity.WorkflowExecution, bool, error) {
	rootExes, err := r.query.WorkflowExecution.WithContext(ctx).
		Where(r.query.WorkflowExecution.ID.Eq(id)).
		Find()
	if err != nil {
		return nil, false, fmt.Errorf("failed to find workflow execution: %v", err)
	}

	if len(rootExes) == 0 {
		return nil, false, nil
	}

	rootExe := rootExes[0]
	exe := &entity.WorkflowExecution{
		ID: rootExe.ID,
		WorkflowIdentity: entity.WorkflowIdentity{
			ID:      rootExe.WorkflowID,
			Version: rootExe.Version,
		},
		SpaceID:      rootExe.SpaceID,
		Mode:         entity.ExecuteMode(rootExe.Mode),
		OperatorID:   rootExe.OperatorID,
		ConnectorID:  rootExe.ConnectorID,
		ConnectorUID: rootExe.ConnectorUID,
		CreatedAt:    time.UnixMilli(rootExe.CreatedAt),
		LogID:        rootExe.LogID,
		ProjectID:    ternary.IFElse(rootExe.ProjectID > 0, ptr.Of(rootExe.ProjectID), nil),
		NodeCount:    rootExe.NodeCount,
		Status:       entity.WorkflowExecuteStatus(rootExe.Status),
		Duration:     time.Duration(rootExe.Duration) * time.Microsecond,
		Input:        &rootExe.Input,
		Output:       &rootExe.Output,
		ErrorCode:    &rootExe.ErrorCode,
		FailReason:   &rootExe.FailReason,
		TokenInfo: &entity.TokenUsage{
			InputTokens:  rootExe.InputTokens,
			OutputTokens: rootExe.OutputTokens,
		},
		UpdatedAt:              ternary.IFElse(rootExe.UpdatedAt > 0, ptr.Of(time.UnixMilli(rootExe.UpdatedAt)), nil),
		ParentNodeID:           ptr.Of(rootExe.ParentNodeID),
		ParentNodeExecuteID:    nil, // TODO: should we insert it here?
		NodeExecutions:         nil, // TODO: should we insert it here?
		RootExecutionID:        rootExe.RootExecutionID,
		CurrentResumingEventID: ternary.IFElse(rootExe.ResumeEventID == 0, nil, ptr.Of(rootExe.ResumeEventID)),
	}

	return exe, true, nil
}

func (r *RepositoryImpl) CreateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error {
	nodeExec := &model2.NodeExecution{
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

	return r.query.NodeExecution.WithContext(ctx).Create(nodeExec)
}

func (r *RepositoryImpl) UpdateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error {
	nodeExec := &model2.NodeExecution{
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

	_, err := r.query.NodeExecution.WithContext(ctx).Where(r.query.NodeExecution.ID.Eq(execution.ID)).Updates(nodeExec)
	if err != nil {
		return fmt.Errorf("failed to update node execution: %w", err)
	}

	return nil
}

func (r *RepositoryImpl) GetNodeExecutionsByWfExeID(ctx context.Context, wfExeID int64) (result []*entity.NodeExecution, err error) {
	nodeExecs, err := r.query.NodeExecution.WithContext(ctx).
		Where(r.query.NodeExecution.ExecuteID.Eq(wfExeID)).
		Find()
	if err != nil {
		return nil, fmt.Errorf("failed to find node executions: %v", err)
	}

	for _, nodeExec := range nodeExecs {
		nodeExeEntity := &entity.NodeExecution{
			ID:           nodeExec.ID,
			ExecuteID:    nodeExec.ExecuteID,
			NodeID:       nodeExec.NodeID,
			NodeName:     nodeExec.NodeName,
			NodeType:     entity.NodeType(nodeExec.NodeType),
			CreatedAt:    time.UnixMilli(nodeExec.CreatedAt),
			Status:       entity.NodeExecuteStatus(nodeExec.Status),
			Duration:     time.Duration(nodeExec.Duration) * time.Millisecond,
			Input:        &nodeExec.Input,
			Output:       &nodeExec.Output,
			RawOutput:    &nodeExec.RawOutput,
			ErrorInfo:    &nodeExec.ErrorInfo,
			ErrorLevel:   &nodeExec.ErrorLevel,
			TokenInfo:    &entity.TokenUsage{InputTokens: nodeExec.InputTokens, OutputTokens: nodeExec.OutputTokens},
			ParentNodeID: ternary.IFElse(nodeExec.ParentNodeID != "", ptr.Of(nodeExec.ParentNodeID), nil),
			Index:        int(nodeExec.CompositeNodeIndex),
			Items:        ternary.IFElse(nodeExec.CompositeNodeItems != "", ptr.Of(nodeExec.CompositeNodeItems), nil),
		}

		if nodeExec.UpdatedAt > 0 {
			nodeExeEntity.UpdatedAt = ptr.Of(time.UnixMilli(nodeExec.UpdatedAt))
		}

		if nodeExec.SubExecuteID > 0 {
			nodeExeEntity.SubWorkflowExecution = &entity.WorkflowExecution{
				ID: nodeExec.SubExecuteID,
			}
		}

		result = append(result, nodeExeEntity)
	}

	return result, nil
}

const (
	// interruptEventListKeyPattern stores events as a list (e.g., "interrupt_event_list:{wfExeID}")
	interruptEventListKeyPattern   = "interrupt_event_list:%d"
	interruptEventTTL              = 24 * time.Hour // Example: expire after 24 hours
	previousResumedEventKeyPattern = "previous_resumed_event:%d"
)

// SaveInterruptEvents saves multiple interrupt events to the end of a Redis list.
func (r *RepositoryImpl) SaveInterruptEvents(ctx context.Context, wfExeID int64, events []*entity.InterruptEvent) error {
	if len(events) == 0 {
		return nil
	}

	listKey := fmt.Sprintf(interruptEventListKeyPattern, wfExeID)
	previousResumedEventKey := fmt.Sprintf(previousResumedEventKeyPattern, wfExeID)

	currentEvents, err := r.ListInterruptEvents(ctx, wfExeID)
	for _, currentE := range currentEvents {
		if len(events) == 0 {
			break
		}
		j := len(events)
		for i := 0; i < j; i++ {
			if events[i].ID == currentE.ID {
				events = append(events[:i], events[i+1:]...)
				i--
				j--
			}
		}
	}

	if len(events) == 0 {
		return nil
	}

	previousEventStr, err := r.redis.Get(ctx, previousResumedEventKey).Result()
	if err != nil {
		if !errors.Is(err, redis.Nil) {
			return fmt.Errorf("failed to get previous resumed event for wfExeID %d: %w", wfExeID, err)
		}
	}

	var previousEvent *entity.InterruptEvent
	if previousEventStr != "" {
		err = sonic.UnmarshalString(previousEventStr, &previousEvent)
		if err != nil {
			return fmt.Errorf("failed to unmarshal previous resumed event (wfExeID %d) from JSON: %w", wfExeID, err)
		}
	}

	var topPriorityEvent *entity.InterruptEvent
	if previousEvent != nil {
		for i := range events {
			if previousEvent.NodeKey == events[i].NodeKey {
				topPriorityEvent = events[i]
				events = append(events[:i], events[i+1:]...)
				break
			}
		}
	}

	pipe := r.redis.Pipeline()
	eventJSONs := make([]interface{}, 0, len(events))

	for _, event := range events {
		eventJSON, err := sonic.MarshalString(event)
		if err != nil {
			return fmt.Errorf("failed to marshal interrupt event %d to JSON: %w", event.ID, err)
		}
		eventJSONs = append(eventJSONs, eventJSON)
	}

	if topPriorityEvent != nil {
		topPriorityEventJSON, err := sonic.MarshalString(topPriorityEvent)
		if err != nil {
			return fmt.Errorf("failed to marshal top priority interrupt event %d to JSON: %w", topPriorityEvent.ID, err)
		}
		pipe.LPush(ctx, listKey, topPriorityEventJSON)
	}

	if len(eventJSONs) > 0 {
		pipe.RPush(ctx, listKey, eventJSONs...)
	}

	pipe.Expire(ctx, listKey, interruptEventTTL)

	_, err = pipe.Exec(ctx) // ignore_security_alert SQL_INJECTION
	if err != nil {
		return fmt.Errorf("failed to save interrupt events to Redis list: %w", err)
	}

	return nil
}

// GetFirstInterruptEvent retrieves the first interrupt event from the list without removing it.
func (r *RepositoryImpl) GetFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error) {
	listKey := fmt.Sprintf(interruptEventListKeyPattern, wfExeID)

	eventJSON, err := r.redis.LIndex(ctx, listKey, 0).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, false, nil // List is empty or key does not exist
		}
		return nil, false, fmt.Errorf("failed to get first interrupt event from Redis list for wfExeID %d: %w", wfExeID, err)
	}

	var event entity.InterruptEvent
	err = sonic.UnmarshalString(eventJSON, &event)
	if err != nil {
		return nil, false, fmt.Errorf("failed to unmarshal first interrupt event (wfExeID %d) from JSON: %w", wfExeID, err)
	}

	return &event, true, nil
}

// PopFirstInterruptEvent retrieves and removes the first interrupt event from the list.
func (r *RepositoryImpl) PopFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error) {
	listKey := fmt.Sprintf(interruptEventListKeyPattern, wfExeID)

	eventJSON, err := r.redis.LPop(ctx, listKey).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, false, nil // List is empty or key does not exist
		}
		return nil, false, fmt.Errorf("failed to pop first interrupt event from Redis list for wfExeID %d: %w", wfExeID, err)
	}

	var event entity.InterruptEvent
	err = sonic.UnmarshalString(eventJSON, &event)
	if err != nil {
		// If unmarshalling fails, the event is already popped.
		// Consider if you need to re-queue or handle this scenario.
		return nil, true, fmt.Errorf("failed to unmarshal popped interrupt event (wfExeID %d) from JSON: %w", wfExeID, err)
	}

	previousResumedEventKey := fmt.Sprintf(previousResumedEventKeyPattern, wfExeID)
	err = r.redis.Set(ctx, previousResumedEventKey, eventJSON, interruptEventTTL).Err()
	if err != nil {
		return nil, true, fmt.Errorf("failed to set previous resumed event for wfExeID %d: %w", wfExeID, err)
	}

	return &event, true, nil
}

func (r *RepositoryImpl) ListInterruptEvents(ctx context.Context, wfExeID int64) ([]*entity.InterruptEvent, error) {
	listKey := fmt.Sprintf(interruptEventListKeyPattern, wfExeID)

	eventJSONs, err := r.redis.LRange(ctx, listKey, 0, -1).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, nil // List is empty or key does not exist
		}
		return nil, fmt.Errorf("failed to get all interrupt events from Redis list for wfExeID %d: %w", wfExeID, err)
	}

	var events []*entity.InterruptEvent
	for _, s := range eventJSONs {
		var event entity.InterruptEvent
		err = sonic.UnmarshalString(s, &event)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal first interrupt event (wfExeID %d) from JSON: %w", wfExeID, err)
		}
		events = append(events, &event)
	}

	return events, nil
}

func (r *RepositoryImpl) GetParentWorkflowsBySubWorkflowID(ctx context.Context, id int64) ([]*entity.WorkflowReference, error) {

	refs, err := r.query.WorkflowReference.WithContext(ctx).Where(r.query.WorkflowReference.ReferringID.Eq(id)).Find()
	if err != nil {
		// Don't treat RecordNotFound as an error, just return an empty slice
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return []*entity.WorkflowReference{}, nil
		}
		return nil, fmt.Errorf("failed to query workflow references for ID %d: %w", id, err)
	}
	result := make([]*entity.WorkflowReference, 0, len(refs))
	for _, ref := range refs {
		result = append(result, &entity.WorkflowReference{
			ID:               ref.ID,
			SpaceID:          ref.SpaceID,
			ReferringID:      ref.ReferringID,
			ReferType:        entity.ReferType(ref.ReferType),
			ReferringBizType: entity.ReferringBizType(ref.ReferringBizType),
			CreatorID:        ref.CreatorID,
			Stage:            entity.Stage(ref.Stage),
			CreatedAt:        time.UnixMilli(ref.CreatedAt),
			UpdatedAt:        ptr.Of(time.UnixMilli(ref.UpdatedAt)),
		})
	}

	return result, nil
}

func (r *RepositoryImpl) MGetWorkflowMeta(ctx context.Context, ids ...int64) (map[int64]*entity.Workflow, error) {
	metas, err := r.query.WorkflowMeta.WithContext(ctx).Where(r.query.WorkflowMeta.ID.In(ids...)).Find()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return make(map[int64]*entity.Workflow), nil
		}
		return nil, fmt.Errorf("failed to get workflow meta for IDs %d: %w", ids, err)
	}

	wfMap := make(map[int64]*entity.Workflow, len(ids))
	for _, meta := range metas {
		url, err := r.tos.GetObjectUrl(ctx, meta.IconURI)
		if err != nil {
			return nil, fmt.Errorf("failed to get icon URL for workfolw id %d, icon uri %s: %w", meta.ID, meta.IconURI, err)
		}

		wf := &entity.Workflow{
			WorkflowIdentity: entity.WorkflowIdentity{
				ID: meta.ID,
			},
			Name:        meta.Name,
			Desc:        meta.Description,
			IconURI:     meta.IconURI,
			IconURL:     url,
			ContentType: entity.ContentType(meta.ContentType),
			Mode:        entity.Mode(meta.Mode),
			CreatorID:   meta.CreatorID,
			AuthorID:    meta.AuthorID,
			SpaceID:     meta.SpaceID,
			CreatedAt:   time.UnixMilli(meta.CreatedAt),
		}
		if meta.Tag != 0 {
			tag := entity.Tag(meta.Tag)
			wf.Tag = &tag
		}
		if meta.SourceID != 0 {
			wf.SourceID = &meta.SourceID
		}
		if meta.ProjectID != 0 {
			wf.ProjectID = &meta.ProjectID
		}
		if meta.UpdatedAt > 0 {
			wf.UpdatedAt = ptr.Of(time.UnixMilli(meta.UpdatedAt))
		}
		wfMap[meta.ID] = wf
	}
	return wfMap, nil
}

func (r *RepositoryImpl) GetLatestWorkflowVersion(ctx context.Context, id int64) (*vo.VersionInfo, error) {

	version, err := r.query.WorkflowVersion.WithContext(ctx).Where(r.query.WorkflowVersion.ID.Eq(id)).
		Order(r.query.WorkflowVersion.CreatedAt.Desc()).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("workflow version not found for ID %d: %w", id, err)
		}
		return nil, fmt.Errorf("failed to query workflow version for ID %d: %w", id, err)
	}
	return &vo.VersionInfo{
		Version:            version.Version,
		VersionDescription: version.VersionDescription,
		Canvas:             version.Canvas,
		InputParams:        version.InputParams,
		OutputParams:       version.OutputParams,
		CreatorID:          version.CreatorID,
		CreatedAt:          version.CreatedAt,
		UpdatedAt:          version.UpdatedAt,
	}, nil
}

func (r *RepositoryImpl) MGetSubWorkflowReferences(ctx context.Context, ids ...int64) (map[int64][]*entity.WorkflowReference, error) {
	wfReferences, err := r.query.WorkflowReference.WithContext(ctx).Where(r.query.WorkflowReference.ID.In(ids...)).Find()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return map[int64][]*entity.WorkflowReference{}, nil
		}
		return nil, err
	}

	wfID2Reference := make(map[int64][]*entity.WorkflowReference, len(ids))
	for _, ref := range wfReferences {
		wfReference := &entity.WorkflowReference{
			ID:               ref.ID,
			ReferringID:      ref.ReferringID,
			ReferType:        entity.ReferType(ref.ReferType),
			ReferringBizType: entity.ReferringBizType(ref.ReferringBizType),
			CreatorID:        ref.CreatorID,
			CreatedAt:        time.UnixMilli(ref.CreatedAt),
		}
		wfID2Reference[ref.ID] = append(wfID2Reference[ref.ID], wfReference)
		if ref.UpdatedAt != 0 {
			wfReference.UpdatedAt = ptr.Of(time.UnixMilli(ref.UpdatedAt))
		}
		if ref.UpdaterID != 0 {
			wfReference.UpdaterID = ptr.Of(ref.UpdaterID)
		}

	}

	return wfID2Reference, nil
}

func (r *RepositoryImpl) ListWorkflowMeta(ctx context.Context, spaceID int64, page *vo.Page, queryOption *vo.QueryOption) ([]*entity.Workflow, error) {

	conditions := make([]gen.Condition, 0)
	conditions = append(conditions, r.query.WorkflowMeta.SpaceID.Eq(spaceID))

	if queryOption != nil {
		if queryOption.Name != nil {
			conditions = append(conditions, r.query.WorkflowMeta.Name.Like("%"+*queryOption.Name+"%"))
		}

		if len(queryOption.IDs) > 0 {
			conditions = append(conditions, r.query.WorkflowMeta.ID.In(queryOption.IDs...))
		}
		if queryOption.PublishStatus == vo.HasPublished {
			conditions = append(conditions, r.query.WorkflowMeta.Status.Eq(1))
		} else if queryOption.PublishStatus == vo.UnPublished {
			conditions = append(conditions, r.query.WorkflowMeta.Status.Eq(0))
		}

	}

	var (
		result = make([]*model2.WorkflowMeta, 0)
		err    error
	)

	workflowMetaDo := r.query.WorkflowMeta.WithContext(ctx).Where(conditions...).Order(r.query.WorkflowMeta.CreatedAt.Desc())

	if page != nil {
		result, _, err = workflowMetaDo.FindByPage(page.Offset(), page.Limit())
		if err != nil {
			return nil, err
		}
	} else {
		result, err = workflowMetaDo.Where(conditions...).Find()
		if err != nil {
			return nil, err
		}

	}

	wfs := make([]*entity.Workflow, 0, len(result))
	for _, meta := range result {
		url, err := r.tos.GetObjectUrl(ctx, meta.IconURI)
		if err != nil {
			return nil, fmt.Errorf("failed to get icon URL for workfolw id %d, icon uri %s: %w", meta.ID, meta.IconURI, err)
		}
		wf := &entity.Workflow{
			WorkflowIdentity: entity.WorkflowIdentity{
				ID: meta.ID,
			},
			Name:        meta.Name,
			Desc:        meta.Description,
			IconURI:     meta.IconURI,
			IconURL:     url,
			ContentType: entity.ContentType(meta.ContentType),
			Mode:        entity.Mode(meta.Mode),
			CreatorID:   meta.CreatorID,
			AuthorID:    meta.AuthorID,
			SpaceID:     meta.SpaceID,
			CreatedAt:   time.UnixMilli(meta.CreatedAt),
		}
		if meta.Tag != 0 {
			tag := entity.Tag(meta.Tag)
			wf.Tag = &tag
		}
		if meta.SourceID != 0 {
			wf.SourceID = &meta.SourceID
		}
		if meta.ProjectID != 0 {
			wf.ProjectID = &meta.ProjectID
		}
		if meta.UpdatedAt > 0 {
			wf.UpdatedAt = ptr.Of(time.UnixMilli(meta.UpdatedAt))
		}
		wfs = append(wfs, wf)
	}

	return wfs, nil
}

const (
	workflowExecutionCancelChannelKey = "workflow:cancel:signal:%d"
	workflowExecutionCancelStatusKey  = "workflow:cancel:status:%d"
)

func (r *RepositoryImpl) EmitWorkflowCancelSignal(ctx context.Context, wfExeID int64) error {
	signalChannel := fmt.Sprintf(workflowExecutionCancelChannelKey, wfExeID)
	statusKey := fmt.Sprintf(workflowExecutionCancelStatusKey, wfExeID)
	// Define a reasonable expiration for the status key, e.g., 24 hours
	expiration := 24 * time.Hour

	// set a kv to redis to indicate cancellation status
	err := r.redis.Set(ctx, statusKey, "cancelled", expiration).Err()
	if err != nil {
		return fmt.Errorf("failed to set workflow cancel status for wfExeID %d after publishing signal: %w", wfExeID, err)
	}

	// Publish a signal to Redis
	err = r.redis.Publish(ctx, signalChannel, "").Err()
	if err != nil {
		return fmt.Errorf("failed to publish workflow cancel signal for wfExeID %d: %w", wfExeID, err)
	}

	return nil
}

func (r *RepositoryImpl) SubscribeWorkflowCancelSignal(ctx context.Context, wfExeID int64) (<-chan *redis.Message, func(), error) {
	// Subscribe to Redis channel specific to this workflow execution
	channelName := fmt.Sprintf(workflowExecutionCancelChannelKey, wfExeID)
	pubSub := r.redis.Subscribe(ctx, channelName)

	// Verify subscription was successful
	_, err := pubSub.Receive(ctx) // Wait for subscription confirmation
	if err != nil {
		_ = pubSub.Close() // Cleanup on error
		return nil, nil, fmt.Errorf("failed to subscribe to cancel signal: %w", err)
	}

	closeFn := func() {
		_ = pubSub.Close()
	}

	return pubSub.Channel(redis.WithChannelSize(1)), closeFn, nil
}

func (r *RepositoryImpl) GetWorkflowCancelFlag(ctx context.Context, wfExeID int64) (bool, error) {
	// Construct Redis key for workflow cancellation status
	key := fmt.Sprintf(workflowExecutionCancelStatusKey, wfExeID)

	// Check if the key exists in Redis
	count, err := r.redis.Exists(ctx, key).Result()
	if err != nil {
		return false, fmt.Errorf("failed to check cancellation status in Redis: %w", err)
	}

	// If key exists (count == 1), return true; otherwise return false
	return count == 1, nil
}

func (r *RepositoryImpl) WorkflowAsTool(ctx context.Context, wfID entity.WorkflowIdentity) (workflow.ToolFromWorkflow, error) {
	// TODO: handle default values and input/output cutting
	namedTypeInfoList := make([]*vo.NamedTypeInfo, 0)

	var canvas vo.Canvas

	wfMeta, err := r.GetWorkflowMeta(ctx, wfID.ID)
	if err != nil {
		return nil, err
	}

	name := fmt.Sprintf("ts_%s_%s", wfMeta.Name, wfMeta.Name)
	desc := wfMeta.Desc

	if wfID.Version == "" {
		draft, err := r.GetWorkflowDraft(ctx, wfID.ID)
		if err != nil {
			return nil, err
		}

		if len(draft.InputParams) == 0 {
			return nil, fmt.Errorf("no input params for draft with id %d", wfID.ID)
		}

		err = sonic.UnmarshalString(draft.InputParams, &namedTypeInfoList)
		if err != nil {
			return nil, err
		}

		err = sonic.UnmarshalString(draft.Canvas, &canvas)
		if err != nil {
			return nil, err
		}
	} else {
		version, err := r.GetWorkflowVersion(ctx, wfID.ID, wfID.Version)
		if err != nil {
			return nil, err
		}

		err = sonic.UnmarshalString(version.InputParams, &namedTypeInfoList)
		if err != nil {
			return nil, err
		}

		err = sonic.UnmarshalString(version.Canvas, &canvas)
		if err != nil {
			return nil, err
		}
	}

	params := make(map[string]*schema.ParameterInfo)

	for _, tInfo := range namedTypeInfoList {
		param, err := tInfo.ToParameterInfo()
		if err != nil {
			return nil, err
		}

		params[tInfo.Name] = param
	}

	toolInfo := &schema.ToolInfo{
		Name:        name,
		Desc:        desc,
		ParamsOneOf: schema.NewParamsOneOfByParams(params),
	}

	workflowSC, err := adaptor.CanvasToWorkflowSchema(ctx, &canvas)
	if err != nil {
		return nil, fmt.Errorf("failed to convert canvas to workflow schema: %w", err)
	}

	wf, err := compose.NewWorkflow(ctx, workflowSC, einoCompose.WithGraphName(fmt.Sprintf("%d", wfID.ID)))
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow: %w", err)
	}

	if wf.StreamRun() {
		return compose.NewStreamableWorkflow(
			toolInfo,
			wf.Runner.Stream,
			wf.TerminatePlan(),
			wfMeta,
			workflowSC,
			r,
		), nil
	}

	return compose.NewInvokableWorkflow(
		toolInfo,
		wf.Runner.Invoke,
		wf.TerminatePlan(),
		wfMeta,
		workflowSC,
		r,
	), nil
}
