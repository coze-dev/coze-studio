package execute

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type Context struct {
	RootCtx

	*SubWorkflowCtx

	*NodeCtx

	*BatchInfo

	TokenCollector *tokenCollector

	IDGen idgen.IDGenerator
}

type RootCtx struct {
	WorkflowID    int64
	SpaceID       int64
	RootExecuteID int64
}

type SubWorkflowCtx struct {
	SubWorkflowID      int64
	SubExecuteID       int64
	SubWorkflowNodeKey nodes.NodeKey
}

type NodeCtx struct {
	NodeKey       nodes.NodeKey
	NodeExecuteID int64
	NodeName      string
	NodeType      nodes.NodeType
}

type BatchInfo struct {
	Index            int
	Items            map[string]any
	CompositeNodeKey nodes.NodeKey
}

type contextKey struct{}

func PrepareRootExeCtx(ctx context.Context, workflowID int64, spaceID int64, executeID int64, idGen idgen.IDGenerator) (context.Context, error) {
	return context.WithValue(ctx, contextKey{}, &Context{
		RootCtx: RootCtx{
			WorkflowID:    workflowID,
			SpaceID:       spaceID,
			RootExecuteID: executeID,
		},

		TokenCollector: newTokenCollector(nil),
		IDGen:          idGen,
	}), nil
}

func GetExeCtx(ctx context.Context) *Context {
	c := ctx.Value(contextKey{})
	if c == nil {
		return nil
	}
	return c.(*Context)
}

func PrepareSubExeCtx(ctx context.Context, subWorkflowID int64) (context.Context, error) {
	c := GetExeCtx(ctx)
	if c == nil {
		return ctx, nil
	}

	subExecuteID, err := c.IDGen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	newC := &Context{
		RootCtx: c.RootCtx,
		SubWorkflowCtx: &SubWorkflowCtx{
			SubWorkflowID:      subWorkflowID,
			SubExecuteID:       subExecuteID,
			SubWorkflowNodeKey: c.NodeCtx.NodeKey,
		},
		TokenCollector: newTokenCollector(c.TokenCollector),
		IDGen:          c.IDGen,
	}

	return context.WithValue(ctx, contextKey{}, newC), nil
}

func PrepareNodeExeCtx(ctx context.Context, nodeKey nodes.NodeKey, nodeName string, nodeType nodes.NodeType) (context.Context, error) {
	c := GetExeCtx(ctx)
	if c == nil {
		return ctx, nil
	}
	nodeExecuteID, err := c.IDGen.GenID(ctx)
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
		IDGen:          c.IDGen,
	}
	return context.WithValue(ctx, contextKey{}, newC), nil
}

func InheritExeCtxWithBatchInfo(ctx context.Context, index int, items map[string]any) context.Context {
	c := GetExeCtx(ctx)
	if c == nil {
		return ctx
	}
	return context.WithValue(ctx, contextKey{}, &Context{
		RootCtx:        c.RootCtx,
		SubWorkflowCtx: c.SubWorkflowCtx,
		TokenCollector: c.TokenCollector,
		BatchInfo: &BatchInfo{
			Index:            index,
			Items:            items,
			CompositeNodeKey: c.NodeCtx.NodeKey,
		},
		IDGen: c.IDGen,
	})
}
