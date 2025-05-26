package compose

import (
	"slices"
	"strconv"

	einoCompose "github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func DesignateOptions(wb *entity.WorkflowBasic,
	workflowSC *WorkflowSchema,
	executeID int64,
	eventChan chan *execute.Event,
	resumedEvent *entity.InterruptEvent) []einoCompose.Option {
	rootHandler := execute.NewRootWorkflowHandler(
		wb,
		executeID,
		workflowSC.RequireCheckpoint(),
		eventChan,
		resumedEvent)

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
				subOpts := designateOptionsForSubWorkflow(rootHandler.(*execute.WorkflowHandler),
					ns,
					eventChan,
					resumedEvent,
					string(key))
				opts = append(opts, subOpts...)
			}
		} else {
			parent := workflowSC.GetAllNodes()[parent]
			opts = append(opts, WrapOpt(nodeOpt, parent.Key))
			if ns.Type == entity.NodeTypeSubWorkflow {
				subOpts := designateOptionsForSubWorkflow(rootHandler.(*execute.WorkflowHandler),
					ns,
					eventChan,
					resumedEvent,
					string(key))
				for _, subO := range subOpts {
					opts = append(opts, WrapOpt(subO, parent.Key))
				}
			}
		}
	}

	if workflowSC.RequireCheckpoint() {
		opts = append(opts, einoCompose.WithCheckPointID(strconv.FormatInt(executeID, 10)))
	}

	return opts
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

func designateOptionsForSubWorkflow(parentHandler *execute.WorkflowHandler,
	ns *NodeSchema,
	eventChan chan *execute.Event,
	resumeEvent *entity.InterruptEvent,
	pathPrefix ...string) (opts []einoCompose.Option) {
	subWorkflowIdentity, _ := ns.GetSubWorkflowIdentity()
	subHandler := execute.NewSubWorkflowHandler(
		parentHandler,
		&entity.WorkflowBasic{
			WorkflowIdentity: *subWorkflowIdentity,
			SpaceID:          0,   // TODO: fill this
			ProjectID:        nil, // TODO: fill this
			NodeCount:        int32(len(ns.SubWorkflowSchema.GetAllNodes())),
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
				subOpts := designateOptionsForSubWorkflow(subHandler.(*execute.WorkflowHandler),
					subNS,
					eventChan,
					resumeEvent,
					fullPath...)
				for _, subO := range subOpts {
					opts = append(opts, WrapOpt(subO, ns.Key))
				}
			}
		} else {
			parent := workflowSC.GetAllNodes()[parent]
			opts = append(opts, WrapOpt(WrapOpt(nodeOpt, parent.Key), ns.Key))
			if subNS.Type == entity.NodeTypeSubWorkflow {
				subOpts := designateOptionsForSubWorkflow(subHandler.(*execute.WorkflowHandler),
					subNS,
					eventChan,
					resumeEvent,
					fullPath...)
				for _, subO := range subOpts {
					opts = append(opts, WrapOpt(WrapOpt(subO, parent.Key), ns.Key))
				}
			}
		}
	}

	return opts
}
