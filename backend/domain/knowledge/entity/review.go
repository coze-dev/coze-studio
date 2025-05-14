package entity

type Review struct {
	ReviewId      *int64
	DocumentName  string
	DocumentType  string
	Uri           string
	Url           string
	Status        *ReviewStatus
	DocTreeTosUrl *string
	PreviewTosUrl *string
}

type ReviewStatus int64

const (
	ReviewStatus_Processing ReviewStatus = 0
	ReviewStatus_Enable     ReviewStatus = 1
	ReviewStatus_Failed     ReviewStatus = 2
	ReviewStatus_ForceStop  ReviewStatus = 3
)
