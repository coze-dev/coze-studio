package execute

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type Context struct {
	RootCtx

	*SubWorkflowCtx

	*NodeCtx

	*BatchInfo

	TokenCollector *TokenCollector

	StartTime int64 // UnixMilli

	CheckPointID string
}

type RootCtx struct {
	WorkflowID    int64
	SpaceID       int64
	RootExecuteID int64
	NodeCount     int32
	Version       string
	ProjectID     *int64
}

type SubWorkflowCtx struct {
	SubWorkflowID int64
	SubExecuteID  int64
	NodeCount     int32
	Version       string
	ProjectID     *int64
}

type NodeCtx struct {
	NodeKey       vo.NodeKey
	NodeExecuteID int64
	NodeName      string
	NodeType      entity.NodeType
	NodePath      []string
}

type BatchInfo struct {
	Index            int
	Items            map[string]any
	CompositeNodeKey vo.NodeKey
}

type contextKey struct{}

func restoreWorkflowCtx(ctx context.Context) (context.Context, error) {
	var storedCtx *Context
	err := compose.ProcessState[ExeContextStore](ctx, func(ctx context.Context, state ExeContextStore) error {
		if state == nil {
			return errors.New("state is nil")
		}

		var e error
		storedCtx, _, e = state.GetWorkflowCtx()
		if e != nil {
			return e
		}

		return nil
	})

	if err != nil {
		return ctx, err
	}

	if storedCtx == nil {
		return ctx, errors.New("stored workflow context is nil")
	}

	return context.WithValue(ctx, contextKey{}, storedCtx), nil
}

func restoreNodeCtx(ctx context.Context, nodeKey vo.NodeKey) (context.Context, error) {
	var storedCtx *Context
	err := compose.ProcessState[ExeContextStore](ctx, func(ctx context.Context, state ExeContextStore) error {
		if state == nil {
			return errors.New("state is nil")
		}
		var e error
		storedCtx, _, e = state.GetNodeCtx(nodeKey)
		if e != nil {
			return e
		}
		return nil
	})
	if err != nil {
		return ctx, err
	}

	if storedCtx == nil {
		return ctx, errors.New("stored node context is nil")
	}

	return context.WithValue(ctx, contextKey{}, storedCtx), nil
}

func PrepareRootExeCtx(ctx context.Context, workflowID int64, spaceID int64, executeID int64,
	nodeCount int32, requireCheckpoint bool, version string, projectID *int64) (context.Context, error) {
	rootExeCtx := &Context{
		RootCtx: RootCtx{
			WorkflowID:    workflowID,
			SpaceID:       spaceID,
			RootExecuteID: executeID,
			NodeCount:     nodeCount,
			Version:       version,
			ProjectID:     projectID,
		},

		TokenCollector: newTokenCollector(nil),
		StartTime:      time.Now().UnixMilli(),
	}

	if requireCheckpoint {
		rootExeCtx.CheckPointID = strconv.FormatInt(executeID, 10)
		err := compose.ProcessState[ExeContextStore](ctx, func(ctx context.Context, state ExeContextStore) error {
			if state == nil {
				return errors.New("state is nil")
			}
			return state.SetWorkflowCtx(rootExeCtx)
		})
		if err != nil {
			return ctx, err
		}
	}

	return context.WithValue(ctx, contextKey{}, rootExeCtx), nil
}

func GetExeCtx(ctx context.Context) *Context {
	c := ctx.Value(contextKey{})
	if c == nil {
		return nil
	}
	return c.(*Context)
}

func PrepareSubExeCtx(ctx context.Context, subWorkflowID int64, nodeCount int32, requireCheckpoint bool, version string, projectID *int64) (context.Context, error) {
	c := GetExeCtx(ctx)
	if c == nil {
		return ctx, nil
	}

	subExecuteID, err := workflow.GetRepository().GenID(ctx)
	if err != nil {
		return nil, err
	}

	var newCheckpointID string
	if len(c.CheckPointID) > 0 {
		newCheckpointID = c.CheckPointID + "_0"
	}

	newC := &Context{
		RootCtx: c.RootCtx,
		SubWorkflowCtx: &SubWorkflowCtx{
			SubWorkflowID: subWorkflowID,
			SubExecuteID:  subExecuteID,
			NodeCount:     nodeCount,
			Version:       version,
			ProjectID:     projectID,
		},
		NodeCtx:        c.NodeCtx,
		TokenCollector: newTokenCollector(c.TokenCollector),
		CheckPointID:   newCheckpointID,
	}

	if requireCheckpoint {
		err := compose.ProcessState[ExeContextStore](ctx, func(ctx context.Context, state ExeContextStore) error {
			if state == nil {
				return errors.New("state is nil")
			}
			return state.SetWorkflowCtx(newC)
		})
		if err != nil {
			return ctx, err
		}
	}

	return context.WithValue(ctx, contextKey{}, newC), nil
}

func PrepareNodeExeCtx(ctx context.Context, nodeKey vo.NodeKey, nodeName string, nodeType entity.NodeType) (context.Context, error) {
	c := GetExeCtx(ctx)
	if c == nil {
		return ctx, nil
	}
	nodeExecuteID, err := workflow.GetRepository().GenID(ctx)
	if err != nil {
		return nil, err
	}
	newC := &Context{
		RootCtx:        c.RootCtx,
		SubWorkflowCtx: c.SubWorkflowCtx,
		NodeCtx: &NodeCtx{
			NodeKey:       nodeKey,
			NodeExecuteID: nodeExecuteID,
			NodeName:      nodeName,
			NodeType:      nodeType,
		},
		TokenCollector: newTokenCollector(c.TokenCollector),
		StartTime:      time.Now().UnixMilli(),
		CheckPointID:   c.CheckPointID,
	}

	if c.NodeCtx == nil { // node within top level workflow, also not under composite node
		newC.NodeCtx.NodePath = []string{string(nodeKey)}
	} else {
		if c.BatchInfo == nil {
			newC.NodeCtx.NodePath = append(c.NodeCtx.NodePath, string(nodeKey))
		} else {
			newC.NodeCtx.NodePath = append(c.NodeCtx.NodePath, InterruptEventIndexPrefix+strconv.Itoa(c.BatchInfo.Index), string(nodeKey))
		}
	}

	return context.WithValue(ctx, contextKey{}, newC), nil
}

func InheritExeCtxWithBatchInfo(ctx context.Context, index int, items map[string]any) (context.Context, string) {
	c := GetExeCtx(ctx)
	if c == nil {
		return ctx, ""
	}
	var newCheckpointID string
	if len(c.CheckPointID) > 0 {
		newCheckpointID = c.CheckPointID + "_" + strconv.Itoa(index)
	}
	return context.WithValue(ctx, contextKey{}, &Context{
		RootCtx:        c.RootCtx,
		SubWorkflowCtx: c.SubWorkflowCtx,
		NodeCtx:        c.NodeCtx,
		TokenCollector: c.TokenCollector,
		BatchInfo: &BatchInfo{
			Index:            index,
			Items:            items,
			CompositeNodeKey: c.NodeCtx.NodeKey,
		},
		CheckPointID: newCheckpointID,
	}), newCheckpointID
}

type ExeContextStore interface {
	GetNodeCtx(key vo.NodeKey) (*Context, bool, error)
	SetNodeCtx(key vo.NodeKey, value *Context) error
	GetWorkflowCtx() (*Context, bool, error)
	SetWorkflowCtx(value *Context) error
}
