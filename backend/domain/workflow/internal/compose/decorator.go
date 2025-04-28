package compose

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

// outputValueFiller will fill the output value with nil if the key is not present in the output map.
// if a node emits stream as output, the node needs to handle these absent keys in stream themselves.
func (s *NodeSchema) outputValueFiller() func(ctx context.Context, output map[string]any) (map[string]any, error) {
	if len(s.OutputTypes) == 0 {
		return nil
	}

	return func(ctx context.Context, output map[string]any) (map[string]any, error) {
		newOutput := make(map[string]any)
		for k := range output {
			newOutput[k] = output[k]
		}

		for k, tInfo := range s.OutputTypes {
			if err := fillIfNotRequired(tInfo, newOutput, k, fillNil); err != nil {
				return nil, err
			}
		}

		return newOutput, nil
	}
}

// inputValueFiller will fill the input value with default value(zero or nil) if the input value is not present in map.
// if a node accepts stream as input, the node needs to handle these absent keys in stream themselves.
func (s *NodeSchema) inputValueFiller() func(ctx context.Context, input map[string]any) (map[string]any, error) {
	if len(s.InputTypes) == 0 {
		return nil
	}

	return func(ctx context.Context, input map[string]any) (map[string]any, error) {
		newInput := make(map[string]any)
		for k := range input {
			newInput[k] = input[k]
		}

		for k, tInfo := range s.InputTypes {
			if err := fillIfNotRequired(tInfo, newInput, k, fillZero); err != nil {
				return nil, err
			}
		}

		return newInput, nil
	}
}

func preDecorate(i compose.InvokeWOOpt[map[string]any, map[string]any],
	preDecorators ...compose.InvokeWOOpt[map[string]any, map[string]any]) compose.InvokeWOOpt[map[string]any, map[string]any] {
	return func(ctx context.Context, input map[string]any) (output map[string]any, err error) {
		for _, preDecorator := range preDecorators {
			if preDecorator == nil {
				continue
			}
			input, err = preDecorator(ctx, input)
			if err != nil {
				return nil, err
			}
		}

		return i(ctx, input)
	}
}

func postDecorate(i compose.InvokeWOOpt[map[string]any, map[string]any],
	postDecorators ...compose.InvokeWOOpt[map[string]any, map[string]any]) compose.InvokeWOOpt[map[string]any, map[string]any] {
	return func(ctx context.Context, input map[string]any) (output map[string]any, err error) {
		output, err = i(ctx, input)
		if err != nil {
			return nil, err
		}
		for _, postDecorator := range postDecorators {
			if postDecorator == nil {
				continue
			}
			output, err = postDecorator(ctx, output)
			if err != nil {
				return nil, err
			}
		}
		return output, nil
	}
}

func preDecorateWO[T any](i compose.Invoke[map[string]any, map[string]any, T],
	preDecorators ...compose.InvokeWOOpt[map[string]any, map[string]any]) compose.Invoke[map[string]any, map[string]any, T] {
	return func(ctx context.Context, input map[string]any, opts ...T) (output map[string]any, err error) {
		for _, preDecorator := range preDecorators {
			if preDecorator == nil {
				continue
			}
			input, err = preDecorator(ctx, input)
			if err != nil {
				return nil, err
			}
		}

		return i(ctx, input, opts...)
	}
}

func postDecorateWO[T any](i compose.Invoke[map[string]any, map[string]any, T],
	postDecorators ...compose.InvokeWOOpt[map[string]any, map[string]any]) compose.Invoke[map[string]any, map[string]any, T] {
	return func(ctx context.Context, input map[string]any, opts ...T) (output map[string]any, err error) {
		output, err = i(ctx, input, opts...)
		if err != nil {
			return nil, err
		}
		for _, postDecorator := range postDecorators {
			if postDecorator == nil {
				continue
			}
			output, err = postDecorator(ctx, output)
			if err != nil {
				return nil, err
			}
		}
		return output, nil
	}
}

type fillStrategy string

const (
	fillZero fillStrategy = "zero"
	fillNil  fillStrategy = "nil"
)

func fillIfNotRequired(tInfo *vo.TypeInfo, container map[string]any, k string, strategy fillStrategy) error {
	v, ok := container[k]
	if ok {
		if len(tInfo.Properties) == 0 { // it's a leaf, no need to do anything.
			return nil
		} else {
			// recursively handler the layered object.
			subContainer, ok := v.(map[string]any)
			if !ok {
				return fmt.Errorf("layer field %s is not a map[string]any", k)
			}
			for subK, subL := range tInfo.Properties {
				if err := fillIfNotRequired(subL, subContainer, subK, strategy); err != nil {
					return err
				}
			}
		}
	} else {
		if tInfo.Required {
			return fmt.Errorf("output field %s is required but not present", k)
		} else {
			var z any
			if strategy == fillZero {
				z = tInfo.Zero()
			}

			container[k] = z
			// if it's an object, recursively handle the layeredFieldInfo.
			if len(tInfo.Properties) > 0 {
				z = make(map[string]any)
				container[k] = z
				subContainer := z.(map[string]any)
				for subK, subL := range tInfo.Properties {
					if err := fillIfNotRequired(subL, subContainer, subK, strategy); err != nil {
						return err
					}
				}
			}
		}
	}

	return nil
}
