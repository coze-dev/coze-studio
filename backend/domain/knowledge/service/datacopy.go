package service

import (
	"context"
	"errors"
	"time"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossdatacopy"
	"code.byted.org/flow/opencoze/backend/domain/datacopy"
	copyEntity "code.byted.org/flow/opencoze/backend/domain/datacopy/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
)

func (k *knowledgeSVC) CopyKnowledge(ctx context.Context, request *knowledge.CopyKnowledgeRequest) (*knowledge.CopyKnowledgeResponse, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	if len(request.TaskUniqKey) == 0 {
		return nil, errors.New("task uniq key is empty")
	}
	if request.KnowledgeID == 0 {
		return nil, errors.New("knowledge id is empty")
	}
	kn, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		return nil, err
	}
	if kn == nil || kn.ID == 0 {
		return nil, errors.New("knowledge not found")
	}
	newID, err := k.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}
	copyTaskEntity := copyEntity.CopyDataTask{
		ID:            0,
		TaskUniqKey:   request.TaskUniqKey,
		OriginDataID:  request.KnowledgeID,
		TargetDataID:  newID,
		OriginSpaceID: request.OriginSpaceID,
		TargetSpaceID: request.TargetSpaceID,
		OriginUserID:  kn.CreatorID,
		TargetUserID:  request.TargetUserID,
		OriginAppID:   request.OriginAppID,
		TargetAppID:   request.TargetAppID,
		DataType:      copyEntity.DataTypeKnowledge,
		StartTime:     time.Now().UnixMilli(),
		FinishTime:    0,
		ExtInfo:       "",
		ErrorMsg:      "",
	}
	checkResult, err := crossdatacopy.DefaultSVC().CheckAndGenCopyTask(ctx, &datacopy.CheckAndGenCopyTaskReq{Task: &copyTaskEntity})
	if err != nil {
		return nil, err
	}
	switch checkResult.CopyTaskStatus {
	case copyEntity.DataCopyTaskStatusSuccess, copyEntity.DataCopyTaskStatusCreate, copyEntity.DataCopyTaskStatusInProgress:
		return &knowledge.CopyKnowledgeResponse{
			OriginKnowledgeID: request.KnowledgeID,
			TargetKnowledgeID: checkResult.TargetID,
			CopyStatus:        knowledge.CopyStatus_Processing,
			ErrMsg:            "",
		}, nil
	}

	return nil, errors.New("copy knowledge failed")
}

func (k *knowledgeSVC) copyDo(ctx context.Context, copyCtx knowledgeCopyCtx) (*knowledge.CopyKnowledgeResponse, error) {
	var err error

}

type knowledgeCopyCtx struct {
	OriginData *model.Knowledge
	CopyTask   *copyEntity.CopyDataTask
}
