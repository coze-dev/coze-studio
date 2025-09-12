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

package external_knowledge

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/coze-dev/coze-studio/backend/api/model/external_knowledge"
	domainExternalKnowledge "github.com/coze-dev/coze-studio/backend/domain/external_knowledge"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// ExternalKnowledgeApplicationSVC is the global instance of the external knowledge application service
var ExternalKnowledgeApplicationSVC *Service

// Service defines the external knowledge application service
type Service struct {
	repo domainExternalKnowledge.Repository
}

// NewService creates a new external knowledge service
func NewService(repo domainExternalKnowledge.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// CreateBinding creates a new external knowledge binding
func (s *Service) CreateBinding(ctx context.Context, userID string, req *external_knowledge.CreateBindingRequest) (*external_knowledge.CreateBindingResponse, error) {
	// Check if binding already exists
	existing, err := s.repo.GetByUserIDAndKey(ctx, userID, req.BindingKey)
	if err != nil {
		logs.Errorf("Failed to check existing binding: %v", err)
		return &external_knowledge.CreateBindingResponse{
			Code: 500,
			Msg:  "Internal server error",
			Data: &external_knowledge.ExternalKnowledgeBinding{},
		}, nil
	}

	if existing != nil {
		return &external_knowledge.CreateBindingResponse{
			Code: 400,
			Msg:  "Binding key already exists",
			Data: &external_knowledge.ExternalKnowledgeBinding{},
		}, nil
	}

	// If creating as enabled, disable all other bindings first
	// Only one binding can be enabled at a time
	err = s.repo.DisableAllByUserID(ctx, userID)
	if err != nil {
		logs.Errorf("Failed to disable existing bindings: %v", err)
		// Continue anyway, this is not critical
	}

	// Create new binding
	bindingType := "default"
	if req.BindingType != nil && *req.BindingType != "" {
		bindingType = *req.BindingType
	}

	entity := &domainExternalKnowledge.ExternalKnowledgeBinding{
		UserID:      userID,
		BindingKey:  req.BindingKey,
		BindingName: req.BindingName,
		BindingType: bindingType,
		ExtraConfig: req.ExtraConfig,
		Status:      domainExternalKnowledge.BindingStatusEnabled,
	}

	created, err := s.repo.Create(ctx, entity)
	if err != nil {
		logs.Errorf("Failed to create binding: %v", err)
		return &external_knowledge.CreateBindingResponse{
			Code: 500,
			Msg:  "Failed to create binding",
			Data: &external_knowledge.ExternalKnowledgeBinding{},
		}, nil
	}

	return &external_knowledge.CreateBindingResponse{
		Code: 0,
		Msg:  "success",
		Data: s.convertToAPIModel(created),
	}, nil
}

// GetBindingList retrieves binding list for a user
func (s *Service) GetBindingList(ctx context.Context, userID string, req *external_knowledge.GetBindingListRequest) (*external_knowledge.GetBindingListResponse, error) {
	page := 1
	pageSize := 20

	if req.Page != nil && *req.Page > 0 {
		page = int(*req.Page)
	}
	if req.PageSize != nil && *req.PageSize > 0 {
		pageSize = int(*req.PageSize)
	}

	offset := (page - 1) * pageSize

	var statusFilter *int8
	if req.Status != nil {
		status := int8(*req.Status)
		statusFilter = &status
	}

	bindings, total, err := s.repo.GetByUserID(ctx, userID, offset, pageSize, statusFilter)
	if err != nil {
		logs.Errorf("Failed to get binding list: %v", err)
		return &external_knowledge.GetBindingListResponse{
			Code:  500,
			Msg:   "Failed to retrieve bindings",
			Data:  []*external_knowledge.ExternalKnowledgeBinding{},
			Total: 0,
		}, nil
	}

	// Convert to API models
	apiBindings := make([]*external_knowledge.ExternalKnowledgeBinding, 0, len(bindings))
	for _, binding := range bindings {
		apiBindings = append(apiBindings, s.convertToAPIModel(binding))
	}

	return &external_knowledge.GetBindingListResponse{
		Code:  0,
		Msg:   "success",
		Data:  apiBindings,
		Total: total,
	}, nil
}

// UpdateBinding updates an existing binding
func (s *Service) UpdateBinding(ctx context.Context, userID string, req *external_knowledge.UpdateBindingRequest) (*external_knowledge.UpdateBindingResponse, error) {
	// Parse ID
	id, err := strconv.ParseInt(req.ID, 10, 64)
	if err != nil {
		return &external_knowledge.UpdateBindingResponse{
			Code: 400,
			Msg:  "Invalid binding ID",
			Data: &external_knowledge.ExternalKnowledgeBinding{},
		}, nil
	}

	// Get existing binding
	binding, err := s.repo.GetByID(ctx, id)
	if err != nil {
		logs.Errorf("Failed to get binding: %v", err)
		return &external_knowledge.UpdateBindingResponse{
			Code: 500,
			Msg:  "Internal server error",
			Data: &external_knowledge.ExternalKnowledgeBinding{},
		}, nil
	}

	if binding == nil || binding.UserID != userID {
		return &external_knowledge.UpdateBindingResponse{
			Code: 404,
			Msg:  "Binding not found",
			Data: &external_knowledge.ExternalKnowledgeBinding{},
		}, nil
	}

	// Update fields
	if req.BindingName != nil {
		binding.BindingName = req.BindingName
	}
	if req.Status != nil {
		newStatus := int8(*req.Status)
		// If enabling this binding, disable all others first
		if newStatus == domainExternalKnowledge.BindingStatusEnabled && binding.Status != domainExternalKnowledge.BindingStatusEnabled {
			err = s.repo.DisableAllByUserID(ctx, userID)
			if err != nil {
				logs.Errorf("Failed to disable other bindings: %v", err)
				// Continue anyway
			}
		}
		binding.Status = newStatus
	}
	if req.ExtraConfig != nil {
		binding.ExtraConfig = req.ExtraConfig
	}

	// Save updates
	if err := s.repo.Update(ctx, binding); err != nil {
		logs.Errorf("Failed to update binding: %v", err)
		return &external_knowledge.UpdateBindingResponse{
			Code: 500,
			Msg:  "Failed to update binding",
			Data: &external_knowledge.ExternalKnowledgeBinding{},
		}, nil
	}

	return &external_knowledge.UpdateBindingResponse{
		Code: 0,
		Msg:  "success",
		Data: s.convertToAPIModel(binding),
	}, nil
}

// DeleteBinding deletes a binding
func (s *Service) DeleteBinding(ctx context.Context, userID string, req *external_knowledge.DeleteBindingRequest) (*external_knowledge.DeleteBindingResponse, error) {
	// Parse ID
	id, err := strconv.ParseInt(req.ID, 10, 64)
	if err != nil {
		return &external_knowledge.DeleteBindingResponse{
			Code: 400,
			Msg:  "Invalid binding ID",
		}, nil
	}

	// Delete binding (ensure it belongs to the user)
	if err := s.repo.DeleteByUserIDAndID(ctx, userID, id); err != nil {
		logs.Errorf("Failed to delete binding: %v", err)
		return &external_knowledge.DeleteBindingResponse{
			Code: 500,
			Msg:  "Failed to delete binding",
		}, nil
	}

	return &external_knowledge.DeleteBindingResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

// ValidateBindingKey validates a binding key
func (s *Service) ValidateBindingKey(ctx context.Context, req *external_knowledge.ValidateBindingKeyRequest) (*external_knowledge.ValidateBindingKeyResponse, error) {
	// Basic validation - check if key is not empty and has minimum length
	key := strings.TrimSpace(req.BindingKey)
	if key == "" {
		msg := "Binding key cannot be empty"
		return &external_knowledge.ValidateBindingKeyResponse{
			Code:     0,
			Msg:      "success",
			IsValid:  false,
			Message:  &msg,
		}, nil
	}

	if len(key) < 10 {
		msg := "Binding key is too short (minimum 10 characters)"
		return &external_knowledge.ValidateBindingKeyResponse{
			Code:     0,
			Msg:      "success",
			IsValid:  false,
			Message:  &msg,
		}, nil
	}

	// In a real implementation, you would validate against external service
	// For now, we just do basic validation
	validMsg := "Binding key is valid"
	return &external_knowledge.ValidateBindingKeyResponse{
		Code:     0,
		Msg:      "success",
		IsValid:  true,
		Message:  &validMsg,
	}, nil
}

// convertToAPIModel converts domain entity to API model
func (s *Service) convertToAPIModel(entity *domainExternalKnowledge.ExternalKnowledgeBinding) *external_knowledge.ExternalKnowledgeBinding {
	apiModel := &external_knowledge.ExternalKnowledgeBinding{
		ID:          entity.ID,
		UserID:      entity.UserID,
		BindingKey:  entity.BindingKey,
		BindingName: entity.BindingName,
		BindingType: &entity.BindingType,
		ExtraConfig: entity.ExtraConfig,
		Status:      int32(entity.Status),
		CreatedAt:   entity.CreatedAt.Unix(),
	}

	if entity.LastSyncAt != nil {
		syncAt := entity.LastSyncAt.Unix()
		apiModel.LastSyncAt = &syncAt
	}

	if !entity.UpdatedAt.IsZero() {
		updatedAt := entity.UpdatedAt.Unix()
		apiModel.UpdatedAt = &updatedAt
	}

	return apiModel
}

// GetRAGFlowDatasets retrieves datasets from RAGFlow using the user's enabled binding key
func (s *Service) GetRAGFlowDatasets(ctx context.Context, userID string, req *external_knowledge.GetRAGFlowDatasetsRequest) (*external_knowledge.GetRAGFlowDatasetsResponse, error) {
	// Get the enabled binding for the user
	bindings, _, err := s.repo.GetByUserID(ctx, userID, 0, 1, &[]int8{domainExternalKnowledge.BindingStatusEnabled}[0])
	if err != nil {
		logs.Errorf("Failed to get enabled binding: %v", err)
		return &external_knowledge.GetRAGFlowDatasetsResponse{
			Code: 500,
			Msg:  "Failed to get binding",
			Data: []*external_knowledge.RAGFlowDataset{},
		}, nil
	}

	if len(bindings) == 0 {
		return &external_knowledge.GetRAGFlowDatasetsResponse{
			Code: 403,
			Msg:  "No enabled binding found. Please enable a binding first.",
			Data: []*external_knowledge.RAGFlowDataset{},
		}, nil
	}

	// Use the first enabled binding's key
	bindingKey := bindings[0].BindingKey

	// Get RAGFlow base URL from environment
	ragflowBaseURL := os.Getenv("RAGFLOW_BASE_URL")
	if ragflowBaseURL == "" {
		ragflowBaseURL = "http://10.10.10.223" // fallback
	}

	// Make request to RAGFlow API
	url := fmt.Sprintf("%s/api/v1/datasets", ragflowBaseURL)

	httpReq, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		logs.Errorf("Failed to create request: %v", err)
		return &external_knowledge.GetRAGFlowDatasetsResponse{
			Code: 500,
			Msg:  "Failed to create request",
			Data: []*external_knowledge.RAGFlowDataset{},
		}, nil
	}

	// Add authorization header with user's binding key
	httpReq.Header.Add("Authorization", fmt.Sprintf("Bearer %s", bindingKey))
	httpReq.Header.Add("Content-Type", "application/json")

	// Execute request
	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		logs.Errorf("Failed to call RAGFlow API: %v", err)
		return &external_knowledge.GetRAGFlowDatasetsResponse{
			Code: 500,
			Msg:  "Failed to connect to RAGFlow",
			Data: []*external_knowledge.RAGFlowDataset{},
		}, nil
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		logs.Errorf("Failed to read response: %v", err)
		return &external_knowledge.GetRAGFlowDatasetsResponse{
			Code: 500,
			Msg:  "Failed to read response",
			Data: []*external_knowledge.RAGFlowDataset{},
		}, nil
	}

	// Debug log the response
	logs.Infof("RAGFlow API URL: %s", url)
	logs.Infof("RAGFlow API Response Status: %d", resp.StatusCode)
	logs.Infof("RAGFlow API Response Body: %s", string(body))

	// Parse RAGFlow response
	var ragflowResp struct {
		Code int32 `json:"code"`
		Data []struct {
			ID              string  `json:"id"`
			Name            string  `json:"name"`
			Description     string  `json:"description"`
			Avatar          *string `json:"avatar"`
			DocumentCount   int32   `json:"document_count"`
			ChunkCount      int32   `json:"chunk_count"`
			TokenNum        int64   `json:"token_num"`
			Language        string  `json:"language"`
			EmbeddingModel  string  `json:"embedding_model"`
			CreateDate      string  `json:"create_date"`
			CreateTime      int64   `json:"create_time"`
			UpdateDate      string  `json:"update_date"`
			UpdateTime      int64   `json:"update_time"`
			Status          string  `json:"status"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &ragflowResp); err != nil {
		logs.Errorf("Failed to parse RAGFlow response: %v", err)
		return &external_knowledge.GetRAGFlowDatasetsResponse{
			Code: 500,
			Msg:  "Failed to parse response",
			Data: []*external_knowledge.RAGFlowDataset{},
		}, nil
	}

	// Check RAGFlow response code
	if ragflowResp.Code != 0 {
		return &external_knowledge.GetRAGFlowDatasetsResponse{
			Code: ragflowResp.Code,
			Msg:  "RAGFlow API error",
			Data: []*external_knowledge.RAGFlowDataset{},
		}, nil
	}

	// Convert to our API model
	datasets := make([]*external_knowledge.RAGFlowDataset, 0, len(ragflowResp.Data))
	for _, ds := range ragflowResp.Data {
		// Convert status string to int
		status := int32(0)
		if ds.Status == "1" {
			status = 1
		}

		dataset := &external_knowledge.RAGFlowDataset{
			ID:             ds.ID,
			Name:           ds.Name,
			Description:    &ds.Description,
			Avatar:         ds.Avatar,
			DocumentCount:  ds.DocumentCount,
			ChunkCount:     ds.ChunkCount,
			TokenNum:       ds.TokenNum,
			Language:       ds.Language,
			EmbeddingModel: ds.EmbeddingModel,
			CreateDate:     ds.CreateDate,
			CreateTime:     ds.CreateTime,
			UpdateDate:     ds.UpdateDate,
			UpdateTime:     ds.UpdateTime,
			Status:         status,
		}
		datasets = append(datasets, dataset)
	}

	return &external_knowledge.GetRAGFlowDatasetsResponse{
		Code: 0,
		Msg:  "success",
		Data: datasets,
	}, nil
}

// Retrieval performs knowledge base retrieval via RAGFlow API
func (s *Service) Retrieval(ctx context.Context, userID string, req *external_knowledge.RetrievalRequest) (*external_knowledge.RetrievalResponse, error) {
	// Get bot's external knowledge configuration
	// Note: In a complete implementation, we would fetch the bot configuration
	// from the database using the bot_id and draft_mode flag

	// For now, we'll need to get the external knowledge settings from the bot
	// This requires integration with the singleagent service
	// TODO: Integrate with singleagent.GetAgentBotInfo to get actual bot config

	// Default RAGFlow URL
	ragflowURL := os.Getenv("RAGFLOW_API_URL")
	if ragflowURL == "" {
		ragflowURL = "http://10.10.10.223"
	}

	// Get RAGFlow API key - in production, this should come from user's binding
	apiKey := os.Getenv("RAGFLOW_API_KEY")
	if apiKey == "" {
		// Use default key for testing
		apiKey = "Bearer ragflow-JmYzBmN2EwOGViMTExZjA4ODhhNTYxM2"
	}

	// TODO: Get these values from bot's external_knowledge configuration
	// For demonstration, using sample values
	datasetIDs := []string{"3d9b76b68e2e11f0827c5613bc28010e"}
	topK := 5
	pageSize := 30
	similarityThreshold := 0.2
	vectorSimilarityWeight := 0.3
	useKeyword := false
	useHighlight := false

	// Build retrieval request body
	requestBody := map[string]interface{}{
		"question":                 req.Question,
		"dataset_ids":             datasetIDs,
		"top_k":                   topK,
		"page":                    1,
		"page_size":               pageSize,
		"similarity_threshold":    similarityThreshold,
		"vector_similarity_weight": vectorSimilarityWeight,
		"keyword":                 useKeyword,
		"highlight":               useHighlight,
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		logs.Errorf("Failed to marshal retrieval request: %v", err)
		return &external_knowledge.RetrievalResponse{
			Code: 500,
			Msg:  "Failed to prepare request",
		}, nil
	}

	// Create HTTP request
	httpReq, err := http.NewRequestWithContext(ctx, "POST", fmt.Sprintf("%s/api/v1/retrieval_v2", ragflowURL), strings.NewReader(string(jsonBody)))
	if err != nil {
		logs.Errorf("Failed to create retrieval request: %v", err)
		return &external_knowledge.RetrievalResponse{
			Code: 500,
			Msg:  "Failed to create request",
		}, nil
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", apiKey)

	// Send request
	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		logs.Errorf("Failed to call RAGFlow retrieval API: %v", err)
		return &external_knowledge.RetrievalResponse{
			Code: 500,
			Msg:  "Failed to call RAGFlow API",
		}, nil
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		logs.Errorf("Failed to read RAGFlow response: %v", err)
		return &external_knowledge.RetrievalResponse{
			Code: 500,
			Msg:  "Failed to read response",
		}, nil
	}

	// Parse RAGFlow response
	var ragflowResp struct {
		Code int    `json:"code"`
		Msg  string `json:"msg,omitempty"`
		Data struct {
			Chunks []struct {
				ID               string                 `json:"id"`
				Content          string                 `json:"content"`
				ContentLtks      string                 `json:"content_ltks,omitempty"`
				DocumentID       string                 `json:"document_id"`
				DocumentKeyword  string                 `json:"document_keyword,omitempty"`
				DatasetID        string                 `json:"dataset_id"`
				DocTypeKwd       string                 `json:"doc_type_kwd,omitempty"`
				Highlight        string                 `json:"highlight,omitempty"`
				ImageID          string                 `json:"image_id,omitempty"`
				ImportantKeywords []string              `json:"important_keywords,omitempty"`
				Positions        [][]int                `json:"positions,omitempty"`
				Similarity       float64                `json:"similarity"`
				TermSimilarity   float64                `json:"term_similarity,omitempty"`
				VectorSimilarity float64                `json:"vector_similarity,omitempty"`
			} `json:"chunks"`
			DocAggs []struct {
				Count   int    `json:"count"`
				DocID   string `json:"doc_id"`
				DocName string `json:"doc_name"`
			} `json:"doc_aggs,omitempty"`
			Total int32 `json:"total"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &ragflowResp); err != nil {
		logs.Errorf("Failed to parse RAGFlow retrieval response: %v", err)
		return &external_knowledge.RetrievalResponse{
			Code: 500,
			Msg:  "Failed to parse response",
		}, nil
	}

	// Check RAGFlow response code
	if ragflowResp.Code != 0 {
		return &external_knowledge.RetrievalResponse{
			Code: int32(ragflowResp.Code),
			Msg:  ragflowResp.Msg,
		}, nil
	}

	// Convert to our API model
	chunks := make([]*external_knowledge.RetrievalChunk, 0, len(ragflowResp.Data.Chunks))
	for _, chunk := range ragflowResp.Data.Chunks {
		// Build metadata from additional fields
		metadata := make(map[string]string)
		if chunk.ContentLtks != "" {
			metadata["content_ltks"] = chunk.ContentLtks
		}
		if chunk.DocTypeKwd != "" {
			metadata["doc_type_kwd"] = chunk.DocTypeKwd
		}
		if chunk.ImageID != "" {
			metadata["image_id"] = chunk.ImageID
		}
		if chunk.TermSimilarity > 0 {
			metadata["term_similarity"] = fmt.Sprintf("%f", chunk.TermSimilarity)
		}
		if chunk.VectorSimilarity > 0 {
			metadata["vector_similarity"] = fmt.Sprintf("%f", chunk.VectorSimilarity)
		}
		if len(chunk.ImportantKeywords) > 0 {
			metadata["important_keywords"] = strings.Join(chunk.ImportantKeywords, ",")
		}
		if len(chunk.Positions) > 0 {
			positionsJSON, _ := json.Marshal(chunk.Positions)
			metadata["positions"] = string(positionsJSON)
		}

		// Use the first position value if available
		var position int32
		if len(chunk.Positions) > 0 && len(chunk.Positions[0]) > 0 {
			position = int32(chunk.Positions[0][0])
		}

		retrievalChunk := &external_knowledge.RetrievalChunk{
			ID:           &chunk.ID,
			Content:      &chunk.Content,
			DocumentID:   &chunk.DocumentID,
			DocumentName: &chunk.DocumentKeyword, // Use document_keyword as document_name
			DatasetID:    &chunk.DatasetID,
			DatasetName:  nil, // RAGFlow doesn't provide dataset_name in this response
			Similarity:   &chunk.Similarity,
			Metadata:     metadata,
			Highlight:    &chunk.Highlight,
			Position:     &position,
		}
		chunks = append(chunks, retrievalChunk)
	}

	return &external_knowledge.RetrievalResponse{
		Code: 0,
		Msg:  "success",
		Data: &external_knowledge.RetrievalData{
			Chunks: chunks,
			Total:  &ragflowResp.Data.Total,
		},
	}, nil
}
