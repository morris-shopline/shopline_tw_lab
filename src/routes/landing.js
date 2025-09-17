const express = require('express')
const router = express.Router()

// SHOPLINE Action Button 登陸頁面
router.get('/', (req, res) => {
  const { 
    shop, 
    hmac, 
    timestamp, 
    code,
    state,
    merchant_id,
    application_id 
  } = req.query

  console.log('🚀 SHOPLINE Action Button Landing Page accessed')
  console.log('📊 Query parameters:', req.query)

  // 驗證 HMAC 簽名（如果有的話）
  if (hmac && shop) {
    console.log('🔐 HMAC verification required')
    // 這裡可以添加 HMAC 驗證邏輯
  }

  // 渲染登陸頁面
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SHOPLINE 應用程式登陸頁面</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                max-width: 500px;
                width: 100%;
                text-align: center;
            }
            
            .logo {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: white;
                font-weight: bold;
            }
            
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 28px;
                font-weight: 600;
            }
            
            .subtitle {
                color: #666;
                margin-bottom: 30px;
                font-size: 16px;
                line-height: 1.5;
            }
            
            .info-card {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
            }
            
            .info-item:last-child {
                margin-bottom: 0;
            }
            
            .info-label {
                color: #666;
                font-weight: 500;
            }
            
            .info-value {
                color: #333;
                font-weight: 600;
                word-break: break-all;
            }
            
            .btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                margin: 10px;
                text-decoration: none;
                display: inline-block;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            
            .btn-secondary {
                background: #6c757d;
            }
            
            .btn-secondary:hover {
                box-shadow: 0 10px 20px rgba(108, 117, 125, 0.3);
            }
            
            .status {
                padding: 10px 20px;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: 500;
            }
            
            .status.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .status.info {
                background: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }
            
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">SL</div>
            <h1>SHOPLINE 應用程式</h1>
            <p class="subtitle">歡迎使用我們的應用程式！請完成登入流程以開始使用。</p>
            
            <div class="status success">
                ✅ 成功連接到 SHOPLINE 平台
            </div>
            
            <div class="info-card">
                <div class="info-item">
                    <span class="info-label">商店網址:</span>
                    <span class="info-value">${shop || '未提供'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">商家 ID:</span>
                    <span class="info-value">${merchant_id || '未提供'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">應用程式 ID:</span>
                    <span class="info-value">${application_id || '未提供'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">授權碼:</span>
                    <span class="info-value">${code ? '已提供' : '未提供'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">狀態參數:</span>
                    <span class="info-value">${state || '未提供'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">時間戳記:</span>
                    <span class="info-value">${timestamp || '未提供'}</span>
                </div>
            </div>
            
            <div class="status info">
                ℹ️ 此頁面用於處理 SHOPLINE 應用程式的安裝和授權流程
            </div>
            
            <div style="margin-top: 30px;">
                <button class="btn" onclick="handleLogin()">開始使用應用程式</button>
                <a href="/webhook/test" class="btn btn-secondary">測試 Webhook</a>
            </div>
            
            <div class="footer">
                <p>© 2024 SHOPLINE 開發者實驗室</p>
                <p>此頁面用於 SHOPLINE Action Button 外部頁面設定</p>
            </div>
        </div>
        
        <script>
            function handleLogin() {
                // 這裡可以添加登入處理邏輯
                console.log('用戶點擊開始使用應用程式');
                
                // 如果有授權碼，可以進行 token 交換
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const merchantId = urlParams.get('merchant_id');
                
                if (code && merchantId) {
                    // 進行 OAuth token 交換
                    fetch('/api/auth/token-exchange', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            code: code,
                            merchant_id: merchantId
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Token 交換成功:', data);
                        alert('登入成功！應用程式已準備就緒。');
                    })
                    .catch(error => {
                        console.error('Token 交換失敗:', error);
                        alert('登入過程中發生錯誤，請重試。');
                    });
                } else {
                    alert('歡迎使用 SHOPLINE 應用程式！');
                }
            }
            
            // 頁面載入時記錄參數
            window.addEventListener('load', function() {
                const urlParams = new URLSearchParams(window.location.search);
                console.log('SHOPLINE 登陸頁面參數:', Object.fromEntries(urlParams));
            });
        </script>
    </body>
    </html>
  `)
})

// OAuth Token 交換端點
router.post('/api/auth/token-exchange', (req, res) => {
  const { code, merchant_id } = req.body
  
  console.log('🔄 OAuth Token 交換請求')
  console.log('📊 參數:', { code, merchant_id })
  
  // 這裡應該實作真正的 OAuth token 交換邏輯
  // 目前只是模擬回應
  
  res.json({
    success: true,
    message: 'Token 交換成功',
    access_token: 'mock_access_token_' + Date.now(),
    merchant_id: merchant_id,
    expires_in: 3600,
    timestamp: new Date().toISOString()
  })
})

// 健康檢查端點
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SHOPLINE Landing Page',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

module.exports = router
