const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const webhookRoutes = require('./routes/webhook')
const apiRoutes = require('./routes/api')
const landingRoutes = require('./routes/landing')
const storefrontOAuthRoutes = require('./routes/storefrontOAuth')

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}))

// Body parsing middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: true, // 改為 true 確保 session 被建立
  cookie: {
    secure: false, // 暫時設為 false 以便除錯
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // 增加 sameSite 設定
  }
}))

// Serve static files
app.use(express.static('public'))

// Routes
app.use('/auth', authRoutes)
app.use('/webhook', webhookRoutes)
app.use('/api', apiRoutes)
app.use('/landing', landingRoutes)
app.use('/storefront-oauth', storefrontOAuthRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SHOPLINE TW Lab</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; }
            .card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 5px; }
            .btn:hover { background: #0056b3; }
            .btn-success { background: #28a745; }
            .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
            .status-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛍️ SHOPLINE TW Lab</h1>
                <p>SHOPLINE 開發者測試應用程式</p>
            </div>
            
            <div class="card">
                <h3>✅ Webhook 狀態</h3>
                <div class="status status-success">
                    <strong>Webhook 端點正常運行</strong><br>
                    端點: <code>/webhook</code><br>
                    驗證: ✅ 已通過 SHOPLINE 驗證
                </div>
                <a href="/webhook/test" class="btn btn-success">測試 Webhook</a>
            </div>
            
            <div class="card">
                <h3>🚀 快速開始</h3>
                <p>這個應用程式提供 SHOPLINE 生態系統的完整測試環境，包括：</p>
                <ul>
                    <li>OAuth2 認證流程</li>
                    <li>Webhook 事件處理</li>
                    <li>API 整合測試</li>
                    <li>商店資料存取</li>
                    <li>Storefront OAuth (客戶端認證)</li>
                </ul>
                <a href="/auth/login" class="btn">商家認證</a>
                <a href="/storefront-oauth/authorize?merchant_id=5f0e8941c68746000897e1f7" class="btn">客戶端認證</a>
            </div>
            
            <div class="card">
                <h3>📚 開發資源</h3>
                <p>參考 SHOPLINE Developer Center 文件：</p>
                <a href="https://shopline-developers.readme.io/docs/get-started" target="_blank" class="btn">開發者文件</a>
            </div>
        </div>
    </body>
    </html>
  `)
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

app.listen(PORT, () => {
  console.log(`🚀 SHOPLINE TW Lab server running on port ${PORT}`)
  console.log(`📱 App URL: ${process.env.APP_URL || `http://localhost:${PORT}`}`)
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app
