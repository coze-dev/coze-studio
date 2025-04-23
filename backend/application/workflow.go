package application

import (
	"context"
	"fmt"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
)

type WorkflowApplicationService struct{}

var WorkflowSVC = &WorkflowApplicationService{}

func (w *WorkflowApplicationService) GetNodeTemplateList(ctx context.Context, req *workflow.NodeTemplateListRequest) (*workflow.NodeTemplateListResponse, error) {
	toQueryTypes := make(map[entity.NodeType]bool)
	for _, t := range req.NodeTypes {
		entityType, err := nodeType2EntityNodeType(t)
		if err != nil {
			return nil, err
		}
		toQueryTypes[entityType] = true
	}

	category2NodeMetaList, _, _, err := service.GetWorkflowService().ListNodeMeta(ctx, toQueryTypes)
	if err != nil {
		return nil, err
	}

	resp := &workflow.NodeTemplateListResponse{
		Data: &workflow.NodeTemplateListData{},
	}

	categoryMap := make(map[string]*workflow.NodeCategory)

	for category, nodeMetaList := range category2NodeMetaList {
		categoryMap[category] = &workflow.NodeCategory{
			Name: category,
		}
		for _, nodeMeta := range nodeMetaList {
			tplType, err := entityNodeTypeToAPINodeTemplateType(nodeMeta.Type)
			if err != nil {
				return nil, err
			}
			tpl := &workflow.NodeTemplate{
				ID:           fmt.Sprintf("%d", nodeMeta.ID),
				Type:         tplType,
				Name:         nodeMeta.Name,
				Desc:         nodeMeta.Desc,
				IconURL:      nodeMeta.IconURL,
				SupportBatch: ternary.IFElse(nodeMeta.SupportBatch, workflow.SupportBatch_SUPPORT, workflow.SupportBatch_NOT_SUPPORT),
				NodeType:     fmt.Sprintf("%d", tplType),
				Color:        nodeMeta.Color,
			}

			resp.Data.TemplateList = append(resp.Data.TemplateList, tpl)
			categoryMap[category].NodeTypeList = append(categoryMap[category].NodeTypeList, fmt.Sprintf("%d", tplType))
		}
	}

	// TODO: handle the plugin lists

	for category, nodeCategory := range categoryMap {
		resp.Data.CateList = append(resp.Data.CateList, &workflow.NodeCategory{
			Name:         category,
			NodeTypeList: nodeCategory.NodeTypeList,
		})
	}

	return resp, nil
}

func nodeType2EntityNodeType(t string) (entity.NodeType, error) {
	i, err := strconv.Atoi(t)
	if err != nil {
		return "", fmt.Errorf("invalid node type string '%s': %w", t, err)
	}

	switch i {
	case 1:
		return entity.NodeTypeEntry, nil
	case 2:
		return entity.NodeTypeExit, nil
	case 3:
		return entity.NodeTypeLLM, nil
	case 4:
		return entity.NodeTypePlugin, nil
	case 5:
		return entity.NodeTypeCodeRunner, nil
	case 6:
		return entity.NodeTypeKnowledgeRetriever, nil
	case 8:
		return entity.NodeTypeSelector, nil
	case 9:
		return entity.NodeTypeSubWorkflow, nil
	case 12:
		return entity.NodeTypeDatabaseCustomSQL, nil
	case 13:
		return entity.NodeTypeOutputEmitter, nil
	case 15:
		return entity.NodeTypeTextProcessor, nil
	case 18:
		return entity.NodeTypeQuestionAnswer, nil
	case 19:
		return entity.NodeTypeBreak, nil
	case 20:
		return entity.NodeTypeVariableAssignerWithinLoop, nil
	case 21:
		return entity.NodeTypeLoop, nil
	case 22:
		return entity.NodeTypeIntentDetector, nil
	case 27:
		return entity.NodeTypeKnowledgeIndexer, nil
	case 28:
		return entity.NodeTypeBatch, nil
	case 29:
		return entity.NodeTypeContinue, nil
	case 30:
		return entity.NodeTypeInputReceiver, nil
	case 32:
		return entity.NodeTypeVariableAggregator, nil
	case 37:
		return entity.NodeTypeMessageList, nil
	case 38:
		return entity.NodeTypeClearMessage, nil
	case 39:
		return entity.NodeTypeCreateConversation, nil
	case 40:
		return entity.NodeTypeVariableAssigner, nil
	case 42:
		return entity.NodeTypeDatabaseUpdate, nil
	case 43:
		return entity.NodeTypeDatabaseQuery, nil
	case 44:
		return entity.NodeTypeDatabaseDelete, nil
	case 45:
		return entity.NodeTypeHTTPRequester, nil
	case 46:
		return entity.NodeTypeDatabaseInsert, nil
	default:
		// Handle all unknown or unsupported types here
		return "", fmt.Errorf("unsupported or unknown node type ID: %d", i)
	}
}

// entityNodeTypeToAPINodeTemplateType converts an entity.NodeType to the corresponding workflow.NodeTemplateType.
func entityNodeTypeToAPINodeTemplateType(nodeType entity.NodeType) (workflow.NodeTemplateType, error) {
	switch nodeType {
	case entity.NodeTypeEntry:
		return workflow.NodeTemplateType_Start, nil
	case entity.NodeTypeExit:
		return workflow.NodeTemplateType_End, nil
	case entity.NodeTypeLLM:
		return workflow.NodeTemplateType_LLM, nil
	case entity.NodeTypePlugin:
		// Maps to Api type in the API model
		return workflow.NodeTemplateType_Api, nil
	case entity.NodeTypeCodeRunner:
		return workflow.NodeTemplateType_Code, nil
	case entity.NodeTypeKnowledgeRetriever:
		// Maps to Dataset type in the API model
		return workflow.NodeTemplateType_Dataset, nil
	case entity.NodeTypeSelector:
		// Maps to If type in the API model
		return workflow.NodeTemplateType_If, nil
	case entity.NodeTypeSubWorkflow:
		return workflow.NodeTemplateType_SubWorkflow, nil
	case entity.NodeTypeDatabaseCustomSQL:
		// Maps to the generic Database type in the API model
		return workflow.NodeTemplateType_Database, nil
	case entity.NodeTypeOutputEmitter:
		// Maps to Message type in the API model
		return workflow.NodeTemplateType_Message, nil
	case entity.NodeTypeTextProcessor:
		return workflow.NodeTemplateType_Text, nil
	case entity.NodeTypeQuestionAnswer:
		return workflow.NodeTemplateType_Question, nil
	case entity.NodeTypeBreak:
		return workflow.NodeTemplateType_Break, nil
	case entity.NodeTypeVariableAssigner:
		// Maps to AssignVariable (ID 40) in the API model.
		// API also has LoopSetVariable (ID 20).
		// TODO: needs to split 20 and 40 to two types in workflow entity defines.
		return workflow.NodeTemplateType_AssignVariable, nil
	case entity.NodeTypeVariableAssignerWithinLoop:
		return workflow.NodeTemplateType_LoopSetVariable, nil
	case entity.NodeTypeLoop:
		return workflow.NodeTemplateType_Loop, nil
	case entity.NodeTypeIntentDetector:
		return workflow.NodeTemplateType_Intent, nil
	case entity.NodeTypeKnowledgeIndexer:
		// Maps to DatasetWrite type in the API model
		return workflow.NodeTemplateType_DatasetWrite, nil
	case entity.NodeTypeBatch:
		return workflow.NodeTemplateType_Batch, nil
	case entity.NodeTypeContinue:
		return workflow.NodeTemplateType_Continue, nil
	case entity.NodeTypeInputReceiver:
		return workflow.NodeTemplateType_Input, nil
	// Note: entity.NodeTypeVariableAggregator (ID 32) has no direct mapping in NodeTemplateType
	// Note: entity.NodeTypeMessageList (ID 37) has no direct mapping in NodeTemplateType
	// Note: entity.NodeTypeClearMessage (ID 38) has no direct mapping in NodeTemplateType
	// Note: entity.NodeTypeCreateConversation (ID 39) has no direct mapping in NodeTemplateType
	case entity.NodeTypeDatabaseUpdate:
		return workflow.NodeTemplateType_DatabaseUpdate, nil
	case entity.NodeTypeDatabaseQuery:
		// Maps to DatabasesELECT (ID 43) in the API model (note potential typo)
		return workflow.NodeTemplateType_DatabasesELECT, nil
	case entity.NodeTypeDatabaseDelete:
		return workflow.NodeTemplateType_DatabaseDelete, nil
	// Note: entity.NodeTypeHTTPRequester (ID 45) has no direct mapping in NodeTemplateType
	case entity.NodeTypeHTTPRequester:
		return workflow.NodeTemplateType(45), nil
	case entity.NodeTypeDatabaseInsert:
		// Maps to DatabaseInsert (ID 41) in the API model, despite entity ID being 46.
		return workflow.NodeTemplateType_DatabaseInsert, nil
	default:
		// Handle entity types that don't have a corresponding NodeTemplateType
		return workflow.NodeTemplateType(0), fmt.Errorf("cannot map entity node type '%s' to a workflow.NodeTemplateType", nodeType)
	}
}
