package entity

type SearchStrategy int64

const (
	SearchStrategySemanticSearch SearchStrategy = 0
	SearchStrategyHybridSearch   SearchStrategy = 1
	SearchStrategyFullTextSearch SearchStrategy = 20
)
