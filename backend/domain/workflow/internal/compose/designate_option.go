package compose

import (
	"context"
	"fmt"
	"slices"
	"strconv"

	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	workflow2 "code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/llm"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func DesignateOptions(ctx context.Context,
	wb *entity.WorkflowBasic,
	workflowSC *WorkflowSchema,
	executeID int64,
	eventChan chan *execute.Event,
	resumedEvent *entity.InterruptEvent,
	sw *schema.StreamWriter[*entity.Message],
	exeCfg vo.ExecuteConfig) ([]einoCompose.Option, error) {
	rootHandler := execute.NewRootWorkflowHandler(
		wb,
		executeID,
		workflowSC.RequireCheckpoint(),
		eventChan,
		resumedEvent,
		exeCfg)

	opts := []einoCompose.Option{einoCompose.WithCallbacks(rootHandler)}

	for key := range workflowSC.GetAllNodes() {
		ns := workflowSC.GetAllNodes()[key]

		var nodeOpt einoCompose.Option
		if ns.Type == entity.NodeTypeExit {
			nodeOpt = nodeCallbackOption(key, ns.Name, eventChan, resumedEvent,
				ptr.Of(mustGetKey[vo.TerminatePlan]("TerminalPlan", ns.Configs)))
		} else {
			nodeOpt = nodeCallbackOption(key, ns.Name, eventChan, resumedEvent, nil)
		}

		if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
			opts = append(opts, nodeOpt)
			if ns.Type == entity.NodeTypeSubWorkflow {
				subOpts, err := designateOptionsForSubWorkflow(ctx,
					rootHandler.(*execute.WorkflowHandler),
					ns,
					eventChan,
					resumedEvent,
					sw,
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
				subOpts, err := designateOptionsForSubWorkflow(ctx,
					rootHandler.(*execute.WorkflowHandler),
					ns,
					eventChan,
					resumedEvent,
					sw,
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

	opts = append(opts, einoCompose.WithCallbacks(execute.GetTokenCallbackHandler()))

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

func designateOptionsForSubWorkflow(ctx context.Context,
	parentHandler *execute.WorkflowHandler,
	ns *NodeSchema,
	eventChan chan *execute.Event,
	resumeEvent *entity.InterruptEvent,
	sw *schema.StreamWriter[*entity.Message],
	pathPrefix ...string) (opts []einoCompose.Option, err error) {
	subWorkflowIdentity, _ := ns.GetSubWorkflowIdentity()
	subHandler := execute.NewSubWorkflowHandler(
		parentHandler,
		&entity.WorkflowBasic{
			WorkflowIdentity: *subWorkflowIdentity,
			SpaceID:          0,   // TODO: fill this
			ProjectID:        nil, // TODO: fill this
			NodeCount:        ns.SubWorkflowSchema.NodeCount(),
		},
		resumeEvent,
	)

	opts = append(opts, WrapOpt(einoCompose.WithCallbacks(subHandler), ns.Key))

	workflowSC := ns.SubWorkflowSchema
	for key := range workflowSC.GetAllNodes() {
		subNS := workflowSC.GetAllNodes()[key]
		fullPath := append(slices.Clone(pathPrefix), string(subNS.Key))

		var nodeOpt einoCompose.Option
		if subNS.Type == entity.NodeTypeExit {
			nodeOpt = nodeCallbackOption(key, subNS.Name, eventChan, resumeEvent,
				ptr.Of(mustGetKey[vo.TerminatePlan]("TerminalPlan", subNS.Configs)))
		} else {
			nodeOpt = nodeCallbackOption(key, subNS.Name, eventChan, resumeEvent, nil)
		}

		if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
			opts = append(opts, WrapOpt(nodeOpt, ns.Key))
			if subNS.Type == entity.NodeTypeSubWorkflow {
				subOpts, err := designateOptionsForSubWorkflow(ctx,
					subHandler.(*execute.WorkflowHandler),
					subNS,
					eventChan,
					resumeEvent,
					sw,
					fullPath...)
				if err != nil {
					return nil, err
				}
				for _, subO := range subOpts {
					opts = append(opts, WrapOpt(subO, ns.Key))
				}
			} else if subNS.Type == entity.NodeTypeLLM {
				llmNodeOpts, err := llmToolCallbackOptions(ctx, subNS, eventChan, sw)
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
				subOpts, err := designateOptionsForSubWorkflow(ctx,
					subHandler.(*execute.WorkflowHandler),
					subNS,
					eventChan,
					resumeEvent,
					sw,
					fullPath...)
				if err != nil {
					return nil, err
				}
				for _, subO := range subOpts {
					opts = append(opts, WrapOpt(WrapOpt(subO, parent.Key), ns.Key))
				}
			} else if subNS.Type == entity.NodeTypeLLM {
				llmNodeOpts, err := llmToolCallbackOptions(ctx, subNS, eventChan, sw)
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

func llmToolCallbackOptions(ctx context.Context, ns *NodeSchema, eventChan chan *execute.Event,
	sw *schema.StreamWriter[*entity.Message]) (
	opts []einoCompose.Option, err error) {
	// this is a LLM node.
	// check if it has any tools, if no tools, then no callback options needed
	// for each tool, extract the entity.FunctionInfo, create the ToolHandler, and add the callback option
	if ns.Type != entity.NodeTypeLLM {
		panic("impossible: llmToolCallbackOptions is called on a non-LLM node")
	}

	fcParams := getKeyOrZero[*vo.FCParam]("FCParam", ns.Configs)
	if fcParams != nil {
		if fcParams.WorkflowFCParam != nil {
			// TODO: try to avoid getting the workflow tool all over again
			for _, wf := range fcParams.WorkflowFCParam.WorkflowList {
				wfIDStr := wf.WorkflowID
				wfID, err := strconv.ParseInt(wfIDStr, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("invalid workflow id: %s", wfIDStr)
				}
				wfTool, err := workflow2.GetRepository().WorkflowAsTool(ctx, entity.WorkflowIdentity{
					ID:      wfID,
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
				}

				toolHandler := execute.NewToolHandler(eventChan, funcInfo)
				opt := einoCompose.WithCallbacks(toolHandler)
				opt = einoCompose.WithLambdaOption(llm.WithNestedWorkflowOptions(nodes.WithOptsForNested(opt))).DesignateNode(string(ns.Key))
				opts = append(opts, opt)
			}
		}
		if fcParams.PluginFCParam != nil {
			// TODO: complete information about plugins
		}
	}

	if sw != nil {
		toolMsgOpt := llm.WithToolWorkflowMessageWriter(sw)
		opt := einoCompose.WithLambdaOption(toolMsgOpt).DesignateNode(string(ns.Key))
		opts = append(opts, opt)
	}

	return opts, nil
}
