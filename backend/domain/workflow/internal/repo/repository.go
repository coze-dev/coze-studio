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
	"gorm.io/gen/field"
	"gorm.io/gorm"

	workflow3 "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas/adaptor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/safego"
)

type RepositoryImpl struct {
	idgen.IDGenerator
	query *query.Query
	redis *redis.Client
	tos   storage.Storage
	einoCompose.CheckPointStore
	workflow.InterruptEventStore
	workflow.CancelSignalStore
	workflow.ExecuteHistoryStore
}

func NewRepository(idgen idgen.IDGenerator, db *gorm.DB, redis *redis.Client, tos storage.Storage,
	cpStore einoCompose.CheckPointStore) workflow.Repository {
	return &RepositoryImpl{
		IDGenerator:     idgen,
		query:           query.Use(db),
		redis:           redis,
		tos:             tos,
		CheckPointStore: cpStore,
		InterruptEventStore: &interruptEventStoreImpl{
			redis: redis,
		},
		CancelSignalStore: &cancelSignalStoreImpl{
			redis: redis,
		},
		ExecuteHistoryStore: &executeHistoryStoreImpl{
			query: query.Use(db),
			redis: redis,
		},
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
		draft, err := r.DraftV2(ctx, id, "")
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

	versionInfo, err := r.GetVersion(ctx, id, version)
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

func (r *RepositoryImpl) CreateMeta(ctx context.Context, meta *vo.Meta) (int64, error) {
	id, err := r.GenID(ctx)
	if err != nil {
		return 0, err
	}
	wfMeta := &model.WorkflowMeta{
		ID:          id,
		Name:        meta.Name,
		Description: meta.Desc,
		IconURI:     meta.IconURI,
		ContentType: int32(meta.ContentType),
		Mode:        int32(meta.Mode),
		CreatorID:   meta.CreatorID,
		AuthorID:    meta.AuthorID,
		SpaceID:     meta.SpaceID,
		DeletedAt:   gorm.DeletedAt{Valid: false},
	}

	if meta.Tag != nil {
		wfMeta.Tag = int32(*meta.Tag)
	}

	if meta.SourceID != nil {
		wfMeta.SourceID = *meta.SourceID
	}

	if meta.AppID != nil {
		wfMeta.AppID = *meta.AppID
	}

	if err = r.query.WorkflowMeta.Create(wfMeta); err != nil {
		return 0, fmt.Errorf("create workflow meta: %w", err)
	}

	return id, nil
}

func (r *RepositoryImpl) CreateVersion(ctx context.Context, id int64, info *vo.VersionInfo) (err error) {
	if err = r.query.WorkflowVersion.WithContext(ctx).Create(&model.WorkflowVersion{
		ID:                 id,
		Version:            info.Version,
		VersionDescription: info.VersionDescription,
		Canvas:             info.Canvas,
		InputParams:        info.InputParams,
		OutputParams:       info.OutputParams,
		CreatorID:          info.VersionCreatorID,
		CommitID:           info.CommitID,
	}); err != nil {
		return fmt.Errorf("publish failed: %w", err)
	}

	var result gen.ResultInfo
	result, err = r.query.WorkflowDraft.WithContext(ctx).
		Where(r.query.WorkflowDraft.ID.Eq(id),
			r.query.WorkflowDraft.CommitID.Eq(info.CommitID)).
		UpdateColumnSimple(
			r.query.WorkflowDraft.Modified.Value(false),
			r.query.WorkflowDraft.TestRunSuccess.Value(true),
		)
	if err != nil {
		return fmt.Errorf("update workflow draft when publish failed: %w", err)
	}

	if result.RowsAffected == 0 {
		logs.CtxWarnf(ctx, "update workflow draft when publish failed: no rows affected. WorkflowID: %d", id)
	}

	_, err = r.query.WorkflowMeta.WithContext(ctx).
		Where(r.query.WorkflowMeta.ID.Eq(id)).
		UpdateColumnSimple(
			r.query.WorkflowMeta.Status.Value(1),
			r.query.WorkflowMeta.LatestVersion.Value(info.Version),
		)
	if err != nil {
		logs.CtxWarnf(ctx, "update workflow meta when publish failed: %v", err)
	}

	return nil
}

func (r *RepositoryImpl) CreateOrUpdateDraft(ctx context.Context, id int64, draft *vo.DraftInfo) error {
	d := &model.WorkflowDraft{
		ID:             id,
		Canvas:         draft.Canvas,
		InputParams:    draft.InputParams,
		OutputParams:   draft.OutputParams,
		Modified:       draft.Modified,
		TestRunSuccess: draft.TestRunSuccess,
		CommitID:       draft.CommitID,
	}

	if err := r.query.WorkflowDraft.WithContext(ctx).Save(d); err != nil {
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

func (r *RepositoryImpl) Delete(ctx context.Context, id int64) error {
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
func (r *RepositoryImpl) MDelete(ctx context.Context, ids []int64) error {
	_, err := r.query.WorkflowMeta.WithContext(ctx).Where(r.query.WorkflowMeta.ID.In(ids...)).Delete()
	if err != nil {
		return fmt.Errorf("delete workflow meta failed err=%w", err)
	}

	safego.Go(ctx, func() {
		_, err = r.query.WorkflowDraft.WithContext(ctx).Where(r.query.WorkflowDraft.ID.In(ids...)).Delete()
		if err != nil {
			logs.Warnf("delete workflow draft failed err=%v, ids %v", err, ids)
		}

		_, err = r.query.WorkflowVersion.WithContext(ctx).Where(r.query.WorkflowVersion.ID.In(ids...)).Delete()
		if err != nil {
			logs.Warnf("delete workflow version failed err=%v, ids %v", err, ids)
		}

		_, err = r.query.WorkflowReference.WithContext(ctx).Where(r.query.WorkflowReference.ID.In(ids...)).Delete()
		if err != nil {
			logs.Warnf("delete workflow reference failed err=%v, ids %v", err, ids)

		}
		_, err = r.query.WorkflowReference.WithContext(ctx).Where(r.query.WorkflowReference.ReferringID.In(ids...)).Delete()
		if err != nil {
			logs.Warnf("delete workflow reference refer failed err=%v, ids %v", err, ids)
		}
	})

	return nil
}

func (r *RepositoryImpl) GetMeta(ctx context.Context, id int64) (*vo.Meta, error) {
	meta, err := r.query.WorkflowMeta.WithContext(ctx).Where(r.query.WorkflowMeta.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("workflow meta not found for ID %d: %w", id, err)
		}
		return nil, fmt.Errorf("failed to get workflow meta for ID %d: %w", id, err)
	}

	return r.convertMeta(ctx, meta)
}

func (r *RepositoryImpl) convertMeta(ctx context.Context, meta *model.WorkflowMeta) (*vo.Meta, error) {
	url, err := r.tos.GetObjectUrl(ctx, meta.IconURI)
	if err != nil {
		logs.Warnf("failed to get url for workflow meta %v", err)
	}
	// Initialize the result entity
	wfMeta := &vo.Meta{
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
		wfMeta.Tag = &tag
	}
	if meta.SourceID != 0 {
		wfMeta.SourceID = &meta.SourceID
	}
	if meta.AppID != 0 {
		wfMeta.AppID = &meta.AppID
	}
	if meta.UpdatedAt > 0 {
		wfMeta.UpdatedAt = ptr.Of(time.UnixMilli(meta.UpdatedAt))
	}
	if meta.Status > 0 {
		wfMeta.HasPublished = true
	}
	if meta.LatestVersion != "" {
		wfMeta.LatestPublishedVersion = ptr.Of(meta.LatestVersion)
	}

	return wfMeta, nil
}

func (r *RepositoryImpl) UpdateMeta(ctx context.Context, id int64, metaUpdate *vo.MetaUpdate) error {
	var expressions []field.AssignExpr

	if metaUpdate.Name != nil {
		expressions = append(expressions, r.query.WorkflowMeta.Name.Value(*metaUpdate.Name))
	}

	if metaUpdate.Desc != nil {
		expressions = append(expressions, r.query.WorkflowMeta.Description.Value(*metaUpdate.Desc))
	}

	if metaUpdate.IconURI != nil {
		expressions = append(expressions, r.query.WorkflowMeta.IconURI.Value(*metaUpdate.IconURI))
	}

	if metaUpdate.HasPublished != nil {
		if *metaUpdate.HasPublished {
			expressions = append(expressions, r.query.WorkflowMeta.Status.Value(1))
		} else {
			expressions = append(expressions, r.query.WorkflowMeta.Status.Value(0))
		}
	}

	if metaUpdate.LatestPublishedVersion != nil {
		expressions = append(expressions, r.query.WorkflowMeta.LatestVersion.Value(*metaUpdate.LatestPublishedVersion))
	}

	if len(expressions) == 0 {
		return nil
	}

	_, err := r.query.WorkflowMeta.WithContext(ctx).Where(r.query.WorkflowMeta.ID.Eq(id)).
		UpdateColumnSimple(expressions...)
	if err != nil {
		return fmt.Errorf("update workflow meta: %w", err)
	}

	return nil
}

func (r *RepositoryImpl) GetVersion(ctx context.Context, id int64, version string) (*vo.VersionInfo, error) {
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
		VersionMeta: &vo.VersionMeta{
			Version:            wfVersion.Version,
			VersionDescription: wfVersion.VersionDescription,
			VersionCreatedAt:   time.UnixMilli(wfVersion.CreatedAt),
			VersionCreatorID:   wfVersion.CreatorID,
		},
		CanvasInfo: vo.CanvasInfo{
			Canvas:       wfVersion.Canvas,
			InputParams:  wfVersion.InputParams,
			OutputParams: wfVersion.OutputParams,
		},
		CommitID: wfVersion.CommitID,
	}, nil
}

func (r *RepositoryImpl) DraftV2(ctx context.Context, id int64, commitID string) (*vo.DraftInfo, error) {
	var conds []gen.Condition
	conds = append(conds, r.query.WorkflowDraft.ID.Eq(id))
	if commitID != "" {
		conds = append(conds, r.query.WorkflowDraft.CommitID.Eq(commitID))
	}

	draft, err := r.query.WorkflowDraft.WithContext(ctx).Where(conds...).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if len(commitID) == 0 {
				return nil, fmt.Errorf("workflow draft not found for ID %d: %w", id, err)
			} else {
				snapshot, err := r.query.WorkflowSnapshot.WithContext(ctx).Where(
					r.query.WorkflowSnapshot.WorkflowID.Eq(id),
					r.query.WorkflowSnapshot.CommitID.Eq(commitID),
				).First()
				if err != nil {
					if errors.Is(err, gorm.ErrRecordNotFound) {
						return nil, fmt.Errorf("workflow snapshot not found for ID %d, commitID %s: %w",
							id, commitID, err)
					} else {
						return nil, fmt.Errorf("failed to query workflow snapshot for ID %d, commitID %s: %w",
							id, commitID, err)
					}
				}

				return &vo.DraftInfo{
					DraftMeta: &vo.DraftMeta{
						Timestamp:  time.UnixMilli(snapshot.CreatedAt),
						IsSnapshot: true,
					},

					Canvas:       snapshot.Canvas,
					InputParams:  snapshot.InputParams,
					OutputParams: snapshot.OutputParams,
					CommitID:     snapshot.CommitID,
				}, nil
			}
		}
		return nil, fmt.Errorf("failed to get workflow draft for ID %d, commitID %s: %w", id, commitID, err)
	}

	return &vo.DraftInfo{
		DraftMeta: &vo.DraftMeta{
			TestRunSuccess: draft.TestRunSuccess,
			Modified:       draft.Modified,
			Timestamp:      time.UnixMilli(draft.UpdatedAt),
			IsSnapshot:     false,
		},

		Canvas:       draft.Canvas,
		InputParams:  draft.InputParams,
		OutputParams: draft.OutputParams,
		CommitID:     draft.CommitID,
	}, nil
}

func (r *RepositoryImpl) MGetDraft(ctx context.Context, ids []int64) (map[int64]*vo.DraftInfo, error) {
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
			DraftMeta: &vo.DraftMeta{
				TestRunSuccess: draft.TestRunSuccess,
				Modified:       draft.Modified,
				Timestamp:      time.UnixMilli(draft.UpdatedAt),
				IsSnapshot:     false,
			},

			Canvas:       draft.Canvas,
			InputParams:  draft.InputParams,
			OutputParams: draft.OutputParams,
			CommitID:     draft.CommitID,
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

func (r *RepositoryImpl) MGetMeta(ctx context.Context, query *vo.MetaQuery) (map[int64]*vo.Meta, error) {
	var conditions []gen.Condition
	if len(query.IDs) > 0 {
		conditions = append(conditions, r.query.WorkflowMeta.ID.In(query.IDs...))
	}

	if query.Name != nil {
		conditions = append(conditions, r.query.WorkflowMeta.Name.Like(*query.Name))
	}

	if query.SpaceID != nil {
		conditions = append(conditions, r.query.WorkflowMeta.SpaceID.Eq(*query.SpaceID))
	}

	if query.PublishStatus != nil {
		if *query.PublishStatus == vo.HasPublished {
			conditions = append(conditions, r.query.WorkflowMeta.Status.Eq(1))
		} else {
			conditions = append(conditions, r.query.WorkflowMeta.Status.Eq(0))
		}
	}

	if query.AppID != nil {
		conditions = append(conditions, r.query.WorkflowMeta.AppID.Eq(*query.AppID))
	}

	var (
		result []*model.WorkflowMeta
		err    error
	)

	workflowMetaDo := r.query.WorkflowMeta.WithContext(ctx).Debug().Where(conditions...).Order(r.query.WorkflowMeta.CreatedAt.Desc())

	if query.Page != nil {
		result, _, err = workflowMetaDo.FindByPage(query.Page.Offset(), query.Page.Limit())
		if err != nil {
			return nil, err
		}
	} else {
		result, err = workflowMetaDo.Find()
		if err != nil {
			return nil, err
		}

	}

	wfMap := make(map[int64]*vo.Meta, len(result))
	for _, meta := range result {
		converted, err := r.convertMeta(ctx, meta)
		if err != nil {
			return nil, err
		}
		wfMap[meta.ID] = converted
	}
	return wfMap, nil
}

func (r *RepositoryImpl) GetLatestVersion(ctx context.Context, id int64) (*vo.VersionInfo, error) {

	version, err := r.query.WorkflowVersion.WithContext(ctx).Where(r.query.WorkflowVersion.ID.Eq(id)).
		Order(r.query.WorkflowVersion.CreatedAt.Desc()).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("workflow version not found for ID %d: %w", id, err)
		}
		return nil, fmt.Errorf("failed to query workflow version for ID %d: %w", id, err)
	}
	return &vo.VersionInfo{
		VersionMeta: &vo.VersionMeta{
			Version:            version.Version,
			VersionDescription: version.VersionDescription,
			VersionCreatedAt:   time.UnixMilli(version.CreatedAt),
			VersionCreatorID:   version.CreatorID,
		},
		CanvasInfo: vo.CanvasInfo{
			Canvas:       version.Canvas,
			InputParams:  version.InputParams,
			OutputParams: version.OutputParams,
		},
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

func (r *RepositoryImpl) WorkflowAsTool(ctx context.Context, policy vo.GetPolicy, wfToolConfig vo.WorkflowToolConfig) (workflow.ToolFromWorkflow, error) {
	var (
		canvas               vo.Canvas
		inputParamsCfg       = wfToolConfig.InputParametersConfig
		outputParamsCfg      = wfToolConfig.OutputParametersConfig
		namedTypeInfoList    = make([]*vo.NamedTypeInfo, 0)
		inputParamsConfigMap = slices.ToMap(inputParamsCfg, func(w *workflow3.APIParameter) (string, *workflow3.APIParameter) {
			return w.Name, w
		})
	)

	wfMeta, err := r.GetMeta(ctx, policy.ID)
	if err != nil {
		return nil, err
	}

	wfEntity := &entity.Workflow{
		ID:           policy.ID,
		Meta:         wfMeta,
		CanvasInfoV2: &vo.CanvasInfoV2{},
	}

	name := fmt.Sprintf("ts_%s_%s", wfMeta.Name, wfMeta.Name)
	desc := wfMeta.Desc

	switch policy.QType {
	case vo.FromDraft:
		draft, err := r.DraftV2(ctx, policy.ID, "")
		if err != nil {
			return nil, err
		}

		wfEntity.DraftMeta = draft.DraftMeta

		if len(draft.InputParams) == 0 {
			return nil, fmt.Errorf("no input params for draft with id %d", policy.ID)
		}

		err = sonic.UnmarshalString(draft.InputParams, &namedTypeInfoList)
		if err != nil {
			return nil, err
		}

		err = sonic.UnmarshalString(draft.Canvas, &canvas)
		if err != nil {
			return nil, err
		}

		wfEntity.Canvas = draft.Canvas
		wfEntity.InputParams = namedTypeInfoList
	case vo.FromSpecificVersion:
		version, err := r.GetLatestVersion(ctx, policy.ID)
		if err != nil {
			return nil, err
		}

		wfEntity.VersionMeta = version.VersionMeta

		err = sonic.UnmarshalString(version.InputParams, &namedTypeInfoList)
		if err != nil {
			return nil, err
		}

		err = sonic.UnmarshalString(version.Canvas, &canvas)
		if err != nil {
			return nil, err
		}

		wfEntity.Canvas = version.Canvas
		wfEntity.InputParams = namedTypeInfoList
	case vo.FromLatestVersion:
		version, err := r.GetVersion(ctx, policy.ID, policy.Version)
		if err != nil {
			return nil, err
		}

		wfEntity.VersionMeta = version.VersionMeta

		err = sonic.UnmarshalString(version.InputParams, &namedTypeInfoList)
		if err != nil {
			return nil, err
		}

		err = sonic.UnmarshalString(version.Canvas, &canvas)
		if err != nil {
			return nil, err
		}

		wfEntity.Canvas = version.Canvas
		wfEntity.InputParams = namedTypeInfoList
	default:
		panic("impossible")
	}

	params := make(map[string]*schema.ParameterInfo)

	for _, tInfo := range namedTypeInfoList {
		if p, ok := inputParamsConfigMap[tInfo.Name]; ok && p.LocalDisable {
			continue
		}
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

	var opts []compose.WorkflowOption
	opts = append(opts, compose.WithIDAsName(policy.ID))
	if s := execute.GetStaticConfig(); s != nil && s.MaxNodeCountPerWorkflow > 0 {
		opts = append(opts, compose.WithMaxNodeCount(s.MaxNodeCountPerWorkflow))
	}

	wf, err := compose.NewWorkflow(ctx, workflowSC, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow: %w", err)
	}

	type streamFunc func(ctx context.Context, in map[string]any, opts ...einoCompose.Option) (*schema.StreamReader[map[string]any], error)

	convertStream := func(stream streamFunc) streamFunc {
		return func(ctx context.Context, in map[string]any, opts ...einoCompose.Option) (*schema.StreamReader[map[string]any], error) {
			if len(inputParamsConfigMap) == 0 {
				return stream(ctx, in, opts...)
			}
			input := make(map[string]any, len(in))
			for k, v := range in {
				if p, ok := inputParamsConfigMap[k]; ok {
					if p.LocalDisable {
						if p.LocalDefault != nil {
							input[k], err = transformDefaultValue(*p.LocalDefault, p)
							if err != nil {
								return nil, err
							}
						}
					} else {
						input[k] = v
					}

				} else {
					input[k] = v
				}
			}
			return stream(ctx, input, opts...)
		}
	}

	if wf.StreamRun() {
		return compose.NewStreamableWorkflow(
			toolInfo,
			convertStream(wf.Runner.Stream),
			wf.TerminatePlan(),
			wfEntity,
			workflowSC,
			r,
		), nil
	}

	type invokeFunc func(ctx context.Context, in map[string]any, opts ...einoCompose.Option) (out map[string]any, err error)
	convertInvoke := func(invoke invokeFunc) invokeFunc {
		return func(ctx context.Context, in map[string]any, opts ...einoCompose.Option) (out map[string]any, err error) {
			if len(inputParamsCfg) == 0 && len(outputParamsCfg) == 0 {
				return invoke(ctx, in, opts...)
			}
			input := make(map[string]any, len(in))
			for k, v := range in {
				if p, ok := inputParamsConfigMap[k]; ok {
					if p.LocalDisable {
						if p.LocalDefault != nil {
							input[k], err = transformDefaultValue(*p.LocalDefault, p)
							if err != nil {
								return nil, fmt.Errorf("failed to transfer default value, default value=%v,value type=%v,err=%w", *p.LocalDefault, p.Type, err)
							}
						}
					} else {
						input[k] = v
					}
				} else {
					input[k] = v
				}
			}

			out, err = invoke(ctx, input, opts...)
			if err != nil {
				return nil, err
			}

			if wf.TerminatePlan() == vo.ReturnVariables && len(outputParamsCfg) > 0 {
				return filterDisabledAPIParameters(outputParamsCfg, out), nil
			}

			return out, nil

		}
	}

	return compose.NewInvokableWorkflow(
		toolInfo,
		convertInvoke(wf.Runner.Invoke),
		wf.TerminatePlan(),
		wfEntity,
		workflowSC,
		r,
	), nil
}

func (r *RepositoryImpl) CopyWorkflow(ctx context.Context, workflowID int64, cfg vo.CopyWorkflowConfig) (*entity.Workflow, error) {
	const (
		copyWorkflowRedisKeyPrefix         = "copy_workflow_redis_key_prefix"
		copyWorkflowRedisKeyExpireInterval = time.Hour * 24 * 7
	)
	var (
		copiedID      int64
		err           error
		workflowMeta  = r.query.WorkflowMeta
		workflowDraft = r.query.WorkflowDraft
	)

	copiedID, err = r.IDGenerator.GenID(ctx)
	if err != nil {
		return nil, err
	}

	copiedWorkflowRedisKey := fmt.Sprintf("%s:%d:%d", copyWorkflowRedisKeyPrefix, workflowID, ctxutil.MustGetUIDFromCtx(ctx))

	copiedNameSuffix, err := r.redis.Incr(ctx, copiedWorkflowRedisKey).Result()
	if err != nil {
		return nil, err
	}
	err = r.redis.Expire(ctx, copiedWorkflowRedisKey, copyWorkflowRedisKeyExpireInterval).Err()
	if err != nil {
		logs.Warnf("failed to set the rediskey %v expiration time, err=%v", copiedWorkflowRedisKey, err)
	}
	var copiedWorkflow *entity.Workflow
	wfMeta, err := workflowMeta.WithContext(ctx).Where(workflowMeta.ID.Eq(workflowID)).First()
	if err != nil {
		return nil, err
	}

	wfDraft, err := workflowDraft.WithContext(ctx).Where(workflowDraft.ID.Eq(workflowID)).First()
	if err != nil {
		return nil, err
	}

	commitID, err := r.IDGenerator.GenID(ctx)
	if err != nil {
		return nil, err
	}

	err = r.query.Transaction(func(tx *query.Query) error {
		wfMeta.Name = fmt.Sprintf("%s_%d", wfMeta.Name, copiedNameSuffix)
		wfMeta.SourceID = workflowID
		wfMeta.Status = 0
		wfMeta.ID = copiedID
		wfMeta.CreatedAt = 0
		wfMeta.UpdatedAt = 0
		wfMeta.LatestVersion = ""

		if cfg.TargetSpaceID != nil {
			wfMeta.SpaceID = *cfg.TargetSpaceID
		}
		if cfg.TargetAppID != nil {
			wfMeta.AppID = *cfg.TargetAppID
		}
		wfMeta.CreatorID = ctxutil.MustGetUIDFromCtx(ctx)
		err = workflowMeta.WithContext(ctx).Create(wfMeta)
		if err != nil {
			return err
		}

		wfDraft.ID = copiedID
		wfDraft.TestRunSuccess = false
		wfDraft.Modified = false
		wfDraft.UpdatedAt = 0
		wfDraft.CommitID = strconv.FormatInt(commitID, 10)
		err = workflowDraft.WithContext(ctx).Create(wfDraft)
		if err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err

	}

	copiedWorkflow = &entity.Workflow{
		ID: copiedID,
		Meta: &vo.Meta{
			SpaceID:   wfMeta.SpaceID,
			Name:      wfMeta.Name,
			CreatorID: wfMeta.CreatorID,
			IconURI:   wfMeta.IconURI,
			Desc:      wfMeta.Description,
		},
	}

	if wfMeta.AppID > 0 {
		copiedWorkflow.AppID = &wfMeta.AppID
	}

	return copiedWorkflow, nil
}

func (r *RepositoryImpl) CopyWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, modifiedCanvasSchema string) (wf *entity.Workflow, err error) {
	var (
		copiedID      int64
		workflowMeta  = r.query.WorkflowMeta
		workflowDraft = r.query.WorkflowDraft
	)

	copiedID, err = r.IDGenerator.GenID(ctx)
	if err != nil {
		return nil, err
	}
	wfMeta, err := workflowMeta.WithContext(ctx).Where(workflowMeta.ID.Eq(workflowID)).First()
	if err != nil {
		return nil, err
	}

	wfDraft, err := workflowDraft.WithContext(ctx).Where(workflowDraft.ID.Eq(workflowID)).First()
	if err != nil {
		return nil, err
	}

	err = r.query.Transaction(func(tx *query.Query) error {
		wfMeta.ID = copiedID
		wfMeta.SourceID = workflowID
		wfMeta.Status = 0
		wfMeta.CreatedAt = 0
		wfMeta.UpdatedAt = 0
		wfMeta.AppID = 0
		wfMeta.CreatorID = ctxutil.MustGetUIDFromCtx(ctx)
		err = workflowMeta.WithContext(ctx).Create(wfMeta)
		if err != nil {
			return err
		}

		wfDraft.ID = copiedID
		wfDraft.TestRunSuccess = false
		wfDraft.Modified = false
		wfDraft.UpdatedAt = 0
		wfDraft.Canvas = modifiedCanvasSchema
		err = workflowDraft.WithContext(ctx).Create(wfDraft)
		if err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	wf = &entity.Workflow{
		ID: copiedID,
		Meta: &vo.Meta{
			SpaceID:   wfMeta.SpaceID,
			CreatorID: wfMeta.CreatorID,
			IconURI:   wfMeta.IconURI,
		},
		CanvasInfoV2: &vo.CanvasInfoV2{
			Canvas: modifiedCanvasSchema,
		},
	}

	return wf, nil
}

func (r *RepositoryImpl) GetDraftWorkflowsByAppID(ctx context.Context, AppID int64) (map[int64]*vo.DraftInfo, map[int64]string, error) {
	var (
		workflowMeta  = r.query.WorkflowMeta
		workflowDraft = r.query.WorkflowDraft
	)

	// TODO(zhuangjie): querying workflow information may require additional commit_id at a later stage, it is used to confirm the workflow information at the time of release, not to obtain the latest version
	wfMetas, err := workflowMeta.WithContext(ctx).Where(workflowMeta.AppID.Eq(AppID)).Find()
	if err != nil {
		return nil, nil, err
	}
	draftIDs := slices.Transform(wfMetas, func(a *model.WorkflowMeta) int64 {
		return a.ID
	})

	wfDrafts, err := workflowDraft.WithContext(ctx).Where(workflowDraft.ID.In(draftIDs...)).Find()
	if err != nil {
		return nil, nil, err
	}
	result := make(map[int64]*vo.DraftInfo, len(wfDrafts))
	for _, d := range wfDrafts {
		result[d.ID] = &vo.DraftInfo{
			Canvas:       d.Canvas,
			InputParams:  d.InputParams,
			OutputParams: d.OutputParams,
		}
	}

	wid2Named := slices.ToMap(wfMetas, func(e *model.WorkflowMeta) (int64, string) {
		return e.ID, e.Name
	})
	return result, wid2Named, nil
}

func filterDisabledAPIParameters(parametersCfg []*workflow3.APIParameter, m map[string]any) map[string]any {
	result := make(map[string]any, len(m))
	responseParameterMap := slices.ToMap(parametersCfg, func(p *workflow3.APIParameter) (string, *workflow3.APIParameter) {
		return p.Name, p
	})
	for key, value := range m {
		if parameter, ok := responseParameterMap[key]; ok {
			if parameter.LocalDisable {
				continue
			}
			if parameter.Type == workflow3.ParameterType_Object && len(parameter.SubParameters) > 0 {
				val := filterDisabledAPIParameters(parameter.SubParameters, value.(map[string]interface{}))
				result[key] = val
			} else {
				result[key] = value
			}
		} else {
			result[key] = value
		}
	}
	return result
}

func transformDefaultValue(value string, p *workflow3.APIParameter) (any, error) {
	switch p.Type {
	default:
		return value, nil
	case workflow3.ParameterType_String:
		return value, nil
	case workflow3.ParameterType_Object:
		ret := make(map[string]any)
		err := sonic.UnmarshalString(value, &ret)
		if err != nil {
			return nil, err
		}
		return ret, nil
	case workflow3.ParameterType_Bool:
		b, err := strconv.ParseBool(value)
		if err != nil {
			return nil, err
		}
		return b, nil
	case workflow3.ParameterType_Number:
		f, err := strconv.ParseFloat(value, 64)
		if err != nil {
			return nil, err
		}
		return f, nil
	case workflow3.ParameterType_Integer:
		i, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return nil, err
		}
		return i, nil
	case workflow3.ParameterType_Array:
		ret := make([]any, 0)
		err := sonic.UnmarshalString(value, &ret)
		if err != nil {
			return nil, err
		}
		return ret, nil

	}
}
