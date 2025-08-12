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

package compose

import (
	"context"
	"fmt"
	"maps"
	"slices"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

// outputValueFiller will fill the output value with nil if the key is not present in the output map.
// if a node emits stream as output, the node needs to handle these absent keys in stream themselves.
func outputValueFiller(s *schema2.NodeSchema) func(ctx context.Context, output map[string]any) (map[string]any, error) {
	if len(s.OutputTypes) == 0 {
		return func(ctx context.Context, output map[string]any) (map[string]any, error) {
			return output, nil
		}
	}

	return func(ctx context.Context, output map[string]any) (map[string]any, error) {
		newOutput := make(map[string]any)
		for k := range output {
			newOutput[k] = output[k]
		}

		for k, tInfo := range s.OutputTypes {
			if err := FillIfNotRequired(tInfo, newOutput, k, FillNil, false); err != nil {
				return nil, err
			}
		}

		return newOutput, nil
	}
}

// inputValueFiller will fill the input value with default value(zero or nil) if the input value is not present in map.
// if a node accepts stream as input, the node needs to handle these absent keys in stream themselves.
func inputValueFiller(s *schema2.NodeSchema) func(ctx context.Context, input map[string]any) (map[string]any, error) {
	if len(s.InputTypes) == 0 {
		return func(ctx context.Context, input map[string]any) (map[string]any, error) {
			return input, nil
		}
	}

	return func(ctx context.Context, input map[string]any) (map[string]any, error) {
		newInput := make(map[string]any)
		for k := range input {
			newInput[k] = input[k]
		}

		for k, tInfo := range s.InputTypes {
			if err := FillIfNotRequired(tInfo, newInput, k, FillZero, false); err != nil {
				return nil, err
			}
		}

		return newInput, nil
	}
}

func streamInputValueFiller(s *schema2.NodeSchema) func(ctx context.Context,
	input *schema.StreamReader[map[string]any]) *schema.StreamReader[map[string]any] {
	fn := func(ctx context.Context, i map[string]any) (map[string]any, error) {
		newI := make(map[string]any)
		for k := range i {
			newI[k] = i[k]
		}

		for k, tInfo := range s.InputTypes {
			if err := replaceNilWithZero(tInfo, newI, k); err != nil {
				return nil, err
			}
		}

		return newI, nil
	}

	return func(ctx context.Context, input *schema.StreamReader[map[string]any]) *schema.StreamReader[map[string]any] {
		return schema.StreamReaderWithConvert(input, func(in map[string]any) (map[string]any, error) {
			return fn(ctx, in)
		})
	}
}

type FillStrategy string

const (
	FillZero FillStrategy = "zero"
	FillNil  FillStrategy = "nil"
)

func FillIfNotRequired(tInfo *vo.TypeInfo, container map[string]any, k string, strategy FillStrategy, isInsideObject bool) error {
	v, ok := container[k]
	if ok {
		if len(tInfo.Properties) == 0 {
			if v == nil && strategy == FillZero {
				if isInsideObject {
					return nil
				}
				v = tInfo.Zero()
				container[k] = v
				return nil
			}

			if v != nil && tInfo.Type == vo.DataTypeArray {
				val, ok := v.([]any)
				if !ok {
					valStr, ok := v.(string)
					if ok {
						err := sonic.UnmarshalString(valStr, &val)
						if err != nil {
							return err
						}
						container[k] = val
					} else {
						return fmt.Errorf("layer field %s is not a []any or string", k)
					}
				}
				elemTInfo := tInfo.ElemTypeInfo
				copiedVal := slices.Clone(val)
				container[k] = copiedVal
				for i := range copiedVal {
					if copiedVal[i] == nil {
						if strategy == FillZero {
							copiedVal[i] = elemTInfo.Zero()
							continue
						}
					}

					if len(elemTInfo.Properties) > 0 {
						subContainer, ok := copiedVal[i].(map[string]any)
						if !ok {
							return fmt.Errorf("map item under array %s is not map[string]any", k)
						}

						newSubContainer := maps.Clone(subContainer)
						if newSubContainer == nil {
							newSubContainer = make(map[string]any)
						}

						for subK, subL := range elemTInfo.Properties {
							if err := FillIfNotRequired(subL, newSubContainer, subK, strategy, true); err != nil {
								return err
							}
						}

						copiedVal[i] = newSubContainer
					}
				}
			}
		} else {
			if v == nil {
				return nil
			}
			// recursively handle the layered object.
			subContainer, ok := v.(map[string]any)
			if !ok {
				subContainerStr, ok := v.(string)
				if ok {
					subContainer = make(map[string]any)
					err := sonic.UnmarshalString(subContainerStr, &subContainer)
					if err != nil {
						return err
					}
					container[k] = subContainer
				} else {
					return fmt.Errorf("layer field %s is not a map[string]any or string", k)
				}
			}

			newSubContainer := maps.Clone(subContainer)
			if newSubContainer == nil {
				newSubContainer = make(map[string]any)
			}
			for subK, subT := range tInfo.Properties {
				if err := FillIfNotRequired(subT, newSubContainer, subK, strategy, true); err != nil {
					return err
				}
			}

			container[k] = newSubContainer
		}
	} else {
		if tInfo.Required {
			return fmt.Errorf("output field %s is required but not present", k)
		} else {
			var z any
			if strategy == FillZero {
				if !isInsideObject {
					z = tInfo.Zero()
				}
			}

			container[k] = z
			// if it's an object, recursively handle the layeredFieldInfo.
			if len(tInfo.Properties) > 0 {
				z = make(map[string]any)
				container[k] = z
				subContainer := z.(map[string]any)
				for subK, subL := range tInfo.Properties {
					if err := FillIfNotRequired(subL, subContainer, subK, strategy, true); err != nil {
						return err
					}
				}
			}
		}
	}

	return nil
}

func replaceNilWithZero(tInfo *vo.TypeInfo, container map[string]any, k string) error {
	v, ok := container[k]
	if !ok {
		return nil
	}

	if len(tInfo.Properties) == 0 {
		if v == nil {
			v = tInfo.Zero()
			container[k] = v
			return nil
		}

		if tInfo.Type == vo.DataTypeArray {
			val, ok := v.([]any)
			if !ok {
				valStr, ok := v.(string)
				if ok {
					err := sonic.UnmarshalString(valStr, &val)
					if err != nil {
						return err
					}
					container[k] = val
				} else {
					return fmt.Errorf("layer field %s is not a []any or string", k)
				}
			}
			elemTInfo := tInfo.ElemTypeInfo
			copiedVal := slices.Clone(val)
			container[k] = copiedVal
			for i := range copiedVal {
				if copiedVal[i] == nil {
					copiedVal[i] = elemTInfo.Zero()
					continue
				}

				if len(elemTInfo.Properties) > 0 {
					subContainer, ok := copiedVal[i].(map[string]any)
					if !ok {
						return fmt.Errorf("map item under array %s is not map[string]any", k)
					}

					newSubContainer := maps.Clone(subContainer)

					for subK, subL := range elemTInfo.Properties {
						if err := replaceNilWithZero(subL, newSubContainer, subK); err != nil {
							return err
						}
					}

					copiedVal[i] = newSubContainer
				}
			}
		}
	} else {
		if v == nil {
			return nil
		}
		// recursively handle the layered object.
		subContainer, ok := v.(map[string]any)
		if !ok {
			subContainerStr, ok := v.(string)
			if ok {
				subContainer = make(map[string]any)
				err := sonic.UnmarshalString(subContainerStr, &subContainer)
				if err != nil {
					return err
				}
				container[k] = subContainer
			} else {
				return fmt.Errorf("layer field %s is not a map[string]any or string", k)
			}
		}

		newSubContainer := maps.Clone(subContainer)
		for subK, subT := range tInfo.Properties {
			if err := replaceNilWithZero(subT, newSubContainer, subK); err != nil {
				return err
			}
		}

		container[k] = newSubContainer
	}

	return nil
}
