package appinfra

import (
	"context"
	"fmt"
	"os"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/cache/redis"
	"code.byted.org/flow/opencoze/backend/infra/impl/es8"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/imagex/veimagex"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
	"code.byted.org/flow/opencoze/backend/infra/impl/storage/minio"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

type AppDependencies struct {
	DB                    *gorm.DB
	CacheCli              *redis.Client
	IDGenSVC              idgen.IDGenerator
	ESClient              *es8.Client
	ImageXClient          imagex.ImageX
	TOSClient             storage.Storage
	ResourceEventProducer eventbus.Producer
	AppEventProducer      eventbus.Producer
}

func Init(ctx context.Context) (*AppDependencies, error) {
	deps := &AppDependencies{}
	var err error

	deps.DB, err = mysql.New()
	if err != nil {
		return nil, err
	}

	deps.CacheCli = redis.New()

	deps.IDGenSVC, err = idgen.New(deps.CacheCli)
	if err != nil {
		return nil, err
	}

	deps.ESClient, err = es8.New()
	if err != nil {
		return nil, err
	}

	deps.ImageXClient, err = initImageX()
	if err != nil {
		return nil, err
	}

	deps.TOSClient, err = initTOS(ctx)
	if err != nil {
		return nil, err
	}

	deps.ResourceEventProducer, err = initResourceEventbusProducer()
	if err != nil {
		return nil, err
	}

	deps.AppEventProducer, err = initAppEventProducer()
	if err != nil {
		return nil, err
	}

	return deps, nil
}

func initImageX() (imagex.ImageX, error) {
	return veimagex.New(
		os.Getenv(consts.VeImageXAK),
		os.Getenv(consts.VeImageXSK),
		os.Getenv(consts.VeImageXDomain),
		os.Getenv(consts.VeImageXUploadHost),
		os.Getenv(consts.VeImageXTemplate),
		[]string{os.Getenv(consts.VeImageXServerID)},
	)
}

func initTOS(ctx context.Context) (storage.Storage, error) {
	return minio.New(
		ctx,
		os.Getenv(consts.MinIOEndpoint),
		os.Getenv(consts.MinIO_AK),
		os.Getenv(consts.MinIO_SK),
		os.Getenv(consts.MinIOBucket),
		false,
	)
}

func initResourceEventbusProducer() (eventbus.Producer, error) {
	// TODO: 确定是不是要移到环境变量里面去
	resourceEventbusProducer, err := rmq.NewProducer("127.0.0.1:9876",
		"opencoze_search_resource", "search_resource", 1)
	if err != nil {
		return nil, fmt.Errorf("init resource producer failed, err=%w", err)
	}

	return resourceEventbusProducer, nil
}

func initAppEventProducer() (eventbus.Producer, error) {
	// TODO: 确定是不是要移到环境变量里面去
	appEventProducer, err := rmq.NewProducer("127.0.0.1:9876", "opencoze_search_app", "search_app", 1)
	if err != nil {
		return nil, fmt.Errorf("init search producer failed, err=%w", err)
	}

	return appEventProducer, nil
}
