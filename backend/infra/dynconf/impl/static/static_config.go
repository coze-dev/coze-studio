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
	absRepoRoot string // Absolute path to root prefix of yaml file
	useJson     bool   // Requires bind json file, does not specify default bind yaml
	groups      []string
}

type OptFunc func(o *Options)

// WithAbsRepoRoot pass in a custom specified read config. < xx >. (yaml, json) under the absolute path/xx, for example/opt/tiger/xxx
func WithAbsRepoRoot(absRepoRoot string) OptFunc {
	return func(o *Options) {
		if len(absRepoRoot) > 0 {
			o.absRepoRoot = absRepoRoot
		}
	}
}

// WithUseJSONType needs to find the text at the end of xx.json
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

// New can be passed in local_config_dir specify to read the custom absolute path file '< local_config_dir >/config. < env >. < region >. < cluster > .yaml'
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
		cfg, err = NewConfYaml(dir, options.groups) // Default use yaml
		if err != nil {
			return nil, err
		}
	}

	configers.Store(key, cfg)

	return cfg, nil
}

// JSONBind does not pass the dir value, according to the default path, the priority is to read/opt/tiger/flowdevops/confcenter/psm/p.s.m/config. < env >. < region >. < cluster > .json
// Custom specified reads can be passed in using WithAbsRepoRoot
func JSONBind(structPtr interface{}, opts ...OptFunc) error {
	opts = append(opts, WithUseJSONType(true))
	conf, err := getOrCreateConf(opts...)
	if err != nil {
		return fmt.Errorf("find config failed: %w", err)
	}
	return bindAndValidate(structPtr, conf)
}

// YAMLBind does not pass the dir value, according to the default path, read/opt/tiger/flowdevops/confcenter/psm/p.s.m/config by priority. < env >. < region >. < cluster > .yaml
// Custom specified reads can be passed in using WithAbsRepoRoot
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
