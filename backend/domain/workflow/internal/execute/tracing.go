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
	tracePayloadLimit     = 4096
	spanTypeWorkflow      = "Workflow"
	spanTypeModel         = "model"
	spanTypeLLMCall       = "LLMCall"
	spanTypePlugin        = "plugin"
	spanTypeFunction      = "function"
	spanTypeVector        = "vector_store"
	spanTypeRetriever     = "vector_retriever"
	spanTypeOutputEmitter = "WorkflowMessage"
	spanTypeExit          = "WorkflowEnd"
	spanTypeEntry         = "WorkflowStart"
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

	spanName := normalizedWorkflowName(wfBasic)
	if workflowKind == "subworkflow" && c.RootCtx.RootWorkflowBasic != nil {
		spanName = fmt.Sprintf(
			"workflow.%s.sub.%s",
			normalizedWorkflowName(c.RootCtx.RootWorkflowBasic),
			normalizedWorkflowName(wfBasic),
		)
	}

	ctxWithSpan, span := workflowTracer.Start(ctx, spanName, oteltrace.WithSpanKind(oteltrace.SpanKindInternal))

	attrs := []attribute.KeyValue{
		attribute.Int64("execute_id", executeID),
		attribute.Int64("root_execute_id", c.RootCtx.RootExecuteID),
		attribute.Int64("id", workflowID),
		attribute.String("version", version),
		attribute.Int64("cozeloop.workspace_id", spaceID),
		attribute.String("kind", workflowKind),
		attribute.String("execute_mode", string(c.RootCtx.ExeCfg.Mode)),
		attribute.String("task_type", string(c.RootCtx.ExeCfg.TaskType)),
		attribute.String("sync_pattern", string(c.RootCtx.ExeCfg.SyncPattern)),
		attribute.Bool("cancellable", c.RootCtx.ExeCfg.Cancellable),
	}

	if wfBasic != nil {
		if wfName := strings.TrimSpace(wfBasic.Name); wfName != "" {
			attrs = append(attrs, attribute.String("name", wfName))
		}
	}

	if c.RootCtx.ExeCfg.WorkflowMode != 0 {
		attrs = append(attrs, attribute.String("workflow_mode", fmt.Sprintf("%d", c.RootCtx.ExeCfg.WorkflowMode)))
	}
	if c.RootCtx.ExeCfg.AppID != nil {
		attrs = append(attrs, attribute.Int64("app_id", *c.RootCtx.ExeCfg.AppID))
	}
	if c.RootCtx.ExeCfg.AgentID != nil {
		attrs = append(attrs, attribute.Int64("agent_id", *c.RootCtx.ExeCfg.AgentID))
	}
	if c.RootCtx.ExeCfg.ConnectorID != 0 {
		attrs = append(attrs, attribute.Int64("connector_id", c.RootCtx.ExeCfg.ConnectorID))
	}
	if c.RootCtx.ExeCfg.RoundID != nil {
		attrs = append(attrs, attribute.Int64("round_id", *c.RootCtx.ExeCfg.RoundID))
	}
	if c.RootCtx.ExeCfg.ConversationID != nil {
		attrs = append(attrs, attribute.Int64("conversation_id", *c.RootCtx.ExeCfg.ConversationID))
	}
	if nodeCount > 0 {
		attrs = append(attrs, attribute.Int64("node_count", int64(nodeCount)))
	}
	if payload != nil {
		attrs = append(attrs, attribute.Int("input_field_count", len(payload)))
	}
	if resumed {
		attrs = append(attrs, attribute.Bool("resumed", true))
	}
	attrs = append(attrs, attribute.String("cozeloop.span_type", spanTypeWorkflow))

	span.SetAttributes(attrs...)
	eventName := "workflow.start"
	if resumed {
		eventName = "workflow.resume"
	}
	span.AddEvent(eventName, oteltrace.WithAttributes(attribute.String("origin", origin)))

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

	baseAttrs := []attribute.KeyValue{attribute.Float64("duration_ms", milliseconds(duration))}
	baseAttrs = append(baseAttrs, tokenAttributes(token)...)
	baseAttrs = append(baseAttrs, attrs...)

	span.SetAttributes(baseAttrs...)
	span.AddEvent("workflow.finish", oteltrace.WithAttributes(attribute.String("finish.status", status.String())))
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
	c.llmSpan = nil

	nodeKey := "unknown"
	nodeName := ""
	if c.NodeCtx != nil {
		nodeKey = string(c.NodeCtx.NodeKey)
		nodeName = c.NodeCtx.NodeName
	}

	spanName := nodeName
	ctxWithSpan, span := workflowTracer.Start(ctx, spanName, oteltrace.WithSpanKind(oteltrace.SpanKindInternal))

	attrs := []attribute.KeyValue{
		attribute.Int64("execute_id", c.RootCtx.RootExecuteID),
		attribute.String("node.id", nodeKey),
		attribute.String("node.name", nodeName),
		attribute.String("node.type", string(nodeType)),
	}

	if c.NodeCtx != nil {
		attrs = append(attrs, attribute.Int64("node.execute_id", c.NodeCtx.NodeExecuteID))
		if len(c.NodeCtx.NodePath) > 0 {
			attrs = append(attrs, attribute.String("node.path", strings.Join(c.NodeCtx.NodePath, ".")))
		}
		if c.NodeCtx.TerminatePlan != nil {
			attrs = append(attrs, attribute.String("node.terminate_plan", string(*c.NodeCtx.TerminatePlan)))
		}
	}

	if c.SubWorkflowCtx != nil {
		attrs = append(attrs, attribute.Int64("sub_execute_id", c.SubWorkflowCtx.SubExecuteID))
		if c.SubWorkflowCtx.SubWorkflowBasic != nil {
			attrs = append(attrs, attribute.Int64("sub_workflow_id", c.SubWorkflowCtx.SubWorkflowBasic.ID))
		}
	}

	if c.BatchInfo != nil {
		attrs = append(attrs,
			attribute.Bool("node.batch", true),
			attribute.Int("node.batch.index", c.BatchInfo.Index),
			attribute.Int("node.batch.item_count", len(c.BatchInfo.Items)),
		)
	}

	if payload != nil {
		attrs = append(attrs, attribute.Int("node.input_field_count", len(payload)))
	}
	if resumed {
		attrs = append(attrs, attribute.Bool("node.resumed", true))
	}
	attrs = append(attrs, attribute.String("cozeloop.span_type", spanTypeForNode(nodeType)))

	span.SetAttributes(attrs...)
	span.AddEvent("node.start", oteltrace.WithAttributes(attribute.String("origin", origin)))

	c.nodeSpan = span

	if nodeType == entity.NodeTypeLLM {
		clearLLMCallMetadata(c)
		callSpanName := fmt.Sprintf("workflow.node.%s.llm", nodeKey)
		callCtx, callSpan := workflowTracer.Start(ctxWithSpan, callSpanName, oteltrace.WithSpanKind(oteltrace.SpanKindInternal))
		callAttrs := []attribute.KeyValue{
			attribute.Int64("node.execute_id", c.NodeCtx.NodeExecuteID),
			attribute.String("node.id", nodeKey),
			attribute.String("cozeloop.span_type", spanTypeModel),
		}
		if nodeName != "" {
			callAttrs = append(callAttrs, attribute.String("node.name", nodeName))
		}
		callSpan.SetAttributes(callAttrs...)
		callSpan.AddEvent("llm.call.start", oteltrace.WithAttributes(attribute.String("origin", origin)))
		c.llmSpan = callSpan
		ctxWithSpan = callCtx
	}
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

	baseAttrs := []attribute.KeyValue{attribute.Float64("node.duration_ms", milliseconds(duration))}
	baseAttrs = append(baseAttrs, tokenAttributes(token)...)
	if c.BatchInfo != nil {
		baseAttrs = append(baseAttrs,
			attribute.Bool("node.batch", true),
			attribute.Int("node.batch.index", c.BatchInfo.Index),
			attribute.Int("node.batch.item_count", len(c.BatchInfo.Items)),
		)
	}
	baseAttrs = append(baseAttrs, attrs...)
	finishLLMCallSpan(c, duration, status, err, token, attrs...)

	span.SetAttributes(baseAttrs...)
	span.AddEvent("node.finish", oteltrace.WithAttributes(attribute.String("node.finish.status", status.String())))
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

func addLLMCallSpanEvent(c *Context, name string, attrs ...attribute.KeyValue) {
	if c == nil {
		return
	}
	span := c.llmSpan
	if span == nil || !span.SpanContext().IsValid() {
		return
	}
	span.AddEvent(name, oteltrace.WithAttributes(attrs...))
}

func finishLLMCallSpan(c *Context, duration time.Duration, status codes.Code, err error, token *TokenInfo, attrs ...attribute.KeyValue) {
	if c == nil {
		return
	}
	span := c.llmSpan
	if span == nil || !span.SpanContext().IsValid() {
		return
	}

	if duration <= 0 && c.StartTime > 0 {
		duration = time.Since(time.UnixMilli(c.StartTime))
	}

	baseAttrs := []attribute.KeyValue{
		attribute.Float64("llm_call.duration_ms", milliseconds(duration)),
		attribute.String("cozeloop.span_type", spanTypeModel),
	}
	baseAttrs = append(baseAttrs, tokenAttributes(token)...)

	if meta := getLLMCallMetadata(c); meta != nil {
		if meta.ModelID != 0 {
			baseAttrs = append(baseAttrs, attribute.Int64("llm.model.id", meta.ModelID))
		}
		if meta.ModelName != "" {
			baseAttrs = append(baseAttrs, attribute.String("gen_ai.request.model", meta.ModelName))
		}
		if meta.ModelDisplayName != "" {
			baseAttrs = append(baseAttrs, attribute.String("llm.model.display_name", meta.ModelDisplayName))
		}
		if meta.ModelProvider != "" {
			baseAttrs = append(baseAttrs, attribute.String("gen_ai.system", meta.ModelProvider))
		}
		if meta.ModelDeployedName != "" {
			baseAttrs = append(baseAttrs, attribute.String("llm.model.deployed", meta.ModelDeployedName))
		}
		if meta.UsingFallback {
			baseAttrs = append(baseAttrs, attribute.Bool("llm.model.using_fallback", true))
		}
	}
	baseAttrs = append(baseAttrs, attrs...)

	span.SetAttributes(baseAttrs...)
	span.AddEvent("llm.call.finish", oteltrace.WithAttributes(attribute.String("llm_call.status", status.String())))
	if err != nil {
		span.RecordError(err)
	}
	span.SetStatus(status, statusMessage(status, err))
	span.End()
	c.llmSpan = nil
	clearLLMCallMetadata(c)
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
		return spanTypeLLMCall
	case entity.NodeTypePlugin, entity.NodeTypeMcp, entity.NodeTypeHTTPRequester:
		return spanTypePlugin
	case entity.NodeTypeSubWorkflow:
		return spanTypeWorkflow
	case entity.NodeTypeKnowledgeIndexer, entity.NodeTypeKnowledgeDeleter:
		return spanTypeVector
	case entity.NodeTypeKnowledgeRetriever:
		return spanTypeRetriever
	case entity.NodeTypeVariableAssigner, entity.NodeTypeVariableAggregator, entity.NodeTypeLambda, entity.NodeTypeCodeRunner, entity.NodeTypeLoop, entity.NodeTypeContinue, entity.NodeTypeBreak:
		return spanTypeFunction
	case entity.NodeTypeOutputEmitter:
		return spanTypeOutputEmitter
	case entity.NodeTypeExit:
		return spanTypeExit
	case entity.NodeTypeEntry:
		return spanTypeEntry
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

func normalizedWorkflowName(wb *entity.WorkflowBasic) string {
	if wb == nil {
		return "unknown"
	}

	fallback := "unknown"
	if wb.ID != 0 {
		fallback = fmt.Sprintf("id-%d", wb.ID)
	}

	return sanitizeSpanSegment(wb.Name, fallback)
}

func truncateTracePayload(s string) string {
	if len(s) <= tracePayloadLimit {
		return s
	}
	r := []rune(s)
	if len(r) <= tracePayloadLimit {
		return s
	}
	if tracePayloadLimit <= 1 {
		return string(r[:tracePayloadLimit])
	}
	return string(r[:tracePayloadLimit-1]) + "…"
}
