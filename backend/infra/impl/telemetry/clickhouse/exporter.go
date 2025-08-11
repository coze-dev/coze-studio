package clickhouse

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel/sdk/trace"

	"github.com/coze-dev/coze-studio/backend/infra/impl/telemetry/clickhouse/internal/model"
	"github.com/coze-dev/coze-studio/backend/infra/impl/telemetry/clickhouse/internal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type exporter struct {
	query *query.Query

	indexRootOnly bool
}

func (e *exporter) ExportSpans(ctx context.Context, spans []trace.ReadOnlySpan) (err error) {
	defer func() {
		if err != nil {
			err = fmt.Errorf("[ExportSpans] failed when exporting spans: %w", err)
			logs.CtxErrorf(ctx, "%v", err)
		}
	}()

	var (
		spansIndex []*model.SpansIndex
		spansData  []*model.SpansData
	)

	for _, span := range spans {
		if !e.indexRootOnly || !span.Parent().HasSpanID() {
			index, err := toSpanIndexModel(span)
			if err != nil {
				return err
			}
			spansIndex = append(spansIndex, index)
		}

		data, err := toSpanDataModel(span)
		if err != nil {
			return err
		}
		spansData = append(spansData, data)
	}

	if len(spansData) > 0 {
		if err = e.query.SpansData.WithContext(ctx).Debug().Create(spansData...); err != nil {
			return err
		}
	}

	if len(spansIndex) > 0 {
		if err = e.query.SpansIndex.WithContext(ctx).Debug().Create(spansIndex...); err != nil {
			return err
		}
	}

	return nil
}

func (e *exporter) Shutdown(ctx context.Context) error {
	return nil
}
