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

package qdrant

import (
	"fmt"
	"reflect"
	"strconv"

	qdrantapi "github.com/qdrant/go-client/qdrant"

	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
)

func (q *qdrantSearchStore) buildFilter(dslInfo map[string]any, options *searchstore.RetrieverOptions) (*qdrantapi.Filter, error) {
	filter := &qdrantapi.Filter{}
	dsl, err := searchstore.LoadDSL(dslInfo)
	if err != nil {
		return nil, err
	}
	if dsl != nil {
		condition, err := dslToCondition(dsl)
		if err != nil {
			return nil, err
		}
		filter.Must = append(filter.Must, condition)
	}

	if options != nil {
		if (options.PartitionKey == nil) != (len(options.Partitions) == 0) {
			return nil, fmt.Errorf("partition key and values must be provided together")
		}
		if options.PartitionKey != nil {
			if *options.PartitionKey == "" {
				return nil, fmt.Errorf("partition key is empty")
			}
			values, err := q.partitionValues(*options.PartitionKey, options.Partitions)
			if err != nil {
				return nil, err
			}
			condition, err := matchCondition(*options.PartitionKey, values)
			if err != nil {
				return nil, fmt.Errorf("partition filter: %w", err)
			}
			filter.Must = append(filter.Must, condition)
		}
	}
	if len(filter.Must) == 0 && len(filter.Should) == 0 && len(filter.MustNot) == 0 {
		return nil, nil
	}
	return filter, nil
}

func dslToCondition(dsl *searchstore.DSL) (*qdrantapi.Condition, error) {
	if dsl == nil {
		return nil, fmt.Errorf("dsl condition is nil")
	}
	switch dsl.Op {
	case searchstore.OpEq, searchstore.OpIn, searchstore.OpNe:
		values, err := toSlice(dsl.Value)
		if err != nil {
			return nil, err
		}
		condition, err := matchCondition(dsl.Field, values)
		if err != nil {
			return nil, err
		}
		if dsl.Op == searchstore.OpNe {
			return qdrantapi.NewFilterAsCondition(&qdrantapi.Filter{MustNot: []*qdrantapi.Condition{condition}}), nil
		}
		return condition, nil
	case searchstore.OpLike:
		value, ok := dsl.Value.(string)
		if !ok {
			return nil, fmt.Errorf("LIKE value for field %q must be string, got %T", dsl.Field, dsl.Value)
		}
		return qdrantapi.NewMatchText(dsl.Field, value), nil
	case searchstore.OpAnd, searchstore.OpOr:
		subDSL, err := loadSubDSL(dsl.Value)
		if err != nil {
			return nil, err
		}
		conditions := make([]*qdrantapi.Condition, 0, len(subDSL))
		for _, sub := range subDSL {
			condition, err := dslToCondition(sub)
			if err != nil {
				return nil, err
			}
			conditions = append(conditions, condition)
		}
		filter := &qdrantapi.Filter{}
		if dsl.Op == searchstore.OpAnd {
			filter.Must = conditions
		} else {
			filter.Should = conditions
		}
		return qdrantapi.NewFilterAsCondition(filter), nil
	default:
		return nil, fmt.Errorf("unsupported dsl operation %q", dsl.Op)
	}
}

func loadSubDSL(value any) ([]*searchstore.DSL, error) {
	if dsl, ok := value.([]*searchstore.DSL); ok {
		if len(dsl) == 0 {
			return nil, fmt.Errorf("logical filter has no conditions")
		}
		return dsl, nil
	}
	if maps, ok := value.([]map[string]any); ok {
		result := make([]*searchstore.DSL, 0, len(maps))
		for _, item := range maps {
			dsl, err := searchstore.LoadDSL(item)
			if err != nil {
				return nil, err
			}
			if dsl == nil {
				return nil, fmt.Errorf("logical filter contains a nil condition")
			}
			result = append(result, dsl)
		}
		if len(result) == 0 {
			return nil, fmt.Errorf("logical filter has no conditions")
		}
		return result, nil
	}
	return nil, fmt.Errorf("logical filter value must be []*searchstore.DSL, got %T", value)
}

func matchCondition(field string, values []any) (*qdrantapi.Condition, error) {
	if field == "" {
		return nil, fmt.Errorf("filter field is empty")
	}
	if len(values) == 0 {
		return nil, fmt.Errorf("filter values are empty")
	}

	ints := make([]int64, 0, len(values))
	strings := make([]string, 0, len(values))
	bools := make([]bool, 0, len(values))
	for _, value := range values {
		switch typed := value.(type) {
		case string:
			strings = append(strings, typed)
		case bool:
			bools = append(bools, typed)
		default:
			integer, ok := integerValue(typed)
			if !ok {
				return nil, fmt.Errorf("filter field %q has unsupported value type %T", field, value)
			}
			ints = append(ints, integer)
		}
	}

	typeCount := 0
	if len(ints) > 0 {
		typeCount++
	}
	if len(strings) > 0 {
		typeCount++
	}
	if len(bools) > 0 {
		typeCount++
	}
	if typeCount != 1 {
		return nil, fmt.Errorf("filter field %q has mixed value types", field)
	}
	if len(ints) > 0 {
		return qdrantapi.NewMatchInts(field, ints...), nil
	}
	if len(strings) > 0 {
		return qdrantapi.NewMatchKeywords(field, strings...), nil
	}
	conditions := make([]*qdrantapi.Condition, 0, len(bools))
	for _, value := range bools {
		conditions = append(conditions, qdrantapi.NewMatchBool(field, value))
	}
	if len(conditions) == 1 {
		return conditions[0], nil
	}
	return qdrantapi.NewFilterAsCondition(&qdrantapi.Filter{Should: conditions}), nil
}

func integerValue(value any) (int64, bool) {
	if value == nil {
		return 0, false
	}
	rv := reflect.ValueOf(value)
	switch rv.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return rv.Int(), true
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64, reflect.Uintptr:
		if rv.Uint() > uint64(^uint64(0)>>1) {
			return 0, false
		}
		return int64(rv.Uint()), true
	default:
		return 0, false
	}
}

func (q *qdrantSearchStore) partitionValues(field string, values []string) ([]any, error) {
	result := make([]any, len(values))
	integerField := q.payloadTypes[field] == qdrantapi.PayloadSchemaType_Integer
	for i, value := range values {
		if !integerField {
			result[i] = value
			continue
		}
		parsed, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("partition value %q for integer field %q is invalid: %w", value, field, err)
		}
		result[i] = parsed
	}
	return result, nil
}
