package clickhouse

import (
	"time"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/sdk/instrumentation"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

type ckSpan struct {
	tracesdk.ReadOnlySpan

	name        string
	spanContext trace.SpanContext
	parent      trace.SpanContext
	kind        trace.SpanKind

	startTime time.Time
	endTime   time.Time

	resource   *resource.Resource
	attributes []attribute.KeyValue
	status     tracesdk.Status
	csCount    int
}

var _ tracesdk.ReadOnlySpan = ckSpan{}

func (c ckSpan) Name() string {
	return c.name
}

func (c ckSpan) SpanContext() trace.SpanContext {
	return c.spanContext
}

func (c ckSpan) Parent() trace.SpanContext {
	return c.parent
}

func (c ckSpan) SpanKind() trace.SpanKind {
	return c.kind
}

func (c ckSpan) StartTime() time.Time {
	return c.startTime
}

func (c ckSpan) EndTime() time.Time {
	return c.endTime
}

func (c ckSpan) Attributes() []attribute.KeyValue {
	return c.attributes
}

func (c ckSpan) Links() []tracesdk.Link {
	return nil
}

func (c ckSpan) Events() []tracesdk.Event {
	return nil
}

func (c ckSpan) Status() tracesdk.Status {
	return c.status
}

func (c ckSpan) InstrumentationScope() instrumentation.Scope {
	return instrumentation.Scope{}
}

func (c ckSpan) InstrumentationLibrary() instrumentation.Library {
	return instrumentation.Library{}
}

func (c ckSpan) Resource() *resource.Resource {
	return c.resource
}

func (c ckSpan) DroppedAttributes() int {
	return 0
}

func (c ckSpan) DroppedLinks() int {
	return 0
}

func (c ckSpan) DroppedEvents() int {
	return 0
}

func (c ckSpan) ChildSpanCount() int {
	return c.csCount
}
