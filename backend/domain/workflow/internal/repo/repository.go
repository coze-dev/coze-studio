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

	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"golang.org/x/exp/maps"
	"gorm.io/gen"
	"gorm.io/gen/field"
	"gorm.io/gorm"

	workflow3 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/adaptor"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/compose"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/repo/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/repo/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	cm "github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

const (
	batchCreateSize = 10
)

type RepositoryImpl struct {
	idgen.IDGenerator
	query *query.Query
	redis cache.Cmdable
	tos   storage.Storage
	einoCompose.CheckPointStore
	workflow.InterruptEventStore
	workflow.CancelSignalStore
	workflow.ExecuteHistoryStore
	builtinModel cm.BaseChatModel
}

func NewRepository(idgen idgen.IDGenerator, db *gorm.DB, redis cache.Cmdable, tos storage.Storage,
	cpStore einoCompose.CheckPointStore, chatModel cm.BaseChatModel) workflow.Repository {
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
		builtinModel: chatModel,
	}
}

func (r *RepositoryImpl) CreateMeta(ctx context.Context, meta *vo.Meta) (int64, error) {
	id, err := r.GenID(ctx)
	if err != nil {
		return 0, vo.WrapError(errno.ErrIDGenError, err)
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
		return 0, vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("create workflow meta: %w", err))
	}

	return id, nil
}

func (r *RepositoryImpl) updateReferences(ctx context.Context, id int64, wfRefs map[entity.WorkflowReferenceKey]struct{}) (
	err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	currentRefs, err := r.query.WorkflowReference.WithContext(ctx).Where(
		r.query.WorkflowReference.ReferringID.Eq(id)).Find()
	if err != nil {
		return fmt.Errorf("failed to find workflow reference: %w", err)
	}

	if len(currentRefs) == 0 {
		if len(wfRefs) == 0 {
			return nil
		}

		refsToCreateModel := make([]*model.WorkflowReference, 0, len(wfRefs))
		refIDs, err := r.GenMultiIDs(ctx, len(wfRefs))
		if err != nil {
			return fmt.Errorf("failed to gen id for workflow reference: %w", err)
		}
		var index int
		for key := range wfRefs {
			refsToCreateModel = append(refsToCreateModel, &model.WorkflowReference{
				ID:               refIDs[index],
				ReferredID:       key.ReferredID,
				ReferringID:      key.ReferringID,
				ReferType:        int32(key.ReferType),
				ReferringBizType: int32(key.ReferringBizType),
				Status:           1,
			})
			index++
		}

		return r.query.WorkflowReference.WithContext(ctx).Create(refsToCreateModel...)
	}

	if len(wfRefs) == 0 {
		_, err = r.query.WorkflowReference.WithContext(ctx).
			Where(r.query.WorkflowReference.ID.In(slices.Transform(currentRefs,
				func(reference *model.WorkflowReference) int64 {
					return reference.ID
				})...)).
			UpdateColumnSimple(r.query.WorkflowReference.Status.Value(0))
		return err
	}

	var (
		refsToDisable  []int64
		refsToEnable   []int64
		refsToCreate   = maps.Clone(wfRefs)
		existingRefMap = slices.ToMap(currentRefs, func(reference *model.WorkflowReference) (
			entity.WorkflowReferenceKey, *model.WorkflowReference) {
			return entity.WorkflowReferenceKey{
				ReferredID:       reference.ReferredID,
				ReferringID:      reference.ReferringID,
				ReferType:        vo.ReferType(reference.ReferType),
				ReferringBizType: vo.ReferringBizType(reference.ReferringBizType),
			}, reference
		})
	)
	for key, ref := range existingRefMap {
		if ref.Status == 1 {
			if _, ok := wfRefs[key]; !ok {
				refsToDisable = append(refsToDisable, ref.ID)
			}
		} else {
			if _, ok := wfRefs[key]; ok {
				refsToEnable = append(refsToEnable, ref.ID)
				delete(refsToCreate, key)
			}
		}
	}

	for key := range refsToCreate {
		if _, ok := existingRefMap[key]; ok {
			delete(refsToCreate, key)
		}
	}

	if len(refsToCreate) > 0 {
		refsToCreateModel := make([]*model.WorkflowReference, 0, len(refsToCreate))
		refIDs, err := r.GenMultiIDs(ctx, len(refsToCreate))
		if err != nil {
			return fmt.Errorf("failed to gen id for workflow reference: %w", err)
		}
		var index int
		for key := range refsToCreate {
			refsToCreateModel = append(refsToCreateModel, &model.WorkflowReference{
				ID:               refIDs[index],
				ReferredID:       key.ReferredID,
				ReferringID:      key.ReferringID,
				ReferType:        int32(key.ReferType),
				ReferringBizType: int32(key.ReferringBizType),
				Status:           1,
			})
			index++
		}

		if err = r.query.WorkflowReference.WithContext(ctx).Create(refsToCreateModel...); err != nil {
			return fmt.Errorf("failed to create workflow reference for workflowID %d, childIDs %v: %v",
				id, refsToCreate, err)
		}
	}

	if len(refsToDisable) > 0 {
		_, err = r.query.WorkflowReference.WithContext(ctx).
			Where(r.query.WorkflowReference.ID.In(refsToDisable...)).
			UpdateColumnSimple(r.query.WorkflowReference.Status.Value(0))
		if err != nil {
			return fmt.Errorf("failed to disable workflow reference for workflowID %d, childIDs %v: %v",
				id, refsToDisable, err)
		}
	}

	if len(refsToEnable) > 0 {
		_, err = r.query.WorkflowReference.WithContext(ctx).
			Where(r.query.WorkflowReference.ID.In(refsToEnable...)).
			UpdateColumnSimple(r.query.WorkflowReference.Status.Value(1))
		if err != nil {
			return fmt.Errorf("failed to enable workflow reference for workflowID %d, childIDs %v: %v",
				id, refsToEnable, err)
		}
	}

	return nil
}

func (r *RepositoryImpl) CreateVersion(ctx context.Context, id int64, info *vo.VersionInfo, newRefs map[entity.WorkflowReferenceKey]struct{}) (err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	if err = r.updateReferences(ctx, id, newRefs); err != nil {
		return err
	}

	if err = r.query.WorkflowVersion.WithContext(ctx).Create(&model.WorkflowVersion{
		// ID: auto_increment
		WorkflowID:         id,
		Version:            info.Version,
		VersionDescription: info.VersionDescription,
		Canvas:             info.Canvas,
		InputParams:        info.InputParamsStr,
		OutputParams:       info.OutputParamsStr,
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
			r.query.WorkflowMeta.LatestVersionTs.Value(time.Now().UnixMilli()),
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
		InputParams:    draft.InputParamsStr,
		OutputParams:   draft.OutputParamsStr,
		Modified:       draft.Modified,
		TestRunSuccess: draft.TestRunSuccess,
		CommitID:       draft.CommitID,
	}

	if err := r.query.WorkflowDraft.WithContext(ctx).Save(d); err != nil {
		return vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("save workflow draft: %w", err))
	}

	return nil
}

func (r *RepositoryImpl) UpdateWorkflowDraftTestRunSuccess(ctx context.Context, id int64) error {
	if _, err := r.query.WorkflowDraft.WithContext(ctx).Where(r.query.WorkflowDraft.ID.Eq(id)).UpdateColumnSimple(r.query.WorkflowDraft.TestRunSuccess.Value(true)); err != nil {
		return vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("update workflow draft test run success failed: %w", err))
	}

	return nil
}

func (r *RepositoryImpl) Delete(ctx context.Context, id int64) (err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

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

		_, err = tx.WorkflowVersion.WithContext(ctx).Where(tx.WorkflowVersion.WorkflowID.Eq(id)).Delete()
		if err != nil {
			return fmt.Errorf("delete workflow versions: %w", err)
		}

		_, err = tx.WorkflowReference.WithContext(ctx).Where(tx.WorkflowReference.ReferredID.Eq(id)).Delete()
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
		return vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("delete workflow meta failed err=%w", err))
	}

	safego.Go(ctx, func() {
		_, err = r.query.WorkflowDraft.WithContext(ctx).Where(r.query.WorkflowDraft.ID.In(ids...)).Delete()
		if err != nil {
			logs.Warnf("delete workflow draft failed err=%v, ids %v", err, ids)
		}

		_, err = r.query.WorkflowVersion.WithContext(ctx).Where(r.query.WorkflowVersion.WorkflowID.In(ids...)).Delete()
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

func (r *RepositoryImpl) GetMeta(ctx context.Context, id int64) (_ *vo.Meta, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	meta, err := r.query.WorkflowMeta.WithContext(ctx).Debug().Where(r.query.WorkflowMeta.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, vo.WrapError(errno.ErrWorkflowNotFound, fmt.Errorf("workflow meta not found for ID %d: %w", id, err),
				errorx.KV("id", strconv.FormatInt(id, 10)))
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
		return vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("update workflow meta: %w", err))
	}

	return nil
}

func (r *RepositoryImpl) GetEntity(ctx context.Context, policy *vo.GetPolicy) (_ *entity.Workflow, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	meta, err := r.GetMeta(ctx, policy.ID)
	if err != nil {
		return nil, err
	}

	if policy.MetaOnly {
		return &entity.Workflow{
			ID:   policy.ID,
			Meta: meta,
		}, nil
	}

	var (
		canvas, inputParams, outputParams string
		draftMeta                         *vo.DraftMeta
		versionMeta                       *vo.VersionMeta
		commitID                          string
	)
	switch policy.QType {
	case vo.FromDraft:
		draft, err := r.DraftV2(ctx, policy.ID, policy.CommitID)
		if err != nil {
			return nil, err
		}

		canvas = draft.Canvas
		inputParams = draft.InputParamsStr
		outputParams = draft.OutputParamsStr
		draftMeta = draft.DraftMeta
		commitID = draft.CommitID
	case vo.FromSpecificVersion:
		v, err := r.GetVersion(ctx, policy.ID, policy.Version)
		if err != nil {
			return nil, err
		}
		canvas = v.Canvas
		inputParams = v.InputParamsStr
		outputParams = v.OutputParamsStr
		versionMeta = v.VersionMeta
		commitID = v.CommitID
	case vo.FromLatestVersion:
		v, err := r.GetLatestVersion(ctx, policy.ID)
		if err != nil {
			return nil, err
		}
		canvas = v.Canvas
		inputParams = v.InputParamsStr
		outputParams = v.OutputParamsStr
		versionMeta = v.VersionMeta
		commitID = v.CommitID
	default:
		panic(fmt.Sprintf("invalid query type: %v", policy.QType))
	}

	var inputs, outputs []*vo.NamedTypeInfo
	if inputParams != "" {
		err = sonic.UnmarshalString(inputParams, &inputs)
		if err != nil {
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}
	if outputParams != "" {
		err = sonic.UnmarshalString(outputParams, &outputs)
		if err != nil {
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
	}

	return &entity.Workflow{
		ID:       policy.ID,
		CommitID: commitID,
		Meta:     meta,
		CanvasInfo: &vo.CanvasInfo{
			Canvas:          canvas,
			InputParams:     inputs,
			OutputParams:    outputs,
			InputParamsStr:  inputParams,
			OutputParamsStr: outputParams,
		},
		DraftMeta:   draftMeta,
		VersionMeta: versionMeta,
	}, nil
}

func (r *RepositoryImpl) GetVersion(ctx context.Context, id int64, version string) (_ *vo.VersionInfo, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	wfVersion, err := r.query.WorkflowVersion.WithContext(ctx).
		Where(r.query.WorkflowVersion.WorkflowID.Eq(id), r.query.WorkflowVersion.Version.Eq(version)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, vo.WrapError(errno.ErrWorkflowNotFound, fmt.Errorf("workflow version %s not found for ID %d: %w", version, id, err), errorx.KV("id", strconv.FormatInt(id, 10)))
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
			Canvas:          wfVersion.Canvas,
			InputParamsStr:  wfVersion.InputParams,
			OutputParamsStr: wfVersion.OutputParams,
		},
		CommitID: wfVersion.CommitID,
	}, nil
}

func (r *RepositoryImpl) IsApplicationConnectorWorkflowVersion(ctx context.Context, connectorID, workflowID int64, version string) (b bool, err error) {
	connectorWorkflowVersion := r.query.ConnectorWorkflowVersion
	_, err = connectorWorkflowVersion.WithContext(ctx).
		Where(connectorWorkflowVersion.ConnectorID.Eq(connectorID),
			connectorWorkflowVersion.WorkflowID.Eq(workflowID),
			connectorWorkflowVersion.Version.Eq(version)).
		First()

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, vo.WrapError(errno.ErrDatabaseError, err)
	}
	return true, nil
}

func (r *RepositoryImpl) DraftV2(ctx context.Context, id int64, commitID string) (_ *vo.DraftInfo, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	var conds []gen.Condition
	conds = append(conds, r.query.WorkflowDraft.ID.Eq(id))
	if commitID != "" {
		conds = append(conds, r.query.WorkflowDraft.CommitID.Eq(commitID))
	}

	draft, err := r.query.WorkflowDraft.WithContext(ctx).Where(conds...).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if len(commitID) == 0 {
				return nil, vo.WrapError(errno.ErrWorkflowNotFound, fmt.Errorf("workflow draft not found for ID %d: %w", id, err),
					errorx.KV("id", strconv.FormatInt(id, 10)))
			} else {
				snapshot, err := r.query.WorkflowSnapshot.WithContext(ctx).Where(
					r.query.WorkflowSnapshot.WorkflowID.Eq(id),
					r.query.WorkflowSnapshot.CommitID.Eq(commitID),
				).First()
				if err != nil {
					if errors.Is(err, gorm.ErrRecordNotFound) {
						return nil, vo.WrapError(errno.ErrWorkflowSnapshotNotFound,
							fmt.Errorf("workflow snapshot not found for ID %d, commitID %s: %w",
								id, commitID, err),
							errorx.KV("id", strconv.FormatInt(id, 10)),
							errorx.KV("commit_id", commitID))
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

					Canvas:          snapshot.Canvas,
					InputParamsStr:  snapshot.InputParams,
					OutputParamsStr: snapshot.OutputParams,
					CommitID:        snapshot.CommitID,
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

		Canvas:          draft.Canvas,
		InputParamsStr:  draft.InputParams,
		OutputParamsStr: draft.OutputParams,
		CommitID:        draft.CommitID,
	}, nil
}

func (r *RepositoryImpl) MGetDrafts(ctx context.Context, policy *vo.MGetPolicy) (_ []*entity.Workflow, totalCount int64, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	q := policy.MetaQuery
	if len(q.IDs) == 0 && q.Page == nil && q.Name == nil && q.AppID == nil {
		return nil, 0, vo.WrapError(errno.ErrInternalBadRequest,
			fmt.Errorf("insufficient query parameters for workflow draft: %+v", q),
			errorx.KV("scene", "query workflow drafts"))
	}

	var (
		conditions []gen.Condition
	)
	if len(q.IDs) > 0 {
		conditions = append(conditions, r.query.WorkflowDraft.ID.In(q.IDs...))
	}

	if q.Name != nil {
		conditions = append(conditions, r.query.WorkflowMeta.Name.Like(`%%`+*q.Name+`%%`))
	}

	if q.SpaceID != nil {
		conditions = append(conditions, r.query.WorkflowMeta.SpaceID.Eq(*q.SpaceID))
	}

	if q.PublishStatus != nil {
		if *q.PublishStatus == vo.HasPublished {
			conditions = append(conditions, r.query.WorkflowMeta.Status.Eq(1))
		} else {
			conditions = append(conditions, r.query.WorkflowMeta.Status.Eq(0))
		}
	}

	if q.AppID != nil {
		conditions = append(conditions, r.query.WorkflowMeta.AppID.Eq(*q.AppID))
	}

	if q.LibOnly {
		conditions = append(conditions, r.query.WorkflowMeta.AppID.Eq(0))
	}

	type combinedDraft struct {
		model.WorkflowDraft
		Name          string `gorm:"column:name"`
		Description   string `gorm:"column:description"`
		AppID         int64  `gorm:"column:app_id"`
		Status        int32  `gorm:"column:status"`
		SpaceID       int64  `gorm:"column:space_id"`
		IconURI       string `gorm:"column:icon_uri"`
		ContentType   int32  `gorm:"column:content_type"`
		Mode          int32  `gorm:"column:mode"`
		CreatedAt     int64  `gorm:"column:created_at"`
		CreatorID     int64  `gorm:"column:creator_id"`
		Tag           int32  `gorm:"column:tag"`
		LatestVersion string `gorm:"column:latest_version"`
	}

	selectColumns := r.query.WorkflowDraft.Columns(r.query.WorkflowDraft.ALL)
	selectColumns = append(selectColumns, r.query.WorkflowMeta.Name.As("name"),
		r.query.WorkflowMeta.Description.As("description"),
		r.query.WorkflowMeta.AppID.As("app_id"),
		r.query.WorkflowMeta.Status.As("status"),
		r.query.WorkflowMeta.SpaceID.As("space_id"),
		r.query.WorkflowMeta.IconURI.As("icon_uri"),
		r.query.WorkflowMeta.ContentType.As("content_type"),
		r.query.WorkflowMeta.Mode.As("mode"),
		r.query.WorkflowMeta.CreatedAt.As("created_at"),
		r.query.WorkflowMeta.CreatorID.As("creator_id"),
		r.query.WorkflowMeta.Tag.As("tag"),
		r.query.WorkflowMeta.LatestVersion.As("latest_version"),
	)

	d := r.query.WorkflowDraft.Debug().WithContext(ctx).
		Join(r.query.WorkflowMeta, r.query.WorkflowDraft.ID.EqCol(r.query.WorkflowMeta.ID)).
		Select(selectColumns...).
		Where(conditions...)

	if q.NeedTotalNumber {
		totalCount, err = d.Count()
		if err != nil {
			return nil, 0, fmt.Errorf("failed to get workflow draft count for policy %+v: %w", policy, err)
		}
	}

	if q.DescByUpdate {
		d = d.Order(r.query.WorkflowDraft.UpdatedAt.Desc())
	} else {
		d = d.Order(r.query.WorkflowMeta.CreatedAt.Desc())
	}

	var combinedDrafts []combinedDraft
	if q.Page != nil {
		_, err = d.ScanByPage(&combinedDrafts, q.Page.Offset(), q.Page.Limit())
	} else {
		err = d.Scan(&combinedDrafts)
	}
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, 0, nil
		}
		return nil, 0, fmt.Errorf("failed to get workflow draft for policy %+v: %w", policy, err)
	}

	result := make([]*entity.Workflow, len(combinedDrafts))
	for i, draft := range combinedDrafts {
		url, err := r.tos.GetObjectUrl(ctx, draft.IconURI)
		if err != nil {
			logs.Warnf("failed to get url for workflow meta %v", err)
		}

		canvasInfo := &vo.CanvasInfo{
			Canvas:          draft.Canvas,
			InputParamsStr:  draft.InputParams,
			OutputParamsStr: draft.OutputParams,
		}
		if err = canvasInfo.Unmarshal(); err != nil {
			return nil, 0, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}

		wf := &entity.Workflow{
			ID:       draft.ID,
			CommitID: draft.CommitID,
			Meta: &vo.Meta{
				SpaceID:     draft.SpaceID,
				CreatorID:   draft.CreatorID,
				CreatedAt:   time.UnixMilli(draft.CreatedAt),
				ContentType: entity.ContentType(draft.ContentType),
				Name:        draft.Name,
				Desc:        draft.Description,
				IconURI:     draft.IconURI,
				IconURL:     url,
				Mode:        entity.Mode(draft.Mode),
			},
			DraftMeta: &vo.DraftMeta{
				TestRunSuccess: draft.TestRunSuccess,
				Modified:       draft.Modified,
				Timestamp:      time.UnixMilli(draft.UpdatedAt),
				IsSnapshot:     false,
			},
			CanvasInfo: canvasInfo,
		}

		if draft.Tag != 0 {
			wf.Meta.Tag = ptr.Of(entity.Tag(draft.Tag))
		}
		if draft.AppID != 0 {
			wf.Meta.AppID = &draft.AppID
		}
		if draft.Status > 0 {
			wf.Meta.HasPublished = true
		}
		if draft.LatestVersion != "" {
			wf.Meta.LatestPublishedVersion = &draft.LatestVersion
		}

		result[i] = wf
	}

	return result, totalCount, nil
}

func (r *RepositoryImpl) MGetLatestVersion(ctx context.Context, policy *vo.MGetPolicy) (
	_ []*entity.Workflow, totalCount int64, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	q := policy.MetaQuery
	if len(q.IDs) == 0 && q.Page == nil && q.Name == nil && q.AppID == nil {
		return nil, 0, vo.WrapError(errno.ErrInternalBadRequest,
			fmt.Errorf("insufficient query parameters for workflow latest versions: %+v", q),
			errorx.KV("scene", "query latest workflow version"))
	}

	var (
		conditions []gen.Condition
	)
	if len(q.IDs) > 0 {
		conditions = append(conditions, r.query.WorkflowVersion.WorkflowID.In(q.IDs...))
	}

	if q.Name != nil {
		conditions = append(conditions, r.query.WorkflowMeta.Name.Like(`%%`+*q.Name+`%%`))
	}

	if q.SpaceID != nil {
		conditions = append(conditions, r.query.WorkflowMeta.SpaceID.Eq(*q.SpaceID))
	}

	if q.PublishStatus != nil {
		if *q.PublishStatus == vo.HasPublished {
			conditions = append(conditions, r.query.WorkflowMeta.Status.Eq(1))
		} else {
			conditions = append(conditions, r.query.WorkflowMeta.Status.Eq(0))
		}
	}

	if q.AppID != nil {
		conditions = append(conditions, r.query.WorkflowMeta.AppID.Eq(*q.AppID))
	}

	if q.LibOnly {
		conditions = append(conditions, r.query.WorkflowMeta.AppID.Eq(0))
	}

	type combinedVersion struct {
		model.WorkflowMeta
		Version            string `gorm:"column:version"`             // release version
		VersionDescription string `gorm:"column:version_description"` // version description
		Canvas             string `gorm:"column:canvas"`              // Front-end schema
		InputParams        string `gorm:"column:input_params"`
		OutputParams       string `gorm:"column:output_params"`
		VersionCreatorID   int64  `gorm:"column:version_creator_id"` // Publish user ID
		VersionCreatedAt   int64  `gorm:"column:version_created_at"` // Creation time millisecond timestamp
		CommitID           string `gorm:"column:commit_id"`          // the commit id corresponding to this version
	}

	selectColumns := r.query.WorkflowMeta.Columns(r.query.WorkflowMeta.ALL)
	selectColumns = append(selectColumns, r.query.WorkflowVersion.Version.As("version"),
		r.query.WorkflowVersion.VersionDescription.As("version_description"),
		r.query.WorkflowVersion.Canvas.As("canvas"),
		r.query.WorkflowVersion.InputParams.As("input_params"),
		r.query.WorkflowVersion.OutputParams.As("output_params"),
		r.query.WorkflowVersion.CreatorID.As("version_creator_id"),
		r.query.WorkflowVersion.CreatedAt.As("version_created_at"),
		r.query.WorkflowVersion.CommitID.As("commit_id"),
	)

	d := r.query.WorkflowMeta.Debug().WithContext(ctx).
		Join(r.query.WorkflowVersion, r.query.WorkflowVersion.WorkflowID.EqCol(r.query.WorkflowMeta.ID),
			r.query.WorkflowVersion.Version.EqCol(r.query.WorkflowMeta.LatestVersion)).
		Select(selectColumns...).
		Where(conditions...)

	if q.NeedTotalNumber {
		totalCount, err = d.Count()
		if err != nil {
			return nil, 0, fmt.Errorf("failed to get workflow latest versions count for policy %+v: %w", policy, err)
		}
	}

	if q.DescByUpdate {
		d = d.Order(r.query.WorkflowMeta.LatestVersionTs.Desc())
	} else {
		d = d.Order(r.query.WorkflowMeta.LatestVersionTs.Asc())
	}

	var combinedVersions []combinedVersion
	if q.Page != nil {
		_, err = d.ScanByPage(&combinedVersions, q.Page.Offset(), q.Page.Limit())
	} else {
		err = d.Scan(&combinedVersions)
	}
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, 0, nil
		}
		return nil, 0, fmt.Errorf("failed to get workflow latest versions for policy %+v: %w", policy, err)
	}

	result := make([]*entity.Workflow, len(combinedVersions))
	for i, version := range combinedVersions {
		url, err := r.tos.GetObjectUrl(ctx, version.IconURI)
		if err != nil {
			logs.Warnf("failed to get url for workflow meta %v", err)
		}

		canvasInfo := &vo.CanvasInfo{
			Canvas:          version.Canvas,
			InputParamsStr:  version.InputParams,
			OutputParamsStr: version.OutputParams,
		}
		if err = canvasInfo.Unmarshal(); err != nil {
			return nil, 0, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}

		wf := &entity.Workflow{
			ID:       version.ID,
			CommitID: version.CommitID,
			Meta: &vo.Meta{
				SpaceID:     version.SpaceID,
				CreatorID:   version.CreatorID,
				CreatedAt:   time.UnixMilli(version.CreatedAt),
				ContentType: entity.ContentType(version.ContentType),
				Name:        version.Name,
				Desc:        version.Description,
				IconURI:     version.IconURI,
				IconURL:     url,
				Mode:        entity.Mode(version.Mode),
			},
			VersionMeta: &vo.VersionMeta{
				Version:            version.Version,
				VersionDescription: version.VersionDescription,
				VersionCreatedAt:   time.UnixMilli(version.VersionCreatedAt),
				VersionCreatorID:   version.VersionCreatorID,
			},
			CanvasInfo: canvasInfo,
		}

		if version.Tag != 0 {
			wf.Meta.Tag = ptr.Of(entity.Tag(version.Tag))
		}
		if version.AppID != 0 {
			wf.Meta.AppID = &version.AppID
		}
		if version.Status > 0 {
			wf.Meta.HasPublished = true
		}
		if version.LatestVersion != "" {
			wf.Meta.LatestPublishedVersion = &version.LatestVersion
		}

		result[i] = wf
	}

	return result, totalCount, nil
}

func (r *RepositoryImpl) MGetReferences(ctx context.Context, policy *vo.MGetReferencePolicy) (
	_ []*entity.WorkflowReference, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	if len(policy.ReferredIDs) == 0 {
		return nil, vo.WrapError(errno.ErrInternalBadRequest, errors.New("referred IDs cannot be empty when querying references"))
	}

	var conds []gen.Condition
	if len(policy.ReferredIDs) == 1 {
		conds = append(conds, r.query.WorkflowReference.ReferredID.Eq(policy.ReferredIDs[0]))
	} else {
		conds = append(conds, r.query.WorkflowReference.ReferredID.In(policy.ReferredIDs...))
	}

	if len(policy.ReferringIDs) == 1 {
		conds = append(conds, r.query.WorkflowReference.ReferringID.Eq(policy.ReferringIDs[0]))
	} else if len(policy.ReferringIDs) > 1 {
		conds = append(conds, r.query.WorkflowReference.ReferringID.In(policy.ReferringIDs...))
	}

	if len(policy.ReferType) == 1 {
		conds = append(conds, r.query.WorkflowReference.ReferType.Eq(int32(policy.ReferType[0])))
	} else if len(policy.ReferType) > 1 {
		conds = append(conds, r.query.WorkflowReference.ReferType.In(
			slices.Transform(policy.ReferType, func(r vo.ReferType) int32 {
				return int32(r)
			})...))
	}

	if len(policy.ReferringBizType) == 1 {
		conds = append(conds, r.query.WorkflowReference.ReferringBizType.Eq(int32(policy.ReferringBizType[0])))
	} else if len(policy.ReferringBizType) > 1 {
		conds = append(conds, r.query.WorkflowReference.ReferringBizType.In(
			slices.Transform(policy.ReferringBizType, func(r vo.ReferringBizType) int32 {
				return int32(r)
			})...))
	}

	conds = append(conds, r.query.WorkflowReference.Status.Eq(1))

	refs, err := r.query.WorkflowReference.WithContext(ctx).Where(conds...).Find()
	if err != nil {
		return nil, fmt.Errorf("failed to query workflow references: %w", err)
	}

	result := make([]*entity.WorkflowReference, 0, len(refs))
	for _, ref := range refs {
		result = append(result, &entity.WorkflowReference{
			ID: ref.ID,
			WorkflowReferenceKey: entity.WorkflowReferenceKey{
				ReferredID:       ref.ReferredID,
				ReferringID:      ref.ReferringID,
				ReferType:        vo.ReferType(ref.ReferType),
				ReferringBizType: vo.ReferringBizType(ref.ReferringBizType),
			},
			CreatedAt: time.UnixMilli(ref.CreatedAt),
			Enabled:   ref.Status == 1,
		})
	}

	return result, nil
}

func (r *RepositoryImpl) MGetMetas(ctx context.Context, query *vo.MetaQuery) (
	_ map[int64]*vo.Meta, _ int64, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	if len(query.IDs) == 0 && query.Page == nil && query.Name == nil && query.AppID == nil {
		return nil, 0, vo.WrapError(errno.ErrInternalBadRequest,
			fmt.Errorf("insufficient query parameters for workflow meta: %+v", query),
			errorx.KV("scene", "query workflow metas"))
	}

	var conditions []gen.Condition
	if len(query.IDs) > 0 {
		conditions = append(conditions, r.query.WorkflowMeta.ID.In(query.IDs...))
	}

	if query.Name != nil {
		conditions = append(conditions, r.query.WorkflowMeta.Name.Like(`%%`+*query.Name+`%%`))
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

	if query.LibOnly { // if AppID not specified, we can only query those within Library
		conditions = append(conditions, r.query.WorkflowMeta.AppID.Eq(0))
	}

	var result []*model.WorkflowMeta

	workflowMetaDo := r.query.WorkflowMeta.WithContext(ctx).Debug().Where(conditions...)

	var total int64
	if query.NeedTotalNumber { // this is the total count
		total, err = workflowMetaDo.Count()
		if err != nil {
			return nil, 0, err
		}
	}

	if query.DescByUpdate {
		workflowMetaDo = workflowMetaDo.Order(r.query.WorkflowMeta.UpdatedAt.Desc())
	} else {
		workflowMetaDo = workflowMetaDo.Order(r.query.WorkflowMeta.CreatedAt.Desc())
	}

	if query.Page != nil {
		result, _, err = workflowMetaDo.FindByPage(query.Page.Offset(), query.Page.Limit())
		if err != nil {
			return nil, 0, err
		}
	} else {
		if len(conditions) == 0 {
			return nil, 0, errors.New("no conditions provided")
		}
		result, err = workflowMetaDo.Find()
		if err != nil {
			return nil, 0, err
		}
	}

	wfMap := make(map[int64]*vo.Meta, len(result))
	for _, meta := range result {
		converted, err := r.convertMeta(ctx, meta)
		if err != nil {
			return nil, 0, err
		}
		wfMap[meta.ID] = converted
	}
	return wfMap, total, nil
}

func (r *RepositoryImpl) GetLatestVersion(ctx context.Context, id int64) (*vo.VersionInfo, error) {
	version, err := r.query.WorkflowVersion.WithContext(ctx).Where(r.query.WorkflowVersion.WorkflowID.Eq(id)).
		Order(r.query.WorkflowVersion.CreatedAt.Desc()).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, vo.WrapError(errno.ErrWorkflowNotFound,
				fmt.Errorf("workflow version not found for ID %d: %w", id, err),
				errorx.KV("id", strconv.FormatInt(id, 10)))
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
			Canvas:          version.Canvas,
			InputParamsStr:  version.InputParams,
			OutputParamsStr: version.OutputParams,
		},
	}, nil
}

func (r *RepositoryImpl) CreateSnapshotIfNeeded(ctx context.Context, id int64, commitID string) error {
	latestSnapshot, err := r.query.WorkflowSnapshot.WithContext(ctx).Where(
		r.query.WorkflowSnapshot.WorkflowID.Eq(id),
		r.query.WorkflowSnapshot.CommitID.Eq(commitID),
	).First()

	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			logs.CtxErrorf(ctx, "query workflow snapshot failed err=%v", err)
		}
	} else if latestSnapshot != nil { // already have this snapshot, no need to create it
		return nil
	}

	draft, err := r.query.WorkflowDraft.WithContext(ctx).Where(
		r.query.WorkflowDraft.ID.Eq(id),
		r.query.WorkflowDraft.CommitID.Eq(commitID),
	).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return vo.WrapError(errno.ErrWorkflowNotFound,
				fmt.Errorf("workflow draft not found for ID %d, commitID %s: %w", id, commitID, err),
				errorx.KV("id", strconv.FormatInt(id, 10)))
		}
		return vo.WrapError(errno.ErrDatabaseError,
			fmt.Errorf("failed to query workflow draft for ID %d, commitID %s: %w", id, commitID, err))
	}

	return r.query.WorkflowSnapshot.WithContext(ctx).Save(&model.WorkflowSnapshot{
		// ID: auto_increment
		WorkflowID:   id,
		CommitID:     commitID,
		Canvas:       draft.Canvas,
		InputParams:  draft.InputParams,
		OutputParams: draft.OutputParams,
	})
}

func (r *RepositoryImpl) WorkflowAsTool(ctx context.Context, policy vo.GetPolicy, wfToolConfig vo.WorkflowToolConfig) (workflow.ToolFromWorkflow, error) {
	var (
		canvas               vo.Canvas
		inputParamsCfg       = wfToolConfig.InputParametersConfig
		outputParamsCfg      = wfToolConfig.OutputParametersConfig
		inputParamsConfigMap = slices.ToMap(inputParamsCfg, func(w *workflow3.APIParameter) (string, *workflow3.APIParameter) {
			return w.Name, w
		})
	)

	wfEntity, err := r.GetEntity(ctx, &policy)
	if err != nil {
		return nil, err
	}

	if err = sonic.UnmarshalString(wfEntity.Canvas, &canvas); err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	name := fmt.Sprintf("ts_%s_%s", wfEntity.Name, wfEntity.Name)
	desc := wfEntity.Desc

	var params map[string]*schema.ParameterInfo

	for _, tInfo := range wfEntity.InputParams {
		if p, ok := inputParamsConfigMap[tInfo.Name]; ok && p.LocalDisable {
			continue
		}
		param, err := tInfo.ToParameterInfo()
		if err != nil {
			return nil, err
		}

		if params == nil {
			params = make(map[string]*schema.ParameterInfo)
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
		return nil, vo.WrapError(errno.ErrSchemaConversionFail, err)
	}

	var opts []compose.WorkflowOption
	opts = append(opts, compose.WithIDAsName(policy.ID))
	if s := execute.GetStaticConfig(); s != nil && s.MaxNodeCountPerWorkflow > 0 {
		opts = append(opts, compose.WithMaxNodeCount(s.MaxNodeCountPerWorkflow))
	}

	wf, err := compose.NewWorkflow(ctx, workflowSC, opts...)
	if err != nil {
		return nil, vo.WrapError(errno.ErrWorkflowCompileFail, err)
	}

	type streamFunc func(ctx context.Context, in map[string]any, opts ...einoCompose.Option) (*schema.StreamReader[map[string]any], error)

	if wf.StreamRun() {
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

func (r *RepositoryImpl) CopyWorkflow(ctx context.Context, workflowID int64, policy vo.CopyWorkflowPolicy) (
	_ *entity.Workflow, err error) {
	const (
		copyWorkflowRedisKeyPrefix         = "copy_workflow_redis_key_prefix"
		copyWorkflowRedisKeyExpireInterval = time.Hour * 24 * 7
	)

	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	var (
		copiedID      int64
		workflowMeta  = r.query.WorkflowMeta
		workflowDraft = r.query.WorkflowDraft
	)

	copiedID, err = r.IDGenerator.GenID(ctx)
	if err != nil {
		return nil, vo.WrapError(errno.ErrIDGenError, err)
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

	var copiedWorkflowName string
	if policy.ShouldModifyWorkflowName {
		copiedWorkflowRedisKey := fmt.Sprintf("%s:%d:%d", copyWorkflowRedisKeyPrefix, workflowID, ctxutil.MustGetUIDFromCtx(ctx))
		copiedNameSuffix, err := r.redis.Incr(ctx, copiedWorkflowRedisKey).Result()
		if err != nil {
			return nil, vo.WrapError(errno.ErrRedisError, err)
		}
		err = r.redis.Expire(ctx, copiedWorkflowRedisKey, copyWorkflowRedisKeyExpireInterval).Err()
		if err != nil {
			logs.Warnf("failed to set the rediskey %v expiration time, err=%v", copiedWorkflowRedisKey, err)
		}
		copiedWorkflowName = fmt.Sprintf("%s_%d", wfMeta.Name, copiedNameSuffix)
	} else {
		copiedWorkflowName = wfMeta.Name
	}

	err = r.query.Transaction(func(tx *query.Query) error {
		wfMeta.Name = copiedWorkflowName
		wfMeta.SourceID = workflowID
		wfMeta.Status = 0
		wfMeta.ID = copiedID
		wfMeta.CreatedAt = 0
		wfMeta.UpdatedAt = 0
		wfMeta.LatestVersion = ""
		if policy.TargetSpaceID != nil {
			wfMeta.SpaceID = *policy.TargetSpaceID
		}
		if policy.TargetAppID != nil {
			wfMeta.AppID = *policy.TargetAppID
		}
		wfMeta.CreatorID = ctxutil.MustGetUIDFromCtx(ctx)
		err = workflowMeta.WithContext(ctx).Create(wfMeta)
		if err != nil {
			return err
		}

		wfDraft.ID = copiedID
		// copy workflow are treated as modified and not tested run
		wfDraft.TestRunSuccess = false
		wfDraft.Modified = true
		wfDraft.UpdatedAt = 0
		wfDraft.CommitID = strconv.FormatInt(commitID, 10)
		if policy.ModifiedCanvasSchema != nil {
			wfDraft.Canvas = *policy.ModifiedCanvasSchema
		}
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
		ID:       copiedID,
		CommitID: wfDraft.CommitID,
		Meta: &vo.Meta{
			SpaceID:   wfMeta.SpaceID,
			Name:      wfMeta.Name,
			CreatorID: wfMeta.CreatorID,
			IconURI:   wfMeta.IconURI,
			Desc:      wfMeta.Description,
			AppID:     ternary.IFElse(wfMeta.AppID == 0, (*int64)(nil), ptr.Of(wfMeta.AppID)),
		},
		CanvasInfo: &vo.CanvasInfo{
			Canvas:          wfDraft.Canvas,
			InputParamsStr:  wfDraft.InputParams,
			OutputParamsStr: wfDraft.OutputParams,
		},
	}

	return copiedWorkflow, nil
}

// ExportWorkflowData exports a single workflow's data for packaging
func (r *RepositoryImpl) ExportWorkflowData(ctx context.Context, workflowID int64) (*vo.WorkflowExportData, error) {
	// Get workflow entity with draft data
	policy := &vo.GetPolicy{
		ID:    workflowID,
		QType: vo.FromDraft,
	}

	wfEntity, err := r.GetEntity(ctx, policy)
	if err != nil {
		return nil, err
	}

	// Get dependencies
	dependencies, err := r.getWorkflowDependencies(ctx, workflowID)
	if err != nil {
		logs.Warnf("Failed to get dependencies for workflow %d: %v", workflowID, err)
		// Don't fail the export for dependency analysis issues
		dependencies = &vo.DependenceResource{
			PluginIDs:    []int64{},
			KnowledgeIDs: []int64{},
			DatabaseIDs:  []int64{},
		}
	}

	// Get workflow references
	references, err := r.getWorkflowReferences(ctx, workflowID)
	if err != nil {
		logs.Warnf("Failed to get references for workflow %d: %v", workflowID, err)
		references = []vo.WorkflowReferenceKey{}
	}

	// Create export data
	exportData := &vo.WorkflowExportData{
		OriginalID:   workflowID,
		Meta:         wfEntity.Meta,
		CanvasInfo:   wfEntity.CanvasInfo,
		DraftMeta:    wfEntity.DraftMeta,
		VersionMeta:  wfEntity.VersionMeta,
		Dependencies: dependencies,
		References:   references,
		ExportedFrom: "coze-studio",
		ExportedAt:   time.Now(),
	}

	return exportData, nil
}

// ImportWorkflowData imports a single workflow from export data
func (r *RepositoryImpl) ImportWorkflowData(ctx context.Context, importData *vo.WorkflowExportData, policy vo.ImportWorkflowPolicy) (*entity.Workflow, error) {
	// Generate new workflow ID
	newID, err := r.IDGenerator.GenID(ctx)
	if err != nil {
		return nil, vo.WrapError(errno.ErrIDGenError, err)
	}

	// Generate new commit ID
	commitID, err := r.IDGenerator.GenID(ctx)
	if err != nil {
		return nil, vo.WrapError(errno.ErrIDGenError, err)
	}

	// Handle name conflicts
	workflowName := importData.Meta.Name
	if policy.ShouldModifyWorkflowName && policy.ConflictResolution == vo.ConflictStrategy_Rename {
		workflowName, err = r.resolveNameConflict(ctx, importData.Meta.Name, policy.TargetSpaceID)
		if err != nil {
			logs.Warnf("Failed to resolve name conflict for workflow %s: %v", importData.Meta.Name, err)
			// Continue with original name
			workflowName = importData.Meta.Name
		}
	}

	// Perform import in transaction
	var importedWorkflow *entity.Workflow
	err = r.query.Transaction(func(tx *query.Query) error {
		return r.importWorkflowInTransaction(ctx, tx, importData, policy, newID, commitID, workflowName)
	})
	if err != nil {
		return nil, err
	}

	// Create result entity
	importedWorkflow = &entity.Workflow{
		ID:       newID,
		CommitID: strconv.FormatInt(commitID, 10),
		Meta: &vo.Meta{
			Name:      workflowName,
			Desc:      importData.Meta.Desc,
			IconURI:   importData.Meta.IconURI,
			SpaceID:   *policy.TargetSpaceID,
			CreatorID: ctxutil.MustGetUIDFromCtx(ctx),
			AppID:     policy.TargetAppID,
		},
		CanvasInfo: importData.CanvasInfo,
	}

	return importedWorkflow, nil
}

// importWorkflowInTransaction performs the actual import within a database transaction
func (r *RepositoryImpl) importWorkflowInTransaction(ctx context.Context, tx *query.Query, importData *vo.WorkflowExportData, policy vo.ImportWorkflowPolicy, newID int64, commitID int64, workflowName string) error {
	// Create workflow meta
	wfMeta := &model.WorkflowMeta{
		ID:          newID,
		Name:        workflowName,
		Description: importData.Meta.Desc,
		IconURI:     importData.Meta.IconURI,
		ContentType: int32(importData.Meta.ContentType),
		Mode:        int32(importData.Meta.Mode),
		CreatorID:   ctxutil.MustGetUIDFromCtx(ctx),
		AuthorID:    ctxutil.MustGetUIDFromCtx(ctx),
		SpaceID:     *policy.TargetSpaceID,
		Status:      0, // Unpublished
		DeletedAt:   gorm.DeletedAt{Valid: false},
	}

	if importData.Meta.Tag != nil {
		wfMeta.Tag = int32(*importData.Meta.Tag)
	}

	if policy.TargetAppID != nil {
		wfMeta.AppID = *policy.TargetAppID
	}

	if err := tx.WorkflowMeta.WithContext(ctx).Create(wfMeta); err != nil {
		return vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("create workflow meta: %w", err))
	}

	// Create workflow draft
	wfDraft := &model.WorkflowDraft{
		ID:             newID,
		Canvas:         importData.CanvasInfo.Canvas,
		InputParams:    importData.CanvasInfo.InputParamsStr,
		OutputParams:   importData.CanvasInfo.OutputParamsStr,
		Modified:       true,  // Mark as modified since it's imported
		TestRunSuccess: false, // Not tested yet
		CommitID:       strconv.FormatInt(commitID, 10),
	}

	if err := tx.WorkflowDraft.WithContext(ctx).Create(wfDraft); err != nil {
		return vo.WrapError(errno.ErrDatabaseError, fmt.Errorf("create workflow draft: %w", err))
	}

	return nil
}

// resolveNameConflict resolves naming conflicts using Redis counter (similar to CopyWorkflow)
func (r *RepositoryImpl) resolveNameConflict(ctx context.Context, originalName string, targetSpaceID *int64) (string, error) {
	if targetSpaceID == nil {
		return originalName, nil
	}

	const (
		importWorkflowRedisKeyPrefix         = "import_workflow_redis_key_prefix"
		importWorkflowRedisKeyExpireInterval = time.Hour * 24 * 7
	)

	importWorkflowRedisKey := fmt.Sprintf("%s:%d:%d:%s", importWorkflowRedisKeyPrefix, *targetSpaceID, ctxutil.MustGetUIDFromCtx(ctx), originalName)
	copiedNameSuffix, err := r.redis.Incr(ctx, importWorkflowRedisKey).Result()
	if err != nil {
		return "", vo.WrapError(errno.ErrRedisError, err)
	}

	err = r.redis.Expire(ctx, importWorkflowRedisKey, importWorkflowRedisKeyExpireInterval).Err()
	if err != nil {
		logs.Warnf("failed to set the rediskey %v expiration time, err=%v", importWorkflowRedisKey, err)
	}

	return fmt.Sprintf("%s_%d", originalName, copiedNameSuffix), nil
}

// getWorkflowDependencies analyzes workflow dependencies (plugins, knowledge, databases)
func (r *RepositoryImpl) getWorkflowDependencies(ctx context.Context, workflowID int64) (*vo.DependenceResource, error) {
	// Get workflow canvas to analyze dependencies
	draft, err := r.DraftV2(ctx, workflowID, "")
	if err != nil {
		return nil, err
	}

	// Parse canvas to extract dependencies
	var canvas vo.Canvas
	if err := sonic.UnmarshalString(draft.Canvas, &canvas); err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	// Analyze dependencies from canvas nodes
	dependencies := &vo.DependenceResource{
		PluginIDs:    []int64{},
		KnowledgeIDs: []int64{},
		DatabaseIDs:  []int64{},
	}

	// Simple dependency extraction (this could be made more sophisticated)
	r.extractDependenciesFromNodes(canvas.Nodes, dependencies)

	return dependencies, nil
}

// extractDependenciesFromNodes extracts dependencies from workflow nodes
func (r *RepositoryImpl) extractDependenciesFromNodes(nodes []*vo.Node, dependencies *vo.DependenceResource) {
	for _, node := range nodes {
		// Extract plugin dependencies (simplified - would need more sophisticated parsing)
		if node.Data != nil {
			// Check for plugin-related blocks
			// Note: vo.BlockTypePlugin might not exist, this is a simplified implementation
			// In practice, you'd need to check the actual node types defined in vo package
		}

		// Extract knowledge dependencies (simplified)
		if node.Type == vo.BlockTypeBotDataset || node.Type == vo.BlockTypeBotDatasetWrite {
			// This would need more sophisticated parsing based on node structure
			// For now, just mark that knowledge dependencies exist
		}

		// Extract database dependencies (simplified)
		if node.Type == vo.BlockTypeDatabase || node.Type == vo.BlockTypeDatabaseSelect ||
			node.Type == vo.BlockTypeDatabaseInsert || node.Type == vo.BlockTypeDatabaseDelete ||
			node.Type == vo.BlockTypeDatabaseUpdate {
			// This would need more sophisticated parsing based on node structure
			// For now, just mark that database dependencies exist
		}

		// Recursively check child nodes
		if len(node.Blocks) > 0 {
			r.extractDependenciesFromNodes(node.Blocks, dependencies)
		}
	}
}

// getWorkflowReferences gets workflow reference relationships
func (r *RepositoryImpl) getWorkflowReferences(ctx context.Context, workflowID int64) ([]vo.WorkflowReferenceKey, error) {
	policy := &vo.MGetReferencePolicy{
		ReferredIDs: []int64{workflowID},
	}

	references, err := r.MGetReferences(ctx, policy)
	if err != nil {
		return nil, err
	}

	// Convert to reference keys
	referenceKeys := make([]vo.WorkflowReferenceKey, len(references))
	for i, ref := range references {
		referenceKeys[i] = vo.WorkflowReferenceKey{
			ReferredID:       ref.WorkflowReferenceKey.ReferredID,
			ReferringID:      ref.WorkflowReferenceKey.ReferringID,
			ReferType:        ref.WorkflowReferenceKey.ReferType,
			ReferringBizType: ref.WorkflowReferenceKey.ReferringBizType,
		}
	}

	return referenceKeys, nil
}

func (r *RepositoryImpl) GetDraftWorkflowsByAppID(ctx context.Context, AppID int64) (
	_ map[int64]*vo.DraftInfo, _ map[int64]string, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrDatabaseError, err)
		}
	}()

	var (
		workflowMeta  = r.query.WorkflowMeta
		workflowDraft = r.query.WorkflowDraft
	)

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
			Canvas:          d.Canvas,
			InputParamsStr:  d.InputParams,
			OutputParamsStr: d.OutputParams,
		}
	}

	wid2Named := slices.ToMap(wfMetas, func(e *model.WorkflowMeta) (int64, string) {
		return e.ID, e.Name
	})
	return result, wid2Named, nil
}

func (r *RepositoryImpl) BatchCreateConnectorWorkflowVersion(ctx context.Context, appID, connectorID int64, workflowIDs []int64, version string) error {
	objects := make([]*model.ConnectorWorkflowVersion, 0, len(workflowIDs))
	for idx := range workflowIDs {
		workflowID := workflowIDs[idx]
		objects = append(objects, &model.ConnectorWorkflowVersion{
			AppID:       appID,
			ConnectorID: connectorID,
			Version:     version,
			WorkflowID:  workflowID,
		})
	}
	err := r.query.ConnectorWorkflowVersion.WithContext(ctx).CreateInBatches(objects, batchCreateSize)
	if err != nil {
		return vo.WrapError(errno.ErrDatabaseError, err)
	}

	return nil
}

func (r *RepositoryImpl) GetKnowledgeRecallChatModel() cm.BaseChatModel {
	return r.builtinModel
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
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
		return ret, nil
	case workflow3.ParameterType_Bool:
		b, err := strconv.ParseBool(value)
		if err != nil {
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
		return b, nil
	case workflow3.ParameterType_Number:
		f, err := strconv.ParseFloat(value, 64)
		if err != nil {
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
		return f, nil
	case workflow3.ParameterType_Integer:
		i, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
		return i, nil
	case workflow3.ParameterType_Array:
		ret := make([]any, 0)
		err := sonic.UnmarshalString(value, &ret)
		if err != nil {
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
		}
		return ret, nil
	}
}
