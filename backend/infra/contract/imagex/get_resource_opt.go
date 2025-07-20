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

package imagex

type GetResourceOpt func(option *GetResourceOption)

type GetResourceOption struct {
	Format   string
	Template string
	Proto    string
	Expire   int
}

func WithResourceFormat(format string) GetResourceOpt {
	return func(o *GetResourceOption) {
		o.Format = format
	}
}

func WithResourceTemplate(template string) GetResourceOpt {
	return func(o *GetResourceOption) {
		o.Template = template
	}
}

func WithResourceProto(proto string) GetResourceOpt {
	return func(o *GetResourceOption) {
		o.Proto = proto
	}
}

func WithResourceExpire(expire int) GetResourceOpt {
	return func(o *GetResourceOption) {
		o.Expire = expire
	}
}
