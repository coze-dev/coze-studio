package searchstore

import (
	"github.com/cloudwego/eino/components/indexer"
	"github.com/cloudwego/eino/components/retriever"
)

type IndexerOptions struct {
	Partition *string // 存储分片映射
}

type RetrieverOptions struct {
	MultiMatch *MultiMatch // 多 field 查询
	Partitions []string    // 查询分片映射
}

type MultiMatch struct {
	Fields []string
	Query  string
}

func WithPartition(partition string) indexer.Option {
	return indexer.WrapImplSpecificOptFn(func(o *IndexerOptions) {
		o.Partition = &partition
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

func WithPartitions(partitions []string) retriever.Option {
	return retriever.WrapImplSpecificOptFn(func(o *RetrieverOptions) {
		o.Partitions = partitions
	})
}
