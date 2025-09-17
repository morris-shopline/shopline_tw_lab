# Shopline TW Lab

這是一個 Shopline Taiwan 實驗室專案，提供完整的 SHOPLINE 生態系統測試環境。

## 快速開始

1. 克隆專案
```bash
git clone <repository-url>
cd shopline_tw_lab
```

2. 安裝依賴
```bash
npm install
```

3. 設定環境變數
```bash
cp env.local.example .env
# 編輯 .env 檔案，填入您的 SHOPLINE 應用程式設定
```

4. 啟動開發伺服器
```bash
npm run dev
```

## 本地 Webhook 測試

### 使用 ngrok 進行本地測試

1. 安裝 ngrok
   - 前往 [ngrok.com](https://ngrok.com/) 註冊免費帳號
   - 下載並安裝 ngrok
   - 執行 `ngrok authtoken YOUR_AUTH_TOKEN`

2. 啟動應用程式與 ngrok
```bash
npm run ngrok
```

3. 更新 SHOPLINE Developer Center
   - 將 webhook URL 設定為 ngrok 提供的 URL + `/webhook`
   - 例如：`https://abc123.ngrok.io/webhook`

### 測試 Webhook 簽名

```bash
npm run test-webhook
```

這會生成測試用的 webhook 簽名，您可以用來測試本地端點。

### 手動測試 Webhook

```bash
# 使用 curl 測試 webhook 端點
curl -X POST "http://localhost:3000/webhook?sign=YOUR_SIGNATURE" \
  -H "Content-Type: application/json" \
  -H "x-shopline-developer-event-timestamp: TIMESTAMP" \
  -d '{"event": "test", "data": "example"}'
```

## 專案結構

```
shopline_tw_lab/
├── README.md
├── .gitignore
└── ...
```

## 開發指南

- 使用 TypeScript 進行開發
- 遵循 ESLint 和 Prettier 規範
- 使用 Tailwind CSS 進行樣式設計
- 採用函數式程式設計風格

## 貢獻

請確保在提交前運行測試：
```bash
npm test
```
