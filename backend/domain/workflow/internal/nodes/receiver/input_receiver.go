package receiver

import (
	"context"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type Config struct {
	OutputTypes map[string]*vo.TypeInfo
}

type InputReceiver struct {
	outputTypes   map[string]*vo.TypeInfo
	interruptData string
}

func New(_ context.Context, cfg *Config) (*InputReceiver, error) {
	return &InputReceiver{
		outputTypes: cfg.OutputTypes,
	}, nil
}

const ReceivedDataKey = "$received_data"

func (i *InputReceiver) Invoke(ctx context.Context, in string) (map[string]any, error) {
	if len(in) == 0 {
		err := compose.ProcessState[nodes.InterruptEventStore](ctx, func(ctx context.Context, setter nodes.InterruptEventStore) error {
			eventID, err := workflow.GetRepository().GenID(ctx)
			if err != nil {
				return err
			}
			return setter.SetInterruptEvent(eventID, &nodes.InterruptEvent{
				ID:            eventID,
				NodeType:      entity.NodeTypeInputReceiver,
				InterruptData: i.interruptData,
				EventType:     nodes.InterruptEventInput,
			})
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
