package compose

import (
	"fmt"
	"maps"
	"reflect"
	"sync"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type WorkflowSchema struct {
	Nodes       []*NodeSchema             `json:"nodes"`
	Connections []*Connection             `json:"connections"`
	Hierarchy   map[vo.NodeKey]vo.NodeKey `json:"hierarchy,omitempty"` // child node key-> parent node key

	GeneratedNodes []vo.NodeKey `json:"generated_nodes,omitempty"` // generated nodes for the nodes in batch mode

	nodeMap           map[vo.NodeKey]*NodeSchema // won't serialize this
	compositeNodes    []*CompositeNode           // won't serialize this
	requireCheckPoint bool                       // won't serialize this

	once sync.Once
}

type Connection struct {
	FromNode vo.NodeKey `json:"from_node"`
	ToNode   vo.NodeKey `json:"to_node"`
	FromPort *string    `json:"from_port,omitempty"`
}

func (c *Connection) ID() string {
	if c.FromPort != nil {
		return fmt.Sprintf("%s:%s:%v", c.FromNode, c.ToNode, *c.FromPort)
	}
	return fmt.Sprintf("%v:%v", c.FromNode, c.ToNode)
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
	w.once.Do(func() {
		w.nodeMap = make(map[vo.NodeKey]*NodeSchema)
		for _, node := range w.Nodes {
			w.nodeMap[node.Key] = node
		}

		w.doGetCompositeNodes()

		for _, node := range w.Nodes {
			if node.requireCheckpoint() {
				w.requireCheckPoint = true
				break
			}
		}
	})
}

func (w *WorkflowSchema) GetNode(key vo.NodeKey) *NodeSchema {
	return w.nodeMap[key]
}

func (w *WorkflowSchema) GetAllNodes() map[vo.NodeKey]*NodeSchema {
	return w.nodeMap // TODO: needs to calculate node count separately, considering batch mode nodes
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

func (w *WorkflowSchema) IsEqual(other *WorkflowSchema) bool {
	otherConnectionsMap := make(map[string]bool, len(other.Connections))
	for _, connection := range other.Connections {
		otherConnectionsMap[connection.ID()] = true
	}
	connectionsMap := make(map[string]bool, len(other.Connections))
	for _, connection := range w.Connections {
		connectionsMap[connection.ID()] = true
	}
	if !maps.Equal(otherConnectionsMap, connectionsMap) {
		return false
	}
	otherNodeMap := make(map[vo.NodeKey]*NodeSchema, len(other.Nodes))
	for _, node := range other.Nodes {
		otherNodeMap[node.Key] = node
	}
	nodeMap := make(map[vo.NodeKey]*NodeSchema, len(w.Nodes))

	for _, node := range w.Nodes {
		nodeMap[node.Key] = node
	}

	if !maps.EqualFunc(otherNodeMap, nodeMap, func(node *NodeSchema, other *NodeSchema) bool {
		if node.Name != other.Name {
			return false
		}
		if !reflect.DeepEqual(node.Configs, other.Configs) {
			return false
		}
		if !reflect.DeepEqual(node.InputTypes, other.InputTypes) {
			return false
		}
		if !reflect.DeepEqual(node.InputSources, other.InputSources) {
			return false
		}

		if !reflect.DeepEqual(node.OutputTypes, other.OutputTypes) {
			return false
		}
		if !reflect.DeepEqual(node.OutputSources, other.OutputSources) {
			return false
		}
		if !reflect.DeepEqual(node.MetaConfigs, other.MetaConfigs) {
			return false
		}
		if !reflect.DeepEqual(node.SubWorkflowBasic, other.SubWorkflowBasic) {
			return false
		}
		return true

	}) {
		return false
	}

	return true

}

func (w *WorkflowSchema) NodeCount() int32 {
	return int32(len(w.Nodes) - len(w.GeneratedNodes))
}
