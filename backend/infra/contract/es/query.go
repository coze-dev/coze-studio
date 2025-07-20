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

package es

const (
	QueryTypeEqual      = "equal"
	QueryTypeMatch      = "match"
	QueryTypeMultiMatch = "multi_match"
	QueryTypeNotExists  = "not_exists"
	QueryTypeContains   = "contains"
	QueryTypeIn         = "in"
)

type KV struct {
	Key   string
	Value any
}

type QueryType string

type Query struct {
	KV              KV
	Type            QueryType
	MultiMatchQuery MultiMatchQuery
	Bool            *BoolQuery
}

type BoolQuery struct {
	Filter             []Query
	Must               []Query
	MustNot            []Query
	Should             []Query
	MinimumShouldMatch *int
}

type MultiMatchQuery struct {
	Fields   []string
	Type     string // best_fields
	Query    string
	Operator string
}

const (
	Or  = "or"
	And = "and"
)

func NewEqualQuery(k string, v any) Query {
	return Query{
		KV:   KV{Key: k, Value: v},
		Type: QueryTypeEqual,
	}
}

func NewMatchQuery(k string, v any) Query {
	return Query{
		KV:   KV{Key: k, Value: v},
		Type: QueryTypeMatch,
	}
}

func NewMultiMatchQuery(fields []string, query, typeStr, operator string) Query {
	return Query{
		Type: QueryTypeMultiMatch,
		MultiMatchQuery: MultiMatchQuery{
			Fields:   fields,
			Query:    query,
			Operator: operator,
			Type:     typeStr,
		},
	}
}

func NewNotExistsQuery(k string) Query {
	return Query{
		KV:   KV{Key: k},
		Type: QueryTypeNotExists,
	}
}

func NewContainsQuery(k string, v any) Query {
	return Query{
		KV:   KV{Key: k, Value: v},
		Type: QueryTypeContains,
	}
}

func NewInQuery[T any](k string, v []T) Query {
	arr := make([]any, 0, len(v))
	for _, item := range v {
		arr = append(arr, item)
	}
	return Query{
		KV:   KV{Key: k, Value: arr},
		Type: QueryTypeIn,
	}
}
