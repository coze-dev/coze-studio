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
	sonic2 "code.byted.org/flow/opencoze/backend/pkg/sonic"
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

	interruptDataStr, err := sonic.ConfigStd.MarshalToString(interruptData) // keep the order of the keys
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

func (i *InputReceiver) Invoke(ctx context.Context, in map[string]any) (map[string]any, error) {
	var input string
	if in != nil {
		receivedData, ok := in[ReceivedDataKey]
		if ok {
			input = receivedData.(string)
		}
	}

	if len(input) == 0 {
		err := compose.ProcessState(ctx, func(ctx context.Context, ieStore nodes.InterruptEventStore) error {
			_, found, e := ieStore.GetInterruptEvent(i.nodeKey) // TODO: try not use InterruptEventStore or state in general
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

	out, err := jsonParseRelaxed(input, i.outputTypes)
	if err != nil {
		return nil, err
	}

	return out, nil
}

func jsonParseRelaxed(data string, schema_ map[string]*vo.TypeInfo) (map[string]any, error) {
	var result map[string]any

	err := sonic2.UnmarshalString(data, &result)
	if err != nil {
		return nil, err
	}

	for k, v := range result {
		if s, ok := schema_[k]; ok {
			if val, err := nodes.Convert(v, s); err == nil {
				result[k] = val
			}
		}
	}

	return result, nil
}
