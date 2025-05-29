package entity

import "code.byted.org/flow/opencoze/backend/api/model/crossdomain/modelmgr"

type Model struct {
	*modelmgr.Model
}

type ModelMeta = modelmgr.ModelMeta

type ModelMetaStatus = modelmgr.ModelMetaStatus

func (m *Model) FindParameter(name modelmgr.ParameterName) (*modelmgr.Parameter, bool) {
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
