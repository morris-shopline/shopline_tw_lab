# **App Installation Token**

App Installation Token flow allows app to receive an open api access token through webhook after merchant installed your app. You may store the token in a database for calling Open API in background operations.App 安裝令牌流程允許應用程式在商家安裝您的應用程式後，通過 webhook 接收開放 API 存取令牌。您可以將令牌儲存在資料庫中，以便在背景操作中調用開放 API。

## **Developer Center Settings開發者中心設定**

- **API Keys**: Turn On “App Installation Token”
    
    API 金鑰：開啟「App 安裝令牌」
    
- **App Scope**: Select required scopes
    
    應用範圍：選擇所需的範圍
    
- **Deploy & Release > Webhook**: Register Webhook URL for:
    
    部署與發佈 > Webhook: 註冊 Webhook URL 用於：
    
    - Access Tokens > app_installation_token_create
        
        存取權杖 > app_installation_token_create
        
    - Access Tokens > app_installation_token_revoke
        
        存取權杖 > app_installation_token_revoke
        

## **Sample Webhook Payload 範例 Webhook 負載**

> ❗️Webhook Signature VerificationWebhook 簽名驗證
> 
> 
> To verify the webhooks are sent from SHOPLINE, make sure to verify the signature for the webhook payload.為了確認 webhook 是來自 SHOPLINE，請確保驗證 webhook 負載的簽名。
> 
> Please refer to https://shopline-developers.readme.io/docs/webhook-signature請參考 https://shopline-developers.readme.io/docs/webhook-signature
> 

### **access_token/app_installation_token_create**

JSX

`{
  "event": "AccessToken",
  "is_devstore": true,
  "merchant_id": "5f0e8941c68746000897e1f7",
  "resource": {
    "_id": "645120c39b5a04000df887cc",
    "application_id": "642e3aed696d9f000e94c99c",
    "created_at": "2023-05-02T14:40:03.887Z",
    "expires_at": "2340-03-22T08:26:42.887Z",
    "expires_in": 9999999999,
    "is_app_installation_token": true,
    "resource_owner_id": {
      "id": "5f0e8941c68746000897e1f7",
      "performer_id": "5f0e894156baf200189ce906"
    },
    "scopes": "products orders pages addon_products",
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmNDgzZmQ1ZGUxOGI4YWUyOWI1MzBkOWExN2I5MTAyZCIsImRhdGEiOnsibWVyY2hhbnRfaWQiOiI1ZjBlODk0MWM2ODc0NjAwMDg5N2UxZjciLCJhcHBsaWNhdGlvbl9pZCI6IjYyZmQwY2NmZDNjYTY5MDAwYjc1NTQ2MiJ9LCJpc3MiOiJodHRwczovL2RldmVsb3BlcnMuc2hvcGxpbmVzdGcuY29tIiwiYXVkIjpbXSwic3ViIjoiNWYwZTg5NDFjNjg3NDYwMDA4OTdlMWY3In0.TQZQEzMsKTwgJvsk0YMfhhds1fqE0NDixy3sMoa6k7I",
    "updated_at": "2023-05-02T14:40:03.892Z",
    "version_type": "TESTING"
  },
  "topic": "access_token/app_installation_token_create",
  "trace_id": "79021955-9239-4435-a6bc-62dc2a685eca",
  "ts": "1683038404039389949"
}`

### **access_token/app_installation_token_revoke**

JSX

`{
  "event": "AccessToken",
  "is_devstore": true,
  "merchant_id": "5f0e8941c68746000897e1f7",
  "resource": {
    "_id": "64367871931544000bf889f8",
    "application_id": "642e3aed696d9f000e94c99c",
    "created_at": "2023-04-12T09:22:57.906Z",
    "expires_at": "2340-03-02T03:09:36.906Z",
    "expires_in": 9999999999,
    "is_app_installation_token": true,
    "resource_owner_id": {
      "id": "5f0e8941c68746000897e1f7",
      "performer_id": "5f0e894156baf200189ce906"
    },
    "revoked_at": "2023-05-02T14:39:27.88Z",
    "scopes": "products orders pages addon_products",
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmNDgzZmQ1ZGUxOGI4YWUyOWI1MzBkOWExN2I5MTAyZCIsImRhdGEiOnsibWVyY2hhbnRfaWQiOiI1ZjBlODk0MWM2ODc0NjAwMDg5N2UxZjciLCJhcHBsaWNhdGlvbl9pZCI6IjYyZmQwY2NmZDNjYTY5MDAwYjc1NTQ2MiJ9LCJpc3MiOiJodHRwczovL2RldmVsb3BlcnMuc2hvcGxpbmVzdGcuY29tIiwiYXVkIjpbXSwic3ViIjoiNWYwZTg5NDFjNjg3NDYwMDA4OTdlMWY3In0.TQZQEzMsKTwgJvsk0YMfhhds1fqE0NDixy3sMoa6k7I",
    "updated_at": "2023-05-02T14:39:27.88Z",
    "version_type": "TESTING"
  },
  "topic": "access_token/app_installation_token_revoke",
  "trace_id": "1c52daca-9e70-4bfd-9d61-642467e4f972",
  "ts": "1683038367979744724"
}`
