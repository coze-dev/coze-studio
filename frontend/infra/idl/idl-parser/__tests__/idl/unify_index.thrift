namespace go unify_idx

include './unify_dependent1.thrift'
include 'unify_dependent2.thrift'

typedef unify_dependent1.Foo TFoo

union FuncRequest {
  1: unify_dependent1.Foo r_key1
  2: TFoo r_key2
}

struct FuncResponse {
  1: unify_dependent2.Number key2
}

service Example {
  FuncResponse Func(1: FuncRequest req)
} (
  api.uri_prefix = 'https://example.com'
)
