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
type BenefitType string

const (
	BenefitTypeCallToolLimit BenefitType = "call_tool_limit"
	BenefitTypeAPIRunQPS     BenefitType = "api_run_qps"
)

// UserLevel represents the user level (string type to match API)
type UserLevel string

const (
	UserLevelUnknown    UserLevel = "unknown"
	UserLevelBasic      UserLevel = "basic"
	UserLevelPro        UserLevel = "v1_pro_instance"
	UserLevelEnterprise UserLevel = "enterprise"
	// Add more levels as needed
)

// EntityBenefitStatus represents the status of a benefit entity (string type to match API)
type EntityBenefitStatus string

const (
	EntityBenefitStatusUnknown EntityBenefitStatus = "unknown"
	EntityBenefitStatusValid   EntityBenefitStatus = "valid"
	EntityBenefitStatusExpired EntityBenefitStatus = "expired"
	// Add more statuses as needed
)

// ResourceUsageStrategy represents the resource usage strategy (string type to match API)
type ResourceUsageStrategy string

const (
	ResourceUsageStrategyUnknown ResourceUsageStrategy = "unknown"
	ResourceUsageStrategyByQuota ResourceUsageStrategy = "quota"
	ResourceUsageStrategyUnlimit ResourceUsageStrategy = "unlimit"
	// Add more strategies as needed
)

// GetEnterpriseBenefitRequest represents the request for getting enterprise benefit
type GetEnterpriseBenefitRequest struct {
	BenefitType *string `json:"benefit_type,omitempty" form:"benefit_type"`
	ResourceID  *string `json:"resource_id,omitempty" form:"resource_id"`
}

// GetEnterpriseBenefitResponse represents the response for getting enterprise benefit
type GetEnterpriseBenefitResponse struct {
	Code    int32        `json:"code"`
	Message string       `json:"message"`
	Data    *BenefitData `json:"data,omitempty"`
}

// BenefitData represents the benefit data
type BenefitData struct {
	BasicInfo   *BasicInfo     `json:"basic_info,omitempty"`
	BenefitInfo []*BenefitInfo `json:"benefit_info,omitempty"`
}

// BasicInfo represents the basic information
type BasicInfo struct {
	UserLevel UserLevel `json:"user_level,omitempty"`
}

// BenefitInfo represents the benefit information
type BenefitInfo struct {
	BenefitType BenefitType          `json:"benefit_type,omitempty"`
	Basic       *BenefitTypeInfoItem `json:"basic,omitempty"`
	Effective   *BenefitTypeInfoItem `json:"effective,omitempty"`
	ResourceID  string               `json:"resource_id,omitempty"`
}

// BenefitTypeInfoItem represents a benefit type info item
type BenefitTypeInfoItem struct {
	ItemID    string              `json:"item_id,omitempty"`
	ItemInfo  *CommonCounter      `json:"item_info,omitempty"`
	Status    EntityBenefitStatus `json:"status,omitempty"`
	BenefitID string              `json:"benefit_id,omitempty"`
}

// CommonCounter represents a common counter
type CommonCounter struct {
	Used     float64               `json:"used,omitempty"`     // Used amount when Strategy == ByQuota, returns 0 if no usage data
	Total    float64               `json:"total,omitempty"`    // Total limit when Strategy == ByQuota
	Strategy ResourceUsageStrategy `json:"strategy,omitempty"` // Resource usage strategy
	StartAt  int64                 `json:"start_at,omitempty"` // Start time in seconds
	EndAt    int64                 `json:"end_at,omitempty"`   // End time in seconds
}

// String methods for enums (for better debugging and logging)

// String methods for enums (for better debugging and logging)
func (bt BenefitType) String() string {
	return string(bt)
}

func (ul UserLevel) String() string {
	return string(ul)
}

func (ebs EntityBenefitStatus) String() string {
	return string(ebs)
}

func (rus ResourceUsageStrategy) String() string {
	return string(rus)
}

// Validation methods
func (ul UserLevel) IsValid() bool {
	switch ul {
	case UserLevelUnknown, UserLevelBasic, UserLevelPro, UserLevelEnterprise:
		return true
	default:
		return false
	}
}

func (ebs EntityBenefitStatus) IsValid() bool {
	switch ebs {
	case EntityBenefitStatusUnknown, EntityBenefitStatusValid, EntityBenefitStatusExpired:
		return true
	default:
		return false
	}
}

func (rus ResourceUsageStrategy) IsValid() bool {
	switch rus {
	case ResourceUsageStrategyUnknown, ResourceUsageStrategyByQuota, ResourceUsageStrategyUnlimit:
		return true
	default:
		return false
	}
}
