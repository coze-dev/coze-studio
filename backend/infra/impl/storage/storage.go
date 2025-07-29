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

package storage

import (
	"context"
	"fmt"
	"os"

	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/infra/impl/storage/minio"
	"github.com/coze-dev/coze-studio/backend/infra/impl/storage/s3"
	"github.com/coze-dev/coze-studio/backend/infra/impl/storage/tos"
	"github.com/coze-dev/coze-studio/backend/types/consts"
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
	case "s3":
		return s3.New(
			ctx,
			os.Getenv(consts.S3AccessKey),
			os.Getenv(consts.S3SecretKey),
			os.Getenv(consts.StorageBucket),
			os.Getenv(consts.S3Endpoint),
			os.Getenv(consts.S3Region),
		)
	}

	return nil, fmt.Errorf("unknown storage type: %s", storageType)
}

func NewImagex(ctx context.Context) (imagex.ImageX, error) {
	storageType := os.Getenv(consts.StorageType)
	switch storageType {
	case "minio":
		return minio.NewStorageImagex(
			ctx,
			os.Getenv(consts.MinIOEndpoint),
			os.Getenv(consts.MinIOAK),
			os.Getenv(consts.MinIOSK),
			os.Getenv(consts.StorageBucket),
			false,
		)
	case "tos":
		return tos.NewStorageImagex(
			ctx,
			os.Getenv(consts.TOSAccessKey),
			os.Getenv(consts.TOSSecretKey),
			os.Getenv(consts.StorageBucket),
			os.Getenv(consts.TOSEndpoint),
			os.Getenv(consts.TOSRegion),
		)
	case "s3":
		return s3.NewStorageImagex(
			ctx,
			os.Getenv(consts.S3AccessKey),
			os.Getenv(consts.S3SecretKey),
			os.Getenv(consts.StorageBucket),
			os.Getenv(consts.S3Endpoint),
			os.Getenv(consts.S3Region),
		)
	}
	return nil, fmt.Errorf("unknown storage type: %s", storageType)
}
