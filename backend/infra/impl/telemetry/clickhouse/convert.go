package clickhouse

import (
	"context"
	"encoding/hex"
	"fmt"
	"strconv"
	"time"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"

	"github.com/coze-dev/coze-studio/backend/infra/contract/telemetry"
	"github.com/coze-dev/coze-studio/backend/infra/impl/telemetry/clickhouse/internal/model"
)

func toSpanIndexModel(span tracesdk.ReadOnlySpan) (*model.SpansIndex, error) {
	index := &model.SpansIndex{
		SpanID:       span.SpanContext().SpanID().String(),
		TraceID:      span.SpanContext().TraceID().String(),
		ParentSpanID: span.Parent().SpanID().String(),
		Name:         span.Name(),
		Kind:         int8(span.SpanKind()),
		StatusCode:   int64(span.Status().Code),
		StatusMsg:    span.Status().Description,
		StartTimeMs:  uint64(span.StartTime().UnixMilli()),
	}

	for _, attr := range span.Attributes() {
		switch attr.Key {
		case telemetry.AttributeLogID:
			index.LogID = attr.Value.AsString()
		case telemetry.AttributeSpaceID:
			index.SpaceID = attr.Value.AsInt64()
		case telemetry.AttributeType:
			index.Type = int32(attr.Value.AsInt64())
		case telemetry.AttributeUserID:
			index.UserID = attr.Value.AsInt64()
		case telemetry.AttributeEntityID:
			index.EntityID = attr.Value.AsInt64()
		case telemetry.AttributeEnvironment:
			index.Env = attr.Value.AsString()
		case telemetry.AttributeVersion:
			index.Version = attr.Value.AsString()
		case telemetry.AttributeInput:
			index.Input = attr.Value.AsString()
		default:
			// do nothing
		}
	}

	return index, nil
}

func toSpanDataModel(span tracesdk.ReadOnlySpan) (*model.SpansData, error) {
	data := &model.SpansData{
		SpanID:             span.SpanContext().SpanID().String(),
		TraceID:            span.SpanContext().TraceID().String(),
		ParentSpanID:       span.Parent().SpanID().String(),
		Name:               span.Name(),
		Kind:               int8(span.SpanKind()),
		StatusCode:         int64(span.Status().Code),
		StatusMsg:          span.Status().Description,
		ResourceAttributes: make(map[string]string),
		LogID:              "",
		StartTimeMs:        uint64(span.StartTime().UnixMilli()),
		AttrKeys:           make([]string, 0, len(span.Attributes())),
		AttrValues:         make([]string, 0, len(span.Attributes())),
	}

	for _, attr := range span.Resource().Attributes() {
		data.ResourceAttributes[string(attr.Key)] = attr.Value.Emit()
	}

	for _, attr := range span.Attributes() {
		switch attr.Key {
		case telemetry.AttributeLogID:
			data.LogID = attr.Value.AsString()
		default:
			data.AttrKeys = append(data.AttrKeys, string(attr.Key))
			data.AttrValues = append(data.AttrValues, attr.Value.Emit())
		}
	}

	return data, nil
}

func fromSpanIndexModel(emptySpanID string) func(index *model.SpansIndex) (tracesdk.ReadOnlySpan, error) {
	return func(index *model.SpansIndex) (tracesdk.ReadOnlySpan, error) {
		traceID, err := hex.DecodeString(index.TraceID)
		if err != nil {
			return nil, err
		}
		if len(traceID) != 16 {
			return nil, fmt.Errorf("[fromSpanIndexModel] invalid trace ID: %s", index.TraceID)
		}

		spanID, err := hex.DecodeString(index.SpanID)
		if err != nil {
			return nil, err
		}
		if len(spanID) != 8 {
			return nil, fmt.Errorf("[fromSpanIndexModel] invalid span ID: %s", index.SpanID)
		}

		span := &ckSpan{
			name: index.Name,
			spanContext: trace.NewSpanContext(trace.SpanContextConfig{
				TraceID: trace.TraceID(traceID),
				SpanID:  trace.SpanID(spanID),
			}),
			parent:    trace.SpanContext{},
			kind:      trace.SpanKind(index.Kind),
			startTime: time.UnixMilli(int64(index.StartTimeMs)),
			resource:  nil,
			attributes: []attribute.KeyValue{
				telemetry.NewSpanAttrLogID(index.LogID),
				telemetry.NewSpanAttrSpaceID(index.SpaceID),
				telemetry.NewSpanAttrType(int64(index.Type)),
				telemetry.NewSpanAttrUserID(index.UserID),
				telemetry.NewSpanAttrEntityID(index.EntityID),
				telemetry.NewSpanAttrEnvironment(index.Env),
				telemetry.NewSpanAttrVersion(index.Version),
				telemetry.NewSpanAttrInput(index.Input),
			},
			status: tracesdk.Status{
				Code:        codes.Code(index.StatusCode),
				Description: index.StatusMsg,
			},
			csCount: 0,
		}

		if index.ParentSpanID != emptySpanID {
			parentSpanID, err := hex.DecodeString(index.ParentSpanID)
			if err != nil {
				return nil, err
			}
			span.parent = trace.NewSpanContext(trace.SpanContextConfig{
				TraceID: trace.TraceID(traceID),
				SpanID:  trace.SpanID(parentSpanID),
			})
		}

		return span, nil
	}
}

func fromSpanDataModel(emptySpanID string) func(data *model.SpansData) (tracesdk.ReadOnlySpan, error) {
	return func(data *model.SpansData) (tracesdk.ReadOnlySpan, error) {
		traceID, err := hex.DecodeString(data.TraceID)
		if err != nil {
			return nil, err
		}
		if len(traceID) != 16 {
			return nil, fmt.Errorf("[fromSpanDataModel] invalid trace ID: %s", data.TraceID)
		}

		spanID, err := hex.DecodeString(data.SpanID)
		if err != nil {
			return nil, err
		}
		if len(spanID) != 8 {
			return nil, fmt.Errorf("[fromSpanDataModel] invalid span ID: %s", data.SpanID)
		}

		span := &ckSpan{
			name: data.Name,
			spanContext: trace.NewSpanContext(trace.SpanContextConfig{
				TraceID: trace.TraceID(traceID),
				SpanID:  trace.SpanID(spanID),
			}),
			parent:     trace.SpanContext{},
			kind:       trace.SpanKind(data.Kind),
			startTime:  time.UnixMilli(int64(data.StartTimeMs)),
			endTime:    time.UnixMilli(int64(data.EndTimeMs)),
			resource:   nil,
			attributes: nil,
			status: tracesdk.Status{
				Code:        codes.Code(data.StatusCode),
				Description: data.StatusMsg,
			},
			csCount: 0,
		}

		if data.ParentSpanID != emptySpanID {
			parentSpanID, err := hex.DecodeString(data.ParentSpanID)
			if err != nil {
				return nil, err
			}
			span.parent = trace.NewSpanContext(trace.SpanContextConfig{
				TraceID: trace.TraceID(traceID),
				SpanID:  trace.SpanID(parentSpanID),
			})
		}

		if len(data.AttrKeys) != len(data.AttrValues) {
			return nil, fmt.Errorf("[fromSpanDataModel] invalid attribute count, keys=%d, vals=%d", len(data.AttrKeys), len(data.AttrValues))
		}

		var ra []attribute.KeyValue
		for k, v := range data.ResourceAttributes {
			// todo: resource value type
			ra = append(ra, attribute.String(k, v))
		}
		rs, err := resource.New(context.Background(), resource.WithAttributes(ra...))
		if err != nil {
			return nil, err
		}
		span.resource = rs

		for i := range data.AttrKeys {
			key, val := data.AttrKeys[i], data.AttrValues[i]
			var kv attribute.KeyValue

			switch key {
			case telemetry.AttributeSpaceID,
				telemetry.AttributeType,
				telemetry.AttributeUserID,
				telemetry.AttributeEntityID,
				telemetry.AttributeInputTokens,
				telemetry.AttributeOutputToken:
				i64, err := strconv.ParseInt(val, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("[fromSpanDataModel] invalid attribute, key=%s, value=%s, expect value as int64, err=%w", key, val, err)
				}
				kv = attribute.Int64(key, i64)
			case telemetry.AttributeLogID,
				telemetry.AttributeEnvironment,
				telemetry.AttributeVersion,
				telemetry.AttributeInput,
				telemetry.AttributeOutput,
				telemetry.AttributeModel:
				kv = attribute.String(key, val)
			default:
				kv = assertAttribute(key, val)
			}

			span.attributes = append(span.attributes, kv)
		}

		return span, nil
	}
}

func assertAttribute(key string, val string) attribute.KeyValue {
	return attribute.String(key, val)
}
