
include 'unify_dependent2.thrift'
include './dep/common.thrift'

namespace js unify_dep1

typedef Foo Foo1

struct Foo {
  1: string f_key1
  2: common.Common f_key2
}
