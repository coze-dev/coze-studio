module github.com/coze-dev/coze-studio/backend

go 1.24.0

replace github.com/apache/thrift => github.com/apache/thrift v0.13.0

replace google.golang.org/grpc => google.golang.org/grpc v1.68.0

require (
	github.com/IBM/sarama v1.45.1
	github.com/apache/rocketmq-client-go/v2 v2.1.3-0.20250427084711-67ec50b93040
	github.com/apache/thrift v0.21.0
	github.com/bytedance/mockey v1.2.14
	github.com/bytedance/sonic v1.13.2
	github.com/cloudwego/eino v0.3.55
	github.com/cloudwego/eino-ext/components/model/ark v0.1.15
	github.com/cloudwego/eino-ext/components/model/claude v0.1.1
	github.com/cloudwego/eino-ext/components/model/deepseek v0.0.0-20250715055739-0d0e28441a2f
	github.com/cloudwego/eino-ext/components/model/openai v0.0.0-20250715055739-0d0e28441a2f
	github.com/cloudwego/eino-ext/libs/acl/openai v0.0.0-20250626133421-3c142631c961
	github.com/cloudwego/hertz v0.10.0
	github.com/elastic/go-elasticsearch/v8 v8.18.0
	github.com/getkin/kin-openapi v0.118.0
	github.com/go-resty/resty/v2 v2.16.5
	github.com/hertz-contrib/sse v0.1.0
	github.com/joho/godotenv v1.5.1
	github.com/matoous/go-nanoid v1.5.1
	github.com/milvus-io/milvus-proto/go-api/v2 v2.5.0-beta.0.20250325034212-6e98baa34971 // indirect
	github.com/nikolalohinski/gonja v1.5.3 // indirect
	github.com/onsi/gomega v1.27.3
	github.com/pingcap/tidb/pkg/parser v0.0.0-20250417044355-c5882b1f6c58
	github.com/redis/go-redis/v9 v9.7.3
	github.com/shopspring/decimal v1.4.0
	github.com/spf13/cast v1.7.1
	github.com/stretchr/testify v1.10.0
	github.com/tealeg/xlsx/v3 v3.3.13
	github.com/volcengine/volc-sdk-golang v1.0.211
	github.com/xuri/excelize/v2 v2.9.0
	go.uber.org/mock v0.5.1
	golang.org/x/exp v0.0.0-20250305212735-054e65f0b394
	golang.org/x/mod v0.25.0
	golang.org/x/sync v0.16.0
	gopkg.in/yaml.v2 v2.4.0
	gorm.io/driver/mysql v1.5.7
	gorm.io/driver/sqlite v1.4.3
	gorm.io/gen v0.3.26
	gorm.io/gorm v1.30.0
	gorm.io/plugin/dbresolver v1.6.0
)

replace parse-curl => github.com/killlowkey/parse-curl v1.0.0

require github.com/alicebob/miniredis/v2 v2.34.0

require (
	github.com/DATA-DOG/go-sqlmock v1.5.2
	github.com/aws/aws-sdk-go-v2/service/s3 v1.84.1
	github.com/cloudwego/eino-ext/components/embedding/ark v0.1.0
	github.com/cloudwego/eino-ext/components/embedding/ollama v0.0.0-20250728060543-79ec300857b8
	github.com/cloudwego/eino-ext/components/embedding/openai v0.0.0-20250522060253-ddb617598b09
	github.com/cloudwego/eino-ext/components/model/gemini v0.1.2
	github.com/cloudwego/eino-ext/components/model/ollama v0.1.0
	github.com/cloudwego/eino-ext/components/model/qwen v0.0.0-20250612061754-5a3deb091dc5
	github.com/dimchansky/utfbom v1.1.1
	github.com/elastic/go-elasticsearch/v7 v7.17.10
	github.com/extrame/xls v0.0.1
	github.com/hertz-contrib/cors v0.1.0
	github.com/jinzhu/copier v0.4.0
	github.com/mattn/go-shellwords v1.0.12
	github.com/nsqio/go-nsq v1.1.0
	github.com/ollama/ollama v0.9.6
	github.com/rbretecher/go-postman-collection v0.9.0
	github.com/volcengine/ve-tos-golang-sdk/v2 v2.7.17
	github.com/yuin/goldmark v1.4.13
	golang.org/x/image v0.22.0
	golang.org/x/oauth2 v0.23.0
	google.golang.org/genai v1.13.0
)

require (
	cloud.google.com/go v0.116.0 // indirect
	cloud.google.com/go/auth v0.9.3 // indirect
	cloud.google.com/go/compute/metadata v0.5.0 // indirect
	github.com/alicebob/gopher-json v0.0.0-20230218143504-906a9b012302 // indirect
	github.com/aws/aws-sdk-go-v2/internal/v4a v1.3.37 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/checksum v1.7.5 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/s3shared v1.18.18 // indirect
	github.com/cloudwego/gopkg v0.1.4 // indirect
	github.com/evanphx/json-patch v4.12.0+incompatible // indirect
	github.com/extrame/ole2 v0.0.0-20160812065207-d69429661ad7 // indirect
	github.com/frankban/quicktest v1.14.6 // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/google/btree v1.1.2 // indirect
	github.com/google/s2a-go v0.1.8 // indirect
	github.com/googleapis/enterprise-certificate-proxy v0.3.4 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	github.com/meguminnnnnnnnn/go-openai v0.0.0-20250620092828-0d508a1dcdde // indirect
	github.com/peterbourgon/diskv/v3 v3.0.1 // indirect
	github.com/rogpeppe/fastuuid v1.2.0 // indirect
	github.com/shabbyrobe/xmlwriter v0.0.0-20200208144257-9fca06d00ffa // indirect
	github.com/yuin/gopher-lua v1.1.1 // indirect
	go.opencensus.io v0.24.0 // indirect
)

require (
	filippo.io/edwards25519 v1.1.0 // indirect
	github.com/milvus-io/milvus/client/v2 v2.0.0-20250422183838-6b30e9ae6002
	github.com/smartystreets/goconvey v1.8.1
)

require (
	github.com/anthropics/anthropic-sdk-go v1.4.0 // indirect
	github.com/avast/retry-go v3.0.0+incompatible // indirect
	github.com/aws/aws-sdk-go-v2 v1.36.6
	github.com/aws/aws-sdk-go-v2/aws/protocol/eventstream v1.6.11 // indirect
	github.com/aws/aws-sdk-go-v2/config v1.29.1
	github.com/aws/aws-sdk-go-v2/credentials v1.17.54
	github.com/aws/aws-sdk-go-v2/feature/ec2/imds v1.16.24 // indirect
	github.com/aws/aws-sdk-go-v2/internal/configsources v1.3.37 // indirect
	github.com/aws/aws-sdk-go-v2/internal/endpoints/v2 v2.6.37 // indirect
	github.com/aws/aws-sdk-go-v2/internal/ini v1.8.1 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/accept-encoding v1.12.4 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/presigned-url v1.12.18 // indirect
	github.com/aws/aws-sdk-go-v2/service/sso v1.24.11 // indirect
	github.com/aws/aws-sdk-go-v2/service/ssooidc v1.28.10 // indirect
	github.com/aws/aws-sdk-go-v2/service/sts v1.33.9 // indirect
	github.com/aws/smithy-go v1.22.4 // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/blang/semver/v4 v4.0.0 // indirect
	github.com/bytedance/gopkg v0.1.1
	github.com/bytedance/sonic/loader v0.2.4 // indirect
	github.com/cenkalti/backoff/v4 v4.3.0 // indirect
	github.com/cespare/xxhash/v2 v2.3.0 // indirect
	github.com/cilium/ebpf v0.11.0 // indirect
	github.com/cloudwego/base64x v0.1.5 // indirect
	github.com/cloudwego/netpoll v0.7.0 // indirect
	github.com/cockroachdb/errors v1.9.1 // indirect
	github.com/cockroachdb/logtags v0.0.0-20211118104740-dabe8e521a4f // indirect
	github.com/cockroachdb/redact v1.1.3 // indirect
	github.com/cohesion-org/deepseek-go v1.3.2 // indirect
	github.com/containerd/cgroups/v3 v3.0.3 // indirect
	github.com/coreos/go-semver v0.3.0 // indirect
	github.com/coreos/go-systemd/v22 v22.3.2 // indirect
	github.com/davecgh/go-spew v1.1.2-0.20180830191138-d8f796af33cc // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/docker/go-units v0.5.0 // indirect
	github.com/dustin/go-humanize v1.0.1 // indirect
	github.com/eapache/go-resiliency v1.7.0 // indirect
	github.com/eapache/go-xerial-snappy v0.0.0-20230731223053-c322873962e3 // indirect
	github.com/eapache/queue v1.1.0 // indirect
	github.com/elastic/elastic-transport-go/v8 v8.7.0 // indirect
	github.com/emirpasic/gods v1.18.1 // indirect
	github.com/form3tech-oss/jwt-go v3.2.3+incompatible // indirect
	github.com/fsnotify/fsnotify v1.9.0 // indirect
	github.com/getsentry/sentry-go v0.34.0 // indirect
	github.com/go-ini/ini v1.67.0 // indirect
	github.com/go-logr/logr v1.4.2 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/go-ole/go-ole v1.2.6 // indirect
	github.com/go-openapi/jsonpointer v0.21.1 // indirect
	github.com/go-openapi/swag v0.23.1 // indirect
	github.com/go-sql-driver/mysql v1.9.0 // indirect
	github.com/goccy/go-json v0.10.5 // indirect
	github.com/godbus/dbus/v5 v5.0.4 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang/mock v1.7.0-rc.1 // indirect
	github.com/golang/protobuf v1.5.4 // indirect
	github.com/golang/snappy v1.0.0 // indirect
	github.com/google/go-cmp v0.7.0 // indirect
	github.com/google/pprof v0.0.0-20250302191652-9094ed2288e7 // indirect
	github.com/google/uuid v1.6.0
	github.com/goph/emperror v0.17.2 // indirect
	github.com/gopherjs/gopherjs v1.17.2 // indirect
	github.com/gorilla/websocket v1.5.3 // indirect
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0 // indirect
	github.com/grpc-ecosystem/go-grpc-prometheus v1.2.0 // indirect
	github.com/grpc-ecosystem/grpc-gateway v1.16.0 // indirect
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.16.0 // indirect
	github.com/hashicorp/errwrap v1.1.0 // indirect
	github.com/hashicorp/go-multierror v1.1.1 // indirect
	github.com/hashicorp/go-uuid v1.0.3 // indirect
	github.com/invopop/yaml v0.1.0 // indirect
	github.com/jcmturner/aescts/v2 v2.0.0 // indirect
	github.com/jcmturner/dnsutils/v2 v2.0.0 // indirect
	github.com/jcmturner/gofork v1.7.6 // indirect
	github.com/jcmturner/gokrb5/v8 v8.4.4 // indirect
	github.com/jcmturner/rpc/v2 v2.0.3 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/jmespath/go-jmespath v0.4.0 // indirect
	github.com/jonboulle/clockwork v0.2.2 // indirect
	github.com/josharian/intern v1.0.0 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/jtolds/gls v4.20.0+incompatible // indirect
	github.com/klauspost/compress v1.18.0 // indirect
	github.com/klauspost/cpuid/v2 v2.2.10 // indirect
	github.com/kr/pretty v0.3.1 // indirect
	github.com/kr/text v0.2.0 // indirect
	github.com/lufia/plan9stats v0.0.0-20211012122336-39d0f177ccd0 // indirect
	github.com/mailru/easyjson v0.9.0 // indirect
	github.com/mattn/go-colorable v0.1.14 // indirect
	github.com/mattn/go-sqlite3 v1.14.15 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.4 // indirect
	github.com/milvus-io/milvus/pkg/v2 v2.0.0-20250319085209-5a6b4e56d59e // indirect
	github.com/minio/crc64nvme v1.0.1 // indirect
	github.com/minio/md5-simd v1.1.2 // indirect
	github.com/minio/minio-go/v7 v7.0.90
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826
	github.com/nyaruka/phonenumbers v1.0.55 // indirect
	github.com/opencontainers/runtime-spec v1.0.2 // indirect
	github.com/panjf2000/ants/v2 v2.7.2 // indirect
	github.com/patrickmn/go-cache v2.1.0+incompatible // indirect
	github.com/pelletier/go-toml/v2 v2.2.3 // indirect
	github.com/perimeterx/marshmallow v1.1.5 // indirect
	github.com/pierrec/lz4/v4 v4.1.22 // indirect
	github.com/pingcap/errors v0.11.5-0.20240311024730-e056997136bb // indirect
	github.com/pingcap/failpoint v0.0.0-20240528011301-b51a646c7c86 // indirect
	github.com/pingcap/log v1.1.1-0.20221015072633-39906604fb81 // indirect
	github.com/pkg/errors v0.9.1
	github.com/pmezard/go-difflib v1.0.1-0.20181226105442-5d4384ee4fb2 // indirect
	github.com/power-devops/perfstat v0.0.0-20210106213030-5aafc221ea8c // indirect
	github.com/prometheus/client_golang v1.14.0 // indirect
	github.com/prometheus/client_model v0.6.0 // indirect
	github.com/prometheus/common v0.42.0 // indirect
	github.com/prometheus/procfs v0.9.0 // indirect
	github.com/rcrowley/go-metrics v0.0.0-20201227073835-cf1acfcdf475 // indirect
	github.com/richardlehane/mscfb v1.0.4 // indirect
	github.com/richardlehane/msoleps v1.0.4 // indirect
	github.com/rogpeppe/go-internal v1.14.1 // indirect
	github.com/rs/xid v1.6.0 // indirect
	github.com/samber/lo v1.27.0 // indirect
	github.com/shirou/gopsutil/v3 v3.22.9 // indirect
	github.com/sirupsen/logrus v1.9.3 // indirect
	github.com/slongfield/pyfmt v0.0.0-20220222012616-ea85ff4c361f
	github.com/smarty/assertions v1.16.0 // indirect
	github.com/soheilhy/cmux v0.1.5 // indirect
	github.com/spaolacci/murmur3 v1.1.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/tidwall/gjson v1.18.0 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.1 // indirect
	github.com/tidwall/sjson v1.2.5
	github.com/tklauser/go-sysconf v0.3.12 // indirect
	github.com/tklauser/numcpus v0.6.1 // indirect
	github.com/tmc/grpc-websocket-proxy v0.0.0-20201229170055-e5319fda7802 // indirect
	github.com/twitchyliquid64/golang-asm v0.15.1 // indirect
	github.com/uber/jaeger-client-go v2.30.0+incompatible // indirect
	github.com/volcengine/volcengine-go-sdk v1.1.20
	github.com/x448/float16 v0.8.4 // indirect
	github.com/xiang90/probing v0.0.0-20190116061207-43a291ad63a2 // indirect
	github.com/xuri/efp v0.0.0-20240408161823-9ad904a10d6d // indirect
	github.com/xuri/nfp v0.0.0-20240318013403-ab9948c2c4a7 // indirect
	github.com/yargevad/filepathx v1.0.0 // indirect
	github.com/yusufpapurcu/wmi v1.2.4 // indirect
	go.etcd.io/bbolt v1.3.6 // indirect
	go.etcd.io/etcd/api/v3 v3.5.5 // indirect
	go.etcd.io/etcd/client/pkg/v3 v3.5.5 // indirect
	go.etcd.io/etcd/client/v2 v2.305.5 // indirect
	go.etcd.io/etcd/client/v3 v3.5.5 // indirect
	go.etcd.io/etcd/pkg/v3 v3.5.5 // indirect
	go.etcd.io/etcd/raft/v3 v3.5.5 // indirect
	go.etcd.io/etcd/server/v3 v3.5.5 // indirect
	go.opentelemetry.io/auto/sdk v1.1.0 // indirect
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.54.0 // indirect
	go.opentelemetry.io/otel v1.36.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.20.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc v1.20.0 // indirect
	go.opentelemetry.io/otel/metric v1.36.0 // indirect
	go.opentelemetry.io/otel/sdk v1.36.0 // indirect
	go.opentelemetry.io/otel/trace v1.36.0 // indirect
	go.opentelemetry.io/proto/otlp v1.0.0 // indirect
	go.uber.org/atomic v1.11.0 // indirect
	go.uber.org/automaxprocs v1.5.3 // indirect
	go.uber.org/multierr v1.11.0 // indirect
	go.uber.org/zap v1.27.0 // indirect
	golang.org/x/arch v0.15.0 // indirect
	golang.org/x/crypto v0.39.0
	golang.org/x/net v0.41.0 // indirect
	golang.org/x/sys v0.33.0 // indirect
	golang.org/x/text v0.26.0 // indirect
	golang.org/x/time v0.11.0 // indirect
	golang.org/x/tools v0.33.0 // indirect
	google.golang.org/genproto v0.0.0-20240903143218-8af14fe29dc1 // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20240903143218-8af14fe29dc1 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20250311190419-81fb87f6b8bf // indirect
	google.golang.org/grpc v1.71.0 // indirect
	google.golang.org/protobuf v1.36.6 // indirect
	gopkg.in/inf.v0 v0.9.1 // indirect
	gopkg.in/natefinch/lumberjack.v2 v2.2.1 // indirect
	gopkg.in/yaml.v3 v3.0.1
	gorm.io/datatypes v1.1.1-0.20230130040222-c43177d3cf8c // indirect
	gorm.io/driver/postgres v1.5.11 // indirect
	gorm.io/hints v1.1.0 // indirect
	k8s.io/apimachinery v0.28.6 // indirect
	sigs.k8s.io/yaml v1.3.0 // indirect
	stathat.com/c/consistent v1.0.0 // indirect
)
