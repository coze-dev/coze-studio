package openapi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/getkin/kin-openapi/openapi2"
	"github.com/getkin/kin-openapi/openapi2conv"
	"github.com/getkin/kin-openapi/openapi3"
	gonanoid "github.com/matoous/go-nanoid"
	"github.com/mattn/go-shellwords"
	postman "github.com/rbretecher/go-postman-collection"
	"gopkg.in/yaml.v3"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func CurlToOpenapi3Doc(ctx context.Context, rawCURL string) (doc *model.Openapi3T, mf *entity.PluginManifest, err error) {
	curlReq, err := parseCURL(ctx, rawCURL)
	if err != nil {
		return nil, nil, err
	}

	rawURL := addHTTPProtocolHeadIfNeed(curlReq.RawURL)

	urlSchema, err := url.Parse(rawURL)
	if err != nil {
		return nil, nil, err
	}

	doc = entity.NewDefaultOpenapiDoc()
	doc.Servers = append(doc.Servers, &openapi3.Server{
		URL: urlSchema.Scheme + "://" + urlSchema.Host,
	})

	operationID := gonanoid.MustID(6)
	doc.Info.Title = fmt.Sprintf("curl_%s", operationID)
	doc.Info.Description = curlReq.Method + ":" + urlSchema.Path

	op := &openapi3.Operation{
		OperationID: operationID,
		Summary:     curlReq.Method + ":" + urlSchema.Path,
		Parameters:  openapi3.Parameters{},
		Responses:   entity.DefaultOpenapi3Responses(),
	}

	if len(curlReq.Header) > 0 {
		op, err = curlHeaderToOpenAPI(ctx, curlReq.Header, op)
		if err != nil {
			return nil, nil, err
		}
	}
	if len(urlSchema.Query()) > 0 {
		op, err = curlQueryToOpenAPI(ctx, urlSchema.Query(), op)
		if err != nil {
			return nil, nil, err
		}
	}
	if len(curlReq.Header["Content-Type"]) > 0 {
		mediaType := curlReq.Header["Content-Type"][0]
		op, err = curlBodyToOpenAPI(ctx, mediaType, curlReq.Body, op)
		if err != nil {
			return nil, nil, err
		}
	}

	pathItem := &openapi3.PathItem{}
	pathItem.SetOperation(strings.ToUpper(curlReq.Method), op)
	doc.Paths = openapi3.Paths{
		urlSchema.Path: pathItem,
	}

	fillNecessaryInfoForOpenapi3Doc(doc)

	mf = entity.NewDefaultPluginManifest()
	fillManifestWithOpenapiDoc(mf, doc)

	return doc, mf, nil
}

type curlRequest struct {
	RawURL string
	Method string
	Query  url.Values
	Header http.Header
	Body   any

	dataToQuery bool
}

func parseCURL(ctx context.Context, rawCURL string) (req *curlRequest, err error) {
	lines, err := shellwords.Parse(rawCURL)
	if err != nil {
		return nil, err
	}
	if len(lines) < 2 {
		return nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KV(errno.PluginMsgKey,
			"invalid curl command"))
	}

	req = &curlRequest{
		Method:      "",
		Header:      http.Header{},
		Query:       url.Values{},
		Body:        map[string]any{}, // TODO(@maronghong): 支持 array
		dataToQuery: false,
	}

	length := len(lines)

	for i := 0; i < length; {
		line := strings.Trim(lines[i], "\n")

		if urlSchema, ok := isValidHTTPURL(line); ok {
			req.RawURL = line
			req.Query = urlSchema.Query()
			i++
			continue
		}

		switch line {
		case "-X", "--request":
			i, err = req.parseCURLMethod(i, lines)
			if err != nil {
				return nil, err
			}

		case "-G", "--get":
			i++
			req.dataToQuery = true

		case "-H", "--header":
			i, err = req.parseCURLHeader(i, lines)
			if err != nil {
				return nil, err
			}

		case "-b", "--cookie":
			i++
			if i >= length {
				return nil, fmt.Errorf("cookie not found")
			}
			req.Header.Add("Cookie", strings.TrimLeft(lines[i], " "))

		case "-e", "--referer":
			i++
			if i >= length {
				return nil, fmt.Errorf("referer not found")
			}
			req.Header.Add("Referer", strings.TrimLeft(lines[i], " "))

		case "-A", "--user-agent":
			i++
			if i >= length {
				return nil, fmt.Errorf("user-agent not found")
			}
			req.Header.Add("User-Agent", strings.TrimLeft(lines[i], " "))

		default:
			i++
			continue
		}
	}

	if req.RawURL == "" {
		return nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KV(errno.PluginMsgKey,
			"invalid request url, url must start with 'http://' or 'https://'"))
	}

	for i := 0; i < length; {
		line := strings.Trim(lines[i], "\n")

		switch line {
		case "-d", "--data", "--data-urlencode":
			i, err = req.parseCURLData(i, lines)
			if err != nil {
				return nil, err
			}
		default:
			i++
			continue
		}
	}

	if req.Method == "" {
		req.Method = http.MethodGet
	}

	return req, nil
}

func isValidHTTPURL(str string) (*url.URL, bool) {
	p, err := url.Parse(str)
	if err != nil {
		return nil, false
	}
	if p.Host == "" {
		return p, false
	}
	if p.Scheme == "http" || p.Scheme == "https" {
		return p, true
	}
	return p, false
}

func (c *curlRequest) parseCURLMethod(curIdx int, lines []string) (nxtIdx int, err error) {
	nxtIdx = curIdx + 2
	if curIdx+1 >= len(lines) {
		return 0, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KV(errno.PluginMsgKey,
			"request method not found"))
	}

	c.Method = strings.ToUpper(lines[curIdx+1])

	return nxtIdx, nil
}

func (c *curlRequest) parseCURLHeader(curIdx int, lines []string) (nxtIdx int, err error) {
	nxtIdx = curIdx + 2
	if curIdx+1 >= len(lines) {
		return 0, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KV(errno.PluginMsgKey,
			"header not found"))
	}

	nxtLine := lines[curIdx+1]
	header := strings.SplitN(nxtLine, ":", 2)

	if len(header) < 2 {
		return 0, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
			"invalid header: %s", nxtLine))
	}

	c.Header.Add(strings.TrimLeft(header[0], " "), strings.TrimLeft(header[1], " "))

	return nxtIdx, nil
}

func (c *curlRequest) parseCURLData(curIdx int, lines []string) (nxtIdx int, err error) {
	if c.Method == "" && !c.dataToQuery {
		c.Method = http.MethodPost
	}

	nxtIdx = curIdx + 2
	if curIdx+1 >= len(lines) {
		return 0, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KV(errno.PluginMsgKey,
			"request body data not found"))
	}

	var mediaType string
	ct, ok := c.Header["Content-Type"]
	if !ok || len(ct) == 0 {
		mediaType = model.MediaTypeFormURLEncoded
		c.Header["Content-Type"] = append(c.Header["Content-Type"], mediaType)
	}
	mediaType = ct[0]

	data := lines[curIdx+1]

	switch mediaType {
	case model.MediaTypeFormURLEncoded:
		err = c.decodeFormUrlEncodedDataBody(data)
		if err != nil {
			return 0, err
		}

	case model.MediaTypeJson, model.MediaTypeProblemJson:
		err = c.decodeJsonDataBody(data)
		if err != nil {
			return 0, err
		}

	case model.MediaTypeYaml, model.MediaTypeXYaml:
		err = c.decodeYamlDataBody(data)
		if err != nil {
			return 0, err
		}

	default:
		return 0, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
			"unsupported request media type '%s'", mediaType))
	}

	return nxtIdx, nil
}

func (c *curlRequest) decodeJsonDataBody(data string) error {
	decoder := json.NewDecoder(bytes.NewBufferString(data))
	decoder.UseNumber()
	valMap := map[string]any{}
	err := decoder.Decode(&valMap)
	if err != nil {
		return errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
			"request body only supports 'object' type, err=%s", err))
	}

	if !c.dataToQuery {
		c.Body = valMap
	} else {
		for k, v := range valMap {
			if v == nil {
				continue
			}
			c.Query.Add(k, fmt.Sprintf("%v", v))
		}
	}

	return nil
}

func (c *curlRequest) decodeYamlDataBody(data string) error {
	decoder := yaml.NewDecoder(bytes.NewBufferString(data))
	valMap := map[string]any{}
	err := decoder.Decode(&valMap)
	if err != nil {
		return errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
			"request body only supports 'object' type, err=%s", err))
	}

	if !c.dataToQuery {
		c.Body = valMap
	} else {
		for k, v := range valMap {
			if v == nil {
				continue
			}
			c.Query.Add(k, fmt.Sprintf("%v", v))
		}
	}

	return nil
}

func (c *curlRequest) decodeFormUrlEncodedDataBody(data string) error {
	values, err := url.ParseQuery(data)
	if err != nil {
		return err
	}

	if c.dataToQuery {
		for k, v := range values {
			if len(v) == 0 {
				continue
			}
			c.Query.Add(k, v[0])
		}

		return nil
	}

	body := c.Body.(map[string]any)
	for k, v := range values {
		if len(v) == 0 {
			continue
		}
		if body[k] == nil {
			body[k] = v[0]
			continue
		}

		item, ok := body[k].([]any)
		if !ok {
			item = []any{body[k]}
		}

		item = append(item, v[0])
		body[k] = item
	}

	return nil
}

func curlHeaderToOpenAPI(ctx context.Context, header http.Header, op *openapi3.Operation) (newOP *openapi3.Operation, err error) {
	for k := range header {
		if k == "Content-Type" {
			continue
		}

		op.Parameters = append(op.Parameters, &openapi3.ParameterRef{
			Value: &openapi3.Parameter{
				In:       openapi3.ParameterInHeader,
				Name:     k,
				Required: true,
				Schema: &openapi3.SchemaRef{
					Value: &openapi3.Schema{
						Type: openapi3.TypeString,
					},
				},
			},
		})
	}

	return op, nil
}

func curlQueryToOpenAPI(ctx context.Context, queryParams url.Values, op *openapi3.Operation) (newOP *openapi3.Operation, err error) {
	for k, v := range queryParams {
		if v == nil {
			continue
		}

		typ := openapi3.TypeString
		if len(v) > 1 {
			typ = openapi3.TypeArray
		}

		op.Parameters = append(op.Parameters, &openapi3.ParameterRef{
			Value: &openapi3.Parameter{
				In:       openapi3.ParameterInQuery,
				Name:     k,
				Required: true,
				Schema: &openapi3.SchemaRef{
					Value: &openapi3.Schema{
						Type: typ,
					},
				},
			},
		})
	}

	return op, nil
}

func buildRequestBodySchema(ctx context.Context, value any) (*openapi3.Schema, error) {
	switch val := value.(type) {
	case string:
		return &openapi3.Schema{
			Type: openapi3.TypeString,
		}, nil

	case bool:
		return &openapi3.Schema{
			Type: openapi3.TypeBoolean,
		}, nil

	case float64:
		return &openapi3.Schema{
			Type: openapi3.TypeNumber,
		}, nil

	case json.Number:
		return &openapi3.Schema{
			Type: openapi3.TypeInteger,
		}, nil

	case map[string]any:
		properties := map[string]*openapi3.SchemaRef{}
		required := make([]string, 0, len(val))
		for k, subVal := range val {
			sc, err := buildRequestBodySchema(ctx, subVal)
			if err != nil {
				return nil, err
			}
			if sc == nil {
				continue
			}
			required = append(required, k)
			properties[k] = &openapi3.SchemaRef{
				Value: sc,
			}
		}

		return &openapi3.Schema{
			Type:       openapi3.TypeObject,
			Properties: properties,
			Required:   required,
		}, nil

	case []any:
		if len(val) == 0 {
			return nil, nil
		}
		sc, err := buildRequestBodySchema(ctx, val[0])
		if err != nil {
			return nil, err
		}

		return &openapi3.Schema{
			Type: openapi3.TypeArray,
			Items: &openapi3.SchemaRef{
				Value: sc,
			},
		}, nil

	default:
		logs.CtxWarnf(ctx, "unsupported type: %T", val)
		return nil, nil
	}
}

func curlBodyToOpenAPI(ctx context.Context, mediaType string, bodyValue any, op *openapi3.Operation) (newOP *openapi3.Operation, err error) {
	bodyValue, ok := bodyValue.(map[string]any) // TODO(@maronghong): 支持 array
	if !ok {
		return nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KV(errno.PluginMsgKey,
			"request body only supports 'object' type"))
	}

	bodySchema, err := buildRequestBodySchema(ctx, bodyValue)
	if err != nil {
		return nil, err
	}
	if bodySchema == nil {
		return op, nil
	}

	if mediaType == "" {
		mediaType = model.MediaTypeJson
	}

	op.RequestBody = &openapi3.RequestBodyRef{
		Value: &openapi3.RequestBody{
			Content: map[string]*openapi3.MediaType{
				mediaType: {
					Schema: &openapi3.SchemaRef{
						Value: bodySchema,
					},
				},
			},
		},
	}

	return op, nil
}

func PostmanToOpenapi3Doc(ctx context.Context, rawPostman string) (doc *model.Openapi3T, mf *entity.PluginManifest, err error) {
	collection, err := postman.ParseCollection(bytes.NewBufferString(rawPostman))
	if err != nil {
		return nil, nil, errorx.New(errno.ErrPluginConvertProtocolFailed,
			errorx.KV(errno.PluginMsgKey, err.Error()))
	}

	if len(collection.Items) == 0 {
		return nil, nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KV(errno.PluginMsgKey,
			"no request found in collection"))
	}

	item0 := collection.Items[0]
	if item0 == nil || item0.Request == nil || item0.Request.URL == nil {
		return nil, nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KV(errno.PluginMsgKey,
			"invalid collection request schema"))
	}

	rawURL := addHTTPProtocolHeadIfNeed(collection.Items[0].Request.URL.Raw)

	urlSchema, ok := isValidHTTPURL(rawURL)
	if !ok {
		return nil, nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
			"invalid request url '%s', url must start with 'http://' or 'https://'", rawURL))
	}

	doc = entity.NewDefaultOpenapiDoc()
	doc.Servers = append(doc.Servers, &openapi3.Server{
		URL: urlSchema.Scheme + "://" + urlSchema.Host,
	})
	doc.Info.Title = collection.Info.Name
	doc.Info.Description = collection.Info.Description.Content

	var buildOperation func(item *postman.Items) error
	buildOperation = func(item *postman.Items) error {
		if item == nil || item.Request == nil || item.Request.URL == nil {
			return errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KV(errno.PluginMsgKey,
				"invalid request schema"))
		}

		itemReq := item.Request

		op := &openapi3.Operation{
			OperationID: item.Name,
			Summary:     item.Description,
			Parameters:  openapi3.Parameters{},
			Responses:   entity.DefaultOpenapi3Responses(),
		}

		var mediaType string
		op, mediaType, err = postmanHeaderToOpenAPI(ctx, itemReq.Header, op)
		if err != nil {
			return err
		}
		op, err = postmanQueryToOpenAPI(ctx, itemReq.URL.Query, op)
		if err != nil {
			return err
		}
		op, err = postmanBodyToOpenAPI(ctx, mediaType, itemReq.Body, op)
		if err != nil {
			return err
		}

		pathItem := &openapi3.PathItem{}
		pathItem.SetOperation(strings.ToUpper(string(item.Request.Method)), op)
		path := "/" + strings.Join(item.Request.URL.Path, "/")

		if doc.Paths[path] != nil {
			return errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
				"duplicated tool '[%s]:%s'", itemReq.Method, path))
		}

		doc.Paths[path] = pathItem

		for _, sub := range item.Items {
			err = buildOperation(sub)
			if err != nil {
				return err
			}
		}

		return nil
	}

	for _, item := range collection.Items {
		err = buildOperation(item)
		if err != nil {
			return nil, nil, err
		}
	}

	fillNecessaryInfoForOpenapi3Doc(doc)

	mf = entity.NewDefaultPluginManifest()
	fillManifestWithOpenapiDoc(mf, doc)

	return doc, mf, nil
}

func postmanHeaderToOpenAPI(ctx context.Context, headers []*postman.Header, op *openapi3.Operation) (newOP *openapi3.Operation, mediaType string, err error) {
	for _, header := range headers {
		if header == nil {
			continue
		}

		if header.Key == "Content-Type" {
			mediaType = header.Value
		}

		op.Parameters = append(op.Parameters, &openapi3.ParameterRef{
			Value: &openapi3.Parameter{
				In:          openapi3.ParameterInHeader,
				Name:        header.Key,
				Description: header.Description,
				Required:    true,
				Schema: &openapi3.SchemaRef{
					Value: &openapi3.Schema{
						Type: openapi3.TypeString,
					},
				},
			},
		})
	}

	return op, mediaType, nil
}

func postmanQueryToOpenAPI(ctx context.Context, queryParams []*postman.QueryParam, op *openapi3.Operation) (newOP *openapi3.Operation, err error) {
	for _, queryParam := range queryParams {
		if queryParam == nil {
			continue
		}

		op.Parameters = append(op.Parameters, &openapi3.ParameterRef{
			Value: &openapi3.Parameter{
				In:          openapi3.ParameterInQuery,
				Name:        queryParam.Key,
				Description: ptr.FromOrDefault(queryParam.Description, ""),
				Required:    true,
				Schema: &openapi3.SchemaRef{
					Value: &openapi3.Schema{
						Type: openapi3.TypeString,
					},
				},
			},
		})
	}

	return op, nil
}

func postmanBodyToOpenAPI(ctx context.Context, mediaType string, body *postman.Body, op *openapi3.Operation) (newOP *openapi3.Operation, err error) {
	if body == nil {
		return op, nil
	}

	if body.Mode != "raw" && body.Mode != "urlencoded" {
		return op, nil
	}

	if body.Mode == "raw" {
		if body.Options == nil {
			return op, nil
		}
		if body.Options.Raw.Language != "json" && body.Options.Raw.Language != "text" {
			return op, nil
		}
	}

	if mediaType == "" {
		mediaType = model.MediaTypeJson
		if body.Mode == "urlencoded" {
			mediaType = model.MediaTypeFormURLEncoded
		}
	}

	var valMap map[string]any
	switch mediaType {
	case model.MediaTypeJson, model.MediaTypeProblemJson:
		valMap, err = decodeRequestJsonBody(body.Raw)
		if err != nil {
			return nil, err
		}

	case model.MediaTypeYaml, model.MediaTypeXYaml:
		valMap, err = decodeRequestYamlBody(body.Raw)
		if err != nil {
			return nil, err
		}

	case model.MediaTypeFormURLEncoded:
		valMap, err = decodePostmanRequestFormURLEncodedBody(body.URLEncoded)
		if err != nil {
			return nil, err
		}

	default:
		return op, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
			"unsupported request media type '%s'", mediaType))
	}

	if len(valMap) == 0 {
		return op, nil
	}

	bodySchema, err := buildRequestBodySchema(ctx, valMap)
	if err != nil {
		return nil, err
	}
	if bodySchema == nil {
		return op, nil
	}

	op.RequestBody = &openapi3.RequestBodyRef{
		Value: &openapi3.RequestBody{
			Content: map[string]*openapi3.MediaType{
				mediaType: {
					Schema: &openapi3.SchemaRef{
						Value: bodySchema,
					},
				},
			},
		},
	}

	return op, nil
}

func decodeRequestJsonBody(rawBody string) (body map[string]any, err error) {
	decoder := json.NewDecoder(bytes.NewBufferString(rawBody))
	decoder.UseNumber()
	valMap := map[string]any{}
	err = decoder.Decode(&valMap)
	if err != nil {
		return nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
			"request body only supports 'object' type, err=%s", err))
	}

	return valMap, nil
}

func decodeRequestYamlBody(rawBody string) (body map[string]any, err error) {
	decoder := yaml.NewDecoder(bytes.NewBufferString(rawBody))
	valMap := map[string]any{}
	err = decoder.Decode(&valMap)
	if err != nil {
		return nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
			"request body only supports 'object' type, err=%s", err))
	}

	return valMap, nil
}

func decodePostmanRequestFormURLEncodedBody(rawBody any) (body map[string]any, err error) {
	valArr, ok := rawBody.([]any)
	if !ok {
		return nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
			"postman urlencoded body should be array type"))
	}

	body = map[string]any{}
	for _, v := range valArr {
		m, ok := v.(map[string]any)
		if !ok {
			return nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
				"postman urlencoded body should be array of 'object' type"))
		}

		key, ok := m["key"].(string)
		if !ok {
			continue
		}
		val, ok := m["value"].(string)
		if !ok {
			continue
		}

		if body[key] == nil {
			body[key] = val
			continue
		}

		item, ok := body[key].([]any)
		if !ok {
			item = []any{body[key]}
		}

		item = append(item, val)
		body[key] = item
	}

	return body, nil
}

func SwaggerToOpenapi3Doc(ctx context.Context, rawSwagger string) (doc *model.Openapi3T, mf *entity.PluginManifest, err error) {
	doc2 := &openapi2.T{}
	if err = json.Unmarshal([]byte(rawSwagger), doc2); err != nil {
		err = yaml.Unmarshal([]byte(rawSwagger), doc2)
		if err != nil {
			return nil, nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
				"invalid swagger schema, err=%s", err))
		}
	}

	doc3, err := openapi2conv.ToV3(doc2)
	if err != nil {
		return nil, nil, err
	}

	doc = ptr.Of(model.Openapi3T(*doc3))
	fillNecessaryInfoForOpenapi3Doc(doc)

	mf = entity.NewDefaultPluginManifest()
	fillManifestWithOpenapiDoc(mf, doc)

	return doc, mf, nil
}

func ToOpenapi3Doc(ctx context.Context, rawOpenAPI string) (doc *model.Openapi3T, mf *entity.PluginManifest, err error) {
	loader := openapi3.NewLoader()
	doc3, err := loader.LoadFromData([]byte(rawOpenAPI))
	if err != nil {
		return nil, nil, errorx.New(errno.ErrPluginConvertProtocolFailed, errorx.KVf(errno.PluginMsgKey,
			"invalid openapi3 document, err=%s", err))
	}

	doc = ptr.Of(model.Openapi3T(*doc3))
	fillNecessaryInfoForOpenapi3Doc(doc)

	mf = entity.NewDefaultPluginManifest()
	fillManifestWithOpenapiDoc(mf, doc)

	return doc, mf, nil
}

func fillManifestWithOpenapiDoc(mf *entity.PluginManifest, doc *model.Openapi3T) {
	if doc.Info == nil {
		return
	}

	mf.NameForHuman = doc.Info.Title
	mf.NameForModel = doc.Info.Title
	mf.DescriptionForHuman = doc.Info.Description
	mf.DescriptionForModel = doc.Info.Description

	return
}

func addHTTPProtocolHeadIfNeed(url string) string {
	if strings.HasPrefix(url, "https://") {
		return url
	}
	if strings.HasPrefix(url, "http://") {
		url = strings.Replace(url, "http://", "https://", 1)
		return url
	}
	return "https://" + url
}

func fillNecessaryInfoForOpenapi3Doc(doc *model.Openapi3T) {
	if doc.Info == nil {
		doc.Info = &openapi3.Info{
			Title:       "title is required",
			Version:     "v1",
			Description: "description is required",
		}
	}
	if doc.Info.Title == "" {
		doc.Info.Title = "title is required"
	}
	if doc.Info.Description == "" {
		doc.Info.Description = doc.Info.Title
	}
	if doc.Info.Version == "" {
		doc.Info.Version = "v1"
	}

	for _, pathItem := range doc.Paths {
		for _, op := range pathItem.Operations() {
			if op.OperationID == "" {
				op.OperationID = gonanoid.MustID(6)
			}

			if op.Summary == "" {
				op.Summary = op.OperationID
			}

			if op.Responses != nil {
				defaultResp := entity.DefaultOpenapi3Responses()
				respRef := op.Responses[strconv.Itoa(http.StatusOK)]
				if respRef == nil || respRef.Value == nil || respRef.Value.Content == nil {
					op.Responses = defaultResp
					respRef = op.Responses[strconv.Itoa(http.StatusOK)]
				}
				if respRef.Value.Content[model.MediaTypeJson] == nil {
					respRef.Value.Content[model.MediaTypeJson] = defaultResp[strconv.Itoa(http.StatusOK)].Value.Content[model.MediaTypeJson]
				}
			}
		}
	}
}
