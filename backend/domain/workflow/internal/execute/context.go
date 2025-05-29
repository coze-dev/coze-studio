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
	RootWorkflowBasic *entity.WorkflowBasic
	RootExecuteID     int64
	ResumeEvent       *entity.InterruptEvent
	ExeCfg            vo.ExecuteConfig
}

type SubWorkflowCtx struct {
	SubWorkflowBasic *entity.WorkflowBasic
	SubExecuteID     int64
}

type NodeCtx struct {
	NodeKey       vo.NodeKey
	NodeExecuteID int64
	NodeName      string
	NodeType      entity.NodeType
	NodePath      []string
	TerminatePlan *vo.TerminatePlan

	ResumingEvent *entity.InterruptEvent
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

func restoreNodeCtx(ctx context.Context, nodeKey vo.NodeKey, resumeEvent *entity.InterruptEvent,
	exactlyResuming bool) (context.Context, error) {
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

	if exactlyResuming {
		storedCtx.NodeCtx.ResumingEvent = resumeEvent
	} else {
		storedCtx.NodeCtx.ResumingEvent = nil
	}

	return context.WithValue(ctx, contextKey{}, storedCtx), nil
}

func PrepareRootExeCtx(ctx context.Context, wb *entity.WorkflowBasic, executeID int64,
	requireCheckpoint bool, resumeEvent *entity.InterruptEvent, exeCfg vo.ExecuteConfig) (context.Context, error) {
	rootExeCtx := &Context{
		RootCtx: RootCtx{
			RootWorkflowBasic: wb,
			RootExecuteID:     executeID,
			ResumeEvent:       resumeEvent,
			ExeCfg:            exeCfg,
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

func PrepareSubExeCtx(ctx context.Context, wb *entity.WorkflowBasic, requireCheckpoint bool) (context.Context, error) {
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
			SubWorkflowBasic: wb,
			SubExecuteID:     subExecuteID,
		},
		NodeCtx:        c.NodeCtx,
		BatchInfo:      c.BatchInfo,
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

func PrepareNodeExeCtx(ctx context.Context, nodeKey vo.NodeKey, nodeName string, nodeType entity.NodeType, plan *vo.TerminatePlan) (context.Context, error) {
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
			TerminatePlan: plan,
		},
		BatchInfo:      c.BatchInfo,
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
