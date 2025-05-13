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
	rootHandler := execute.NewRootWorkflowHandler(
		wfID,
		spaceID,
		executeID,
		int32(len(workflowSC.GetAllNodes())),
		resumedEvent != nil,
		workflowSC.RequireCheckpoint(),
		version,
		projectID,
		eventChan)

	opts := []einoCompose.Option{einoCompose.WithCallbacks(rootHandler)}

	var resumePath []string
	if resumedEvent != nil {
		resumePath = resumedEvent.NodePath
	}

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
			opts = append(opts, wrapWithinCompositeNode(nodeOpt, parent.Key))
			if ns.Type == entity.NodeTypeSubWorkflow {
				subOpts := designateOptionsForSubWorkflow(rootHandler.(*execute.WorkflowHandler),
					ns,
					eventChan,
					resumePath,
					string(key))
				for _, subO := range subOpts {
					opts = append(opts, wrapWithinCompositeNode(subO, parent.Key))
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

func wrapWithinCompositeNode(opt einoCompose.Option, compositeNodeKey vo.NodeKey) einoCompose.Option {
	return einoCompose.WithLambdaOption(nodes.WithOptsForInner(opt)).DesignateNode(string(compositeNodeKey))
}

func wrapWithinSubWorkflow(opt einoCompose.Option, subWorkflowNodeKey vo.NodeKey) einoCompose.Option {
	return einoCompose.WithLambdaOption(opt).DesignateNode(string(subWorkflowNodeKey))
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
	)

	opts = append(opts, wrapWithinSubWorkflow(einoCompose.WithCallbacks(subHandler), ns.Key))

	workflowSC := ns.SubWorkflowSchema
	for key := range workflowSC.GetAllNodes() {
		subNS := workflowSC.GetAllNodes()[key]
		fullPath := append(slices.Clone(pathPrefix), string(subNS.Key))
		nodeOpt := nodeCallbackOption(key, subNS.Name, eventChan, resumePath)

		if parent, ok := workflowSC.Hierarchy[key]; !ok { // top level nodes, just add the node handler
			opts = append(opts, wrapWithinSubWorkflow(nodeOpt, ns.Key))
			if subNS.Type == entity.NodeTypeSubWorkflow {
				subOpts := designateOptionsForSubWorkflow(subHandler.(*execute.WorkflowHandler),
					subNS,
					eventChan,
					resumePath,
					fullPath...)
				for _, subO := range subOpts {
					opts = append(opts, wrapWithinSubWorkflow(subO, ns.Key))
				}
			}
		} else {
			parent := workflowSC.GetAllNodes()[parent]
			opts = append(opts, wrapWithinSubWorkflow(wrapWithinCompositeNode(nodeOpt, parent.Key), ns.Key))
			if subNS.Type == entity.NodeTypeSubWorkflow {
				subOpts := designateOptionsForSubWorkflow(subHandler.(*execute.WorkflowHandler),
					subNS,
					eventChan,
					resumePath,
					fullPath...)
				for _, subO := range subOpts {
					opts = append(opts, wrapWithinSubWorkflow(wrapWithinCompositeNode(subO, parent.Key), ns.Key))
				}
			}
		}
	}

	return opts
}
