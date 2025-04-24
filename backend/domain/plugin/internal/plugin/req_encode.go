package plugin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"reflect"
	"strconv"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/shopspring/decimal"
)

type bodyEncoder func(body any) ([]byte, error)

var bodyEncoders = map[string]bodyEncoder{
	"application/json":                  jsonBodyEncoder,
	"application/json-patch+json":       jsonBodyEncoder,
	"application/octet-stream":          fileBodyEncoder,
	"application/problem+json":          jsonBodyEncoder,
	"application/x-www-form-urlencoded": urlencodedBodyEncoder,
	"application/x-yaml":                yamlBodyEncoder,
	"application/yaml":                  yamlBodyEncoder,
	"application/zip":                   zipFileBodyEncoder,
	"multipart/form-data":               multipartBodyEncoder,
	"text/csv":                          csvBodyEncoder,
	"text/plain":                        plainBodyEncoder,
}

//TODO(@maronghong): 规范 error 返回

func invalidSerializationMethodErr(sm *openapi3.SerializationMethod) error {
	return fmt.Errorf("invalid serialization method: style=%q, explode=%v", sm.Style, sm.Explode)
}

func invalidTypeErr(t any) error {
	return fmt.Errorf("invalid params type type=%t", t)
}

func nilParamError() error {
	return errors.New("param values is nil")
}

func encodeSchemaValue(_ context.Context, param *openapi3.Parameter, value any) (encodeVal string, err error) {
	sm, err := param.SerializationMethod()
	if err != nil {
		return "", err
	}

	p := paramEncoder{
		body: value,
	}

	return p.encode(sm, param)
}

type paramEncoder struct {
	body any
}

func (d *paramEncoder) encode(sm *openapi3.SerializationMethod, param *openapi3.Parameter) (string, error) {
	switch d.body.(type) {
	case map[string]any:
		return d.encodeObject(sm, param.Name)
	case []any:
		return d.encodeArray(sm, param.Name)
	default:
		return d.encodePrimitive(sm, param.Name)
	}
}

func (d *paramEncoder) encodePrimitive(sm *openapi3.SerializationMethod, paramName string) (string, error) {
	switch d.body.(type) {
	case map[any]any, []any:
		return "", invalidTypeErr(d.body)
	}
	var prefix string
	switch sm.Style {
	case "simple":
		// A prefix is empty for style "simple".
	case "label":
		prefix = "."
	case "matrix":
		prefix = ";" + url.QueryEscape(paramName) + "="
	case "form":
		result := url.QueryEscape(paramName) + "=" + url.QueryEscape(mustString(d.body))
		return result, nil
	default:
		return "", invalidSerializationMethodErr(sm)
	}

	raw := mustString(d.body)

	return prefix + raw, nil
}

func (d *paramEncoder) encodeArray(sm *openapi3.SerializationMethod, paramName string) (string, error) {
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
		return "", invalidSerializationMethodErr(sm)
	}

	value := prefix
	switch body := d.body.(type) {
	case []any:
		for i, v := range body {
			vStr := mustString(v)
			value += vStr

			if i != len(body)-1 {
				value += delim
			}
		}
	default:
		return "", invalidTypeErr(d.body)
	}
	return value, nil
}

func (d *paramEncoder) encodeObject(sm *openapi3.SerializationMethod, paramName string) (string, error) {
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
		return "", invalidSerializationMethodErr(sm)
	}

	//只允许有一层map,且map只允许简单类型
	res := prefix
	switch body := d.body.(type) {
	case map[string]any:
		for k, v := range body {
			vStr := mustString(v)
			res += k + valueDelim + vStr + propsDelim
		}

		if len(body) > 0 && len(res) > 0 {
			res = res[:len(res)-1]
		}

		return res, nil
	default:
		return "", invalidTypeErr(d.body)
	}
}

func isNilValue(value any) bool {
	if value == nil {
		return true
	}

	switch reflect.TypeOf(value).Kind() {
	case reflect.Ptr, reflect.Map, reflect.Array, reflect.Chan, reflect.Slice:
		return reflect.ValueOf(value).IsNil()
	default:
		return false
	}
}

func mustString(value any) string {
	if isNilValue(value) {
		return ""
	}

	switch v := value.(type) {
	case string:
		return v
	case int64:
		return strconv.FormatInt(v, 10)
	case float64:
		d := decimal.NewFromFloat(v)
		return d.String()
	default:
		b, _ := json.Marshal(value)
		return string(b)
	}
}

func tryString(value any) (string, error) {
	if isNilValue(value) {
		return "", errors.New("value is nil")
	}

	switch v := value.(type) {
	case string:
		return v, nil
	case int64:
		return strconv.FormatInt(v, 10), nil
	case float64:
		d := decimal.NewFromFloat(v)
		return d.String(), nil
	case json.Number:
		return v.String(), nil
	default:
		return "", fmt.Errorf("can not convert type from %t to string", value)
	}
}

func tryInt64(value any) (int64, error) {
	if isNilValue(value) {
		return 0, errors.New("value is nil")
	}

	switch v := value.(type) {
	case string:
		vi64, _ := strconv.ParseInt(v, 10, 64)
		return vi64, nil
	case int64:
		return v, nil
	case float64:
		return int64(v), nil
	case json.Number:
		vi64, _ := strconv.ParseInt(v.String(), 10, 64)
		return vi64, nil
	default:
		return 0, fmt.Errorf("can not convert type from %t to int64", value)
	}
}

func tryBool(value any) (bool, error) {
	if isNilValue(value) {
		return false, errors.New("value is nil")
	}

	switch v := value.(type) {
	case string:
		return strconv.ParseBool(v)
	case bool:
		return v, nil
	default:
		return false, fmt.Errorf("can not convert type from %t to bool", value)
	}
}

func tryFloat64(value any) (float64, error) {
	if isNilValue(value) {
		return 0, errors.New("value is nil")
	}

	switch v := value.(type) {
	case string:
		return strconv.ParseFloat(v, 64)
	case float64:
		return v, nil
	case int64:
		return float64(v), nil
	case json.Number:
		return strconv.ParseFloat(v.String(), 64)
	default:
		return 0, fmt.Errorf("can not convert type from %t to float64", value)
	}
}

func plainBodyEncoder(body any) ([]byte, error) {
	if isNilValue(body) {
		return nil, nilParamError()
	}

	switch v := body.(type) {
	case string:
		return []byte(v), nil
	default:
		return nil, invalidTypeErr(v)
	}
}

func jsonBodyEncoder(body any) ([]byte, error) {
	if isNilValue(body) {
		return nil, nilParamError()
	}

	switch reflect.TypeOf(body).Kind() {
	case reflect.Map, reflect.Array, reflect.Struct:
		return sonic.Marshal(body)
	default:
		return nil, invalidTypeErr(body)
	}
}

func yamlBodyEncoder(body any) ([]byte, error) {
	if isNilValue(body) {
		return nil, nilParamError()
	}

	switch body.(type) {
	case string:
		return []byte(body.(string)), nil
	default:
		return nil, invalidTypeErr(body)
	}
}

func urlencodedBodyEncoder(body any) ([]byte, error) {
	if isNilValue(body) {
		return nil, nilParamError()
	}

	objectStr := ""
	res := url.Values{}
	sm := &openapi3.SerializationMethod{
		Style:   "form",
		Explode: true,
	}

	switch value := body.(type) {
	case map[string]any:
		for k, v := range value {
			switch v.(type) {
			case map[string]any:
				p := paramEncoder{body: v}

				vStr, err := p.encodeObject(sm, k)
				if err != nil {
					return nil, err
				}

				if len(objectStr) > 0 {
					vStr = "&" + vStr
				}

				objectStr += vStr
			case []any:
				p := paramEncoder{body: v}

				vStr, err := p.encodeArray(sm, k)
				if err != nil {
					return nil, err
				}

				if len(objectStr) > 0 {
					vStr = "&" + vStr
				}

				objectStr += vStr
			case string:
				res.Add(k, v.(string))
			default:
				res.Add(k, mustString(v))
			}
		}

	default:
		return nil, invalidTypeErr(body)
	}

	if len(objectStr) > 0 {
		return []byte(res.Encode() + "&" + url.QueryEscape(objectStr)), nil
	}

	return []byte(res.Encode()), nil
}

func multipartBodyEncoder(body any) ([]byte, error) {
	//暂时先不支持，大模型可能解析不了这么复杂的参数
	return nil, nil
}

func fileBodyEncoder(body any) ([]byte, error) {
	if isNilValue(body) {
		return nil, nilParamError()
	}

	switch value := body.(type) {
	case string:
		return []byte(value), nil
	default:
		return nil, invalidTypeErr(body)
	}
}

func zipFileBodyEncoder(body any) ([]byte, error) {
	if isNilValue(body) {
		return nil, nilParamError()
	}

	switch value := body.(type) {
	case string:
		return []byte(value), nil
	default:
		return nil, invalidTypeErr(body)
	}
}

func csvBodyEncoder(body any) ([]byte, error) {
	if isNilValue(body) {
		return nil, nilParamError()
	}

	switch value := body.(type) {
	case string:
		return []byte(value), nil
	default:
		return nil, invalidTypeErr(body)
	}
}

func convertArgType(schemaRef *openapi3.SchemaRef, value any) (any, error) {
	if schemaRef == nil || schemaRef.Value == nil {
		return nil, fmt.Errorf("[convertArgType] schemaRef is nil")
	}

	//TODO(@maronghong): 在 tool.Extra 中增加 try 失败信息
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
		arr, ok := value.([]any)
		if !ok {
			return nil, invalidTypeErr(value)
		}

		for i, v := range arr {
			_v, err := convertArgType(schemaRef.Value.Items, v)
			if err != nil {
				return nil, err
			}

			arr[i] = _v
		}

		return arr, nil
	case openapi3.TypeObject:
		obj, ok := value.(map[string]any)
		if !ok {
			return nil, invalidTypeErr(value)
		}

		for k, v := range obj {
			prop, ok := schemaRef.Value.Properties[k]
			if !ok {
				continue
			}

			_v, err := convertArgType(prop, v)
			if err != nil {
				return nil, err
			}

			obj[k] = _v
		}

		return obj, nil
	default:
		return nil, fmt.Errorf("[convertArgType] unsupported schema type '%s'", schemaRef.Value.Type)
	}
}
