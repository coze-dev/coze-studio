package repo

import (
	"context"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
)

type RepositoryImpl struct {
	idGen idgen.IDGenerator
	query *query.Query
}

func NewRepository(idgen idgen.IDGenerator, db *gorm.DB) workflow.Repository {
	return &RepositoryImpl{
		idGen: idgen,
		query: query.Use(db),
	}
}

func (r *RepositoryImpl) GetSubWorkflowCanvas(ctx context.Context, parent *vo.Node) (*vo.Canvas, error) {
	//TODO implement me
	panic("implement me")
}

func (r *RepositoryImpl) BatchGetSubWorkflowCanvas(ctx context.Context, parents []*vo.Node) (map[string]*vo.Canvas, error) {
	panic("implement me")
}

func (r *RepositoryImpl) GenID(ctx context.Context) (int64, error) {
	return r.idGen.GenID(ctx)
}

func (r *RepositoryImpl) CreateWorkflowMeta(ctx context.Context, wf *entity.Workflow, ref *entity.WorkflowReference) (int64, error) {
	id, err := r.GenID(ctx)
	if err != nil {
		return 0, err
	}

	wfMeta := &model.WorkflowMeta{
		ID:          id,
		Name:        wf.Name,
		Description: wf.Desc,
		IconURI:     wf.IconURI,
		Status:      1,
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

	wfRef := &model.WorkflowReference{
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

func (r *RepositoryImpl) CreateOrUpdateDraft(ctx context.Context, id int64, canvas string, inputParams, outputParams string) error {
	d := &model.WorkflowDraft{
		ID:           id,
		Canvas:       canvas,
		InputParams:  inputParams,
		OutputParams: outputParams,
	}

	if err := r.query.WorkflowDraft.WithContext(ctx).Save(d); err != nil {
		return fmt.Errorf("save workflow draft: %w", err)
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

	// Initialize the result entity
	wf := &entity.Workflow{
		WorkflowIdentity: entity.WorkflowIdentity{
			ID: id,
		},
		Name:        meta.Name,
		Desc:        meta.Description,
		IconURI:     meta.IconURI,
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

	return wf, nil
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
		Canvas:       draft.Canvas,
		InputParams:  draft.InputParams,
		OutputParams: draft.OutputParams,
		CreatedAt:    draft.CreatedAt,
		UpdatedAt:    draft.UpdatedAt,
	}, nil
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
	wfExec := &model.WorkflowExecution{
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

func (r *RepositoryImpl) UpdateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution) error {
	wfExec := &model.WorkflowExecution{
		Status:     int32(execution.Status),
		Output:     ptr.FromOrDefault(execution.Output, ""),
		Duration:   execution.Duration.Milliseconds(),
		ErrorCode:  ptr.FromOrDefault(execution.ErrorCode, ""),
		FailReason: ptr.FromOrDefault(execution.FailReason, ""),
	}

	if execution.TokenInfo != nil {
		wfExec.InputTokens = execution.TokenInfo.InputTokens
		wfExec.OutputTokens = execution.TokenInfo.OutputTokens
	}

	_, err := r.query.WorkflowExecution.WithContext(ctx).Where(r.query.WorkflowExecution.ID.Eq(execution.ID)).Updates(wfExec)
	if err != nil {
		return fmt.Errorf("failed to update workflow execution: %w", err)
	}

	return nil
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
		Duration:     time.Duration(rootExe.Duration),
		Input:        &rootExe.Input,
		Output:       &rootExe.Output,
		ErrorCode:    &rootExe.ErrorCode,
		FailReason:   &rootExe.FailReason,
		TokenInfo: &entity.TokenUsage{
			InputTokens:  rootExe.InputTokens,
			OutputTokens: rootExe.OutputTokens,
		},
		UpdatedAt:           ternary.IFElse(rootExe.UpdatedAt > 0, ptr.Of(time.UnixMilli(rootExe.UpdatedAt)), nil),
		ParentNodeID:        ptr.Of(rootExe.ParentNodeID),
		ParentNodeExecuteID: nil, // TODO: should we insert it here?
		NodeExecutions:      nil, // TODO: should we insert it here?
		RootExecutionID:     rootExe.RootExecutionID,
	}

	return exe, true, nil
}

func (r *RepositoryImpl) CreateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error {
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

	return r.query.NodeExecution.WithContext(ctx).Create(nodeExec)
}

func (r *RepositoryImpl) UpdateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error {
	nodeExec := &model.NodeExecution{
		Status:     int32(execution.Status),
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
			Duration:     time.Duration(nodeExec.Duration),
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
