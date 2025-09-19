/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package execute

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	oteltrace "go.opentelemetry.io/otel/trace"
)

var (
	workflowTracer = otel.Tracer("github.com/coze-dev/coze-studio/backend/domain/workflow/execute")
)

const (
	tracePayloadLimit = 2048
	spanTypeAttrKey   = "cozeloop.span_type"
	spanTypeWorkflow  = "graph"
	spanTypeModel     = "model"
	spanTypePlugin    = "plugin"
	spanTypeFunction  = "function"
	spanTypeVector    = "vector_store"
	spanTypeRetriever = "vector_retriever"
)

func startWorkflowSpan(ctx context.Context, c *Context, handler *WorkflowHandler, resumed bool, origin string, payload map[string]any, nodeCount int32) context.Context {
	if c == nil {
		return ctx
	}
	if c.workflowSpan != nil && c.workflowSpan.SpanContext().IsValid() {
		return ctx
	}

	wfBasic := handler.rootWorkflowBasic
	executeID := handler.rootExecuteID
	workflowKind := "root"
	if handler.subWorkflowBasic != nil && c.SubWorkflowCtx != nil {
		wfBasic = handler.subWorkflowBasic
		executeID = c.SubWorkflowCtx.SubExecuteID
		workflowKind = "subworkflow"
	}

	workflowID := int64(0)
	spaceID := int64(0)
	version := ""
	if wfBasic != nil {
		workflowID = wfBasic.ID
		spaceID = wfBasic.SpaceID
		version = wfBasic.Version
	}

	spanName := fmt.Sprintf("workflow.%d", workflowID)
	if workflowKind == "subworkflow" && c.RootCtx.RootWorkflowBasic != nil {
		spanName = fmt.Sprintf("workflow.%d.sub.%d", c.RootCtx.RootWorkflowBasic.ID, workflowID)
	}

	ctxWithSpan, span := workflowTracer.Start(ctx, spanName, oteltrace.WithSpanKind(oteltrace.SpanKindInternal))

	attrs := []attribute.KeyValue{
		attribute.Int64("cozeloop.workflow.execute_id", executeID),
		attribute.Int64("cozeloop.workflow.root_execute_id", c.RootCtx.RootExecuteID),
		attribute.Int64("cozeloop.workflow.id", workflowID),
		attribute.String("cozeloop.workflow.version", version),
		attribute.Int64("cozeloop.workflow.space_id", spaceID),
		attribute.String("cozeloop.workflow.kind", workflowKind),
		attribute.String("cozeloop.workflow.execute_mode", string(c.RootCtx.ExeCfg.Mode)),
		attribute.String("cozeloop.workflow.task_type", string(c.RootCtx.ExeCfg.TaskType)),
		attribute.String("cozeloop.workflow.sync_pattern", string(c.RootCtx.ExeCfg.SyncPattern)),
		attribute.Bool("cozeloop.workflow.cancellable", c.RootCtx.ExeCfg.Cancellable),
	}

	if c.RootCtx.ExeCfg.WorkflowMode != 0 {
		attrs = append(attrs, attribute.String("cozeloop.workflow.workflow_mode", fmt.Sprintf("%d", c.RootCtx.ExeCfg.WorkflowMode)))
	}
	if c.RootCtx.ExeCfg.AppID != nil {
		attrs = append(attrs, attribute.Int64("cozeloop.workflow.app_id", *c.RootCtx.ExeCfg.AppID))
	}
	if c.RootCtx.ExeCfg.AgentID != nil {
		attrs = append(attrs, attribute.Int64("cozeloop.workflow.agent_id", *c.RootCtx.ExeCfg.AgentID))
	}
	if c.RootCtx.ExeCfg.ConnectorID != 0 {
		attrs = append(attrs, attribute.Int64("cozeloop.workflow.connector_id", c.RootCtx.ExeCfg.ConnectorID))
	}
	if c.RootCtx.ExeCfg.RoundID != nil {
		attrs = append(attrs, attribute.Int64("cozeloop.workflow.round_id", *c.RootCtx.ExeCfg.RoundID))
	}
	if c.RootCtx.ExeCfg.ConversationID != nil {
		attrs = append(attrs, attribute.Int64("cozeloop.workflow.conversation_id", *c.RootCtx.ExeCfg.ConversationID))
	}
	if nodeCount > 0 {
		attrs = append(attrs, attribute.Int64("cozeloop.workflow.node_count", int64(nodeCount)))
	}
	if payload != nil {
		attrs = append(attrs, attribute.Int("cozeloop.workflow.input_field_count", len(payload)))
	}
	if resumed {
		attrs = append(attrs, attribute.Bool("cozeloop.workflow.resumed", true))
	}
	attrs = append(attrs, attribute.String(spanTypeAttrKey, spanTypeWorkflow))

	span.SetAttributes(attrs...)
	eventName := "workflow.start"
	if resumed {
		eventName = "workflow.resume"
	}
	span.AddEvent(eventName, oteltrace.WithAttributes(attribute.String("cozeloop.workflow.origin", origin)))

	c.workflowSpan = span
	return ctxWithSpan
}

func finishWorkflowSpan(c *Context, duration time.Duration, status codes.Code, err error, token *TokenInfo, attrs ...attribute.KeyValue) {
	if c == nil {
		return
	}
	span := c.workflowSpan
	if span == nil || !span.SpanContext().IsValid() {
		return
	}

	if duration <= 0 && c.StartTime > 0 {
		duration = time.Since(time.UnixMilli(c.StartTime))
	}

	baseAttrs := []attribute.KeyValue{attribute.Float64("cozeloop.workflow.duration_ms", milliseconds(duration))}
	baseAttrs = append(baseAttrs, tokenAttributes(token)...)
	baseAttrs = append(baseAttrs, attrs...)

	span.SetAttributes(baseAttrs...)
	span.AddEvent("workflow.finish", oteltrace.WithAttributes(attribute.String("cozeloop.workflow.finish.status", status.String())))
	if err != nil {
		span.RecordError(err)
	}
	span.SetStatus(status, statusMessage(status, err))
	span.End()
	c.workflowSpan = nil
}

func addWorkflowSpanEvent(c *Context, name string, attrs ...attribute.KeyValue) {
	if c == nil {
		return
	}
	span := c.workflowSpan
	if span == nil || !span.SpanContext().IsValid() {
		return
	}
	span.AddEvent(name, oteltrace.WithAttributes(attrs...))
}

func startNodeSpan(ctx context.Context, c *Context, nodeType entity.NodeType, resumed bool, origin string, payload map[string]any) context.Context {
	if c == nil {
		return ctx
	}
	if c.nodeSpan != nil && c.nodeSpan.SpanContext().IsValid() {
		return ctx
	}

	nodeKey := "unknown"
	nodeName := ""
	if c.NodeCtx != nil {
		nodeKey = string(c.NodeCtx.NodeKey)
		nodeName = c.NodeCtx.NodeName
	}

	spanName := fmt.Sprintf("workflow.node.%s", nodeKey)
	ctxWithSpan, span := workflowTracer.Start(ctx, spanName, oteltrace.WithSpanKind(oteltrace.SpanKindInternal))

	attrs := []attribute.KeyValue{
		attribute.Int64("cozeloop.workflow.execute_id", c.RootCtx.RootExecuteID),
		attribute.String("cozeloop.workflow.node.id", nodeKey),
		attribute.String("cozeloop.workflow.node.name", nodeName),
		attribute.String("cozeloop.workflow.node.type", string(nodeType)),
	}

	if c.NodeCtx != nil {
		attrs = append(attrs, attribute.Int64("cozeloop.workflow.node.execute_id", c.NodeCtx.NodeExecuteID))
		if len(c.NodeCtx.NodePath) > 0 {
			attrs = append(attrs, attribute.String("cozeloop.workflow.node.path", strings.Join(c.NodeCtx.NodePath, ".")))
		}
		if c.NodeCtx.TerminatePlan != nil {
			attrs = append(attrs, attribute.String("cozeloop.workflow.node.terminate_plan", string(*c.NodeCtx.TerminatePlan)))
		}
	}

	if c.SubWorkflowCtx != nil {
		attrs = append(attrs, attribute.Int64("cozeloop.workflow.sub_execute_id", c.SubWorkflowCtx.SubExecuteID))
		if c.SubWorkflowCtx.SubWorkflowBasic != nil {
			attrs = append(attrs, attribute.Int64("cozeloop.workflow.sub_workflow_id", c.SubWorkflowCtx.SubWorkflowBasic.ID))
		}
	}

	if c.BatchInfo != nil {
		attrs = append(attrs,
			attribute.Bool("cozeloop.workflow.node.batch", true),
			attribute.Int("cozeloop.workflow.node.batch.index", c.BatchInfo.Index),
			attribute.Int("cozeloop.workflow.node.batch.item_count", len(c.BatchInfo.Items)),
		)
	}

	if payload != nil {
		attrs = append(attrs, attribute.Int("cozeloop.workflow.node.input_field_count", len(payload)))
	}
	if resumed {
		attrs = append(attrs, attribute.Bool("cozeloop.workflow.node.resumed", true))
	}
	attrs = append(attrs, attribute.String(spanTypeAttrKey, spanTypeForNode(nodeType)))

	span.SetAttributes(attrs...)
	span.AddEvent("node.start", oteltrace.WithAttributes(attribute.String("cozeloop.workflow.origin", origin)))

	c.nodeSpan = span
	return ctxWithSpan
}

func finishNodeSpan(c *Context, duration time.Duration, status codes.Code, err error, token *TokenInfo, attrs ...attribute.KeyValue) {
	if c == nil {
		return
	}
	span := c.nodeSpan
	if span == nil || !span.SpanContext().IsValid() {
		return
	}

	if duration <= 0 && c.StartTime > 0 {
		duration = time.Since(time.UnixMilli(c.StartTime))
	}

	baseAttrs := []attribute.KeyValue{attribute.Float64("cozeloop.workflow.node.duration_ms", milliseconds(duration))}
	baseAttrs = append(baseAttrs, tokenAttributes(token)...)
	if c.BatchInfo != nil {
		baseAttrs = append(baseAttrs,
			attribute.Bool("cozeloop.workflow.node.batch", true),
			attribute.Int("cozeloop.workflow.node.batch.index", c.BatchInfo.Index),
			attribute.Int("cozeloop.workflow.node.batch.item_count", len(c.BatchInfo.Items)),
		)
	}
	baseAttrs = append(baseAttrs, attrs...)

	span.SetAttributes(baseAttrs...)
	span.AddEvent("node.finish", oteltrace.WithAttributes(attribute.String("cozeloop.workflow.node.finish.status", status.String())))
	if err != nil {
		span.RecordError(err)
	}
	span.SetStatus(status, statusMessage(status, err))
	span.End()
	c.nodeSpan = nil
}

func addNodeSpanEvent(c *Context, name string, attrs ...attribute.KeyValue) {
	if c == nil {
		return
	}
	span := c.nodeSpan
	if span == nil || !span.SpanContext().IsValid() {
		return
	}
	span.AddEvent(name, oteltrace.WithAttributes(attrs...))
}

func tokenAttributes(token *TokenInfo) []attribute.KeyValue {
	if token == nil {
		return nil
	}
	return []attribute.KeyValue{
		attribute.Int64("gen_ai.usage.input_tokens", token.InputToken),
		attribute.Int64("gen_ai.usage.output_tokens", token.OutputToken),
		attribute.Int64("gen_ai.usage.total_tokens", token.TotalToken),
	}
}

func milliseconds(d time.Duration) float64 {
	if d <= 0 {
		return 0
	}
	return float64(d) / float64(time.Millisecond)
}

func statusMessage(status codes.Code, err error) string {
	if err != nil {
		return err.Error()
	}
	return status.String()
}

func spanTypeForNode(nodeType entity.NodeType) string {
	switch nodeType {
	case entity.NodeTypeLLM:
		return spanTypeModel
	case entity.NodeTypePlugin, entity.NodeTypeMcp:
		return spanTypePlugin
	case entity.NodeTypeSubWorkflow:
		return spanTypeWorkflow
	case entity.NodeTypeKnowledgeIndexer, entity.NodeTypeKnowledgeDeleter:
		return spanTypeVector
	case entity.NodeTypeKnowledgeRetriever:
		return spanTypeRetriever
	case entity.NodeTypeVariableAssigner, entity.NodeTypeVariableAggregator, entity.NodeTypeLambda, entity.NodeTypeCodeRunner, entity.NodeTypeLoop, entity.NodeTypeContinue, entity.NodeTypeBreak:
		return spanTypeFunction
	default:
		return spanTypeFunction
	}
}

func formatTracePayloadMap(data map[string]any) string {
	if len(data) == 0 {
		return ""
	}
	return truncateTracePayload(mustMarshalToString(data))
}

func formatTraceText(s string) string {
	if s == "" {
		return ""
	}
	return truncateTracePayload(s)
}

func truncateTracePayload(s string) string {
	if len(s) <= tracePayloadLimit {
		return s
	}
	r := []rune(s)
	if len(r) <= tracePayloadLimit {
		return s
	}
	return string(r[:tracePayloadLimit]) + "…"
}
