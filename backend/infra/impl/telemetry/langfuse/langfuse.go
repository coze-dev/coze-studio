package langfuse

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"

	"code.byted.org/flow/opencoze/backend/infra/contract/telemetry"
)

type TracerConfig struct {
	// Langfuse can receive traces on the /api/public/otel (OTLP) endpoint.

	// EU data region: https://cloud.langfuse.com/api/public/otel
	// US data region: https://us.cloud.langfuse.com/api/public/otel
	// Local deployment (>= v3.22.0): http://localhost:3000/api/public/otel
	Endpoint string

	// Authorization=Basic ${AUTH_STRING}
	AuthString string

	Options []trace.TracerProviderOption
}

func NewTracerProvider(ctx context.Context, cfg TracerConfig) (telemetry.TracerProvider, error) {
	clientOptions := []otlptracegrpc.Option{
		otlptracegrpc.WithEndpoint(cfg.Endpoint),
		otlptracegrpc.WithHeaders(map[string]string{
			"Authorization": fmt.Sprintf("Bearer %s", cfg.AuthString),
		}),
	}
	client := otlptracegrpc.NewClient(clientOptions...)
	traceExp, err := otlptrace.New(ctx, client)
	if err != nil {
		return nil, fmt.Errorf("[NewTracer] failed to create otlp trace exporter: %v", err)
	}

	rcs, err := resource.New(
		context.Background(),
		resource.WithHost(),
		resource.WithFromEnv(),
		resource.WithProcessPID(),
		resource.WithTelemetrySDK())
	if err != nil {
		return nil, err
	}

	wrappedExp := &wrappedExporter{traceExp}
	bsp := trace.NewBatchSpanProcessor(wrappedExp)
	tp := trace.NewTracerProvider(append([]trace.TracerProviderOption{
		trace.WithSpanProcessor(bsp),
		trace.WithResource(rcs),
		trace.WithSampler(trace.AlwaysSample()),
	}, cfg.Options...)...)

	return tp, nil
}

type wrappedExporter struct {
	trace.SpanExporter
}

func (w *wrappedExporter) ExportSpans(ctx context.Context, spans []trace.ReadOnlySpan) error {
	converted := make([]trace.ReadOnlySpan, len(spans))
	for i := range spans {
		converted[i] = &wrappedSpan{spans[i]}
	}

	return w.SpanExporter.ExportSpans(ctx, converted)
}

type wrappedSpan struct {
	trace.ReadOnlySpan
}

func (w *wrappedSpan) Attributes() []attribute.KeyValue {
	var (
		attrs    = w.ReadOnlySpan.Attributes()
		newAttrs = make([]attribute.KeyValue, len(attrs))
	)

	for i := range attrs {
		attr := attrs[i]
		switch attr.Key {
		// case telemetry.AttributeTraceID:
		// 	newAttrs[i] = attribute.String(AttributeSessionID, attr.Value.AsString())
		// case telemetry.AttributeUserID:
		// 	newAttrs[i] = attribute.String(AttributeUserID, attr.Value.AsString())
		default:
			newAttrs[i] = attr
		}
	}

	return newAttrs
}
