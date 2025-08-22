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

// sso.go

package coze

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol"
	"github.com/coze-dev/coze-studio/backend/api/model/passport"
	"github.com/coze-dev/coze-studio/backend/application/user"
	"github.com/coze-dev/coze-studio/backend/domain/user/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/hertzutil/domain"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

// --- Structs for External API Response (Keep these as they are) ---
type SuccessData struct {
	Account string `json:"account"`
}
type SuccessResponse struct {
	StatusCode int         `json:"statusCode"`
	Message    string      `json:"message"`
	Data       SuccessData `json:"data"`
}
type ErrorResponse struct {
	StatusCode int    `json:"statusCode"`
	Message    string `json:"message"`
}
type SsoRequest struct {
    // `json:"ctx"` 标签确保它能正确绑定名为 "ctx" 的字段
    Ctx string `json:"ctx" vd:"required"`
}

// --- Core External API Logic (Keep this as it is) ---
func checkLoginApi(token string) (*SuccessResponse, error) {
	url := "https://www.rail-info.com/gpt/v1/trans/get-user-info"
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	// IMPORTANT: The external API requires "Bearer " prefix
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode == http.StatusOK {
		var successData SuccessResponse
		if err := json.Unmarshal(body, &successData); err != nil {
			return nil, fmt.Errorf("failed to decode successful response JSON: %w", err)
		}
		return &successData, nil
	}

	var errorData ErrorResponse
	if err := json.Unmarshal(body, &errorData); err != nil {
		return nil, fmt.Errorf("request failed with status code %d and unparseable body: %s", resp.StatusCode, string(body))
	}
	return nil, fmt.Errorf("API error: (status %d) %s", errorData.StatusCode, errorData.Message)
}






// CheckLoginStatusPost is the updated Hertz handler that orchestrates the full SSO logic.
// @router /api/sso/check-login [POST]
func CheckLoginStatusPost(ctx context.Context, c *app.RequestContext) {
	var req SsoRequest
  if err := c.BindAndValidate(&req); err != nil {
        // 如果请求体为空，或者没有 "ctx" 字段，这里会报错
        internalServerErrorResponse(ctx, c, err)
        return
  }

    // 3. 从绑定好的结构体中获取 token
  token := req.Ctx
  if token == "" {
        internalServerErrorResponse(ctx, c, errors.New("token from ctx field cannot be empty"))
        return
  }

	// 1. Validate token with the external service
	loginInfo, err := checkLoginApi(token)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}
	if loginInfo.Data.Account == "" {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	accountName := loginInfo.Data.Account
	userEmail := fmt.Sprintf("%s@rails.cn", accountName)
	userPassword := "XxsVip@2025" // 固定的密码

	// 3. 直接尝试使用用户信息和固定密码进行登录
	loginReq := &passport.PassportWebEmailLoginPostRequest{
		Email:    userEmail,
		Password: userPassword,
	}

	loginResp, sessionKey, loginErr := user.UserApplicationSVC.PassportWebEmailLoginPost(ctx, loginReq)
	fmt.Printf("Login response: %+v, SessionKey: %s, Error: %v\n", loginResp, sessionKey, loginErr)
	// 4. 判断登录结果
	if loginErr != nil {
		// 登录失败 - 在此场景下，我们认为就是用户不存在，立即尝试注册
		registerReq := &passport.PassportWebEmailRegisterV2PostRequest{
			Email:    userEmail,
			Password: userPassword,
		}
		locale := string("zh-CN") // 获取地区信息

		regResp, regSessionKey, regErr := user.UserApplicationSVC.PassportWebEmailRegisterV2(ctx, locale, registerReq)
		if regErr != nil {
			// 如果尝试注册也失败了（比如，并发请求导致用户刚被创建），则返回统一的错误
			internalServerErrorResponse(ctx, c, fmt.Errorf("登录和注册均失败: %w", regErr))
			return
		}

		// 注册成功，设置 cookie 并返回响应
		c.SetCookie(entity.SessionKey,
			regSessionKey,
			3600, // Set session max age to 3600 seconds (1 hour)
			"/", domain.GetOriginHost(c),
			protocol.CookieSameSiteDefaultMode,
			false, true)

		c.JSON(http.StatusOK, regResp)
		return
	}

	// 5. 登录成功
	// 设置 cookie 并返回响应
	c.SetCookie(entity.SessionKey,
		sessionKey,
		consts.SessionMaxAgeSecond,
		"/", domain.GetOriginHost(c),
		protocol.CookieSameSiteDefaultMode,
		false, true)
	c.JSON(http.StatusOK, loginResp)
}
