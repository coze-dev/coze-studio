package storage

import (
	"context"
	"fmt"
	"os"

	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/storage/minio"
	"code.byted.org/flow/opencoze/backend/infra/impl/storage/tos"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

type Storage = storage.Storage

func New(ctx context.Context) (Storage, error) {
	storageType := os.Getenv(consts.StorageType)
	switch storageType {
	case "minio":
		return minio.New(
			ctx,
			os.Getenv(consts.MinIOEndpoint),
			os.Getenv(consts.MinIOAK),
			os.Getenv(consts.MinIOSK),
			os.Getenv(consts.StorageBucket),
			false,
		)
	case "tos":
		return tos.New(
			ctx,
			os.Getenv(consts.TOSAccessKey),
			os.Getenv(consts.TOSSecretKey),
			os.Getenv(consts.StorageBucket),
			os.Getenv(consts.TOSEndpoint),
			os.Getenv(consts.TOSRegion),
		)
	}

	return nil, fmt.Errorf("unknown storage type: %s", storageType)
}
