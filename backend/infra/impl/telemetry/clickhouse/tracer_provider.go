package clickhouse

import (
	"context"

	"github.com/ClickHouse/clickhouse-go/v2"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"

	"code.byted.org/flow/opencoze/backend/infra/contract/telemetry"
	"code.byted.org/flow/opencoze/backend/infra/impl/telemetry/clickhouse/internal/query"
)

type TracerConfig struct {
	ClickhouseOptions     *clickhouse.Options
	TracerProviderOptions []trace.TracerProviderOption
	IndexRootOnly         bool
}

func NewTracerProvider(ctx context.Context, cfg *TracerConfig) (telemetry.TracerProvider, error) {
	db, err := newClickhouseDB(cfg.ClickhouseOptions)
	if err != nil {
		return nil, err
	}

	exp := &exporter{query: query.Use(db), indexRootOnly: cfg.IndexRootOnly}
	rcs, err := resource.New(
		context.Background(),
		resource.WithHost(),
		resource.WithFromEnv(),
		resource.WithProcessPID(),
		resource.WithTelemetrySDK())
	if err != nil {
		return nil, err
	}

	bsp := trace.NewBatchSpanProcessor(exp)
	tp := trace.NewTracerProvider(append([]trace.TracerProviderOption{
		trace.WithSpanProcessor(bsp),
		trace.WithResource(rcs),
		trace.WithSampler(trace.AlwaysSample()),
	}, cfg.TracerProviderOptions...)...)

	return tp, nil
}
