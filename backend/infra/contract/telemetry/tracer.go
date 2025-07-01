package telemetry

import (
	"context"
	"time"

	"go.opentelemetry.io/otel/codes"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

type TracerProvider interface {
	trace.TracerProvider

	Shutdown(ctx context.Context) error
}

type QueryClient interface {
	ListSpan(ctx context.Context, request *ListTracesRequest) (
		spans []tracesdk.ReadOnlySpan, nextCursor *string, hasMore bool, err error)

	GetTrace(ctx context.Context, request *GetTraceRequest) ([]tracesdk.ReadOnlySpan, error)
}

type ListTracesRequest struct {
	RootOnly bool
	SpaceID  int64
	EntityID int64
	Status   codes.Code

	StartAt time.Time
	EndAt   time.Time

	Limit  int
	Cursor *string
}

type GetTraceRequest struct {
	SpaceID  int64
	EntityID int64
	TraceID  *trace.TraceID
	LogID    *string
}
