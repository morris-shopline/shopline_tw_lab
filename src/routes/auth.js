const express = require('express')
const axios = require('axios')
const crypto = require('crypto')
const router = express.Router()

// SHOPLINE OAuth2 配置
const SHOPLINE_AUTH_URL = 'https://auth.shoplineapp.com/oauth/authorize'
const SHOPLINE_TOKEN_URL = 'https://auth.shoplineapp.com/oauth/token'
const SHOPLINE_API_BASE = 'https://open-api.shoplineapp.com'

// 生成隨機 state 參數
const generateState = () => {
  return crypto.randomBytes(32).toString('hex')
}

// 開始 OAuth2 認證流程
router.get('/login', (req, res) => {
  try {
    const state = generateState()
    req.session.oauthState = state
    
    const authParams = new URLSearchParams({
      client_id: process.env.SHOPLINE_CLIENT_ID,
      redirect_uri: process.env.SHOPLINE_REDIRECT_URI,
      response_type: 'code',
      scope: process.env.SHOPLINE_SCOPE || 'read_products,read_orders',
      state: state
    })
    
    const authUrl = `${SHOPLINE_AUTH_URL}?${authParams.toString()}`
    
    console.log('🔐 Redirecting to SHOPLINE auth:', authUrl)
    res.redirect(authUrl)
  } catch (error) {
    console.error('❌ Auth login error:', error)
    res.status(500).json({ error: 'Authentication failed', details: error.message })
  }
})

// OAuth2 回調處理
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query
    
    console.log('🔍 OAuth callback received:')
    console.log('   Code:', code ? 'Present' : 'Missing')
    console.log('   State:', state || 'Missing')
    console.log('   Session State:', req.session.oauthState || 'Missing')
    console.log('   Error:', error || 'None')
    
    // 檢查是否有錯誤
    if (error) {
      console.error('❌ OAuth error:', error)
      return res.status(400).json({ error: 'OAuth authorization failed', details: error })
    }
    
    // 驗證 state 參數
    if (!state || state !== req.session.oauthState) {
      console.error('❌ Invalid state parameter')
      console.error('   Expected:', req.session.oauthState)
      console.error('   Received:', state)
      console.error('   Session ID:', req.sessionID)
      return res.status(400).json({ 
        error: 'Invalid state parameter',
        details: {
          expected: req.session.oauthState,
          received: state,
          sessionId: req.sessionID
        }
      })
    }
    
    // 清除 session 中的 state
    delete req.session.oauthState
    
    // 交換授權碼為 access token
    const tokenResponse = await axios.post(SHOPLINE_TOKEN_URL, {
      client_id: process.env.SHOPLINE_CLIENT_ID,
      client_secret: process.env.SHOPLINE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.SHOPLINE_REDIRECT_URI
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const { access_token, refresh_token, expires_in, scope } = tokenResponse.data
    
    // 儲存 token 到 session
    req.session.accessToken = access_token
    req.session.refreshToken = refresh_token
    req.session.tokenExpiresAt = Date.now() + (expires_in * 1000)
    req.session.scope = scope
    
    console.log('✅ OAuth2 authentication successful')
    console.log('📊 Token info:', { 
      expires_in, 
      scope: scope.split(','),
      expires_at: new Date(req.session.tokenExpiresAt).toISOString()
    })
    
    // 重定向到成功頁面
    res.redirect('/auth/success')
    
  } catch (error) {
    console.error('❌ OAuth callback error:', error.response?.data || error.message)
    res.status(500).json({ 
      error: 'Token exchange failed', 
      details: error.response?.data || error.message 
    })
  }
})

// 認證成功頁面
router.get('/success', (req, res) => {
  if (!req.session.accessToken) {
    return res.redirect('/auth/login')
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>認證成功 - SHOPLINE TW Lab</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
            .container { max-width: 600px; margin: 0 auto; text-align: center; }
            .success { color: #28a745; font-size: 48px; margin-bottom: 20px; }
            .card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px; }
            .btn:hover { background: #0056b3; }
            .btn-secondary { background: #6c757d; }
            .btn-secondary:hover { background: #545b62; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success">✅</div>
            <h1>認證成功！</h1>
            <p>你已成功連接到 SHOPLINE 商店</p>
            
            <div class="card">
                <h3>🎉 下一步</h3>
                <p>現在你可以開始測試 SHOPLINE API 功能：</p>
                <ul>
                    <li>查看商店資訊</li>
                    <li>讀取商品資料</li>
                    <li>處理訂單事件</li>
                    <li>設定 Webhook</li>
                </ul>
            </div>
            
            <div>
                <a href="/api/shop" class="btn">查看商店資訊</a>
                <a href="/api/products" class="btn">查看商品</a>
                <a href="/api/orders" class="btn">查看訂單</a>
                <a href="/" class="btn btn-secondary">回到首頁</a>
            </div>
        </div>
    </body>
    </html>
  `)
})

// 登出
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Logout error:', err)
      return res.status(500).json({ error: 'Logout failed' })
    }
    res.redirect('/')
  })
})

// 檢查認證狀態
router.get('/status', (req, res) => {
  const isAuthenticated = !!req.session.accessToken
  const tokenExpired = req.session.tokenExpiresAt && Date.now() > req.session.tokenExpiresAt
  
  res.json({
    authenticated: isAuthenticated && !tokenExpired,
    token_expired: tokenExpired,
    expires_at: req.session.tokenExpiresAt ? new Date(req.session.tokenExpiresAt).toISOString() : null,
    scope: req.session.scope ? req.session.scope.split(',') : []
  })
})

module.exports = router
