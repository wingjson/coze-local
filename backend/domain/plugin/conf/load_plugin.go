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

package conf

import (
	"context"
	"fmt"
	"log"
	"os"
	"path"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/mohae/deepcopy"
	"golang.org/x/mod/semver"
	"gopkg.in/yaml.v3"

	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type pluginProductMeta struct {
	PluginID       int64                 `yaml:"plugin_id" validate:"required"`
	Deprecated     bool                  `yaml:"deprecated"`
	Version        string                `yaml:"version" validate:"required"`
	PluginType     common.PluginType     `yaml:"plugin_type" validate:"required"`
	OpenapiDocFile string                `yaml:"openapi_doc_file" validate:"required"`
	Manifest       *model.PluginManifest `yaml:"manifest" validate:"required"`
	Tools          []*toolProductMeta    `yaml:"tools" validate:"required"`
}

type toolProductMeta struct {
	ToolID     int64  `yaml:"tool_id" validate:"required"`
	Deprecated bool   `yaml:"deprecated"`
	Method     string `yaml:"method" validate:"required"`
	SubURL     string `yaml:"sub_url" validate:"required"`
}

var (
	pluginProducts map[int64]*PluginInfo
	toolProducts   map[int64]*ToolInfo
)

func GetToolProduct(toolID int64) (*ToolInfo, bool) {
	ti, ok := toolProducts[toolID]
	if !ok {
		return nil, false
	}

	ti_ := deepcopy.Copy(ti).(*ToolInfo)

	return ti_, true
}

func MGetToolProducts(toolIDs []int64) []*ToolInfo {
	tools := make([]*ToolInfo, 0, len(toolIDs))
	for _, toolID := range toolIDs {
		ti, ok := GetToolProduct(toolID)
		if !ok {
			continue
		}

		tools = append(tools, ti)
	}

	return tools
}

func GetPluginProduct(pluginID int64) (*PluginInfo, bool) {
	pl, ok := pluginProducts[pluginID]
	return pl, ok
}

func MGetPluginProducts(pluginIDs []int64) []*PluginInfo {
	plugins := make([]*PluginInfo, 0, len(pluginIDs))
	for _, pluginID := range pluginIDs {
		pl, ok := pluginProducts[pluginID]
		if !ok {
			continue
		}
		plugins = append(plugins, pl)
	}
	return plugins
}

func GetAllPluginProducts() []*PluginInfo {
	plugins := make([]*PluginInfo, 0, len(pluginProducts))
	for _, pl := range pluginProducts {
		plugins = append(plugins, pl)
	}
	return plugins
}

type PluginInfo struct {
	Info    *model.PluginInfo
	ToolIDs []int64
}

func (pi PluginInfo) GetPluginAllTools() (tools []*ToolInfo) {
	tools = make([]*ToolInfo, 0, len(pi.ToolIDs))
	for _, toolID := range pi.ToolIDs {
		ti, ok := toolProducts[toolID]
		if !ok {
			continue
		}
		tools = append(tools, ti)
	}
	return tools
}

type ToolInfo struct {
	Info *entity.ToolInfo
}

// func loadPluginProductMeta(ctx context.Context, basePath string) (err error) {
// 	root := path.Join(basePath, "pluginproduct")
// 	metaFile := path.Join(root, "plugin_meta.yaml")

// 	file, err := os.ReadFile(metaFile)
// 	if err != nil {
// 		return fmt.Errorf("read file '%s' failed, err=%v", metaFile, err)
// 	}

// 	var pluginsMeta []*pluginProductMeta
// 	err = yaml.Unmarshal(file, &pluginsMeta)
// 	if err != nil {
// 		return fmt.Errorf("unmarshal file '%s' failed, err=%v", metaFile, err)
// 	}

// 	pluginProducts = make(map[int64]*PluginInfo, len(pluginsMeta))
// 	toolProducts = map[int64]*ToolInfo{}

// 	for _, m := range pluginsMeta {
// 		if !checkPluginMetaInfo(ctx, m) {
// 			continue
// 		}

// 		err = m.Manifest.Validate(true)
// 		if err != nil {
// 			logs.CtxErrorf(ctx, "plugin manifest validates failed, err=%v", err)
// 			continue
// 		}

// 		docPath := path.Join(root, m.OpenapiDocFile)
// 		loader := openapi3.NewLoader()
// 		_doc, err := loader.LoadFromFile(docPath)
// 		if err != nil {
// 			logs.CtxErrorf(ctx, "load file '%s', err=%v", docPath, err)
// 			continue
// 		}

// 		doc := ptr.Of(model.Openapi3T(*_doc))

// 		err = doc.Validate(ctx)
// 		if err != nil {
// 			logs.CtxErrorf(ctx, "the openapi3 doc '%s' validates failed, err=%v", m.OpenapiDocFile, err)
// 			continue
// 		}

// 		pi := &PluginInfo{
// 			Info: &model.PluginInfo{
// 				ID:           m.PluginID,
// 				RefProductID: &m.ProductID,
// 				PluginType:   m.PluginType,
// 				Version:      ptr.Of(m.Version),
// 				IconURI:      ptr.Of(m.Manifest.LogoURL),
// 				ServerURL:    ptr.Of(doc.Servers[0].URL),
// 				Manifest:     m.Manifest,
// 				OpenapiDoc:   doc,
// 			},
// 			ToolIDs: make([]int64, 0, len(m.Tools)),
// 		}

// 		if pluginProducts[m.PluginID] != nil {
// 			logs.CtxErrorf(ctx, "duplicate plugin id '%d'", m.PluginID)
// 			continue
// 		}

// 		pluginProducts[m.PluginID] = pi

// 		apis := make(map[entity.UniqueToolAPI]*model.Openapi3Operation, len(doc.Paths))
// 		for subURL, pathItem := range doc.Paths {
// 			for method, op := range pathItem.Operations() {
// 				api := entity.UniqueToolAPI{
// 					SubURL: subURL,
// 					Method: strings.ToUpper(method),
// 				}
// 				apis[api] = model.NewOpenapi3Operation(op)
// 			}
// 		}

// 		for _, t := range m.Tools {
// 			if t.Deprecated {
// 				continue
// 			}

// 			_, ok := toolProducts[t.ToolID]
// 			if ok {
// 				logs.CtxErrorf(ctx, "duplicate tool id '%d'", t.ToolID)
// 				continue
// 			}

// 			api := entity.UniqueToolAPI{
// 				SubURL: t.SubURL,
// 				Method: strings.ToUpper(t.Method),
// 			}
// 			op, ok := apis[api]
// 			if !ok {
// 				logs.CtxErrorf(ctx, "api '[%s]:%s' not found in doc '%s'", api.Method, api.SubURL, docPath)
// 				continue
// 			}
// 			if err = op.Validate(ctx); err != nil {
// 				logs.CtxErrorf(ctx, "the openapi3 operation of tool '[%s]:%s' in '%s' validates failed, err=%v",
// 					t.Method, t.SubURL, m.OpenapiDocFile, err)
// 				continue
// 			}

// 			pi.ToolIDs = append(pi.ToolIDs, t.ToolID)

// 			toolProducts[t.ToolID] = &ToolInfo{
// 				Info: &entity.ToolInfo{
// 					ID:              t.ToolID,
// 					PluginID:        m.PluginID,
// 					Version:         ptr.Of(m.Version),
// 					Method:          ptr.Of(t.Method),
// 					SubURL:          ptr.Of(t.SubURL),
// 					Operation:       op,
// 					ActivatedStatus: ptr.Of(model.ActivateTool),
// 					DebugStatus:     ptr.Of(common.APIDebugStatus_DebugPassed),
// 				},
// 			}
// 		}

// 		if len(pi.ToolIDs) == 0 {
// 			delete(pluginProducts, m.PluginID)
// 		}
// 	}

// 	return nil
// }

func loadPluginProductMeta(ctx context.Context, basePath string) (err error) {
	log.Printf("[步骤 1] 开始加载插件，基础路径: %s", basePath)
	root := path.Join(basePath, "pluginproduct")
	metaFile := path.Join(root, "plugin_meta.yaml")

	log.Printf("[步骤 2] 准备读取主元数据文件: %s", metaFile)
	file, err := os.ReadFile(metaFile)
	if err != nil {
		log.Printf("[错误] 读取主元数据文件 '%s' 失败: %v", metaFile, err)
		return fmt.Errorf("read file '%s' failed, err=%v", metaFile, err)
	}
	log.Printf("[成功] 已成功读取主元数据文件: %s", metaFile)

	var pluginsMeta []*pluginProductMeta
	log.Println("[步骤 3] 准备解析 YAML 文件内容...")
	err = yaml.Unmarshal(file, &pluginsMeta)
	if err != nil {
		log.Printf("[错误] 解析 YAML 文件 '%s' 失败: %v", metaFile, err)
		return fmt.Errorf("unmarshal file '%s' failed, err=%v", metaFile, err)
	}
	log.Printf("[成功] YAML 解析完成，共找到 %d 个插件的元数据定义。", len(pluginsMeta))

	pluginProducts = make(map[int64]*PluginInfo, len(pluginsMeta))
	toolProducts = map[int64]*ToolInfo{}

	log.Println("================== [开始] 循环处理每个插件 ==================")
	for i, m := range pluginsMeta {
		log.Printf("\n--- [正在处理第 %d 个插件] PluginID: %d, 名称: %s ---", i+1, m.PluginID, m.Manifest.NameForHuman)

		log.Printf("    [检查 1] 正在检查插件元信息 (checkPluginMetaInfo)...")
		if !checkPluginMetaInfo(ctx, m) {
			log.Printf("    [跳过] 插件 (ID: %d) 未通过元信息检查，已跳过。", m.PluginID)
			continue
		}
		log.Printf("    [通过] 插件元信息检查通过。")

		log.Printf("    [检查 2] 正在验证插件清单 (Manifest)...")
		err = m.Manifest.Validate(true)
		if err != nil {
			log.Printf("    [错误] 插件 (ID: %d) 的清单验证失败: %v，已跳过。", m.PluginID, err)
			continue
		}
		log.Printf("    [通过] 插件清单验证通过。")

		docPath := path.Join(root, m.OpenapiDocFile)
		log.Printf("    [检查 3] 准备加载 OpenAPI 文档: %s", docPath)
		loader := openapi3.NewLoader()
		_doc, err := loader.LoadFromFile(docPath)
		if err != nil {
			log.Printf("    [错误] 插件 (ID: %d) 的 OpenAPI 文档 '%s' 加载失败: %v，已跳过。", m.PluginID, docPath, err)
			continue
		}
		log.Printf("    [通过] OpenAPI 文档加载成功。")

		doc := ptr.Of(model.Openapi3T(*_doc))

		log.Printf("    [检查 4] 正在验证 OpenAPI 文档内容...")
		err = doc.Validate(ctx)
		if err != nil {
			log.Printf("    [错误] 插件 (ID: %d) 的 OpenAPI 文档 '%s' 内容验证失败: %v，已跳过。", m.PluginID, m.OpenapiDocFile, err)
			continue
		}
		log.Printf("    [通过] OpenAPI 文档内容验证通过。")

		pi := &PluginInfo{
			Info: &model.PluginInfo{
				ID:         m.PluginID,
				PluginType: m.PluginType,
				Version:    ptr.Of(m.Version),
				IconURI:    ptr.Of(m.Manifest.LogoURL),
				ServerURL:  ptr.Of(doc.Servers[0].URL),
				Manifest:   m.Manifest,
				OpenapiDoc: doc,
			},
			ToolIDs: make([]int64, 0, len(m.Tools)),
		}

		if pluginProducts[m.PluginID] != nil {
			log.Printf("    [错误] 发现重复的 PluginID: %d，此插件将被跳过。", m.PluginID)
			continue
		}

		pluginProducts[m.PluginID] = pi

		apis := make(map[dto.UniqueToolAPI]*model.Openapi3Operation, len(doc.Paths))
		for subURL, pathItem := range doc.Paths {
			for method, op := range pathItem.Operations() {
				api := dto.UniqueToolAPI{
					SubURL: subURL,
					Method: strings.ToUpper(method),
				}
				apis[api] = model.NewOpenapi3Operation(op)
			}
		}

		log.Printf("    [信息] 正在处理该插件下的 %d 个工具...", len(m.Tools))
		for _, t := range m.Tools {
			if t.Deprecated {
				log.Printf("        - 工具 (ToolID: %d) 已被标记为弃用，已跳过。", t.ToolID)
				continue
			}

			if _, ok := toolProducts[t.ToolID]; ok {
				log.Printf("        - [错误] 发现重复的 ToolID: %d，此工具将被跳过。", t.ToolID)
				continue
			}

			api := dto.UniqueToolAPI{
				SubURL: t.SubURL,
				Method: strings.ToUpper(t.Method),
			}
			op, ok := apis[api]
			if !ok {
				log.Printf("        - [错误] 工具 (ToolID: %d) 定义的 API '[%s]:%s' 在 OpenAPI 文档 '%s' 中未找到，已跳过。", t.ToolID, api.Method, api.SubURL, docPath)
				continue
			}
			if err = op.Validate(ctx); err != nil {
				log.Printf("        - [错误] 工具 (ToolID: %d) 对应的 OpenAPI 操作验证失败: %v，已跳过。", t.ToolID, err)
				continue
			}

			pi.ToolIDs = append(pi.ToolIDs, t.ToolID)

			toolProducts[t.ToolID] = &ToolInfo{
				Info: &entity.ToolInfo{
					ID:              t.ToolID,
					PluginID:        m.PluginID,
					Version:         ptr.Of(m.Version),
					Method:          ptr.Of(t.Method),
					SubURL:          ptr.Of(t.SubURL),
					Operation:       op,
					ActivatedStatus: ptr.Of(consts.ActivateTool),
					DebugStatus:     ptr.Of(common.APIDebugStatus_DebugPassed),
				},
			}
		}

		if len(pi.ToolIDs) == 0 {
			log.Printf("    [警告] 插件 (ID: %d, 名称: %s) 没有加载任何有效的工具，此插件将被整体移除。", m.PluginID, m.Manifest.NameForHuman)
			delete(pluginProducts, m.PluginID)
		} else {
			log.Printf("--- [成功] 插件 (ID: %d, 名称: %s) 已处理完成，共加载 %d 个工具。 ---", m.PluginID, m.Manifest.NameForHuman, len(pi.ToolIDs))
		}
	}

	// =================================================================
	// ===================== 从这里开始是修改后的摘要日志 =====================
	// =================================================================
	log.Println("\n================== [结束] 所有插件处理完毕 ==================")

	if len(pluginProducts) > 0 {
		loadedPluginNames := make([]string, 0, len(pluginProducts))
		for _, pluginInfo := range pluginProducts {
			loadedPluginNames = append(loadedPluginNames, fmt.Sprintf("'%s'(ID:%d)", pluginInfo.Info.Manifest.NameForHuman, pluginInfo.Info.ID))
		}
		log.Printf("[总结] 最终成功加载了 %d 个插件产品: %v", len(pluginProducts), loadedPluginNames)
		log.Printf("[总结] 共加载了 %d 个工具。", len(toolProducts))
	} else {
		log.Println("[总结] 最终未能加载任何插件产品。")
	}

	return nil
}

func checkPluginMetaInfo(ctx context.Context, m *pluginProductMeta) (continued bool) {
	if m.Deprecated {
		return false
	}

	if !semver.IsValid(m.Version) {
		logs.CtxErrorf(ctx, "invalid version '%s'", m.Version)
		return false
	}
	if m.PluginID <= 0 {
		logs.CtxErrorf(ctx, "invalid plugin id '%d'", m.PluginID)
		return false
	}

	_, ok := toolProducts[m.PluginID]
	if ok {
		logs.CtxErrorf(ctx, "duplicate plugin id '%d'", m.PluginID)
		return false
	}
	if m.PluginType != common.PluginType_PLUGIN {
		logs.CtxErrorf(ctx, "invalid plugin type '%s'", m.PluginType)
		return false
	}

	return true
}
