const express = require('express')
const crypto = require('crypto')
const storefrontOAuthService = require('../services/storefrontOAuth')
const router = express.Router()

/**
 * Storefront OAuth 路由
 * 根據 Integration Guide for Merchant Customer Authentication 實作
 * 處理客戶端 OAuth 流程
 */

// 生成隨機 state 參數
const generateState = () => {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * 開始 Storefront OAuth 流程
 * 重定向客戶到商家的授權頁面
 */
router.get('/authorize', async (req, res) => {
  try {
    const { merchant_id, requested_user_id, return_to } = req.query
    
    if (!merchant_id) {
      return res.status(400).json({ error: 'Missing merchant_id parameter' })
    }

    // 生成 state 參數
    const state = generateState()
    
    // 儲存 OAuth 資訊到 session
    if (!req.session.subSessions) {
      req.session.subSessions = []
    }
    
    req.session.subSessions.push({
      oauthInfo: {
        requestedMerchantId: merchant_id,
        requestedUserId: requested_user_id,
        state: state,
        returnTo: return_to,
        createdAt: new Date().toISOString()
      }
    })

    console.log('🔐 Starting Storefront OAuth flow:')
    console.log(`   Merchant ID: ${merchant_id}`)
    console.log(`   Requested User ID: ${requested_user_id || 'N/A'}`)
    console.log(`   State: ${state}`)
    console.log(`   Return To: ${return_to || 'N/A'}`)

    // TODO: 這裡需要從資料庫中取得該商家的 Storefront OAuth Application 資訊
    // 包括 app_id 和 redirect_uri
    // 暫時使用環境變數作為範例
    const clientId = process.env.STOREFRONT_CLIENT_ID || 'RLTdkWrfX51RaJ_zLUWIbektFiRyDn08yAH-oS0CIeM'
    const redirectUri = process.env.STOREFRONT_REDIRECT_URI || 'https://localhost:3000/storefront-oauth/callback'
    
    // TODO: 這裡需要從資料庫中取得該商家的 brand_home_url
    // 暫時使用環境變數作為範例
    const merchantStorefrontUrl = process.env.MERCHANT_STOREFRONT_URL || 'https://terence.shoplineapp.com'

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'shop',
      state: state
    })

    const authUrl = `${merchantStorefrontUrl}/oauth/authorize?${authParams.toString()}`
    
    console.log(`🔗 Redirecting to: ${authUrl}`)
    res.redirect(authUrl)
    
  } catch (error) {
    console.error('❌ Storefront OAuth authorize error:', error)
    res.status(500).json({ error: 'Storefront OAuth authorization failed', details: error.message })
  }
})

/**
 * Storefront OAuth 回調處理
 * 處理客戶授權完成後的回調
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query
    
    console.log('🔍 Storefront OAuth callback received:')
    console.log(`   Code: ${code ? 'Present' : 'Missing'}`)
    console.log(`   State: ${state || 'Missing'}`)
    console.log(`   Error: ${error || 'None'}`)
    
    // 檢查是否有錯誤
    if (error) {
      console.error('❌ Storefront OAuth error:', error)
      return res.status(400).json({ error: 'Storefront OAuth authorization failed', details: error })
    }
    
    // 驗證 state 參數
    if (!state || !req.session.subSessions) {
      console.error('❌ Invalid state parameter or no session')
      return res.status(400).json({ error: 'Invalid state parameter' })
    }
    
    // 找到對應的 session
    const currentSession = req.session.subSessions.find((session) => {
      return session.oauthInfo && session.oauthInfo.state === state
    })
    
    if (!currentSession) {
      console.error('❌ Session not found for state:', state)
      return res.status(400).json({ error: 'Session not found' })
    }
    
    const { requestedMerchantId, requestedUserId, returnTo } = currentSession.oauthInfo
    
    console.log('✅ Valid session found:')
    console.log(`   Merchant ID: ${requestedMerchantId}`)
    console.log(`   User ID: ${requestedUserId || 'N/A'}`)
    console.log(`   Return To: ${returnTo || 'N/A'}`)
    
    // TODO: 這裡需要從資料庫中取得該商家的 Storefront OAuth Application 資訊
    const clientId = process.env.STOREFRONT_CLIENT_ID || 'RLTdkWrfX51RaJ_zLUWIbektFiRyDn08yAH-oS0CIeM'
    const clientSecret = process.env.STOREFRONT_CLIENT_SECRET || 'JJ8gsA0ISbqEsl1mTHF8Nt29MQPJRlYLMpYHcTDFbgk'
    const redirectUri = process.env.STOREFRONT_REDIRECT_URI || 'https://localhost:3000/storefront-oauth/callback'
    const merchantStorefrontUrl = process.env.MERCHANT_STOREFRONT_URL || 'https://terence.shoplineapp.com'
    
    // 交換授權碼為 access token
    const tokenData = await storefrontOAuthService.exchangeStorefrontToken(
      merchantStorefrontUrl,
      clientId,
      clientSecret,
      code,
      redirectUri
    )
    
    // 取得詳細的 token 資訊
    const tokenInfo = await storefrontOAuthService.getStorefrontTokenInfo(
      merchantStorefrontUrl,
      tokenData.access_token
    )
    
    // 更新 session，標記為已認證
    currentSession.merchantId = requestedMerchantId
    currentSession.userId = tokenInfo.user._id
    currentSession.accessToken = tokenData.access_token
    currentSession.refreshToken = tokenData.refresh_token
    currentSession.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000)
    currentSession.scope = tokenData.scope
    currentSession.userInfo = tokenInfo.user
    currentSession.merchantInfo = tokenInfo.merchant
    currentSession.authenticatedAt = new Date().toISOString()
    
    // 清除 OAuth 資訊
    delete currentSession.oauthInfo
    
    console.log('✅ Storefront OAuth authentication successful:')
    console.log(`   User: ${tokenInfo.user.name} (${tokenInfo.user.email})`)
    console.log(`   Merchant: ${tokenInfo.merchant.name} (${tokenInfo.merchant.email})`)
    console.log(`   Scope: ${tokenData.scope}`)
    
    // 重定向到成功頁面或原始請求的頁面
    const successUrl = returnTo || '/storefront-oauth/success'
    res.redirect(successUrl)
    
  } catch (error) {
    console.error('❌ Storefront OAuth callback error:', error.response?.data || error.message)
    res.status(500).json({ 
      error: 'Storefront OAuth token exchange failed', 
      details: error.response?.data || error.message 
    })
  }
})

/**
 * Storefront OAuth 成功頁面
 */
router.get('/success', (req, res) => {
  // 找到已認證的 session
  const authenticatedSession = req.session.subSessions?.find(session => 
    session.merchantId && session.userId && !session.oauthInfo
  )
  
  if (!authenticatedSession) {
    return res.redirect('/storefront-oauth/authorize')
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Storefront OAuth 成功 - SHOPLINE TW Lab</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
            .container { max-width: 600px; margin: 0 auto; text-align: center; }
            .success { color: #28a745; font-size: 48px; margin-bottom: 20px; }
            .card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px; }
            .btn:hover { background: #0056b3; }
            .btn-secondary { background: #6c757d; }
            .btn-secondary:hover { background: #545b62; }
            .info { color: #6c757d; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success">✅</div>
            <h1>Storefront OAuth 認證成功！</h1>
            <p>你已成功連接到 SHOPLINE 商店前台</p>
            
            <div class="card">
                <h3>👤 用戶資訊</h3>
                <p><strong>姓名:</strong> ${authenticatedSession.userInfo?.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${authenticatedSession.userInfo?.email || 'N/A'}</p>
                <p><strong>用戶 ID:</strong> ${authenticatedSession.userId}</p>
            </div>
            
            <div class="card">
                <h3>🏪 商家資訊</h3>
                <p><strong>商家名稱:</strong> ${authenticatedSession.merchantInfo?.name || 'N/A'}</p>
                <p><strong>商家 Email:</strong> ${authenticatedSession.merchantInfo?.email || 'N/A'}</p>
                <p><strong>商家 ID:</strong> ${authenticatedSession.merchantId}</p>
            </div>
            
            <div class="card">
                <h3>🔑 Token 資訊</h3>
                <p><strong>Scope:</strong> ${authenticatedSession.scope}</p>
                <p><strong>過期時間:</strong> ${new Date(authenticatedSession.tokenExpiresAt).toLocaleString()}</p>
                <p class="info">認證時間: ${authenticatedSession.authenticatedAt}</p>
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

/**
 * 檢查 Storefront OAuth 認證狀態
 */
router.get('/status', (req, res) => {
  const { requested_merchant_id, requested_user_id } = req.query
  
  if (!requested_merchant_id || !requested_user_id) {
    return res.status(422).json({ error: 'Missing requested merchant id or user id' })
  }
  
  if (!req.session.subSessions) {
    req.session.subSessions = []
  }
  
  const currentSession = req.session.subSessions.find((session) => {
    return (
      session.merchantId === requested_merchant_id &&
      session.userId === requested_user_id
    )
  })
  
  const isAuthenticated = !!currentSession && !currentSession.oauthInfo
  const tokenExpired = currentSession?.tokenExpiresAt && Date.now() > currentSession.tokenExpiresAt
  
  res.json({
    authenticated: isAuthenticated && !tokenExpired,
    token_expired: tokenExpired,
    expires_at: currentSession?.tokenExpiresAt ? new Date(currentSession.tokenExpiresAt).toISOString() : null,
    scope: currentSession?.scope ? currentSession.scope.split(',') : [],
    user_info: currentSession?.userInfo || null,
    merchant_info: currentSession?.merchantInfo || null
  })
})

/**
 * Storefront OAuth 登出
 */
router.get('/logout', (req, res) => {
  const { requested_merchant_id, requested_user_id } = req.query
  
  if (requested_merchant_id && requested_user_id && req.session.subSessions) {
    // 只清除特定商家的 session
    req.session.subSessions = req.session.subSessions.filter((session) => {
      return !(session.merchantId === requested_merchant_id && session.userId === requested_user_id)
    })
    
    console.log(`🚪 Storefront OAuth logout for merchant: ${requested_merchant_id}, user: ${requested_user_id}`)
  } else {
    // 清除所有 session
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Storefront OAuth logout error:', err)
        return res.status(500).json({ error: 'Logout failed' })
      }
    })
  }
  
  res.redirect('/')
})

module.exports = router
