# 本地開發設定指南

## 快速設定步驟

### 1. 環境變數設定

```bash
# 複製環境變數範例檔案
cp env.local.example .env

# 編輯 .env 檔案，填入您的設定
```

在 `.env` 檔案中填入以下資訊：

```env
# SHOPLINE App Configuration
SHOPLINE_CLIENT_ID=your_client_id_here
SHOPLINE_CLIENT_SECRET=your_client_secret_here
SHOPLINE_REDIRECT_URI=http://localhost:3000/auth/callback
SHOPLINE_SCOPE=read_products,write_products,read_orders,write_orders

# App Configuration
APP_URL=http://localhost:3000
PORT=3000
SESSION_SECRET=dev-session-secret-key-change-in-production
NODE_ENV=development

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. 安裝 ngrok

1. 前往 [ngrok.com](https://ngrok.com/) 註冊免費帳號
2. 下載並安裝 ngrok
3. 執行 `ngrok authtoken YOUR_AUTH_TOKEN`

### 3. 啟動應用程式

```bash
# 一般啟動
npm run dev

# 或使用 ngrok 啟動（推薦用於 webhook 測試）
npm run ngrok
```

### 4. 測試 Webhook

```bash
# 測試 webhook 簽名生成
npm run test-webhook
```

## Webhook 測試流程

### 1. 啟動 ngrok
```bash
npm run ngrok
```

### 2. 更新 SHOPLINE Developer Center
- 登入 [SHOPLINE Developer Center](https://developers.shopline.com/)
- 前往您的應用程式設定
- 在 Webhook 設定中，將 URL 更新為 ngrok 提供的 URL + `/webhook`
- 例如：`https://abc123.ngrok.io/webhook`

### 3. 測試 Webhook 事件
- 在 SHOPLINE Developer Center 中觸發測試事件
- 查看終端機輸出，確認 webhook 事件被正確接收

### 4. 驗證簽名
- 應用程式會自動驗證 webhook 簽名
- 如果驗證失敗，檢查 `WEBHOOK_SECRET` 是否正確設定

## 支援的 Webhook 事件

- `orders/create` - 訂單建立
- `orders/update` - 訂單更新
- `orders/paid` - 訂單付款
- `orders/cancelled` - 訂單取消
- `products/create` - 商品建立
- `products/update` - 商品更新
- `products/delete` - 商品刪除
- `customers/create` - 客戶建立
- `customers/update` - 客戶更新
- `application/install` - 應用程式安裝
- `application/uninstall` - 應用程式卸載
- `access_token/create` - 存取權杖建立
- `access_token/revoke` - 存取權杖撤銷
- `access_token/app_installation_token_create` - App 安裝權杖建立
- `access_token/app_installation_token_revoke` - App 安裝權杖撤銷

## 除錯指南

### Webhook 簽名驗證失敗
1. 檢查 `WEBHOOK_SECRET` 是否正確
2. 確認 SHOPLINE Developer Center 中的 webhook secret 設定
3. 檢查 payload 格式是否正確

### ngrok 連線問題
1. 確認 ngrok 已正確安裝並設定 auth token
2. 檢查防火牆設定
3. 確認網路連線正常

### 應用程式無法啟動
1. 檢查 Node.js 版本（需要 >= 18.0.0）
2. 確認所有依賴已安裝：`npm install`
3. 檢查環境變數設定

## 常用指令

```bash
# 啟動開發伺服器
npm run dev

# 使用 ngrok 啟動
npm run ngrok

# 測試 webhook 簽名
npm run test-webhook

# 檢查應用程式狀態
curl http://localhost:3000/health

# 檢查 webhook 端點
curl http://localhost:3000/webhook/test
```
