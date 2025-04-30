package entity

type SingleAgentPublish struct {
	ID            int64
	AgentID       int64
	PublishID     string
	ConnectorIds  []int64
	Version       string
	PublishResult *string
	PublishInfo   *string
	CreatorID     int64
	PublishTime   int64
	CreatedAt     int64
	UpdatedAt     int64
	Status        int32
	Extra         *string
}
