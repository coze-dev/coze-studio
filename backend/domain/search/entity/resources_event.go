package entity

// 复用AppDomainEvent中的DomainName和OpType

type ResourceDomainEvent struct {
	OpType   OpType         `json:"op_type"`
	Resource *Resource      `json:"resource,omitempty"`
	Meta     *EventMeta     `json:"meta,omitempty"`
	Extra    map[string]any `json:"extra"`
}
