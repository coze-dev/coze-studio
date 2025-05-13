package service

import (
	"slices"
	"strconv"

	einoCompose "github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

func designateOptions(wfID int64,
	spaceID int64,
	version string,
	projectID *int64,
	workflowSC *compose.WorkflowSchema,
	executeID int64,
	eventChan chan *execute.Event,
	resumedEvent *entity.InterruptEvent) []einoCompose.Option {
	var resumePath []string
	if resumedEvent != nil {
		resumePath = resumedEvent.NodePath
	}

	rootHandler := execute.NewRootWorkflowHandler(
		wfID,
		spaceID,
		executeID,
		int32(len(workflowSC.GetAllNodes())),
		workflowSC.RequireCheckpoint(),
		version,
		projectID,
		eventChan,
		resumePath)

	opts := []einoCompose.Option{einoCompose.WithCallbacks(rootHandler)}

	for key := range workflowSC.GetAllNodes() {
		ns := workflowSC.GetAllNodes()[key]
		nodeOpt := nodeCallbackOption(key, ns.Name, eventChan, resumePath)

		if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
			opts = append(opts, nodeOpt)
			if ns.Type == entity.NodeTypeSubWorkflow {
				subOpts := designateOptionsForSubWorkflow(rootHandler.(*execute.WorkflowHandler),
					ns,
					eventChan,
					resumePath,
					string(key))
				opts = append(opts, subOpts...)
			}
		} else {
			parent := workflowSC.GetAllNodes()[parent]
			opts = append(opts, wrapOpt(nodeOpt, parent.Key))
			if ns.Type == entity.NodeTypeSubWorkflow {
				subOpts := designateOptionsForSubWorkflow(rootHandler.(*execute.WorkflowHandler),
					ns,
					eventChan,
					resumePath,
					string(key))
				for _, subO := range subOpts {
					opts = append(opts, wrapOpt(subO, parent.Key))
				}
			}
		}
	}

	if workflowSC.RequireCheckpoint() {
		opts = append(opts, einoCompose.WithCheckPointID(strconv.FormatInt(executeID, 10)))
	}

	return opts
}

func nodeCallbackOption(key vo.NodeKey, name string, eventChan chan *execute.Event, resumePath []string) einoCompose.Option {
	return einoCompose.WithCallbacks(execute.NewNodeHandler(string(key), name, eventChan, resumePath)).DesignateNode(string(key))
}

func wrapOpt(opt einoCompose.Option, parentNodeKey vo.NodeKey) einoCompose.Option {
	return einoCompose.WithLambdaOption(nodes.WithOptsForNested(opt)).DesignateNode(string(parentNodeKey))
}

func wrapOptWithIndex(opt einoCompose.Option, parentNodeKey vo.NodeKey, index int) einoCompose.Option {
	return einoCompose.WithLambdaOption(nodes.WithOptsForIndexed(index, opt)).DesignateNode(string(parentNodeKey))
}

func designateOptionsForSubWorkflow(parentHandler *execute.WorkflowHandler,
	ns *compose.NodeSchema,
	eventChan chan *execute.Event,
	resumePath []string,
	pathPrefix ...string) (opts []einoCompose.Option) {
	subWorkflowIdentity, _ := ns.GetSubWorkflowIdentity()

	subHandler := execute.NewSubWorkflowHandler(
		parentHandler,
		subWorkflowIdentity.ID,
		int32(len(ns.SubWorkflowSchema.GetAllNodes())),
		subWorkflowIdentity.Version,
		nil, // TODO: how to get this efficiently?
		resumePath,
	)

	opts = append(opts, wrapOpt(einoCompose.WithCallbacks(subHandler), ns.Key))

	workflowSC := ns.SubWorkflowSchema
	for key := range workflowSC.GetAllNodes() {
		subNS := workflowSC.GetAllNodes()[key]
		fullPath := append(slices.Clone(pathPrefix), string(subNS.Key))
		nodeOpt := nodeCallbackOption(key, subNS.Name, eventChan, resumePath)

		if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
			opts = append(opts, wrapOpt(nodeOpt, ns.Key))
			if subNS.Type == entity.NodeTypeSubWorkflow {
				subOpts := designateOptionsForSubWorkflow(subHandler.(*execute.WorkflowHandler),
					subNS,
					eventChan,
					resumePath,
					fullPath...)
				for _, subO := range subOpts {
					opts = append(opts, wrapOpt(subO, ns.Key))
				}
			}
		} else {
			parent := workflowSC.GetAllNodes()[parent]
			opts = append(opts, wrapOpt(wrapOpt(nodeOpt, parent.Key), ns.Key))
			if subNS.Type == entity.NodeTypeSubWorkflow {
				subOpts := designateOptionsForSubWorkflow(subHandler.(*execute.WorkflowHandler),
					subNS,
					eventChan,
					resumePath,
					fullPath...)
				for _, subO := range subOpts {
					opts = append(opts, wrapOpt(wrapOpt(subO, parent.Key), ns.Key))
				}
			}
		}
	}

	return opts
}
