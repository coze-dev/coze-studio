package entity

type PromptResource struct {
	ID          int64
	SpaceID     int64
	Name        string
	Description string
	PromptText  string
	Status      int32
	CreatorID   int64
	CreatedAt   int64
	UpdatedAt   int64
}
