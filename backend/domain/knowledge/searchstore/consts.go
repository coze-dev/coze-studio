package searchstore

type Type string

const (
	TypeVikingDB      Type = "viking_db"
	TypeMilvus        Type = "milvus"
	TypeElasticSearch Type = "elastic_search"
)
