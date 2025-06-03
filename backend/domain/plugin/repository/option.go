package repository

import (
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal"
)

type PluginSelectedOptions func(*dal.PluginSelectedOption)

func WithPluginID() PluginSelectedOptions {
	return func(opts *dal.PluginSelectedOption) {
		opts.PluginID = true
	}
}

func WithPluginOpenapiDoc() PluginSelectedOptions {
	return func(opts *dal.PluginSelectedOption) {
		opts.OpenapiDoc = true
	}
}

func WithPluginVersion() PluginSelectedOptions {
	return func(opts *dal.PluginSelectedOption) {
		opts.Version = true
	}
}

type ToolSelectedOptions func(option *dal.ToolSelectedOption)

func WithToolID() ToolSelectedOptions {
	return func(opts *dal.ToolSelectedOption) {
		opts.ToolID = true
	}
}

func WithToolActivatedStatus() ToolSelectedOptions {
	return func(opts *dal.ToolSelectedOption) {
		opts.ActivatedStatus = true
	}
}

func WithToolDebugStatus() ToolSelectedOptions {
	return func(opts *dal.ToolSelectedOption) {
		opts.DebugStatus = true
	}
}
