package compose

import (
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type WorkflowSchema struct {
	Nodes       []*NodeSchema             `json:"nodes"`
	Connections []*Connection             `json:"connections"`
	Hierarchy   map[vo.NodeKey]vo.NodeKey `json:"hierarchy,omitempty"` // child node key-> parent node key

	nodeMap           map[vo.NodeKey]*NodeSchema // won't serialize this
	compositeNodes    []*CompositeNode           // won't serialize this
	requireCheckPoint bool                       // won't serialize this
}

type Connection struct {
	FromNode   vo.NodeKey `json:"from_node"`
	ToNode     vo.NodeKey `json:"to_node"`
	FromPort   *string    `json:"from_port,omitempty"`
	FromBranch bool       `json:"from_branch,omitempty"`
}

const (
	EntryNodeKey = "100001"
	ExitNodeKey  = "900001"
)

type CompositeNode struct {
	Parent   *NodeSchema
	Children []*NodeSchema
}

func (w *WorkflowSchema) Init() {
	w.nodeMap = make(map[vo.NodeKey]*NodeSchema)
	for _, node := range w.Nodes {
		w.nodeMap[node.Key] = node
	}

	w.doGetCompositeNodes()

	for _, node := range w.Nodes {
		if node.Type == entity.NodeTypeQuestionAnswer || node.Type == entity.NodeTypeInputReceiver {
			w.requireCheckPoint = true
			break
		}

		if node.Type == entity.NodeTypeSubWorkflow {
			node.SubWorkflowSchema.Init()
			if node.SubWorkflowSchema.requireCheckPoint {
				w.requireCheckPoint = true
				break
			}
		}
	}
}

func (w *WorkflowSchema) GetNode(key vo.NodeKey) *NodeSchema {
	return w.nodeMap[key]
}

func (w *WorkflowSchema) GetAllNodes() map[vo.NodeKey]*NodeSchema {
	return w.nodeMap
}

func (w *WorkflowSchema) RequireCheckpoint() bool {
	return w.requireCheckPoint
}

func (w *WorkflowSchema) GetCompositeNodes() []*CompositeNode {
	if w.compositeNodes == nil {
		w.compositeNodes = w.doGetCompositeNodes()
	}

	return w.compositeNodes
}

func (w *WorkflowSchema) doGetCompositeNodes() (cNodes []*CompositeNode) {
	if w.Hierarchy == nil {
		return nil
	}

	// Build parent to children mapping
	parentToChildren := make(map[vo.NodeKey][]*NodeSchema)
	for childKey, parentKey := range w.Hierarchy {
		if parentSchema := w.nodeMap[parentKey]; parentSchema != nil {
			if childSchema := w.nodeMap[childKey]; childSchema != nil {
				parentToChildren[parentKey] = append(parentToChildren[parentKey], childSchema)
			}
		}
	}

	// Create composite nodes
	for parentKey, children := range parentToChildren {
		if parentSchema := w.nodeMap[parentKey]; parentSchema != nil {
			cNodes = append(cNodes, &CompositeNode{
				Parent:   parentSchema,
				Children: children,
			})
		}
	}

	return cNodes
}

func IsInSameWorkflow(n map[vo.NodeKey]vo.NodeKey, nodeKey, otherNodeKey vo.NodeKey) bool {
	if n == nil {
		return true
	}

	myParents, myParentExists := n[nodeKey]
	theirParents, theirParentExists := n[otherNodeKey]

	if !myParentExists && !theirParentExists {
		return true
	}

	if !myParentExists || !theirParentExists {
		return false
	}

	return myParents == theirParents
}

func IsBelowOneLevel(n map[vo.NodeKey]vo.NodeKey, nodeKey, otherNodeKey vo.NodeKey) bool {
	if n == nil {
		return false
	}
	_, myParentExists := n[nodeKey]
	_, theirParentExists := n[otherNodeKey]

	return myParentExists && !theirParentExists
}

func IsParentOf(n map[vo.NodeKey]vo.NodeKey, nodeKey, otherNodeKey vo.NodeKey) bool {
	if n == nil {
		return false
	}
	theirParent, theirParentExists := n[otherNodeKey]

	return theirParentExists && theirParent == nodeKey
}
