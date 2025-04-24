package repo

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas"
)

//go:generate  mockgen -destination ./mockrepo/repository.go --package mockWorkflowRepo -source interface.go
type Repository interface {
	GetSubWorkflowCanvas(ctx context.Context, parent *canvas.Node) (*canvas.Canvas, error)
}
