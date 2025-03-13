package main

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/infra"
)

func main() {
	var err error
	ctx := context.Background()

	err = infra.InitializeInfra(ctx)
	if err != nil {
		panic(fmt.Errorf("InitializeInfra failed, err=%w", err))
	}
}
