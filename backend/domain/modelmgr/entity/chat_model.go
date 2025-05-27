package entity

import (
	"fmt"
	"strconv"
)

type Model struct {
	ID                int64
	Name              string
	Description       string
	DefaultParameters []*Parameter

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

	Meta     ModelMeta
	Scenario Scenario
}

func (m *Model) FindParameter(name ParameterName) (*Parameter, bool) {
	if len(m.DefaultParameters) == 0 {
		return nil, false
	}

	for _, param := range m.DefaultParameters {
		if param.Name == name {
			return param, true
		}
	}

	return nil, false
}

type Parameter struct {
	Name       ParameterName  `json:"name"`
	Label      string         `json:"label"`
	Desc       string         `json:"desc"`
	Type       ValueType      `json:"type"`
	Min        string         `json:"min"`
	Max        string         `json:"max"`
	DefaultVal DefaultValue   `json:"default_val"`
	Precision  int            `json:"precision,omitempty"` // float precision, default 2
	Options    []*ParamOption `json:"options"`             // enum options
	Style      DisplayStyle   `json:"param_class"`
}

func (p *Parameter) GetFloat(tp DefaultType) (float64, error) {
	if p.Type != ValueTypeFloat {
		return 0, fmt.Errorf("unexpected paramerter type, name=%v, expect=%v, given=%v",
			p.Name, ValueTypeFloat, p.Type)
	}

	if tp != DefaultTypeDefault && p.DefaultVal[tp] == "" {
		tp = DefaultTypeDefault
	}

	val, ok := p.DefaultVal[tp]
	if !ok {
		return 0, fmt.Errorf("unexpected default type, name=%v, type=%v", p.Name, tp)
	}

	return strconv.ParseFloat(val, 64)
}

func (p *Parameter) GetInt(tp DefaultType) (int64, error) {
	if p.Type != ValueTypeInt {
		return 0, fmt.Errorf("unexpected paramerter type, name=%v, expect=%v, given=%v",
			p.Name, ValueTypeInt, p.Type)
	}

	if tp != DefaultTypeDefault && p.DefaultVal[tp] == "" {
		tp = DefaultTypeDefault
	}
	val, ok := p.DefaultVal[tp]
	if !ok {
		return 0, fmt.Errorf("unexpected default type, name=%v, type=%v", p.Name, tp)
	}
	return strconv.ParseInt(val, 10, 64)
}

func (p *Parameter) GetBool(tp DefaultType) (bool, error) {
	if p.Type != ValueTypeBoolean {
		return false, fmt.Errorf("unexpected paramerter type, name=%v, expect=%v, given=%v",
			p.Name, ValueTypeBoolean, p.Type)
	}
	if tp != DefaultTypeDefault && p.DefaultVal[tp] == "" {
		tp = DefaultTypeDefault
	}
	val, ok := p.DefaultVal[tp]
	if !ok {
		return false, fmt.Errorf("unexpected default type, name=%v, type=%v", p.Name, tp)
	}
	return strconv.ParseBool(val)
}

func (p *Parameter) GetString(tp DefaultType) (string, error) {
	if tp != DefaultTypeDefault && p.DefaultVal[tp] == "" {
		tp = DefaultTypeDefault
	}

	val, ok := p.DefaultVal[tp]
	if !ok {
		return "", fmt.Errorf("unexpected default type, name=%v, type=%v", p.Name, tp)
	}
	return val, nil
}

type DefaultValue map[DefaultType]string

type DisplayStyle struct {
	Widget Widget `json:"class_id"`
	Label  string `json:"label"`
}

type ParamOption struct {
	Label string `json:"label"`
	Value string `json:"value"`
}
