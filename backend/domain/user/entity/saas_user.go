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

package entity

// BenefitType represents the type of benefit
type BenefitType int32

const (
	BenefitTypeUnknown BenefitType = 0
	// Add specific benefit types as needed
)

// UserLevel represents the user level
type UserLevel int32

const (
	UserLevelUnknown UserLevel = 0
	UserLevelBasic   UserLevel = 1
	UserLevelPro     UserLevel = 2
	// Add more levels as needed
)

// EntityBenefitStatus represents the status of a benefit entity
type EntityBenefitStatus int32

const (
	EntityBenefitStatusUnknown EntityBenefitStatus = 0
	EntityBenefitStatusActive  EntityBenefitStatus = 1
	EntityBenefitStatusExpired EntityBenefitStatus = 2
	// Add more statuses as needed
)

// ResourceUsageStrategy represents the resource usage strategy
type ResourceUsageStrategy int32

const (
	ResourceUsageStrategyUnknown ResourceUsageStrategy = 0
	ResourceUsageStrategyByQuota ResourceUsageStrategy = 1
	// Add more strategies as needed
)

// GetEnterpriseBenefitRequest represents the request for getting enterprise benefit
type GetEnterpriseBenefitRequest struct {
	BenefitType *BenefitType `json:"benefit_type,omitempty" form:"benefit_type"`
	ResourceID  *string      `json:"resource_id,omitempty" form:"resource_id"`
}

// GetEnterpriseBenefitResponse represents the response for getting enterprise benefit
type GetEnterpriseBenefitResponse struct {
	Code    int32        `json:"code"`
	Message string       `json:"message"`
	Data    *BenefitData `json:"data,omitempty"`
}

// BenefitData represents the benefit data
type BenefitData struct {
	BasicInfo   *BasicInfo   `json:"basic_info,omitempty"`
	BenefitInfo *BenefitInfo `json:"benefit_info,omitempty"`
}

// BasicInfo represents the basic information
type BasicInfo struct {
	UserLevel UserLevel `json:"user_level"`
}

// BenefitInfo represents the benefit information
type BenefitInfo struct {
	ResourceID  *string                `json:"resource_id,omitempty"`
	BenefitType *BenefitType           `json:"benefit_type,omitempty"`
	Basic       *BenefitTypeInfoItem   `json:"basic,omitempty"`       // Basic value
	Extra       []*BenefitTypeInfoItem `json:"extra,omitempty"`       // Extra values, may not exist
}

// BenefitTypeInfoItem represents a benefit type info item
type BenefitTypeInfoItem struct {
	ItemID    *string              `json:"item_id,omitempty"`
	ItemInfo  *CommonCounter       `json:"item_info,omitempty"`
	Status    *EntityBenefitStatus `json:"status,omitempty"`
	BenefitID *string              `json:"benefit_id,omitempty"`
}

// CommonCounter represents a common counter
type CommonCounter struct {
	Used     *float64               `json:"used,omitempty"`     // Used amount when Strategy == ByQuota, returns 0 if no usage data
	Total    *float64               `json:"total,omitempty"`    // Total limit when Strategy == ByQuota
	Strategy *ResourceUsageStrategy `json:"strategy,omitempty"` // Resource usage strategy
	StartAt  *int64                 `json:"start_at,omitempty"` // Start time in seconds
	EndAt    *int64                 `json:"end_at,omitempty"`   // End time in seconds
}

// String methods for enums (for better debugging and logging)

func (bt BenefitType) String() string {
	switch bt {
	case BenefitTypeUnknown:
		return "Unknown"
	default:
		return "Unknown"
	}
}

func (ul UserLevel) String() string {
	switch ul {
	case UserLevelUnknown:
		return "Unknown"
	case UserLevelBasic:
		return "Basic"
	case UserLevelPro:
		return "Pro"
	default:
		return "Unknown"
	}
}

func (ebs EntityBenefitStatus) String() string {
	switch ebs {
	case EntityBenefitStatusUnknown:
		return "Unknown"
	case EntityBenefitStatusActive:
		return "Active"
	case EntityBenefitStatusExpired:
		return "Expired"
	default:
		return "Unknown"
	}
}

func (rus ResourceUsageStrategy) String() string {
	switch rus {
	case ResourceUsageStrategyUnknown:
		return "Unknown"
	case ResourceUsageStrategyByQuota:
		return "ByQuota"
	default:
		return "Unknown"
	}
}