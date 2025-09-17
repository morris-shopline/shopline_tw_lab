# SHOPLINE TW Lab - 部署指南

## 🚀 Render 部署步驟

### 1. 準備環境變數

在 Render 控制台中設定以下環境變數：

```bash
# 必要設定
NODE_ENV=production
PORT=3000
SESSION_SECRET=<自動生成>

# SHOPLINE App 設定 (需要從 Developer Center 取得)
SHOPLINE_CLIENT_ID=<你的_client_id>
SHOPLINE_CLIENT_SECRET=<你的_client_secret>
SHOPLINE_REDIRECT_URI=https://your-app-name.onrender.com/auth/callback
SHOPLINE_SCOPE=read_products,write_products,read_orders,write_orders,read_customers

# Webhook 設定
WEBHOOK_SECRET=<自動生成>
```

### 2. 在 SHOPLINE Developer Center 設定

1. 前往 [SHOPLINE Developer Center](https://shopline-developers.readme.io/docs/get-started)
2. 創建新的 App
3. 設定 OAuth Redirect URI: `https://your-app-name.onrender.com/auth/callback`
4. 設定 Webhook URL: `https://your-app-name.onrender.com/webhook`
5. 選擇需要的權限範圍 (Scopes)

### 3. Render 部署

1. 連接 GitHub 儲存庫到 Render
2. 選擇 `render.yaml` 配置
3. 設定環境變數
4. 部署應用程式

### 4. 測試部署

部署完成後，訪問以下端點進行測試：

- **首頁**: `https://your-app-name.onrender.com/`
- **健康檢查**: `https://your-app-name.onrender.com/health`
- **認證測試**: `https://your-app-name.onrender.com/auth/login`
- **API 測試**: `https://your-app-name.onrender.com/api/test`
- **Webhook 測試**: `https://your-app-name.onrender.com/webhook/test`

## 🔧 本地開發

### 安裝依賴

```bash
npm install
```

### 設定環境變數

複製 `env.example` 為 `.env` 並填入你的設定：

```bash
cp env.example .env
```

### 啟動開發伺服器

```bash
npm run dev
```

## 📚 API 端點

### 認證相關
- `GET /auth/login` - 開始 OAuth2 認證
- `GET /auth/callback` - OAuth2 回調處理
- `GET /auth/success` - 認證成功頁面
- `GET /auth/logout` - 登出
- `GET /auth/status` - 檢查認證狀態

### API 相關
- `GET /api/shop` - 商店資訊
- `GET /api/products` - 商品列表
- `GET /api/products/:id` - 單一商品
- `GET /api/orders` - 訂單列表
- `GET /api/orders/:id` - 單一訂單
- `GET /api/customers` - 客戶列表
- `GET /api/test` - API 測試

### Webhook 相關
- `POST /webhook` - Webhook 事件接收
- `GET /webhook/test` - Webhook 測試

## 🛠️ 故障排除

### 常見問題

1. **OAuth 認證失敗**
   - 檢查 `SHOPLINE_CLIENT_ID` 和 `SHOPLINE_CLIENT_SECRET` 是否正確
   - 確認 `SHOPLINE_REDIRECT_URI` 與 Developer Center 設定一致

2. **API 呼叫失敗**
   - 確認已通過 OAuth 認證
   - 檢查 token 是否過期
   - 確認 App 有足夠的權限範圍

3. **Webhook 接收失敗**
   - 檢查 `WEBHOOK_SECRET` 是否設定
   - 確認 Webhook URL 在 Developer Center 中正確設定

### 日誌查看

在 Render 控制台中查看應用程式日誌，所有重要事件都會記錄在控制台中。
