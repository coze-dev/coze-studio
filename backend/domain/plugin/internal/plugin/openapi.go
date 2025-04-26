package plugin

import (
	"context"

	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type PluginSyncer interface {
	SyncToolToPluginOpenapiDoc(ctx context.Context, updated, tool *entity.ToolInfo) (newPlugin *entity.PluginInfo, err error)
	ApplyPluginOpenapi3DocToTools(ctx context.Context, oldTools []*entity.ToolInfo) (newTools, updatedTools []*entity.ToolInfo, err error)
}

var assistTypeToFormat = map[consts.APIFileAssistType]string{
	consts.AssistTypeFile:  "file_url",
	consts.AssistTypeImage: "image_url",
	consts.AssistTypeDoc:   "doc_url",
	consts.AssistTypePpt:   "ppt_url",
	consts.AssistTypeCode:  "code_url",
	consts.AssistTypeExcel: "excel_url",
	consts.AssistTypeZip:   "zip_url",
	consts.AssistTypeVideo: "video_url",
	consts.AssistTypeAudio: "audio_url",
	consts.AssistTypeTxt:   "txt_url",
	//consts.AssistTypeVoice: "voice_id",
}

var formatToAssistType = func() map[string]consts.APIFileAssistType {
	types := make(map[string]consts.APIFileAssistType, len(assistTypeToFormat))
	for k, v := range assistTypeToFormat {
		types[v] = k
	}

	return types
}()

//	func NewPluginSyncer(_ context.Context, plugin *entity.PluginInfo) PluginSyncer {
//		return &pluginSyncerImpl{
//			PluginInfo: plugin,
//		}
//	}
//
//	type pluginSyncerImpl struct {
//		*entity.PluginInfo
//	}
//
//	func (p *pluginSyncerImpl) SyncToolToPluginOpenapiDoc(ctx context.Context, updated, tool *entity.ToolInfo) (newPlugin *entity.PluginInfo, err error) {
//		if p.OpenapiDoc == nil {
//			return p.PluginInfo, nil
//		}
//
//		paths := p.OpenapiDoc.Paths
//		if paths == nil {
//			paths = map[string]*openapi3.PathItem{}
//			p.OpenapiDoc.Paths = paths
//		}
//
//		if updated.GetActivatedStatus() == consts.ActivateTool {
//			p.activateTool(tool)
//		} else if updated.ActivatedStatus != nil && *updated.ActivatedStatus == consts.DeactivateTool {
//			p.deactivateTool(tool, updated)
//			return
//		}
//
//		p.syncPath(updated, tool)
//
//		urlPath := tool.GetSubURL()
//		if updated.SubURL != nil {
//			urlPath = updated.GetSubURL()
//		}
//
//		pathItem, _ := p.OpenapiDoc.Paths[urlPath]
//
//		method := tool.GetMethod()
//		if updated.Method != nil && updated.GetMethod() != tool.GetMethod() {
//			method = updated.GetMethod()
//			pathItem.SetOperation(updated.GetMethod(), pathItem.GetOperation(tool.GetMethod()))
//		}
//
//		op := pathItem.GetOperation(method)
//
//		if updated.Name != nil && updated.GetName() != tool.GetName() {
//			op.OperationID = updated.GetName()
//		}
//
//		if updated.Desc != nil && updated.GetDesc() != tool.GetDesc() {
//			op.Summary = updated.GetDesc()
//		}
//
//		if updated.ReqParameters != nil {
//			p.syncRequestParams(urlPath, method, updated.ReqParameters)
//		}
//
//		if updated.RespParameters != nil {
//			p.syncResponseParams(urlPath, method, updated.RespParameters)
//		}
//
//		return p.PluginInfo, nil
//	}
//
//	func (p *pluginSyncerImpl) activateTool(tool *entity.ToolInfo) {
//		if tool.GetActivatedStatus() == consts.ActivateTool {
//			return
//		}
//
//		pathItem := &openapi3.PathItem{}
//		operation := &openapi3.Operation{
//			OperationID: tool.GetName(),
//			Summary:     tool.GetDesc(),
//		}
//
//		method := tool.GetReqMethodName()
//		pathItem.SetOperation(method, operation)
//
//		p.OpenapiDoc.Paths[tool.GetSubURL()] = pathItem
//	}
//
//	func (p *pluginSyncerImpl) deactivateTool(updated, tool *entity.ToolInfo) {
//		if updated.ActivatedStatus == nil || *updated.ActivatedStatus == consts.DeactivateTool ||
//			tool.GetActivatedStatus() == updated.GetActivatedStatus() {
//			return
//		}
//
//		delete(p.OpenapiDoc.Paths, tool.GetSubURL())
//
//		return
//	}
//
//	func (p *pluginSyncerImpl) syncPath(updated, tool *entity.ToolInfo) {
//		if updated.SubURL == nil || updated.GetSubURL() == tool.GetSubURL() {
//			return
//		}
//
//		paths := p.OpenapiDoc.Paths
//
//		pathItem := paths[updated.GetSubURL()]
//		if pathItem != nil {
//			return
//		}
//
//		pathItem, ok := paths[tool.GetSubURL()]
//		if !ok {
//			paths[updated.GetSubURL()] = &openapi3.PathItem{}
//			return
//		}
//
//		delete(paths, tool.GetSubURL())
//		paths[updated.GetSubURL()] = pathItem
//	}
//
//	func (p *pluginSyncerImpl) syncRequestParams(urlPath, method string, reqParams []*common.APIParameter) {
//		op := p.OpenapiDoc.Paths[urlPath].Operations()[method]
//
//		params := make([]*openapi3.ParameterRef, 0)
//		subParams := make([]*common.APIParameter, 0)
//
//		for _, param := range reqParams {
//			if param.Location == common.ParameterLocation_Body {
//				subParams = append(subParams, param)
//			} else {
//				params = append(params, &openapi3.ParameterRef{
//					Value: &openapi3.Parameter{
//						Name:        param.Name,
//						In:          string(convertor.ToHTTPParamLocation(param.Location)),
//						Description: param.Desc,
//						Required:    param.IsRequired,
//						Schema:      convertAPIParamToOpenapi3Schema(param),
//					},
//				})
//			}
//		}
//
//		op.Parameters = params
//		if op.RequestBody == nil {
//			op.RequestBody = &openapi3.RequestBodyRef{
//				Value: openapi3.NewRequestBody(),
//			}
//		}
//
//		if op.RequestBody.Value.Content == nil {
//			op.RequestBody.Value.Description = "new desc"
//			op.RequestBody.Value.Content = openapi3.NewContent()
//		}
//
//		mediaType := openapi3.NewMediaType()
//		mediaType.Schema = convertAPIParamToOpenapi3Schema(&common.APIParameter{
//			Type:          common.ParameterType_Object,
//			SubParameters: subParams,
//		})
//
//		op.RequestBody.Value.Content["application/json"] = mediaType
//	}
//
//	func (p *pluginSyncerImpl) syncResponseParams(urlPath, method string, respParams []*common.APIParameter) {
//		op := p.OpenapiDoc.Paths[urlPath].Operations()[method]
//
//		if op.Responses == nil {
//			op.Responses = openapi3.NewResponses()
//		}
//
//		resp := op.Responses[strconv.Itoa(http.StatusOK)]
//		if resp == nil {
//			resp = &openapi3.ResponseRef{
//				Value: openapi3.NewResponse(),
//			}
//		}
//
//		if resp.Value.Content == nil {
//			resp.Value.Content = openapi3.NewContent()
//			str := "new desc"
//			resp.Value.Description = &str
//		}
//
//		mediaType := openapi3.NewMediaType()
//		if len(respParams) == 1 {
//			mediaType.Schema = convertAPIParamToOpenapi3Schema(respParams[0])
//		} else {
//			mediaType.Schema = convertAPIParamToOpenapi3Schema(&common.APIParameter{
//				Type:          common.ParameterType_Object,
//				SubParameters: respParams,
//			})
//		}
//
//		resp.Value.Content["application/json"] = mediaType
//
//		op.Responses[strconv.Itoa(http.StatusOK)] = resp
//	}
//
//	func convertAPIParamToOpenapi3Schema(param *common.APIParameter) *openapi3.SchemaRef {
//		if param == nil {
//			return nil
//		}
//
//		scRef := &openapi3.SchemaRef{
//			Value: openapi3.NewSchema(),
//		}
//
//		if len(param.Desc) > 0 {
//			scRef.Value.Description = param.Desc
//		}
//
//		typ := convertor.ToOpenapiParamType(param.Type)
//		if typ != "" {
//			scRef.Value.Type = typ
//		}
//
//		if param.GlobalDefault != nil {
//			scRef.Value.Default = unmarshalGlobalDefault(param.GetGlobalDefault(), param.Type)
//		}
//
//		if scRef.Value.Extensions == nil {
//			scRef.Value.Extensions = make(map[string]interface{})
//		}
//
//		if typ != openapi3.TypeObject && param.GlobalDisable {
//			scRef.Value.Extensions[consts.APISchemaExtendGlobalDisable] = true
//		}
//
//		if param.GetAssistType() > 0 {
//			aType := convertor.ToAPIAssistType(param.GetAssistType())
//			scRef.Value.Extensions[consts.APISchemaExtendAssistType] = aType
//			scRef.Value.Format = assistTypeToFormat[aType]
//		}
//
//		switch typ {
//		case openapi3.TypeObject:
//			scRef.Value.Properties = make(map[string]*openapi3.SchemaRef, len(param.SubParameters))
//			for _, p := range param.SubParameters {
//				scRef.Value.Properties[p.Name] = convertAPIParamToOpenapi3Schema(p)
//				if p.IsRequired {
//					scRef.Value.Required = append(scRef.Value.Required, p.Name)
//				}
//			}
//		case openapi3.TypeArray:
//			if len(param.SubParameters) > 0 {
//				scRef.Value.Items = &openapi3.SchemaRef{
//					Value: openapi3.NewSchema(),
//				}
//
//				if convertor.ToOpenapiParamType(param.GetSubType()) != openapi3.TypeObject {
//					scRef.Value.Items = convertAPIParamToOpenapi3Schema(param.SubParameters[0])
//				} else {
//					scRef.Value.Items.Value.Properties = make(map[string]*openapi3.SchemaRef, len(param.SubParameters))
//					scRef.Value.Items.Value.Type = openapi3.TypeObject
//
//					for _, p := range param.SubParameters {
//						scRef.Value.Items.Value.Properties[p.Name] = convertAPIParamToOpenapi3Schema(p)
//					}
//				}
//			} else {
//				scRef.Value.Items = &openapi3.SchemaRef{
//					Value: openapi3.NewSchema(),
//				}
//
//				scRef.Value.Items.Value.Type = convertor.ToOpenapiParamType(param.GetSubType())
//			}
//		}
//
//		return scRef
//	}
//
//	func unmarshalGlobalDefault(s string, typ common.ParameterType) any {
//		if s == "" {
//			return nil
//		}
//
//		switch typ {
//		case common.ParameterType_Array:
//			var array []any
//			if sonic.Unmarshal([]byte(s), &array) == nil {
//				return array
//			}
//		case common.ParameterType_Integer, common.ParameterType_Number:
//			if f64, err := strconv.ParseFloat(s, 64); err == nil {
//				return f64
//			}
//		case common.ParameterType_Bool:
//			if b, err := strconv.ParseBool(s); err == nil {
//				return b
//			}
//		case common.ParameterType_String:
//			return s
//		}
//
//		return nil
//	}
var contentTypeArray = []string{
	"application/json",
	"application/json-patch+json",
	"application/problem+json",
	"application/x-www-form-urlencoded",
	"application/x-yaml",
}

//
//func (p *pluginSyncerImpl) ApplyPluginOpenapi3DocToTools(ctx context.Context,
//	oldTools []*entity.ToolInfo) (newTools, updatedTools []*entity.ToolInfo, err error) {
//
//	doc := p.OpenapiDoc
//
//	newTools = make([]*entity.ToolInfo, 0, 4)
//	updatedTools = make([]*entity.ToolInfo, 0, len(oldTools))
//
//	pathItems := make(map[string]*openapi3.PathItem, len(doc.Paths))
//	for subURLPath, pathItem := range doc.Paths {
//		for method := range pathItem.Operations() {
//			k := fmt.Sprintf("%s:%s", subURLPath, method)
//			pathItems[k] = pathItem
//		}
//	}
//
//	oldToolMap := make(map[string]*entity.ToolInfo, len(oldTools))
//
//	for _, oldTool := range oldTools {
//		method := oldTool.GetReqMethodName()
//		k := fmt.Sprintf("%s:%s", oldTool.GetSubURL(), method)
//
//		oldToolMap[k] = oldTool
//
//		nt, ok := pathItems[k]
//		if !ok {
//			oldTool.ActivatedStatus = ptr.Of(consts.DeactivateTool)
//			updatedTools = append(updatedTools, oldTool)
//			continue
//		}
//
//		op := nt.Operations()[method]
//		needUpdate := false
//
//		if oldTool.GetName() != op.OperationID {
//			oldTool.Name = ptr.Of(op.OperationID)
//			needUpdate = true
//		}
//
//		if oldTool.GetDesc() != op.Description {
//			oldTool.Desc = ptr.Of(op.Description)
//			needUpdate = true
//		}
//
//		reqAPIParams, err := getAPIReqParamsFromOperation(ctx, op)
//		if err != nil {
//			return nil, nil, err
//		}
//
//		if isParamsNotEqual(oldTool.ReqParameters, reqAPIParams) {
//			needUpdate = true
//			oldTool.ReqParameters = reqAPIParams
//		}
//
//		respAPIParams, err := getAPIRespParamsFromOperation(ctx, op)
//		if err != nil {
//			return nil, nil, err
//		}
//
//		if isParamsNotEqual(oldTool.RespParameters, respAPIParams) {
//			needUpdate = true
//			oldTool.RespParameters = respAPIParams
//		}
//
//		if needUpdate {
//			updatedTools = append(updatedTools, oldTool)
//		}
//	}
//
//	for k, pathItem := range pathItems {
//		if oldToolMap[k] != nil {
//			continue
//		}
//
//		s := strings.Split(k, ":")
//		subURLPath, method := s[0], s[1]
//
//		op := pathItem.Operations()[method]
//
//		newTool := &entity.ToolInfo{
//			PluginID:        p.ID,
//			Name:            &op.OperationID,
//			Desc:            ptr.Of(op.Description),
//			ActivatedStatus: ptr.Of(consts.ActivateTool),
//			DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
//			Method:          ptr.Of(convertor.ToThriftAPIMethod(method)),
//			SubURL:          ptr.Of(subURLPath),
//		}
//
//		reqAPIParams, err := getAPIReqParamsFromOperation(ctx, op)
//		if err != nil {
//			return nil, nil, err
//		}
//
//		newTool.ReqParameters = reqAPIParams
//
//		respAPIParams, err := getAPIRespParamsFromOperation(ctx, op)
//		if err != nil {
//			return nil, nil, err
//		}
//
//		newTool.RespParameters = respAPIParams
//
//		newTools = append(newTools, newTool)
//	}
//
//	return newTools, updatedTools, nil
//}
//
//func getAPIReqParamsFromOperation(ctx context.Context, op *openapi3.Operation) ([]*common.APIParameter, error) {
//	reqAPIParams := make([]*common.APIParameter, 0, len(op.Parameters))
//
//	for _, param := range op.Parameters {
//		if param == nil || param.Value == nil {
//			return nil, fmt.Errorf("ParameterRef is nil")
//		}
//
//		apiParam, err := convertOpenapi3ParamToAPIParam(ctx, param.Value)
//		if err != nil {
//			continue
//		}
//
//		reqAPIParams = append(reqAPIParams, apiParam)
//	}
//
//	if op.RequestBody != nil &&
//		op.RequestBody.Value != nil &&
//		len(op.RequestBody.Value.Content) > 0 {
//		for _, ct := range contentTypeArray {
//			mType := op.RequestBody.Value.Content.Get(ct)
//			if mType == nil {
//				continue
//			}
//
//			apiParam, err := convertOpenapi3SchemaToAPIParam(ctx, mType.Schema.Value, common.ParameterLocation_Body)
//			if err != nil {
//				return nil, err
//			}
//
//			reqAPIParams = append(reqAPIParams, apiParam)
//
//			break
//		}
//	}
//
//	if len(reqAPIParams) > 0 { // 不能返回，需要区分 nil 和空切片
//		return reqAPIParams, nil
//	}
//
//	return nil, nil
//}
//
//func getAPIRespParamsFromOperation(ctx context.Context, op *openapi3.Operation) ([]*common.APIParameter, error) {
//	if op.Responses == nil || len(op.Responses) == 0 {
//		return nil, nil
//	}
//
//	for code, v := range op.Responses {
//		if code != strconv.Itoa(http.StatusOK) {
//			continue
//		}
//
//		for _, ct := range contentTypeArray {
//			mType := v.Value.Content.Get(ct)
//			if mType == nil {
//				continue
//			}
//
//			respAPIParam, err := convertOpenapi3SchemaToAPIParam(ctx, mType.Schema.Value, common.ParameterLocation_Body)
//			if err != nil {
//				return nil, err
//			}
//
//			return []*common.APIParameter{respAPIParam}, nil
//		}
//	}
//
//	return nil, nil
//}
//
//func convertOpenapi3ParamToAPIParam(ctx context.Context, param *openapi3.Parameter) (*common.APIParameter, error) {
//	if param == nil {
//		return nil, fmt.Errorf("ParameterRef is nil")
//	}
//
//	scRef := param.Schema
//	if scRef == nil || scRef.Value == nil {
//		return nil, fmt.Errorf("SchemaRef is nil")
//	}
//
//	loc := convertor.ToThriftHTTPParamLocation(consts.HTTPParamLocation(strings.ToLower(param.In)))
//
//	sub, err := convertOpenapi3SchemaToAPIParam(ctx, scRef.Value, loc)
//	if err != nil {
//		return nil, err
//	}
//
//	res := &common.APIParameter{
//		Name:       param.Name,
//		Desc:       param.Description,
//		IsRequired: param.Required,
//		Location:   loc,
//		Type:       convertor.ToThriftParamType(strings.ToLower(param.Schema.Value.Type)),
//		SubType:    sub.SubType,
//	}
//
//	if param.Schema != nil &&
//		param.Schema.Value != nil &&
//		len(param.Schema.Value.Extensions) > 0 {
//		if val, ok := param.Schema.Value.Extensions[consts.APISchemaExtendGlobalDisable]; ok {
//			if disable, ok := val.(bool); ok {
//				res.GlobalDisable = disable
//			}
//		}
//	}
//
//	if sub.AssistType != nil {
//		res.AssistType = sub.AssistType
//	}
//
//	if sub.Type == common.ParameterType_Object || sub.Type == common.ParameterType_Array {
//		res.SubParameters = sub.SubParameters
//	}
//
//	if len(param.Description) == 0 {
//		if param.Example != nil {
//			res.Desc = fmt.Sprintf("Example:%v", param.Example)
//		} else if len(param.Examples) > 0 {
//			b, _ := sonic.Marshal(param.Examples)
//			res.Desc = fmt.Sprintf("Examples:%s", b)
//		}
//	}
//
//	return res, nil
//}
//
//func convertOpenapi3SchemaToAPIParam(ctx context.Context, sc *openapi3.Schema, location common.ParameterLocation) (*common.APIParameter, error) {
//	if sc == nil {
//		return nil, fmt.Errorf("paramSchema is nil")
//	}
//
//	if len(sc.Type) == 0 {
//		return nil, fmt.Errorf("paramSchema type is empty")
//	}
//
//	res := &common.APIParameter{
//		Desc:     sc.Description,
//		Type:     convertor.ToThriftParamType(strings.ToLower(sc.Type)),
//		Location: location, //使用父节点的值
//	}
//
//	if sc.Default != nil {
//		if err := checkParamType(sc.Default, sc.Type); err != nil {
//			return nil, err
//		}
//	}
//
//	if len(sc.Format) > 0 {
//		aType := formatToAssistType[sc.Format]
//		if aType != "" {
//			sc.Extensions[consts.APISchemaExtendAssistType] = aType
//			res.AssistType = ptr.Of(convertor.ToThriftAPIAssistType(aType))
//		}
//	}
//
//	if len(sc.Extensions) > 0 && sc.Type != openapi3.TypeObject {
//		if val, ok := sc.Extensions[consts.APISchemaExtendGlobalDisable]; ok {
//			if disable, ok := val.(bool); ok {
//				res.GlobalDisable = disable
//			}
//		}
//	}
//
//	if sc.Type == openapi3.TypeObject && len(sc.Properties) > 0 {
//		for name, v := range sc.Properties {
//			subParam, err := convertOpenapi3SchemaToAPIParam(ctx, v.Value, location)
//			if err != nil {
//				return nil, err
//			}
//
//			subParam.Name = name
//
//			for _, x := range sc.Required {
//				if x == name {
//					subParam.IsRequired = true
//				}
//			}
//
//			res.SubParameters = append(res.SubParameters, subParam)
//		}
//
//	} else if sc.Type == openapi3.TypeArray && sc.Items != nil {
//		subType := convertor.ToThriftParamType(strings.ToLower(sc.Items.Value.Type))
//		if subType == 0 {
//			return nil, fmt.Errorf("invalid array item type '%s'", sc.Items.Value.Type)
//		}
//
//		res.SubType = ptr.Of(subType)
//
//		item, err := convertOpenapi3SchemaToAPIParam(ctx, sc.Items.Value, location)
//		if err != nil {
//			return nil, err
//		}
//
//		if item != nil && item.Type == common.ParameterType_Object {
//			if res.SubType == nil {
//				res.SubType = ptr.Of(common.ParameterType_Object)
//			}
//
//			res.SubParameters = append(res.SubParameters, item.SubParameters...)
//		}
//
//		if item != nil && item.Type != common.ParameterType_Array && item.Type != common.ParameterType_Object {
//			res.SubParameters = append(res.SubParameters, item)
//		}
//	}
//
//	return res, nil
//}
//
//func checkParamType(v interface{}, paramType string) error {
//	if v == nil {
//		return nil
//	}
//
//	switch paramType {
//	case openapi3.TypeInteger, openapi3.TypeNumber:
//		_, ok := v.(float64)
//		if !ok {
//			return fmt.Errorf("param type is float64 but is=%v", v)
//		}
//	case openapi3.TypeBoolean:
//		_, ok := v.(bool)
//		if !ok {
//			return fmt.Errorf("param type is bool but is=%v", v)
//		}
//	case openapi3.TypeString:
//		_, ok := v.(string)
//		if !ok {
//			return fmt.Errorf("param type is string but is=%v", v)
//		}
//	case openapi3.TypeObject:
//		_, ok := v.(map[string]interface{})
//		if !ok {
//			return fmt.Errorf("param type is object but is=%v", v)
//		}
//	case openapi3.TypeArray:
//		_, ok := v.([]interface{})
//		if !ok {
//			return fmt.Errorf("param type is array but is=%v", v)
//		}
//	default:
//		return nil
//	}
//
//	return nil
//}
//
//func isParamsNotEqual(oldParams, newParams []*common.APIParameter) bool {
//	if len(oldParams) == 0 && len(newParams) == 0 {
//		return false
//	}
//
//	if len(oldParams) != len(newParams) {
//		return true
//	}
//
//	newParamsMap := make(map[string]*common.APIParameter)
//	for _, p := range newParams {
//		newParamsMap[p.Name] = p
//	}
//
//	for _, oldP := range oldParams {
//		newP, ok := newParamsMap[oldP.Name]
//		if !ok {
//			return true
//		}
//
//		if oldP.Name != newP.Name || oldP.Desc != newP.Desc || oldP.Type != newP.Type ||
//			oldP.Location != newP.Location || oldP.IsRequired != newP.IsRequired {
//			return true
//		}
//
//		if (oldP.SubType != nil && newP.SubType == nil) || (oldP.SubType == nil && newP.SubType != nil) ||
//			(oldP.SubType != nil && newP.SubType != nil && *oldP.SubType != *newP.SubType) {
//			return true
//		}
//
//		if (oldP.AssistType != nil && newP.AssistType == nil) || (oldP.AssistType == nil && newP.AssistType != nil) ||
//			(oldP.AssistType != nil && newP.AssistType != nil && *oldP.AssistType != *newP.AssistType) {
//			return true
//		}
//
//		if oldP.GlobalDisable != newP.GlobalDisable || oldP.LocalDisable != newP.LocalDisable {
//			return true
//		}
//
//		if (oldP.GlobalDefault != nil && (newP.GlobalDefault == nil || *oldP.GlobalDefault != *newP.GlobalDefault)) ||
//			(oldP.GlobalDefault == nil && newP.GlobalDefault != nil) {
//			return true
//		}
//
//		if (oldP.LocalDefault != nil && (newP.LocalDefault == nil || *oldP.LocalDefault != *newP.LocalDefault)) ||
//			(oldP.LocalDefault == nil && newP.LocalDefault != nil) {
//			return true
//		}
//
//		if isParamsNotEqual(oldP.SubParameters, newP.SubParameters) {
//			return true
//		}
//	}
//
//	return false
//}

func NeedResetDebugStatusTool(_ context.Context, nt, ot *openapi3.Operation) bool {
	if len(ot.Parameters) != len(ot.Parameters) {
		return true
	}

	otParams := make(map[string]*openapi3.Parameter, len(ot.Parameters))
	cnt := make(map[string]int, len(nt.Parameters))

	for _, p := range nt.Parameters {
		cnt[p.Value.Name]++
	}
	for _, p := range ot.Parameters {
		cnt[p.Value.Name]--
		otParams[p.Value.Name] = p.Value
	}
	for _, v := range cnt {
		if v != 0 {
			return true
		}
	}

	for _, p := range nt.Parameters {
		np, op := p.Value, otParams[p.Value.Name]
		if np.In != op.In {
			return true
		}
		if np.Required != op.Required {
			return true
		}

		if !isJsonSchemaEqual(op.Schema.Value, np.Schema.Value) {
			return true
		}
	}

	nReqBody, oReqBody := nt.RequestBody.Value, ot.RequestBody.Value
	if len(nReqBody.Content) != len(oReqBody.Content) {
		return true
	}
	cnt = make(map[string]int, len(nReqBody.Content))
	for ct := range nReqBody.Content {
		cnt[ct]++
	}
	for ct := range oReqBody.Content {
		cnt[ct]--
	}
	for _, v := range cnt {
		if v != 0 {
			return true
		}
	}

	for ct, nct := range nReqBody.Content {
		oct := oReqBody.Content[ct]
		if !isJsonSchemaEqual(nct.Schema.Value, oct.Schema.Value) {
			return true
		}
	}

	return false
}

func isJsonSchemaEqual(nsc, osc *openapi3.Schema) bool {
	if nsc.Type != osc.Type {
		return false
	}
	if nsc.Format != osc.Format {
		return false
	}
	if nsc.Default != osc.Default {
		return false
	}
	if nsc.Extensions[consts.APISchemaExtendAssistType] != osc.Extensions[consts.APISchemaExtendAssistType] {
		return false
	}
	if nsc.Extensions[consts.APISchemaExtendGlobalDisable] != osc.Extensions[consts.APISchemaExtendGlobalDisable] {
		return false
	}

	switch nsc.Type {
	case openapi3.TypeObject:
		if len(nsc.Required) != len(osc.Required) {
			return false
		}
		if len(nsc.Required) > 0 {
			cnt := make(map[string]int, len(nsc.Required))
			for _, x := range nsc.Required {
				cnt[x]++
			}
			for _, x := range osc.Required {
				cnt[x]--
			}
			for _, v := range cnt {
				if v != 0 {
					return true
				}
			}
		}

		if len(nsc.Properties) != len(osc.Properties) {
			return false
		}
		if len(nsc.Properties) > 0 {
			for paramName, np := range nsc.Properties {
				op, ok := osc.Properties[paramName]
				if !ok {
					return false
				}
				if !isJsonSchemaEqual(np.Value, op.Value) {
					return false
				}
			}
		}
	case openapi3.TypeArray:
		if !isJsonSchemaEqual(nsc.Items.Value, osc.Items.Value) {
			return false
		}
	}

	return true
}
