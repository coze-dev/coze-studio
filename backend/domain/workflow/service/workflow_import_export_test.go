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

package service

import (
	"context"
	"testing"
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/stretchr/testify/assert"
)

func TestValidateImportPackage_EmptyPackage(t *testing.T) {
	service := &impl{}

	ctx := context.Background()
	policy := vo.ImportWorkflowPolicy{}

	result, err := service.ValidateImportPackage(ctx, nil, policy)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.False(t, result.IsValid)
	assert.Len(t, result.Errors, 1)
	assert.Equal(t, "INVALID_PACKAGE", result.Errors[0].Code)
}

func TestValidateImportPackage_ValidPackage(t *testing.T) {
	service := &impl{}

	ctx := context.Background()
	policy := vo.ImportWorkflowPolicy{}

	// Create a minimal valid package
	importPackage := &vo.WorkflowExportPackage{
		Version:     "1.0",
		ExportedAt:  time.Now(),
		ExportedBy:  123,
		Source:      "coze-studio",
		Description: "Test package",
		Workflows: []vo.WorkflowExportData{
			{
				OriginalID: 1,
				Meta: &vo.Meta{
					Name:        "Test Workflow",
					Desc:        "A test workflow",
					SpaceID:     456,
					CreatorID:   123,
					ContentType: 1,
					Mode:        0,
				},
				CanvasInfo: &vo.CanvasInfo{
					Canvas:          `{"nodes":[],"edges":[]}`,
					InputParamsStr:  "[]",
					OutputParamsStr: "[]",
				},
				ExportedFrom: "coze-studio",
				ExportedAt:   time.Now(),
			},
		},
		ExportPolicy: vo.ExportWorkflowPolicy{
			IncludeDependencies: false,
			ExportFormat:        "json",
		},
	}

	result, err := service.ValidateImportPackage(ctx, importPackage, policy)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.True(t, result.IsValid)
	assert.Len(t, result.Errors, 0)
	assert.Equal(t, "1.0", result.FormatVersion)
	assert.Equal(t, "coze-studio", result.SourceSystem)
	assert.Equal(t, 1, result.WorkflowCount)
}

func TestValidateImportPackage_InvalidWorkflow(t *testing.T) {
	service := &impl{}

	ctx := context.Background()
	policy := vo.ImportWorkflowPolicy{}

	// Create a package with invalid workflow (missing meta)
	importPackage := &vo.WorkflowExportPackage{
		Version:     "1.0",
		ExportedAt:  time.Now(),
		ExportedBy:  123,
		Source:      "coze-studio",
		Description: "Test package",
		Workflows: []vo.WorkflowExportData{
			{
				OriginalID: 1,
				Meta:       nil, // Missing meta
				CanvasInfo: &vo.CanvasInfo{
					Canvas:          `{"nodes":[],"edges":[]}`,
					InputParamsStr:  "[]",
					OutputParamsStr: "[]",
				},
				ExportedFrom: "coze-studio",
				ExportedAt:   time.Now(),
			},
		},
		ExportPolicy: vo.ExportWorkflowPolicy{
			IncludeDependencies: false,
			ExportFormat:        "json",
		},
	}

	result, err := service.ValidateImportPackage(ctx, importPackage, policy)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.False(t, result.IsValid)
	assert.Len(t, result.Errors, 1)
	assert.Equal(t, "MISSING_META", result.Errors[0].Code)
	assert.Equal(t, int64(1), *result.Errors[0].WorkflowID)
}

func TestValidateImportPackage_InvalidCanvas(t *testing.T) {
	service := &impl{}

	ctx := context.Background()
	policy := vo.ImportWorkflowPolicy{}

	// Create a package with invalid canvas JSON
	importPackage := &vo.WorkflowExportPackage{
		Version:     "1.0",
		ExportedAt:  time.Now(),
		ExportedBy:  123,
		Source:      "coze-studio",
		Description: "Test package",
		Workflows: []vo.WorkflowExportData{
			{
				OriginalID: 1,
				Meta: &vo.Meta{
					Name:        "Test Workflow",
					Desc:        "A test workflow",
					SpaceID:     456,
					CreatorID:   123,
					ContentType: 1,
					Mode:        0,
				},
				CanvasInfo: &vo.CanvasInfo{
					Canvas:          `{invalid json}`, // Invalid JSON
					InputParamsStr:  "[]",
					OutputParamsStr: "[]",
				},
				ExportedFrom: "coze-studio",
				ExportedAt:   time.Now(),
			},
		},
		ExportPolicy: vo.ExportWorkflowPolicy{
			IncludeDependencies: false,
			ExportFormat:        "json",
		},
	}

	result, err := service.ValidateImportPackage(ctx, importPackage, policy)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.False(t, result.IsValid)
	assert.Len(t, result.Errors, 1)
	assert.Equal(t, "INVALID_CANVAS", result.Errors[0].Code)
}

func TestValidateImportPackage_VersionMismatch(t *testing.T) {
	service := &impl{}

	ctx := context.Background()
	policy := vo.ImportWorkflowPolicy{}

	// Create a package with different version
	importPackage := &vo.WorkflowExportPackage{
		Version:     "2.0", // Different version
		ExportedAt:  time.Now(),
		ExportedBy:  123,
		Source:      "coze-studio",
		Description: "Test package",
		Workflows: []vo.WorkflowExportData{
			{
				OriginalID: 1,
				Meta: &vo.Meta{
					Name:        "Test Workflow",
					Desc:        "A test workflow",
					SpaceID:     456,
					CreatorID:   123,
					ContentType: 1,
					Mode:        0,
				},
				CanvasInfo: &vo.CanvasInfo{
					Canvas:          `{"nodes":[],"edges":[]}`,
					InputParamsStr:  "[]",
					OutputParamsStr: "[]",
				},
				ExportedFrom: "coze-studio",
				ExportedAt:   time.Now(),
			},
		},
		ExportPolicy: vo.ExportWorkflowPolicy{
			IncludeDependencies: false,
			ExportFormat:        "json",
		},
	}

	result, err := service.ValidateImportPackage(ctx, importPackage, policy)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.True(t, result.IsValid) // Still valid, but with warnings
	assert.Len(t, result.Errors, 0)
	assert.Len(t, result.Warnings, 1)
	assert.Equal(t, "VERSION_MISMATCH", result.Warnings[0].Code)
}
