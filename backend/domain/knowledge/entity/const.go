package entity

type SearchStrategy string

const (
	FullText SearchStrategy = "full_text"
	Semantic SearchStrategy = "semantic"
	Hybrid   SearchStrategy = "hybrid"
)
