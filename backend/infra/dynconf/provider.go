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

package dynconf

import "context"

//  zookeeper, etcd, nacos

type Provider interface {
	Initialize(ctx context.Context, namespace, group string, opts ...Option) (DynamicClient, error)
}

type DynamicClient interface {
	AddListener(key string, callback func(value string, err error)) error
	RemoveListener(key string) error
	Get(ctx context.Context, key string) (string, error)
}

type options struct{}

type Option struct {
	apply func(opts *options)

	implSpecificOptFn any
}
