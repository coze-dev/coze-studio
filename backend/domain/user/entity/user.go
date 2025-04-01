package entity

type UserIdentity struct {
	UserID  int64
	SpaceID int64

	Name        string
	Description string
	IconURI     string
}
