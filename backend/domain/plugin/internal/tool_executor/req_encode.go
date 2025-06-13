package tool_executor

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strconv"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/shopspring/decimal"
	"gopkg.in/yaml.v3"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
)

func encodeBodyWithContentType(contentType string, body map[string]any) ([]byte, error) {
	switch contentType {
	case plugin.MediaTypeJson, plugin.MediaTypeProblemJson:
		return jsonBodyEncoder(body)
	case plugin.MediaTypeFormURLEncoded:
		return urlencodedBodyEncoder(body)
	case plugin.MediaTypeYaml, plugin.MediaTypeXYaml:
		return yamlBodyEncoder(body)
	default:
		return nil, fmt.Errorf("[encodeBodyWithContentType] unsupported contentType=%s", contentType)
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
		Style:   "form",
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
			res.Add(k, mustString(val))
		}
	}

	if len(objectStr) > 0 {
		return []byte(res.Encode() + "&" + url.QueryEscape(objectStr)), nil
	}

	return []byte(res.Encode()), nil
}

func encodeParameter(param *openapi3.Parameter, value any) (string, error) {
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
	case "simple":
		// A prefix is empty for style "simple".
	case "label":
		prefix = "."
	case "matrix":
		prefix = ";" + url.QueryEscape(paramName) + "="
	case "form":
		result := url.QueryEscape(paramName) + "=" + url.QueryEscape(mustString(val))
		return result, nil
	default:
		return "", fmt.Errorf("invalid serialization method: style=%q, explode=%v", sm.Style, sm.Explode)
	}

	raw := mustString(val)

	return prefix + raw, nil
}

func encodeArrayParam(sm *openapi3.SerializationMethod, paramName string, arrVal []any) (string, error) {
	var prefix, delim string
	switch {
	case sm.Style == "matrix" && !sm.Explode:
		prefix = ";" + paramName + "="
		delim = ","
	case sm.Style == "matrix" && sm.Explode:
		prefix = ";" + paramName + "="
		delim = ";" + paramName + "="
	case sm.Style == "label" && !sm.Explode:
		prefix = "."
		delim = ","
	case sm.Style == "label" && sm.Explode:
		prefix = "."
		delim = "."
	case sm.Style == "form" && sm.Explode:
		prefix = paramName + "="
		delim = "&" + paramName + "="
	case sm.Style == "form" && !sm.Explode:
		prefix = paramName + "="
		delim = ","
	case sm.Style == "simple":
		delim = ","
	case sm.Style == "spaceDelimited" && !sm.Explode:
		delim = ","
	case sm.Style == "pipeDelimited" && !sm.Explode:
		delim = "|"
	default:
		return "", fmt.Errorf("invalid serialization method: style=%q, explode=%v", sm.Style, sm.Explode)
	}

	res := prefix

	for i, val := range arrVal {
		vStr := mustString(val)
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
	case sm.Style == "simple" && !sm.Explode:
		propsDelim = ","
		valueDelim = ","
	case sm.Style == "simple" && sm.Explode:
		propsDelim = ","
		valueDelim = "="
	case sm.Style == "label" && !sm.Explode:
		prefix = "."
		propsDelim = "."
		valueDelim = "."
	case sm.Style == "label" && sm.Explode:
		prefix = "."
		propsDelim = "."
		valueDelim = "="
	case sm.Style == "matrix" && !sm.Explode:
		prefix = ";" + paramName + "="
		propsDelim = ","
		valueDelim = ","
	case sm.Style == "matrix" && sm.Explode:
		prefix = ";"
		propsDelim = ";"
		valueDelim = "="
	case sm.Style == "form" && !sm.Explode:
		prefix = paramName + "="
		propsDelim = ","
		valueDelim = ","
	case sm.Style == "form" && sm.Explode:
		propsDelim = "&"
		valueDelim = "="
	case sm.Style == "spaceDelimited" && !sm.Explode:
		propsDelim = " "
		valueDelim = " "
	case sm.Style == "pipeDelimited" && !sm.Explode:
		propsDelim = "|"
		valueDelim = "|"
	case sm.Style == "deepObject" && sm.Explode:
		prefix = paramName + "["
		propsDelim = "&color["
		valueDelim = "]="
	default:
		return "", fmt.Errorf("invalid serialization method: style=%s, explode=%t", sm.Style, sm.Explode)
	}

	res := prefix
	for k, val := range mapVal {
		vStr := mustString(val)
		res += k + valueDelim + vStr + propsDelim
	}

	if len(mapVal) > 0 && len(res) > 0 {
		res = res[:len(res)-1]
	}

	return res, nil
}

func mustString(value any) string {
	if value == nil {
		return ""
	}

	switch val := value.(type) {
	case string:
		return val
	case int64:
		return strconv.FormatInt(val, 10)
	case float64:
		d := decimal.NewFromFloat(val)
		return d.String()
	default:
		b, _ := json.Marshal(val)
		return string(b)
	}
}

func tryFixValueType(paramName string, schemaRef *openapi3.SchemaRef, value any) (any, error) {
	if value == nil {
		return "", fmt.Errorf("value of '%s' is nil", paramName)
	}

	// TODO(@maronghong): 在 tool.Extra 中增加 try 失败信息
	switch schemaRef.Value.Type {
	case openapi3.TypeString:
		return tryString(value)
	case openapi3.TypeNumber:
		return tryFloat64(value)
	case openapi3.TypeInteger:
		return tryInt64(value)
	case openapi3.TypeBoolean:
		return tryBool(value)
	case openapi3.TypeArray:
		arrVal, ok := value.([]any)
		if !ok {
			return nil, fmt.Errorf("[tryFixValueType] value '%s' is not array", paramName)
		}

		for i, v := range arrVal {
			_v, err := tryFixValueType(paramName, schemaRef.Value.Items, v)
			if err != nil {
				return nil, err
			}

			arrVal[i] = _v
		}

		return arrVal, nil
	case openapi3.TypeObject:
		mapVal, ok := value.(map[string]any)
		if !ok {
			return nil, fmt.Errorf("[tryFixValueType] value '%s' is not object", paramName)
		}

		for k, v := range mapVal {
			p, ok := schemaRef.Value.Properties[k]
			if !ok {
				continue
			}

			_v, err := tryFixValueType(k, p, v)
			if err != nil {
				return nil, err
			}

			mapVal[k] = _v
		}

		return mapVal, nil
	default:
		return nil, fmt.Errorf("[tryFixValueType] unsupported schema type '%s'", schemaRef.Value.Type)
	}
}

func tryString(value any) (string, error) {
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
		return "", fmt.Errorf("cannot convert type from '%T' to string", val)
	}
}

func tryInt64(value any) (int64, error) {
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

func tryBool(value any) (bool, error) {
	switch val := value.(type) {
	case string:
		return strconv.ParseBool(val)
	case bool:
		return val, nil
	default:
		return false, fmt.Errorf("cannot convert type from '%T' to bool", val)
	}
}

func tryFloat64(value any) (float64, error) {
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
