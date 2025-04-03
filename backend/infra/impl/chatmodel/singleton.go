package chatmodel

import (
	"sync"

	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
)

var (
	once             sync.Once
	singletonFactory chatmodel.Factory
)

func InitSingletonFactory(factory chatmodel.Factory) {
	once.Do(func() {
		singletonFactory = factory
	})
}

func GetSingletonFactory() chatmodel.Factory {
	return singletonFactory
}
