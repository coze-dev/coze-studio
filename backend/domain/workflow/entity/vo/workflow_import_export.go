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

package vo

import (
	"time"
)

// WorkflowReferenceKey represents a workflow reference key
type WorkflowReferenceKey struct {
	ReferredID       int64            `json:"referred_id"`
	ReferringID      int64            `json:"referring_id"`
	ReferType        ReferType        `json:"refer_type"`
	ReferringBizType ReferringBizType `json:"referring_biz_type"`
}

// ConflictStrategy defines how to handle conflicts during import
type ConflictStrategy int

const (
	ConflictStrategy_Skip      ConflictStrategy = 0 // Skip conflicting workflows
	ConflictStrategy_Overwrite ConflictStrategy = 1 // Overwrite existing workflows
	ConflictStrategy_Rename    ConflictStrategy = 2 // Rename conflicting workflows
)

// ExportWorkflowPolicy defines the policy for exporting workflows
type ExportWorkflowPolicy struct {
	IncludeDependencies bool   `json:"include_dependencies"` // Whether to include dependency information
	ExportFormat        string `json:"export_format"`        // Export format: "json" (extensible for future formats)
	IncludeVersions     bool   `json:"include_versions"`     // Whether to include version history
}

// ImportWorkflowPolicy defines the policy for importing workflows
type ImportWorkflowPolicy struct {
	TargetSpaceID            *int64            `json:"target_space_id"`              // Target space ID
	TargetAppID              *int64            `json:"target_app_id"`                // Target app ID
	ConflictResolution       ConflictStrategy  `json:"conflict_resolution"`          // How to handle name conflicts
	ShouldModifyWorkflowName bool              `json:"should_modify_workflow_name"`  // Whether to modify workflow names
	DependencyMapping        map[string]string `json:"dependency_mapping,omitempty"` // Mapping for dependency IDs
	PreserveOriginalIDs      bool              `json:"preserve_original_ids"`        // Whether to preserve original workflow IDs (for debugging)
}

// WorkflowExportData represents a single workflow's export data
type WorkflowExportData struct {
	// Core workflow information (based on existing structures)
	OriginalID  int64        `json:"original_id"`            // Original workflow ID for reference
	Meta        *Meta        `json:"meta"`                   // Workflow metadata
	CanvasInfo  *CanvasInfo  `json:"canvas_info"`            // Canvas and parameter information
	DraftMeta   *DraftMeta   `json:"draft_meta,omitempty"`   // Draft metadata if available
	VersionMeta *VersionMeta `json:"version_meta,omitempty"` // Version metadata if available

	// Dependencies and references
	Dependencies *DependenceResource    `json:"dependencies,omitempty"` // External dependencies
	References   []WorkflowReferenceKey `json:"references,omitempty"`   // Workflow references

	// Export metadata
	ExportedFrom string    `json:"exported_from"` // Source system identifier
	ExportedAt   time.Time `json:"exported_at"`   // Export timestamp
}

// WorkflowExportPackage represents the complete export package
type WorkflowExportPackage struct {
	// Package metadata
	Version     string    `json:"version"`     // Export format version (e.g., "1.0")
	ExportedAt  time.Time `json:"exported_at"` // Export timestamp
	ExportedBy  int64     `json:"exported_by"` // User ID who performed the export
	Source      string    `json:"source"`      // Source system identifier
	Description string    `json:"description"` // Optional description

	// Workflow data
	Workflows []WorkflowExportData `json:"workflows"` // List of exported workflows

	// Global dependency information
	GlobalDependencies *GlobalDependencyInfo `json:"global_dependencies,omitempty"` // Shared dependencies across workflows

	// Export policy used
	ExportPolicy ExportWorkflowPolicy `json:"export_policy"` // Policy used for this export
}

// GlobalDependencyInfo represents dependencies shared across multiple workflows
type GlobalDependencyInfo struct {
	Plugins   map[int64]*PluginEntity `json:"plugins,omitempty"`   // Plugin dependencies
	Knowledge map[int64]string        `json:"knowledge,omitempty"` // Knowledge base dependencies (ID -> name mapping)
	Databases map[int64]string        `json:"databases,omitempty"` // Database dependencies (ID -> name mapping)
	Workflows map[int64]string        `json:"workflows,omitempty"` // Referenced workflows (ID -> name mapping)
}

// ImportResult represents the result of importing workflows
type ImportResult struct {
	ImportedWorkflows []ImportedWorkflowInfo `json:"imported_workflows"` // Successfully imported workflows
	SkippedWorkflows  []SkippedWorkflowInfo  `json:"skipped_workflows"`  // Workflows that were skipped
	FailedWorkflows   []FailedWorkflowInfo   `json:"failed_workflows"`   // Workflows that failed to import
	DependencyIssues  []DependencyIssue      `json:"dependency_issues"`  // Issues with dependencies
}

// ImportedWorkflowInfo represents information about a successfully imported workflow
type ImportedWorkflowInfo struct {
	OriginalID int64  `json:"original_id"` // Original workflow ID from export
	NewID      int64  `json:"new_id"`      // New workflow ID in the target system
	Name       string `json:"name"`        // Workflow name
	WasRenamed bool   `json:"was_renamed"` // Whether the workflow was renamed due to conflicts
	NewName    string `json:"new_name"`    // New name if renamed
}

// SkippedWorkflowInfo represents information about a skipped workflow
type SkippedWorkflowInfo struct {
	OriginalID int64  `json:"original_id"` // Original workflow ID from export
	Name       string `json:"name"`        // Workflow name
	Reason     string `json:"reason"`      // Reason for skipping
}

// FailedWorkflowInfo represents information about a workflow that failed to import
type FailedWorkflowInfo struct {
	OriginalID int64  `json:"original_id"` // Original workflow ID from export
	Name       string `json:"name"`        // Workflow name
	Error      string `json:"error"`       // Error message
}

// DependencyIssue represents an issue with dependencies during import
type DependencyIssue struct {
	WorkflowID     int64  `json:"workflow_id"`     // Workflow ID (original or new)
	DependencyType string `json:"dependency_type"` // Type of dependency (plugin, knowledge, database, workflow)
	DependencyID   int64  `json:"dependency_id"`   // Dependency ID
	Issue          string `json:"issue"`           // Description of the issue
	Severity       string `json:"severity"`        // Severity: "warning", "error"
}

// ValidationResult represents the result of validating an import package
type ValidationResult struct {
	IsValid       bool              `json:"is_valid"`
	Errors        []ValidationError `json:"errors,omitempty"`
	Warnings      []ValidationError `json:"warnings,omitempty"`
	FormatVersion string            `json:"format_version"`
	SourceSystem  string            `json:"source_system"`
	WorkflowCount int               `json:"workflow_count"`
}

// ValidationError represents a validation error or warning
type ValidationError struct {
	Code       string `json:"code"`
	Message    string `json:"message"`
	WorkflowID *int64 `json:"workflow_id,omitempty"` // Workflow ID if error is specific to a workflow
	FieldPath  string `json:"field_path,omitempty"`  // Path to the problematic field
	Severity   string `json:"severity"`              // "error" or "warning"
}
