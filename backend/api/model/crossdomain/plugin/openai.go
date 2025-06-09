package plugin

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"github.com/cloudwego/eino/schema"
)

type Openapi3T openapi3.T

func (ot Openapi3T) Validate(ctx context.Context) (err error) {
	err = ptr.Of(openapi3.T(ot)).Validate(ctx)
	if err != nil {
		return fmt.Errorf("openapi validates failed, err=%v", err)
	}

	if ot.Info == nil {
		return fmt.Errorf("info is empty")
	}
	if ot.Info.Title == "" {
		return fmt.Errorf("title of info is empty")
	}
	if ot.Info.Description == "" {
		return fmt.Errorf("description of info is empty")
	}

	if len(ot.Servers) != 1 {
		return fmt.Errorf("server is required and only one server is allowed, servers=%v", ot.Servers)
	}

	serverURL := ot.Servers[0].URL
	_, err = url.Parse(serverURL)
	if err != nil {
		return fmt.Errorf("invalid server url '%s'", serverURL)
	}
	if len(serverURL) > 512 {
		return fmt.Errorf("server url '%s' too long", serverURL)
	}
	if !strings.HasPrefix(serverURL, "https://") {
		return fmt.Errorf("server url must start with 'https://'")
	}

	for _, pathItem := range ot.Paths {
		for _, op := range pathItem.Operations() {
			err = Openapi3Operation(*op).Validate()
			if err != nil {
				return err
			}
		}
	}

	return nil
}

type Openapi3Operation openapi3.Operation

func (op Openapi3Operation) Validate() (err error) {
	if op.OperationID == "" {
		return fmt.Errorf("operation id is empty")
	}
	if op.Summary == "" {
		return fmt.Errorf("summary is empty")
	}

	err = validateOpenapi3RequestBody(op.RequestBody)
	if err != nil {
		return err
	}

	err = validateOpenapi3Parameters(op.Parameters)
	if err != nil {
		return err
	}

	err = validateOpenapi3Responses(op.Responses)
	if err != nil {
		return err
	}

	return nil
}

func (op Openapi3Operation) ToEinoSchemaParameterInfo() (map[string]*schema.ParameterInfo, error) {
	convertType := func(openapiType string) schema.DataType {
		switch openapiType {
		case openapi3.TypeString:
			return schema.String
		case openapi3.TypeInteger:
			return schema.Integer
		case openapi3.TypeObject:
			return schema.Object
		case openapi3.TypeArray:
			return schema.Array
		case openapi3.TypeBoolean:
			return schema.Boolean
		case openapi3.TypeNumber:
			return schema.Number
		default:
			return schema.Null
		}
	}

	var convertReqBody func(sc *openapi3.Schema, isRequired bool) (*schema.ParameterInfo, error)
	convertReqBody = func(sc *openapi3.Schema, isRequired bool) (*schema.ParameterInfo, error) {
		if disabledParam(sc) {
			return nil, nil
		}

		paramInfo := &schema.ParameterInfo{
			Type:     convertType(sc.Type),
			Desc:     sc.Description,
			Required: isRequired,
		}

		switch sc.Type {
		case openapi3.TypeObject:
			required := slices.ToMap(sc.Required, func(e string) (string, bool) {
				return e, true
			})

			subParams := make(map[string]*schema.ParameterInfo, len(sc.Properties))
			for paramName, prop := range sc.Properties {
				subParam, err := convertReqBody(prop.Value, required[paramName])
				if err != nil {
					return nil, err
				}

				subParams[paramName] = subParam
			}

			paramInfo.SubParams = subParams
		case openapi3.TypeArray:
			ele, err := convertReqBody(sc.Items.Value, isRequired)
			if err != nil {
				return nil, err
			}

			paramInfo.ElemInfo = ele
		case openapi3.TypeString, openapi3.TypeInteger, openapi3.TypeBoolean, openapi3.TypeNumber:
			return paramInfo, nil
		default:
			return nil, fmt.Errorf("unsupported json type '%s'", sc.Type)
		}

		return paramInfo, nil
	}

	result := make(map[string]*schema.ParameterInfo)

	for _, prop := range op.Parameters {
		paramVal := prop.Value
		schemaVal := paramVal.Schema.Value
		if schemaVal.Type == openapi3.TypeObject || schemaVal.Type == openapi3.TypeArray {
			continue
		}

		if disabledParam(prop.Value.Schema.Value) {
			continue
		}

		paramInfo := &schema.ParameterInfo{
			Type:     convertType(schemaVal.Type),
			Desc:     paramVal.Description,
			Required: paramVal.Required,
		}

		if _, ok := result[paramVal.Name]; ok {
			return nil, fmt.Errorf("duplicate param name '%s'", paramVal.Name)
		}

		result[paramVal.Name] = paramInfo
	}

	if op.RequestBody == nil || op.RequestBody.Value == nil || len(op.RequestBody.Value.Content) == 0 {
		return result, nil
	}

	for _, mType := range op.RequestBody.Value.Content {
		schemaVal := mType.Schema.Value
		if len(schemaVal.Properties) == 0 {
			continue
		}

		required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
			return e, true
		})

		for paramName, prop := range schemaVal.Properties {
			paramInfo, err := convertReqBody(prop.Value, required[paramName])
			if err != nil {
				return nil, err
			}

			if _, ok := result[paramName]; ok {
				return nil, fmt.Errorf("duplicate param name '%s'", paramName)
			}

			result[paramName] = paramInfo
		}

		break // 只取一种 MIME
	}

	return result, nil
}

func validateOpenapi3RequestBody(bodyRef *openapi3.RequestBodyRef) (err error) {
	if bodyRef == nil || bodyRef.Value == nil || len(bodyRef.Value.Content) == 0 {
		return nil
	}

	body := bodyRef.Value
	if len(body.Content) != 1 {
		return fmt.Errorf("the request body only supports one MIME type")
	}

	var mType *openapi3.MediaType
	for _, ct := range contentTypeArray {
		var ok bool
		mType, ok = body.Content[ct]
		if ok {
			break
		}
	}
	if mType == nil {
		return fmt.Errorf("invalid request MIME type, the request body only the following types: [%v]",
			strings.Join(contentTypeArray, ", "))
	}

	if mType.Schema == nil || mType.Schema.Value == nil {
		return fmt.Errorf("request body schema is empty")
	}

	sc := mType.Schema.Value
	if sc.Type == "" {
		return fmt.Errorf("request body type is empty")
	}
	if sc.Type != openapi3.TypeObject {
		return fmt.Errorf("the request body only supports 'object' type")
	}

	return nil
}

func validateOpenapi3Parameters(params openapi3.Parameters) (err error) {
	if len(params) == 0 {
		return nil
	}

	for _, param := range params {
		if param == nil || param.Value == nil {
			return fmt.Errorf("parameter schema is nil")
		}

		if param.Value.In == "" {
			return fmt.Errorf("parameter location is empty")
		}
		loc := strings.ToLower(param.Value.In)
		if loc == string(ParamInBody) {
			return fmt.Errorf("the location of parameter '%s' cannot be 'body'", param.Value.Name)
		}

		if param.Value.Schema == nil || param.Value.Schema.Value == nil {
			return fmt.Errorf("parameter schema is empty")
		}

		sc := param.Value.Schema.Value
		if sc.Type == "" {
			return fmt.Errorf("parameter type is empty")
		}
		if sc.Type != openapi3.TypeString &&
			sc.Type != openapi3.TypeInteger &&
			sc.Type != openapi3.TypeNumber &&
			sc.Type != openapi3.TypeBoolean {
			return fmt.Errorf("invalid parameter type '%s'", sc.Type)
		}
	}

	return nil
}

// MIME Type
const (
	MIMETypeJson        = "application/json"
	MIMETypeProblemJson = "application/problem+json"
	MIMETypeJsonPatch   = "application/json-patch+json"
	MIMETypeForm        = "application/x-www-form-urlencoded"
	MIMETypeXYaml       = "application/x-yaml"
	MIMETypeYaml        = "application/yaml"
)

var contentTypeArray = []string{
	MIMETypeJson,
	MIMETypeJsonPatch,
	MIMETypeProblemJson,
	MIMETypeForm,
	MIMETypeXYaml,
	MIMETypeYaml,
}

func validateOpenapi3Responses(responses openapi3.Responses) (err error) {
	if len(responses) == 0 {
		return nil
	}

	// default status 不处理
	// 只处理 '200' status
	if len(responses) != 1 {
		if len(responses) != 2 {
			return fmt.Errorf("the response only supports '200' status")
		} else if _, ok := responses["default"]; !ok {
			return fmt.Errorf("the response only supports '200' status")
		}
	}

	resp, ok := responses[strconv.Itoa(http.StatusOK)]
	if !ok || resp == nil {
		return fmt.Errorf("the response only supports '200' status")
	}
	if resp.Value == nil {
		return fmt.Errorf("response value is nil")
	}
	if len(resp.Value.Content) != 1 {
		return fmt.Errorf("the response only supports 'application/json' type")
	}
	mType, ok := resp.Value.Content[MIMETypeJson]
	if !ok || mType == nil {
		return fmt.Errorf("the response only supports 'application/json' type")
	}
	if mType.Schema == nil || mType.Schema.Value == nil {
		return fmt.Errorf("response schema is empty")
	}

	sc := mType.Schema.Value
	if sc.Type == "" {
		return fmt.Errorf("response type is empty")
	}
	if sc.Type != openapi3.TypeObject {
		return fmt.Errorf("the response only supports 'object' type")
	}

	return nil
}

func disabledParam(schemaVal *openapi3.Schema) bool {
	if len(schemaVal.Extensions) == 0 {
		return false
	}
	globalDisable, localDisable := false, false
	if v, ok := schemaVal.Extensions[APISchemaExtendLocalDisable]; ok {
		localDisable = v.(bool)
	}
	if v, ok := schemaVal.Extensions[APISchemaExtendGlobalDisable]; ok {
		globalDisable = v.(bool)
	}
	return globalDisable || localDisable
}
