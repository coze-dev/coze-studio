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

package encoder

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strconv"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/shopspring/decimal"
	"gopkg.in/yaml.v3"

	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
)

func EncodeBodyWithContentType(contentType string, body map[string]any) ([]byte, error) {
	switch contentType {
	case consts.MediaTypeJson, consts.MediaTypeProblemJson:
		return jsonBodyEncoder(body)
	case consts.MediaTypeFormURLEncoded:
		return urlencodedBodyEncoder(body)
	case consts.MediaTypeYaml, consts.MediaTypeXYaml:
		return yamlBodyEncoder(body)
	default:
		return nil, fmt.Errorf("[EncodeBodyWithContentType] unsupported contentType=%s", contentType)
	}
}

func jsonBodyEncoder(body map[string]any) ([]byte, error) {
	b, err := sonic.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("[jsonBodyEncoder] failed to marshal body, err=%v", err)
	}

	return b, nil
}

func yamlBodyEncoder(body map[string]any) ([]byte, error) {
	b, err := yaml.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("[yamlBodyEncoder] failed to marshal body, err=%v", err)
	}

	return b, nil
}

func urlencodedBodyEncoder(body map[string]any) ([]byte, error) {
	objectStr := ""
	res := url.Values{}
	sm := &openapi3.SerializationMethod{
		Style:   openapi3.SerializationForm,
		Explode: true,
	}

	for k, value := range body {
		switch val := value.(type) {
		case map[string]any:
			vStr, err := encodeObjectParam(sm, k, val)
			if err != nil {
				return nil, err
			}

			if len(objectStr) > 0 {
				vStr = "&" + vStr
			}

			objectStr += vStr
		case []any:
			vStr, err := encodeArrayParam(sm, k, val)
			if err != nil {
				return nil, err
			}

			if len(objectStr) > 0 {
				vStr = "&" + vStr
			}

			objectStr += vStr
		case string:
			res.Add(k, val)
		default:
			res.Add(k, MustString(val))
		}
	}

	if len(objectStr) > 0 {
		return []byte(res.Encode() + "&" + url.QueryEscape(objectStr)), nil
	}

	return []byte(res.Encode()), nil
}

func EncodeParameter(param *openapi3.Parameter, value any) (string, error) {
	sm, err := param.SerializationMethod()
	if err != nil {
		return "", err
	}

	switch v := value.(type) {
	case map[string]any:
		return encodeObjectParam(sm, param.Name, v)
	case []any:
		return encodeArrayParam(sm, param.Name, v)
	default:
		return encodePrimitiveParam(sm, param.Name, v)
	}
}

func encodePrimitiveParam(sm *openapi3.SerializationMethod, paramName string, val any) (string, error) {
	var prefix string
	switch sm.Style {
	case openapi3.SerializationSimple:
		// A prefix is empty for style "simple".
	case openapi3.SerializationLabel:
		prefix = "."
	case openapi3.SerializationMatrix:
		prefix = ";" + url.QueryEscape(paramName) + "="
	case openapi3.SerializationForm:
		result := url.QueryEscape(paramName) + "=" + url.QueryEscape(MustString(val))
		return result, nil
	default:
		return "", fmt.Errorf("invalid serialization method: style=%q, explode=%v", sm.Style, sm.Explode)
	}

	raw := MustString(val)

	return prefix + raw, nil
}

func encodeArrayParam(sm *openapi3.SerializationMethod, paramName string, arrVal []any) (string, error) {
	var prefix, delim string
	switch {
	case sm.Style == openapi3.SerializationMatrix && !sm.Explode:
		prefix = ";" + paramName + "="
		delim = ","
	case sm.Style == openapi3.SerializationMatrix && sm.Explode:
		prefix = ";" + paramName + "="
		delim = ";" + paramName + "="
	case sm.Style == openapi3.SerializationLabel && !sm.Explode:
		prefix = "."
		delim = ","
	case sm.Style == openapi3.SerializationLabel && sm.Explode:
		prefix = "."
		delim = "."
	case sm.Style == openapi3.SerializationForm && sm.Explode:
		prefix = paramName + "="
		delim = "&" + paramName + "="
	case sm.Style == openapi3.SerializationForm && !sm.Explode:
		prefix = paramName + "="
		delim = ","
	case sm.Style == openapi3.SerializationSimple:
		delim = ","
	case sm.Style == openapi3.SerializationSpaceDelimited && !sm.Explode:
		delim = ","
	case sm.Style == openapi3.SerializationPipeDelimited && !sm.Explode:
		delim = "|"
	default:
		return "", fmt.Errorf("invalid serialization method: style=%q, explode=%v", sm.Style, sm.Explode)
	}

	res := prefix

	for i, val := range arrVal {
		vStr := MustString(val)
		res += vStr

		if i != len(arrVal)-1 {
			res += delim
		}
	}

	return res, nil
}

func encodeObjectParam(sm *openapi3.SerializationMethod, paramName string, mapVal map[string]any) (string, error) {
	var prefix, propsDelim, valueDelim string

	switch {
	case sm.Style == openapi3.SerializationSimple && !sm.Explode:
		propsDelim = ","
		valueDelim = ","
	case sm.Style == openapi3.SerializationSimple && sm.Explode:
		propsDelim = ","
		valueDelim = "="
	case sm.Style == openapi3.SerializationLabel && !sm.Explode:
		prefix = "."
		propsDelim = "."
		valueDelim = "."
	case sm.Style == openapi3.SerializationLabel && sm.Explode:
		prefix = "."
		propsDelim = "."
		valueDelim = "="
	case sm.Style == openapi3.SerializationMatrix && !sm.Explode:
		prefix = ";" + paramName + "="
		propsDelim = ","
		valueDelim = ","
	case sm.Style == openapi3.SerializationMatrix && sm.Explode:
		prefix = ";"
		propsDelim = ";"
		valueDelim = "="
	case sm.Style == openapi3.SerializationForm && !sm.Explode:
		prefix = paramName + "="
		propsDelim = ","
		valueDelim = ","
	case sm.Style == openapi3.SerializationForm && sm.Explode:
		propsDelim = "&"
		valueDelim = "="
	case sm.Style == openapi3.SerializationSpaceDelimited && !sm.Explode:
		propsDelim = " "
		valueDelim = " "
	case sm.Style == openapi3.SerializationPipeDelimited && !sm.Explode:
		propsDelim = "|"
		valueDelim = "|"
	case sm.Style == openapi3.SerializationDeepObject && sm.Explode:
		prefix = paramName + "["
		propsDelim = "&color["
		valueDelim = "]="
	default:
		return "", fmt.Errorf("invalid serialization method: style=%s, explode=%t", sm.Style, sm.Explode)
	}

	res := prefix
	for k, val := range mapVal {
		vStr := MustString(val)
		res += k + valueDelim + vStr + propsDelim
	}

	if len(mapVal) > 0 && len(res) > 0 {
		res = res[:len(res)-1]
	}

	return res, nil
}

func MustString(value any) string {
	if value == nil {
		return ""
	}

	switch val := value.(type) {
	case string:
		return val
	default:
		b, _ := json.Marshal(val)
		return string(b)
	}
}

func TryCorrectValueType(paramName string, schemaRef *openapi3.SchemaRef, value any) (any, error) {
	if value == nil {
		return "", fmt.Errorf("value of '%s' is nil", paramName)
	}

	switch schemaRef.Value.Type {
	case openapi3.TypeString:
		return tryCorrectString(value)
	case openapi3.TypeNumber:
		return tryCorrectFloat64(value)
	case openapi3.TypeInteger:
		return tryCorrectInt64(value)
	case openapi3.TypeBoolean:
		return tryCorrectBool(value)
	case openapi3.TypeArray:
		arrVal, ok := value.([]any)
		if !ok {
			return nil, fmt.Errorf("[TryCorrectValueType] value '%s' is not array", paramName)
		}

		for i, v := range arrVal {
			_v, err := TryCorrectValueType(paramName, schemaRef.Value.Items, v)
			if err != nil {
				return nil, err
			}

			arrVal[i] = _v
		}

		return arrVal, nil
	case openapi3.TypeObject:
		mapVal, ok := value.(map[string]any)
		if !ok {
			return nil, fmt.Errorf("[TryCorrectValueType] value '%s' is not object", paramName)
		}

		for k, v := range mapVal {
			p, ok := schemaRef.Value.Properties[k]
			if !ok {
				continue
			}

			_v, err := TryCorrectValueType(k, p, v)
			if err != nil {
				return nil, err
			}

			mapVal[k] = _v
		}

		return mapVal, nil
	default:
		return nil, fmt.Errorf("[TryCorrectValueType] unsupported schema type '%s'", schemaRef.Value.Type)
	}
}

func tryCorrectString(value any) (string, error) {
	switch val := value.(type) {
	case string:
		return val, nil
	case int64:
		return strconv.FormatInt(val, 10), nil
	case float64:
		d := decimal.NewFromFloat(val)
		return d.String(), nil
	case json.Number:
		return val.String(), nil
	default:
		b, err := sonic.MarshalString(value)
		if err != nil {
			return "", fmt.Errorf("tryCorrectString failed, err=%w", err)
		}
		return b, nil
	}
}

func tryCorrectInt64(value any) (int64, error) {
	switch val := value.(type) {
	case string:
		vi64, _ := strconv.ParseInt(val, 10, 64)
		return vi64, nil
	case int64:
		return val, nil
	case float64:
		return int64(val), nil
	case json.Number:
		vi64, _ := strconv.ParseInt(val.String(), 10, 64)
		return vi64, nil
	default:
		return 0, fmt.Errorf("cannot convert type from '%T' to int64", val)
	}
}

func tryCorrectBool(value any) (bool, error) {
	switch val := value.(type) {
	case string:
		return strconv.ParseBool(val)
	case bool:
		return val, nil
	default:
		return false, fmt.Errorf("cannot convert type from '%T' to bool", val)
	}
}

func tryCorrectFloat64(value any) (float64, error) {
	switch val := value.(type) {
	case string:
		return strconv.ParseFloat(val, 64)
	case float64:
		return val, nil
	case int64:
		return float64(val), nil
	case json.Number:
		return strconv.ParseFloat(val.String(), 64)
	default:
		return 0, fmt.Errorf("cannot convert type from '%T' to float64", val)
	}
}
