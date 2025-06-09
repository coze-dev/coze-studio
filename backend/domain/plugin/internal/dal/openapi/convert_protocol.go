package openapi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

	parseCURL "parse-curl"

	"github.com/getkin/kin-openapi/openapi2"
	"github.com/getkin/kin-openapi/openapi2conv"
	"github.com/getkin/kin-openapi/openapi3"
	gonanoid "github.com/matoous/go-nanoid"
	postman "github.com/rbretecher/go-postman-collection"
	"gopkg.in/yaml.v3"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func CurlToOpenapi3Doc(ctx context.Context, rawCURL string) (doc *model.Openapi3T, mf *entity.PluginManifest, err error) {
	curlReq, ok := parseCURL.Parse(rawCURL)
	if !ok {
		return nil, nil, fmt.Errorf("parse curl failed")
	}

	rawURL := addHTTPProtocolHeadIfNeed(curlReq.Url)

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
	if curlReq.Body != "" {
		op, err = curlBodyToOpenAPI(ctx, curlReq.Body, op)
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

func curlHeaderToOpenAPI(ctx context.Context, headers map[string]string, op *openapi3.Operation) (newOP *openapi3.Operation, err error) {
	for k := range headers {
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

func curlBodyToOpenAPI(ctx context.Context, bodyStr string, op *openapi3.Operation) (newOP *openapi3.Operation, err error) {
	decoder := json.NewDecoder(bytes.NewBufferString(bodyStr))
	valMap := map[string]any{} // TODO(@maronghong): 支持 array
	err = decoder.Decode(&valMap)
	if err != nil {
		return nil, err
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
				model.MIMETypeJson: {
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
		return nil, nil, err
	}

	if len(collection.Items) == 0 {
		return nil, nil, fmt.Errorf("no request found in collection")
	}

	item0 := collection.Items[0]
	if item0 == nil || item0.Request == nil || item0.Request.URL == nil {
		return nil, nil, fmt.Errorf("invalid collection request schema")
	}

	rawURL := addHTTPProtocolHeadIfNeed(collection.Items[0].Request.URL.Raw)

	urlSchema, err := url.Parse(rawURL)
	if err != nil {
		return nil, nil, err
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
			return fmt.Errorf("invalid request schema")
		}

		op := &openapi3.Operation{
			OperationID: item.Name,
			Summary:     item.Description,
			Parameters:  openapi3.Parameters{},
			Responses:   entity.DefaultOpenapi3Responses(),
		}

		op, err = postmanHeaderToOpenAPI(ctx, item.Request.Header, op)
		if err != nil {
			return err
		}
		op, err = postmanQueryToOpenAPI(ctx, item.Request.URL.Query, op)
		if err != nil {
			return err
		}
		op, err = postmanBodyToOpenAPI(ctx, item.Request.Body, op)
		if err != nil {
			return err
		}

		pathItem := &openapi3.PathItem{}
		pathItem.SetOperation(strings.ToUpper(string(item.Request.Method)), op)
		path := "/" + strings.Join(item.Request.URL.Path, "/")
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

func postmanHeaderToOpenAPI(ctx context.Context, headers []*postman.Header, op *openapi3.Operation) (newOP *openapi3.Operation, err error) {
	for _, header := range headers {
		if header == nil {
			continue
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

	return op, nil
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

func postmanBodyToOpenAPI(ctx context.Context, body *postman.Body, op *openapi3.Operation) (newOP *openapi3.Operation, err error) {
	if body == nil || body.Mode != "raw" ||
		body.Options == nil || body.Options.Raw.Language != "json" {
		return op, nil
	}

	decoder := json.NewDecoder(bytes.NewBufferString(body.Raw))
	valMap := map[string]any{} // TODO(@maronghong): 支持 array
	err = decoder.Decode(&valMap)
	if err != nil {
		return nil, err
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
				model.MIMETypeJson: {
					Schema: &openapi3.SchemaRef{
						Value: bodySchema,
					},
				},
			},
		},
	}

	return op, nil
}

func SwaggerToOpenapi3Doc(ctx context.Context, rawSwagger string) (doc *model.Openapi3T, mf *entity.PluginManifest, err error) {
	doc2 := &openapi2.T{}
	if err = json.Unmarshal([]byte(rawSwagger), doc2); err != nil {
		err = yaml.Unmarshal([]byte(rawSwagger), doc2)
		if err != nil {
			return nil, nil, err
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
		return nil, nil, err
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
	if strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://") {
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
		}
	}
}
