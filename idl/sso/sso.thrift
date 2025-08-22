include "../base.thrift"
namespace go sso

struct SSOCheckLoginRequest {
    255: optional base.Base Base (api.tag="base")
}

// 4. 定义与 Go 代码中 SuccessData 结构体完全匹配的 Thrift 结构体
struct SsoSuccessData {
    1: string account (api.json="account")
}

// 5. 定义与 Go 代码中 SuccessResponse 结构体完全匹配的 Thrift 结构体
//    这是你接口成功时返回的 JSON 格式
struct SSOCheckLoginResponse {
    1: i32 statusCode (api.json="statusCode")
    2: string message (api.json="message")
    3: SsoSuccessData data (api.json="data")
    255: optional base.BaseResp BaseResp (api.tag="base_resp")
}

// 6. 定义服务和接口
service SsoService {
    // 这里的路径和方法必须和你的 Go 代码里的 @router 注释完全一致
    SSOCheckLoginResponse CheckLoginStatusPost(1: SSOCheckLoginRequest req) (api.post = "/api/sso/check-login")
}
