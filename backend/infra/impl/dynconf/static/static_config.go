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

package static

import (
	"fmt"
	"sync"
)

const (
	defaultBase = "/deploy"
)

type Options struct {
	absRepoRoot string // yaml文件root前缀的绝对路径
	useJson     bool   // 需要bind json文件，不指定默认bind yaml
	groups      []string
}

type OptFunc func(o *Options)

// WithAbsRepoRoot 传入自定义指定读取绝对路径/xx下的config.<xx>.(yaml,json)，例如/opt/tiger/xxx
func WithAbsRepoRoot(absRepoRoot string) OptFunc {
	return func(o *Options) {
		if len(absRepoRoot) > 0 {
			o.absRepoRoot = absRepoRoot
		}
	}
}

// WithUseJSONType 需要查找xx.json结尾的文
func WithUseJSONType(useJson bool) OptFunc {
	return func(o *Options) {
		o.useJson = useJson
	}
}

func WithGroups(groups []string) OptFunc {
	return func(o *Options) {
		o.groups = groups
	}
}

func loadOpts(opts ...OptFunc) *Options {
	o := &Options{}
	for _, opt := range opts {
		opt(o)
	}

	return o
}

var configers sync.Map // key: abs path, value: configer

// New 可传入local_config_dir指定读取自定义的绝对路径文件 `<local_config_dir>/config.<env>.<region>.<cluster>.yaml`
func getOrCreateConf(opts ...OptFunc) (configer, error) {
	options := loadOpts(opts...)
	if options.absRepoRoot == "" {
		options.absRepoRoot = defaultBase
	}

	keyFn := func(dir string, withJSON bool) string {
		fileFmt := "yaml"
		if withJSON {
			fileFmt = "json"
		}
		return dir + "_" + fileFmt
	}
	dir := options.absRepoRoot
	withJSON := options.useJson
	key := keyFn(dir, withJSON)

	val, exist := configers.Load(key)
	if exist {
		if conf, ok := val.(configer); ok {
			return conf, nil
		}
	}

	var (
		cfg configer
		err error
	)

	if withJSON {
		cfg, err = NewConfJson(dir, options.groups)
		if err != nil {
			return nil, err
		}
	} else {
		cfg, err = NewConfYaml(dir, options.groups) // 默认使用yaml
		if err != nil {
			return nil, err
		}
	}

	configers.Store(key, cfg)

	return cfg, nil
}

// JSONBind 不传dir值，按默认路径，优先级读取/opt/tiger/flowdevops/confcenter/psm/p.s.m/config.<env>.<region>.<cluster>.json
// 可使用WithAbsRepoRoot 传入自定义指定读取
func JSONBind(structPtr interface{}, opts ...OptFunc) error {
	opts = append(opts, WithUseJSONType(true))
	conf, err := getOrCreateConf(opts...)
	if err != nil {
		return fmt.Errorf("find config failed: %w", err)
	}
	return bindAndValidate(structPtr, conf)
}

// YAMLBind 不传dir值，按默认路径，按优先级读取/opt/tiger/flowdevops/confcenter/psm/p.s.m/config.<env>.<region>.<cluster>.yaml
// 可使用WithAbsRepoRoot 传入自定义指定读取
func YAMLBind(structPtr interface{}, opts ...OptFunc) error {
	conf, err := getOrCreateConf(opts...)
	if err != nil {
		return fmt.Errorf("find config failed: %w", err)
	}
	return bindAndValidate(structPtr, conf)
}

type MarshalFunc func(data interface{}) ([]byte, error)
type UnmarshalFunc func(data []byte, v interface{}) error

type configer interface {
	GetBytes() []byte
	MarshalFunc() MarshalFunc
	UnmarshalFunc() UnmarshalFunc
}

func bindAndValidate(structPtr interface{}, cnf configer) error {
	return cnf.UnmarshalFunc()(cnf.GetBytes(), structPtr)
}
