package receiver

import (
	"context"
	"errors"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type Config struct {
	OutputTypes  map[string]*vo.TypeInfo
	NodeKey      vo.NodeKey
	OutputSchema string
}

type InputReceiver struct {
	outputTypes   map[string]*vo.TypeInfo
	interruptData string
	nodeKey       vo.NodeKey
	nodeMeta      entity.NodeTypeMeta
}

func New(_ context.Context, cfg *Config) (*InputReceiver, error) {
	nodeMeta := entity.NodeMetaByNodeType(entity.NodeTypeInputReceiver)
	if nodeMeta == nil {
		return nil, errors.New("node meta not found for input receiver")
	}

	interruptData := map[string]string{
		"content_type": "form_schema",
		"content":      cfg.OutputSchema,
	}

	interruptDataStr, err := sonic.MarshalString(interruptData)
	if err != nil {
		return nil, err
	}

	return &InputReceiver{
		outputTypes:   cfg.OutputTypes,
		nodeMeta:      *nodeMeta,
		nodeKey:       cfg.NodeKey,
		interruptData: interruptDataStr,
	}, nil
}

const ReceivedDataKey = "$received_data"

func (i *InputReceiver) Invoke(ctx context.Context, in string) (map[string]any, error) {
	if len(in) == 0 {
		err := compose.ProcessState(ctx, func(ctx context.Context, ieStore nodes.InterruptEventStore) error {
			_, found, e := ieStore.GetInterruptEvent(i.nodeKey)
			if e != nil {
				return e
			}

			if !found { // only generate a new event if it doesn't exist
				eventID, err := workflow.GetRepository().GenID(ctx)
				if err != nil {
					return err
				}
				return ieStore.SetInterruptEvent(i.nodeKey, &entity.InterruptEvent{
					ID:            eventID,
					NodeKey:       i.nodeKey,
					NodeType:      entity.NodeTypeInputReceiver,
					NodeTitle:     i.nodeMeta.Name,
					NodeIcon:      i.nodeMeta.IconURL,
					InterruptData: i.interruptData,
					EventType:     entity.InterruptEventInput,
				})
			}

			return nil
		})
		if err != nil {
			return nil, err
		}
		return nil, compose.InterruptAndRerun
	}

	out, err := jsonParseRelaxed(in, i.outputTypes)
	if err != nil {
		return nil, err
	}

	return out, nil
}

func jsonParseRelaxed(data string, schema_ map[string]*vo.TypeInfo) (map[string]any, error) {
	var result map[string]any

	err := sonic.UnmarshalString(data, &result)
	if err != nil {
		return nil, err
	}

	for k, v := range result {
		if s, ok := schema_[k]; ok {
			if val, ok_ := vo.TypeValidateAndConvert(s, v); ok_ {
				result[k] = val
			}
		}
	}

	return result, nil
}
