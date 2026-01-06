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

package compose

import (
	"context"
	"fmt"
	"slices"
	"strconv"

	einoCompose "github.com/cloudwego/eino/compose"

	model "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	workflow2 "github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/exit"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/llm"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	wrapPlugin "github.com/coze-dev/coze-studio/backend/domain/workflow/plugin"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func (r *WorkflowRunner) designateOptions(ctx context.Context) ([]einoCompose.Option, error) {
	var (
		wb           = r.basic
		exeCfg       = r.config
		executeID    = r.executeID
		workflowSC   = r.schema
		eventChan    = r.eventChan
		resumedEvent = r.interruptEvent
		sw           = r.container
	)

	if wb.AppID != nil && exeCfg.AppID == nil {
		exeCfg.AppID = wb.AppID
	}

	rootHandler := execute.NewRootWorkflowHandler(
		wb,
		executeID,
		workflowSC.RequireCheckpoint(),
		eventChan,
		resumedEvent,
		exeCfg,
		workflowSC.NodeCount())

	opts := []einoCompose.Option{einoCompose.WithCallbacks(rootHandler)}

	for key := range workflowSC.GetAllNodes() {
		ns := workflowSC.GetAllNodes()[key]

		var nodeOpt einoCompose.Option
		if ns.Type == entity.NodeTypeExit {
			nodeOpt = nodeCallbackOption(key, ns.Name, eventChan, resumedEvent,
				ptr.Of(ns.Configs.(*exit.Config).TerminatePlan))
		} else if ns.Type != entity.NodeTypeLambda {
			nodeOpt = nodeCallbackOption(key, ns.Name, eventChan, resumedEvent, nil)
		}

		if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
			opts = append(opts, nodeOpt)
			if ns.Type == entity.NodeTypeSubWorkflow {
				subOpts, err := r.designateOptionsForSubWorkflow(ctx,
					rootHandler.(*execute.WorkflowHandler),
					ns,
					string(key))
				if err != nil {
					return nil, err
				}
				opts = append(opts, subOpts...)
			} else if ns.Type == entity.NodeTypeLLM {
				llmNodeOpts, err := llmToolCallbackOptions(ctx, ns, eventChan, sw)
				if err != nil {
					return nil, err
				}

				opts = append(opts, llmNodeOpts...)
			}
		} else {
			parent := workflowSC.GetAllNodes()[parent]
			opts = append(opts, WrapOpt(nodeOpt, parent.Key))
			if ns.Type == entity.NodeTypeSubWorkflow {
				subOpts, err := r.designateOptionsForSubWorkflow(ctx,
					rootHandler.(*execute.WorkflowHandler),
					ns,
					string(key))
				if err != nil {
					return nil, err
				}
				for _, subO := range subOpts {
					opts = append(opts, WrapOpt(subO, parent.Key))
				}
			} else if ns.Type == entity.NodeTypeLLM {
				llmNodeOpts, err := llmToolCallbackOptions(ctx, ns, eventChan, sw)
				if err != nil {
					return nil, err
				}
				for _, subO := range llmNodeOpts {
					opts = append(opts, WrapOpt(subO, parent.Key))
				}
			}
		}
	}

	if workflowSC.RequireCheckpoint() {
		opts = append(opts, einoCompose.WithCheckPointID(strconv.FormatInt(executeID, 10)))
	}

	return opts, nil
}

func nodeCallbackOption(key vo.NodeKey, name string, eventChan chan *execute.Event, resumeEvent *entity.InterruptEvent,
	terminatePlan *vo.TerminatePlan) einoCompose.Option {
	return einoCompose.WithCallbacks(execute.NewNodeHandler(string(key), name, eventChan, resumeEvent, terminatePlan)).DesignateNode(string(key))
}

func WrapOpt(opt einoCompose.Option, parentNodeKey vo.NodeKey) einoCompose.Option {
	return einoCompose.WithLambdaOption(nodes.WithOptsForNested(opt)).DesignateNode(string(parentNodeKey))
}

func WrapOptWithIndex(opt einoCompose.Option, parentNodeKey vo.NodeKey, index int) einoCompose.Option {
	return einoCompose.WithLambdaOption(nodes.WithOptsForIndexed(index, opt)).DesignateNode(string(parentNodeKey))
}

func (r *WorkflowRunner) designateOptionsForSubWorkflow(ctx context.Context,
	parentHandler *execute.WorkflowHandler,
	ns *schema2.NodeSchema,
	pathPrefix ...string) (opts []einoCompose.Option, err error) {
	var (
		resumeEvent = r.interruptEvent
		eventChan   = r.eventChan
		container   = r.container
	)
	subHandler := execute.NewSubWorkflowHandler(
		parentHandler,
		ns.SubWorkflowBasic,
		resumeEvent,
		ns.SubWorkflowSchema.NodeCount(),
	)

	opts = append(opts, WrapOpt(einoCompose.WithCallbacks(subHandler), ns.Key))

	workflowSC := ns.SubWorkflowSchema
	for key := range workflowSC.GetAllNodes() {
		subNS := workflowSC.GetAllNodes()[key]
		fullPath := append(slices.Clone(pathPrefix), string(subNS.Key))

		var nodeOpt einoCompose.Option
		if subNS.Type == entity.NodeTypeExit {
			nodeOpt = nodeCallbackOption(key, subNS.Name, eventChan, resumeEvent,
				ptr.Of(subNS.Configs.(*exit.Config).TerminatePlan))
		} else {
			nodeOpt = nodeCallbackOption(key, subNS.Name, eventChan, resumeEvent, nil)
		}

		if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
			opts = append(opts, WrapOpt(nodeOpt, ns.Key))
			if subNS.Type == entity.NodeTypeSubWorkflow {
				subOpts, err := r.designateOptionsForSubWorkflow(ctx,
					subHandler.(*execute.WorkflowHandler),
					subNS,
					fullPath...)
				if err != nil {
					return nil, err
				}
				for _, subO := range subOpts {
					opts = append(opts, WrapOpt(subO, ns.Key))
				}
			} else if subNS.Type == entity.NodeTypeLLM {
				llmNodeOpts, err := llmToolCallbackOptions(ctx, subNS, eventChan, container)
				if err != nil {
					return nil, err
				}
				for _, subO := range llmNodeOpts {
					opts = append(opts, WrapOpt(subO, ns.Key))
				}
			}
		} else {
			parent := workflowSC.GetAllNodes()[parent]
			opts = append(opts, WrapOpt(WrapOpt(nodeOpt, parent.Key), ns.Key))
			if subNS.Type == entity.NodeTypeSubWorkflow {
				subOpts, err := r.designateOptionsForSubWorkflow(ctx,
					subHandler.(*execute.WorkflowHandler),
					subNS,
					fullPath...)
				if err != nil {
					return nil, err
				}
				for _, subO := range subOpts {
					opts = append(opts, WrapOpt(WrapOpt(subO, parent.Key), ns.Key))
				}
			} else if subNS.Type == entity.NodeTypeLLM {
				llmNodeOpts, err := llmToolCallbackOptions(ctx, subNS, eventChan, container)
				if err != nil {
					return nil, err
				}
				for _, subO := range llmNodeOpts {
					opts = append(opts, WrapOpt(WrapOpt(subO, parent.Key), ns.Key))
				}
			}
		}
	}

	return opts, nil
}

func llmToolCallbackOptions(ctx context.Context, ns *schema2.NodeSchema, eventChan chan *execute.Event,
	container *execute.StreamContainer) (
	opts []einoCompose.Option, err error) {
	// this is a LLM node.
	// check if it has any tools, if no tools, then no callback options needed
	// for each tool, extract the entity.FunctionInfo, create the ToolHandler, and add the callback option
	if ns.Type != entity.NodeTypeLLM {
		panic("impossible: llmToolCallbackOptions is called on a non-LLM node")
	}

	cfg := ns.Configs.(*llm.Config)
	fcParams := cfg.FCParam
	if fcParams != nil {
		if fcParams.WorkflowFCParam != nil {
			// TODO: try to avoid getting the workflow tool all over again
			for _, wf := range fcParams.WorkflowFCParam.WorkflowList {
				wfIDStr := wf.WorkflowID
				wfID, err := strconv.ParseInt(wfIDStr, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("invalid workflow id: %s", wfIDStr)
				}
				locator := model.FromDraft
				if wf.WorkflowVersion != "" {
					locator = model.FromSpecificVersion
				}

				wfTool, err := workflow2.GetRepository().WorkflowAsTool(ctx, vo.GetPolicy{
					ID:      wfID,
					QType:   locator,
					Version: wf.WorkflowVersion,
				}, vo.WorkflowToolConfig{})

				if err != nil {
					return nil, err
				}

				tInfo, err := wfTool.Info(ctx)
				if err != nil {
					return nil, err
				}

				funcInfo := entity.FunctionInfo{
					Name:                  tInfo.Name,
					Type:                  entity.WorkflowTool,
					WorkflowName:          wfTool.GetWorkflow().Name,
					WorkflowTerminatePlan: wfTool.TerminatePlan(),
					APIID:                 wfID,
					APIName:               wfTool.GetWorkflow().Name,
					PluginID:              wfID,
					PluginName:            wfTool.GetWorkflow().Name,
				}

				toolHandler := execute.NewToolHandler(eventChan, funcInfo)
				opt := einoCompose.WithCallbacks(toolHandler)
				opt = einoCompose.WithLambdaOption(nodes.WithOptsForNested(opt)).DesignateNode(string(ns.Key))
				opts = append(opts, opt)
			}

			if container != nil {
				toolMsgOpt := llm.WithToolWorkflowStreamContainer(container)
				opt := einoCompose.WithLambdaOption(toolMsgOpt).DesignateNode(string(ns.Key))
				opts = append(opts, opt)
			}
		}
		if fcParams.PluginFCParam != nil {
			for _, p := range fcParams.PluginFCParam.PluginList {
				toolID, err := strconv.ParseInt(p.ApiId, 10, 64)
				if err != nil {
					return nil, err
				}
				pluginID, err := strconv.ParseInt(p.PluginID, 10, 64)
				if err != nil {
					return nil, err
				}

				toolInfoResponse, err := wrapPlugin.GetPluginToolsInfo(ctx, &wrapPlugin.ToolsInfoRequest{
					PluginEntity: vo.PluginEntity{
						PluginID:      pluginID,
						PluginVersion: ptr.Of(p.PluginVersion),
						PluginFrom:    p.PluginFrom,
					},
					ToolIDs: []int64{toolID},
				})

				if err != nil {
					return nil, err
				}

				funcInfo := entity.FunctionInfo{
					Name:       toolInfoResponse.ToolInfoList[toolID].ToolName,
					Type:       entity.PluginTool,
					PluginID:   pluginID,
					PluginName: toolInfoResponse.PluginName,
					APIID:      toolID,
					APIName:    p.ApiName,
				}

				toolHandler := execute.NewToolHandler(eventChan, funcInfo)
				opt := einoCompose.WithCallbacks(toolHandler)
				opt = einoCompose.WithLambdaOption(nodes.WithOptsForNested(opt)).DesignateNode(string(ns.Key))
				opts = append(opts, opt)
			}
		}
	}

	return opts, nil
}
