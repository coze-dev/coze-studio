package execute

import (
	"context"

	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type Context struct {
	WorkflowID   int64
	SpaceID      int64
	ExecuteID    int64
	SubExecuteID int64
}

type contextKey struct{}

func PrepareExecuteContext(ctx context.Context, eCtx *Context, idGen idgen.IDGenerator) (context.Context, error) {
	if eCtx.ExecuteID == 0 {
		executeID, err := idGen.GenID(ctx)
		if err != nil {
			return nil, err
		}
		eCtx = &Context{
			ExecuteID:  executeID,
			SpaceID:    eCtx.SpaceID,
			WorkflowID: eCtx.WorkflowID,
		}
	}

	return context.WithValue(ctx, contextKey{}, eCtx), nil
}

func GetExecuteContext(ctx context.Context) *Context {
	return ctx.Value(contextKey{}).(*Context)
}

func PrepareSubExecuteContext(ctx context.Context, subWorkflowID int64, subExecuteID int64) (context.Context, *Context) {
	c := GetExecuteContext(ctx)
	newC := &Context{
		WorkflowID:   subWorkflowID,
		SpaceID:      c.SpaceID,
		ExecuteID:    c.ExecuteID,
		SubExecuteID: subExecuteID,
	}
	return context.WithValue(ctx, contextKey{}, newC), newC
}
