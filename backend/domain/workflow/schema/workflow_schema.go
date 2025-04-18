package schema

import (
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type WorkflowSchema struct {
	Nodes       []*NodeSchema                   `json:"nodes"`
	Connections []*Connection                   `json:"connections"`
	Hierarchy   map[nodes.NodeKey]nodes.NodeKey `json:"hierarchy,omitempty"` // child node key-> parent node key

	nodeMap           map[nodes.NodeKey]*NodeSchema // won't serialize this
	compositeNodes    []*CompositeNode              // won't serialize this
	requireCheckPoint bool                          // won't serialize this
}

type Connection struct {
	FromNode   nodes.NodeKey `json:"from_node"`
	ToNode     nodes.NodeKey `json:"to_node"`
	FromPort   *string       `json:"from_port,omitempty"`
	FromBranch bool          `json:"from_branch,omitempty"`
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
	w.nodeMap = make(map[nodes.NodeKey]*NodeSchema)
	for _, node := range w.Nodes {
		w.nodeMap[node.Key] = node
	}

	w.doGetCompositeNodes()

	for _, node := range w.Nodes {
		if node.Type == NodeTypeQuestionAnswer || node.Type == NodeTypeInputReceiver {
			w.requireCheckPoint = true
			break
		}
	}
}

func (w *WorkflowSchema) GetNode(key nodes.NodeKey) *NodeSchema {
	return w.nodeMap[key]
}

func (w *WorkflowSchema) GetAllNodes() map[nodes.NodeKey]*NodeSchema {
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
	parentToChildren := make(map[nodes.NodeKey][]*NodeSchema)
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

func IsInSameWorkflow(n map[nodes.NodeKey]nodes.NodeKey, nodeKey, otherNodeKey nodes.NodeKey) bool {
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

func IsBelowOneLevel(n map[nodes.NodeKey]nodes.NodeKey, nodeKey, otherNodeKey nodes.NodeKey) bool {
	if n == nil {
		return false
	}
	_, myParentExists := n[nodeKey]
	_, theirParentExists := n[otherNodeKey]

	return myParentExists && !theirParentExists
}

func IsParentOf(n map[nodes.NodeKey]nodes.NodeKey, nodeKey, otherNodeKey nodes.NodeKey) bool {
	if n == nil {
		return false
	}
	theirParent, theirParentExists := n[otherNodeKey]

	return theirParentExists && theirParent == nodeKey
}
