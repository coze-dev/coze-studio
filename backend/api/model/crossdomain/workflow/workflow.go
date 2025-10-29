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

package workflow

import (
	"sync"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/conversation"
)

type Locator uint8

const (
	FromDraft Locator = iota
	FromSpecificVersion
	FromLatestVersion
)

type ExecuteConfig struct {
	ID                                int64
	From                              Locator
	Version                           string
	CommitID                          string
	Operator                          int64
	Mode                              ExecuteMode
	AppID                             *int64
	AgentID                           *int64
	ConnectorID                       int64
	ConnectorUID                      string
	TaskType                          TaskType
	SyncPattern                       SyncPattern
	InputFailFast                     bool // whether to fail fast if input conversion has warnings
	BizType                           BizType
	Cancellable                       bool
	WorkflowMode                      WorkflowMode
	RoundID                           *int64 // if workflow is chat flow, conversation round id is required
	InitRoundID                       *int64 // if workflow is chat flow, init conversation round id is required
	ConversationID                    *int64 // if workflow is chat flow, conversation id is required
	UserMessage                       *schema.Message
	ConversationHistory               []*conversation.Message
	ConversationHistorySchemaMessages []*schema.Message
	SectionID                         *int64
	MaxHistoryRounds                  *int32

	// HiAgent conversation mapping: map[agentID]HiAgentConversationInfo
	// Used to maintain HiAgent conversation state across multiple calls in the same ChatFlow session
	HiAgentConversations              map[string]*HiAgentConversationInfo
	hiAgentConversationsMu            sync.RWMutex
}

type ExecuteMode string

const (
	ExecuteModeDebug     ExecuteMode = "debug"
	ExecuteModeRelease   ExecuteMode = "release"
	ExecuteModeNodeDebug ExecuteMode = "node_debug"
)

type WorkflowMode = workflow.WorkflowMode

type TaskType string

const (
	TaskTypeForeground TaskType = "foreground"
	TaskTypeBackground TaskType = "background"
)

type SyncPattern string

const (
	SyncPatternSync   SyncPattern = "sync"
	SyncPatternAsync  SyncPattern = "async"
	SyncPatternStream SyncPattern = "stream"
)

var DebugURLTpl = "http://127.0.0.1:3000/work_flow?execute_id=%d&space_id=%d&workflow_id=%d&execute_mode=2"

type BizType string

const (
	BizTypeAgent    BizType = "agent"
	BizTypeWorkflow BizType = "workflow"
)

// HiAgentConversationInfo stores HiAgent conversation state
type HiAgentConversationInfo struct {
	AppConversationID string `json:"app_conversation_id"`
	LastSectionID     int64  `json:"last_section_id"`
}

// GetHiAgentConversationID retrieves the HiAgent conversation ID for a specific agent (backward compatible)
func (c *ExecuteConfig) GetHiAgentConversationID(agentID string) string {
	info := c.GetHiAgentConversationInfo(agentID)
	if info == nil {
		return ""
	}
	return info.AppConversationID
}

// GetHiAgentConversationInfo retrieves the full HiAgent conversation info for a specific agent
func (c *ExecuteConfig) GetHiAgentConversationInfo(agentID string) *HiAgentConversationInfo {
	c.hiAgentConversationsMu.RLock()
	defer c.hiAgentConversationsMu.RUnlock()

	if c.HiAgentConversations == nil {
		return nil
	}
	return c.HiAgentConversations[agentID]
}

// SetHiAgentConversationID sets the HiAgent conversation ID for a specific agent (backward compatible)
func (c *ExecuteConfig) SetHiAgentConversationID(agentID, appConvID string) {
	c.SetHiAgentConversationInfo(agentID, &HiAgentConversationInfo{
		AppConversationID: appConvID,
		LastSectionID:     0, // Will be updated when section info is available
	})
}

// SetHiAgentConversationInfo sets the full HiAgent conversation info for a specific agent
func (c *ExecuteConfig) SetHiAgentConversationInfo(agentID string, info *HiAgentConversationInfo) {
	c.hiAgentConversationsMu.Lock()
	defer c.hiAgentConversationsMu.Unlock()

	if c.HiAgentConversations == nil {
		c.HiAgentConversations = make(map[string]*HiAgentConversationInfo)
	}
	c.HiAgentConversations[agentID] = info
}

// ClearHiAgentConversationID clears the HiAgent conversation ID for a specific agent
func (c *ExecuteConfig) ClearHiAgentConversationID(agentID string) {
	c.hiAgentConversationsMu.Lock()
	defer c.hiAgentConversationsMu.Unlock()

	if c.HiAgentConversations != nil {
		delete(c.HiAgentConversations, agentID)
	}
}

// ClearAllHiAgentConversations clears all HiAgent conversation mappings
func (c *ExecuteConfig) ClearAllHiAgentConversations() {
	c.hiAgentConversationsMu.Lock()
	defer c.hiAgentConversationsMu.Unlock()

	c.HiAgentConversations = make(map[string]*HiAgentConversationInfo)
}
