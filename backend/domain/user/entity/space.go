package entity

type SpaceType int32

const (
	SpaceTypePersonal SpaceType = 1
	SpaceTypeTeam     SpaceType = 2
)

type Space struct {
	ID          int64
	Name        string
	Description string
	IconURL     string
	SpaceType   SpaceType
	OwnerID     int64
	CreatorID   int64
	CreatedAt   int64
	UpdatedAt   int64
}
