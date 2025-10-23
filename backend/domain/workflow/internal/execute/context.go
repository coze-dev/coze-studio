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

package execute

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/cloudwego/eino/compose"

	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type Context struct {
	RootCtx

	*SubWorkflowCtx

	*NodeCtx

	*BatchInfo

	TokenCollector *TokenCollector

	StartTime int64 // UnixMilli

	CheckPointID string

	AppVarStore *AppVariables

	executed *atomic.Int64
}

type RootCtx struct {
	RootWorkflowBasic *entity.WorkflowBasic
	RootExecuteID     int64
	ResumeEvent       *entity.InterruptEvent
	ExeCfg            workflowModel.ExecuteConfig
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

	ResumingEvent    *entity.InterruptEvent
	SubWorkflowExeID int64 // if this node is subworkflow node, the execute id of the sub workflow

	CurrentRetryCount int
}

type BatchInfo struct {
	Index            int
	Items            map[string]any
	CompositeNodeKey vo.NodeKey
}

type contextKey struct{}

func restoreWorkflowCtx(ctx context.Context, h *WorkflowHandler) (context.Context, error) {
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

	storedCtx.ResumeEvent = h.resumeEvent
	currentC := GetExeCtx(ctx)
	if currentC != nil {
		// restore the parent-child relationship between token collectors
		if storedCtx.TokenCollector != nil && storedCtx.TokenCollector.Parent != nil {
			currentTokenCollector := currentC.TokenCollector
			storedCtx.TokenCollector.Parent = currentTokenCollector
		}

		storedCtx.AppVarStore = currentC.AppVarStore
		storedCtx.executed = currentC.executed
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

	existingC := GetExeCtx(ctx)
	if existingC != nil {
		storedCtx.RootCtx.ResumeEvent = existingC.RootCtx.ResumeEvent
	}

	currentC := GetExeCtx(ctx)

	if currentC != nil {
		// restore the parent-child relationship between token collectors
		if storedCtx.TokenCollector != nil && storedCtx.TokenCollector.Parent != nil {
			currentTokenCollector := currentC.TokenCollector
			storedCtx.TokenCollector.Parent = currentTokenCollector
		}

		storedCtx.AppVarStore = currentC.AppVarStore
		storedCtx.executed = currentC.executed
	}

	storedCtx.NodeCtx.CurrentRetryCount = 0

	return context.WithValue(ctx, contextKey{}, storedCtx), nil
}

func tryRestoreNodeCtx(ctx context.Context, nodeKey vo.NodeKey) (context.Context, bool) {
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
	if err != nil || storedCtx == nil {
		return ctx, false
	}

	storedCtx.NodeCtx.ResumingEvent = nil

	existingC := GetExeCtx(ctx)
	if existingC != nil {
		storedCtx.RootCtx.ResumeEvent = existingC.RootCtx.ResumeEvent
		storedCtx.AppVarStore = existingC.AppVarStore
	}

	// restore the parent-child relationship between token collectors
	if storedCtx.TokenCollector != nil && storedCtx.TokenCollector.Parent != nil && existingC != nil {
		currentTokenCollector := existingC.TokenCollector
		storedCtx.TokenCollector.Parent = currentTokenCollector

		storedCtx.AppVarStore = existingC.AppVarStore
		storedCtx.executed = existingC.executed
	}

	storedCtx.NodeCtx.CurrentRetryCount = 0

	return context.WithValue(ctx, contextKey{}, storedCtx), true
}

func PrepareRootExeCtx(ctx context.Context, h *WorkflowHandler) (context.Context, error) {
	var parentTokenCollector *TokenCollector
	if currentC := GetExeCtx(ctx); currentC != nil {
		parentTokenCollector = currentC.TokenCollector
	}

	rootExeCtx := &Context{
		RootCtx: RootCtx{
			RootWorkflowBasic: h.rootWorkflowBasic,
			RootExecuteID:     h.rootExecuteID,
			ResumeEvent:       h.resumeEvent,
			ExeCfg:            h.exeCfg,
		},

		TokenCollector: newTokenCollector(fmt.Sprintf("wf_%d", h.rootWorkflowBasic.ID), parentTokenCollector),
		StartTime:      time.Now().UnixMilli(),
		AppVarStore:    NewAppVariables(),
		executed:       ptr.Of(atomic.Int64{}),
	}

	if h.requireCheckpoint {
		rootExeCtx.CheckPointID = strconv.FormatInt(h.rootExecuteID, 10)
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
		newCheckpointID = c.CheckPointID + "_" + strconv.FormatInt(subExecuteID, 10)
	}

	newC := &Context{
		RootCtx: c.RootCtx,
		SubWorkflowCtx: &SubWorkflowCtx{
			SubWorkflowBasic: wb,
			SubExecuteID:     subExecuteID,
		},
		NodeCtx:        c.NodeCtx,
		BatchInfo:      c.BatchInfo,
		TokenCollector: newTokenCollector(fmt.Sprintf("sub_wf_%d", wb.ID), c.TokenCollector),
		CheckPointID:   newCheckpointID,
		StartTime:      time.Now().UnixMilli(),
		AppVarStore:    c.AppVarStore,
		executed:       c.executed,
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

	newC.NodeCtx.SubWorkflowExeID = subExecuteID

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
		BatchInfo:    c.BatchInfo,
		StartTime:    time.Now().UnixMilli(),
		CheckPointID: c.CheckPointID,
		AppVarStore:  c.AppVarStore,
		executed:     c.executed,
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

	tc := c.TokenCollector
	if entity.NodeMetaByNodeType(nodeType).MayUseChatModel {
		tc = newTokenCollector(strings.Join(append([]string{string(newC.NodeType)}, newC.NodeCtx.NodePath...), "."), c.TokenCollector)
	}
	newC.TokenCollector = tc

	return context.WithValue(ctx, contextKey{}, newC), nil
}

func InheritExeCtxWithBatchInfo(ctx context.Context, index int, items map[string]any) (context.Context, string) {
	c := GetExeCtx(ctx)
	if c == nil {
		return ctx, ""
	}
	var newCheckpointID string
	if len(c.CheckPointID) > 0 {
		newCheckpointID = c.CheckPointID
		if c.SubWorkflowCtx != nil {
			newCheckpointID += "_" + strconv.Itoa(int(c.SubWorkflowCtx.SubExecuteID))
		}
		newCheckpointID += "_" + string(c.NodeCtx.NodeKey)
		newCheckpointID += "_" + strconv.Itoa(index)
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
		AppVarStore:  c.AppVarStore,
		executed:     c.executed,
	}), newCheckpointID
}

type ExeContextStore interface {
	GetNodeCtx(key vo.NodeKey) (*Context, bool, error)
	SetNodeCtx(key vo.NodeKey, value *Context) error
	GetWorkflowCtx() (*Context, bool, error)
	SetWorkflowCtx(value *Context) error
}

type AppVariables struct {
	Vars map[string]any
	mu   sync.RWMutex
}

func NewAppVariables() *AppVariables {
	return &AppVariables{
		Vars: make(map[string]any),
	}
}

func (av *AppVariables) Set(key string, value any) {
	av.mu.Lock()
	av.Vars[key] = value
	av.mu.Unlock()
}

func (av *AppVariables) Get(key string) (any, bool) {
	av.mu.RLock()
	defer av.mu.RUnlock()

	if value, ok := av.Vars[key]; ok {
		return value, ok
	}
	return nil, false
}

func GetAppVarStore(ctx context.Context) *AppVariables {
	c := ctx.Value(contextKey{})
	if c == nil {
		return nil
	}
	return c.(*Context).AppVarStore
}
