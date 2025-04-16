package schema

import "code.byted.org/flow/opencoze/backend/domain/workflow/nodes"

type WorkflowSchema struct {
	ID          string                          `json:"id"`
	Name        string                          `json:"name"`
	Desc        string                          `json:"desc"`
	Nodes       []NodeSchema                    `json:"nodes"`
	Connections []*Connection                   `json:"connections"`
	Hierarchy   map[nodes.NodeKey]nodes.NodeKey `json:"hierarchy,omitempty"`
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

/*func (w *WorkflowSchema) GetCompositeNodes() (cNodes []*CompositeNode) {
	parentMaps := make(map[nodes.NodeKey]*NodeSchema)
	for child, parents := range w.Hierarchy {
		parentMaps[w.Nodes[i].Key] = &w.Nodes[i]
	}
}*/

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
