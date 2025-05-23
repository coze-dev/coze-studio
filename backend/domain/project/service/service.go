package service

import (
	"context"
)

type ProjectService interface {
	CreateProject(ctx context.Context, req *CreateProjectRequest) (resp *CreateProjectResponse, err error)
	DeleteProject(ctx context.Context, req *DeleteProjectRequest) (err error)
	UpdateProjectMeta(ctx context.Context, req *UpdateProjectMetaRequest) (err error)
	ListProjectResources(ctx context.Context, req *ListProjectResourcesRequest) (resp *ListProjectResourcesResponse, err error)

	PublishProject(ctx context.Context, req *PublishProjectRequest) (resp *PublishProjectResponse, err error)
	CopyResource(ctx context.Context, req *CopyResourceRequest) (resp *CopyResourceResponse, err error)
}

type CreateProjectRequest struct {
}

type CreateProjectResponse struct {
}

type DeleteProjectRequest struct {
}

type UpdateProjectMetaRequest struct {
}

type ListProjectResourcesRequest struct {
}

type ListProjectResourcesResponse struct {
}

type PublishProjectRequest struct {
}

type PublishProjectResponse struct {
}

type CopyResourceRequest struct {
}

type CopyResourceResponse struct {
}
