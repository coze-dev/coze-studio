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

package otel

import (
	"context"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

const (
	envEnable       = "COZE_LOOP_TELEMETRY_ENABLE"
	envEndpoint     = "COZE_LOOP_TELEMETRY_ENDPOINT"
	envWorkspace    = "COZE_LOOP_WORKSPACE_ID"
	envToken        = "COZE_LOOP_TELEMETRY_TOKEN"
	envSamplerRatio = "COZE_LOOP_TRACE_RATIO"
	envServiceName  = "COZE_SERVICE_NAME"
	defaultSvcName  = "coze-studio"
	defaultSample   = 1.0
	defaultTimeout  = 5 * time.Second
)

// Init configures the global OTEL TracerProvider, returning a shutdown function when enabled.
func Init(ctx context.Context) (func(context.Context) error, error) {
	enabled := strings.ToLower(strings.TrimSpace(os.Getenv(envEnable)))
	if enabled == "" || enabled == "0" || enabled == "false" {
		logs.Infof("otel: telemetry disabled (%s not truthy)", envEnable)
		return nil, nil
	}

	endpoint := strings.TrimSpace(os.Getenv(envEndpoint))
	workspace := strings.TrimSpace(os.Getenv(envWorkspace))
	token := strings.TrimSpace(os.Getenv(envToken))
	if endpoint == "" || workspace == "" || token == "" {
		logs.Warnf("otel: missing endpoint/workspace/token, telemetry not started")
		return nil, nil
	}

	exporter, err := buildExporter(ctx, endpoint, workspace, token)
	if err != nil {
		return nil, err
	}

	res, err := buildResource(ctx)
	if err != nil {
		return nil, err
	}

	sampler := sdktrace.ParentBased(sdktrace.TraceIDRatioBased(readRatio()))
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithResource(res),
		sdktrace.WithSampler(sampler),
		sdktrace.WithSpanProcessor(sdktrace.NewBatchSpanProcessor(exporter)),
	)

	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	logs.Infof("otel: telemetry initialized, exporting to %s", endpoint)

	return func(shutdownCtx context.Context) error {
		ctxWithTimeout, cancel := context.WithTimeout(shutdownCtx, defaultTimeout)
		defer cancel()
		return tp.Shutdown(ctxWithTimeout)
	}, nil
}

func buildExporter(ctx context.Context, endpoint, workspace, token string) (sdktrace.SpanExporter, error) {
	u, err := url.Parse(endpoint)
	if err != nil {
		return nil, err
	}

	headers := map[string]string{
		"cozeloop-workspace-id": workspace,
	}
	if !strings.HasPrefix(strings.ToLower(token), "bearer ") {
		token = "Bearer " + token
	}
	headers["authorization"] = token

	opts := []otlptracehttp.Option{
		otlptracehttp.WithHeaders(headers),
		otlptracehttp.WithTimeout(defaultTimeout),
	}

	if u.Scheme == "http" {
		opts = append(opts, otlptracehttp.WithInsecure())
	}

	if host := u.Host; host != "" {
		opts = append(opts, otlptracehttp.WithEndpoint(host))
	}

	if trimmed := strings.TrimSpace(u.Path); trimmed != "" {
		opts = append(opts, otlptracehttp.WithURLPath("/"+strings.TrimPrefix(trimmed, "/")))
	}

	return otlptracehttp.New(ctx, opts...)
}

func buildResource(ctx context.Context) (*resource.Resource, error) {
	svcName := strings.TrimSpace(os.Getenv(envServiceName))
	if svcName == "" {
		svcName = defaultSvcName
	}

	appEnv := strings.TrimSpace(os.Getenv("APP_ENV"))

	return resource.New(ctx,
		resource.WithFromEnv(),
		resource.WithTelemetrySDK(),
		resource.WithHost(),
		resource.WithAttributes(
			semconv.ServiceNameKey.String(svcName),
			attribute.String("environment", appEnv),
		),
	)
}

func readRatio() float64 {
	val := strings.TrimSpace(os.Getenv(envSamplerRatio))
	if val == "" {
		return defaultSample
	}

	parsed, err := strconv.ParseFloat(val, 64)
	if err != nil {
		logs.Warnf("otel: invalid %s=%s, fallback to %f", envSamplerRatio, val, defaultSample)
		return defaultSample
	}
	if parsed <= 0 {
		return 0
	}
	if parsed > 1 {
		return 1
	}
	return parsed
}
