package clickhouse

import (
	"context"
	"fmt"
	"strconv"

	"github.com/ClickHouse/clickhouse-go/v2"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/sdk/trace"
	"gorm.io/gen"

	"github.com/coze-dev/coze-studio/backend/infra/contract/telemetry"
	"github.com/coze-dev/coze-studio/backend/infra/impl/telemetry/clickhouse/internal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

const (
	emptySpanID = "0000000000000000"
)

type QueryClientConfig struct {
	ClickhouseOptions *clickhouse.Options
	EmptySpanID       *string
}

func NewQueryClient(config *QueryClientConfig) (telemetry.QueryClient, error) {
	db, err := newClickhouseDB(config.ClickhouseOptions)
	if err != nil {
		return nil, err

	}

	qc := &queryClient{
		query:       query.Use(db),
		emptySpanID: emptySpanID,
	}

	if config.EmptySpanID != nil {
		qc.emptySpanID = *config.EmptySpanID
	}

	return qc, nil
}

type queryClient struct {
	query       *query.Query
	emptySpanID string
}

func (q *queryClient) ListSpan(ctx context.Context, request *telemetry.ListTracesRequest) (
	spans []trace.ReadOnlySpan, nextCursor *string, hasMore bool, err error) {

	if request.SpaceID == 0 || request.EntityID == 0 || (request.StartAt.IsZero() && request.EndAt.IsZero()) {
		return nil, nil, false, fmt.Errorf("[ListSpan] invalid request params")
	}

	si := q.query.SpansIndex

	conds := []gen.Condition{
		si.SpaceID.Eq(request.SpaceID),
		si.EntityID.Eq(request.EntityID),
	}
	if !request.StartAt.IsZero() {
		conds = append(conds, si.StartTimeMs.Gte(uint64(request.StartAt.UnixMilli())))
	}
	if !request.EndAt.IsZero() {
		conds = append(conds, si.StartTimeMs.Lte(uint64(request.EndAt.UnixMilli())))
	}
	if request.RootOnly {
		conds = append(conds, si.ParentSpanID.Eq(q.emptySpanID))
	}
	if request.Status != codes.Unset {
		conds = append(conds, si.StatusCode.Eq(int64(request.Status)))
	}
	if request.Cursor != nil {
		ms, err := strconv.ParseInt(*request.Cursor, 10, 64)
		if err != nil {
			return nil, nil, false, err
		}
		conds = append(conds, si.StartTimeMs.Lt(uint64(ms)))
	}

	limit := request.Limit
	if limit == 0 {
		limit = 30
	}
	indexes, err := si.WithContext(ctx).Debug().
		Where(conds...).
		Order(si.StartTimeMs.Desc()).
		Limit(limit).
		Find()
	if err != nil {
		return nil, nil, false, err
	}

	spans, err = slices.TransformWithErrorCheck(indexes, fromSpanIndexModel(q.emptySpanID))
	if err != nil {
		return nil, nil, false, err
	}

	if len(indexes) == limit {
		hasMore = true
		ms := indexes[len(indexes)-1].StartTimeMs
		nextCursor = ptr.Of(strconv.FormatInt(int64(ms), 10))
	}

	return spans, nextCursor, hasMore, nil
}

func (q *queryClient) GetTrace(ctx context.Context, request *telemetry.GetTraceRequest) ([]trace.ReadOnlySpan, error) {

	sd := q.query.SpansData

	// TODO: 看下 space_id 和 entity_id 是否要加到 spans_data 表
	var conds []gen.Condition
	if request.TraceID == nil && request.LogID == nil {
		return nil, fmt.Errorf("[GetTrace] both traceID and logID is nil")
	}
	if request.TraceID != nil {
		conds = append(conds, sd.TraceID.Eq(request.TraceID.String()))
	}
	if request.LogID != nil {
		conds = append(conds, sd.LogID.Eq(*request.LogID))
	}

	rows, err := sd.WithContext(ctx).Debug().Where(conds...).Limit(-1).Find()
	if err != nil {
		return nil, err
	}

	spans, err := slices.TransformWithErrorCheck(rows, fromSpanDataModel(q.emptySpanID))
	if err != nil {
		return nil, err
	}

	return spans, nil
}
