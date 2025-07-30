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

package searchstore

import (
	"github.com/cloudwego/eino/components/indexer"
	"github.com/cloudwego/eino/components/retriever"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/progressbar"
)

type IndexerOptions struct {
	PartitionKey   *string
	Partition      *string // Storage sharding map
	IndexingFields []string
	ProgressBar    progressbar.ProgressBar
}

type RetrieverOptions struct {
	MultiMatch   *MultiMatch // Multi-field query
	PartitionKey *string
	Partitions   []string // Query sharding map
}

type MultiMatch struct {
	Fields []string
	Query  string
}

func WithIndexerPartitionKey(key string) indexer.Option {
	return indexer.WrapImplSpecificOptFn(func(o *IndexerOptions) {
		o.PartitionKey = &key
	})
}

func WithPartition(partition string) indexer.Option {
	return indexer.WrapImplSpecificOptFn(func(o *IndexerOptions) {
		o.Partition = &partition
	})
}

func WithIndexingFields(fields []string) indexer.Option {
	return indexer.WrapImplSpecificOptFn(func(o *IndexerOptions) {
		o.IndexingFields = fields
	})
}

func WithProgressBar(progressBar progressbar.ProgressBar) indexer.Option {
	return indexer.WrapImplSpecificOptFn(func(o *IndexerOptions) {
		o.ProgressBar = progressBar
	})
}

func WithMultiMatch(fields []string, query string) retriever.Option {
	return retriever.WrapImplSpecificOptFn(func(o *RetrieverOptions) {
		o.MultiMatch = &MultiMatch{
			Fields: fields,
			Query:  query,
		}
	})
}

func WithRetrieverPartitionKey(key string) retriever.Option {
	return retriever.WrapImplSpecificOptFn(func(o *RetrieverOptions) {
		o.PartitionKey = &key
	})
}

func WithPartitions(partitions []string) retriever.Option {
	return retriever.WrapImplSpecificOptFn(func(o *RetrieverOptions) {
		o.Partitions = partitions
	})
}
