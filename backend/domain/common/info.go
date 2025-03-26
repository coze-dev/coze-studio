package common

type Info struct {
	ID          int64
	Name        string
	Description string
	IconURI     string

	DeveloperID int64
	SpaceID     int64

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64
}
