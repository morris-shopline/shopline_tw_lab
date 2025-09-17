const express = require('express')
const crypto = require('crypto')
const router = express.Router()

// Webhook 驗證中間件
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-shopline-hmac-sha256']
  const webhookSecret = process.env.WEBHOOK_SECRET
  
  if (!signature || !webhookSecret) {
    console.warn('⚠️ Webhook signature verification skipped - missing signature or secret')
    return next()
  }
  
  const body = JSON.stringify(req.body)
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')
  
  const providedSignature = signature.replace('sha256=', '')
  
  if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature))) {
    console.error('❌ Webhook signature verification failed')
    return res.status(401).json({ error: 'Invalid webhook signature' })
  }
  
  console.log('✅ Webhook signature verified')
  next()
}

// 記錄 Webhook 事件
const logWebhookEvent = (req, res, next) => {
  const eventType = req.headers['x-shopline-topic']
  const eventId = req.headers['x-shopline-event-id']
  
  console.log(`📨 Webhook received: ${eventType} (${eventId})`)
  console.log('📊 Event data:', JSON.stringify(req.body, null, 2))
  
  next()
}

// 處理所有 Webhook 事件
router.post('/', verifyWebhookSignature, logWebhookEvent, (req, res) => {
  try {
    const eventType = req.headers['x-shopline-topic']
    const eventId = req.headers['x-shopline-event-id']
    const eventData = req.body
    
    // 根據事件類型處理不同的邏輯
    switch (eventType) {
      case 'orders/create':
        handleOrderCreated(eventData, eventId)
        break
        
      case 'orders/update':
        handleOrderUpdated(eventData, eventId)
        break
        
      case 'orders/paid':
        handleOrderPaid(eventData, eventId)
        break
        
      case 'orders/cancelled':
        handleOrderCancelled(eventData, eventId)
        break
        
      case 'products/create':
        handleProductCreated(eventData, eventId)
        break
        
      case 'products/update':
        handleProductUpdated(eventData, eventId)
        break
        
      case 'products/delete':
        handleProductDeleted(eventData, eventId)
        break
        
      case 'customers/create':
        handleCustomerCreated(eventData, eventId)
        break
        
      case 'customers/update':
        handleCustomerUpdated(eventData, eventId)
        break
        
      default:
        console.log(`🔔 Unhandled webhook event: ${eventType}`)
        handleGenericEvent(eventType, eventData, eventId)
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      event_type: eventType,
      event_id: eventId
    })
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    res.status(500).json({ 
      error: 'Webhook processing failed', 
      details: error.message 
    })
  }
})

// 訂單相關事件處理
function handleOrderCreated(orderData, eventId) {
  console.log(`🛒 New order created: ${orderData.id}`)
  console.log(`💰 Order total: ${orderData.total_price}`)
  console.log(`👤 Customer: ${orderData.customer?.email || 'Guest'}`)
  
  // 在這裡添加你的業務邏輯
  // 例如：發送確認郵件、更新庫存、記錄到資料庫等
}

function handleOrderUpdated(orderData, eventId) {
  console.log(`📝 Order updated: ${orderData.id}`)
  console.log(`📊 New status: ${orderData.financial_status}`)
  
  // 處理訂單狀態變更
}

function handleOrderPaid(orderData, eventId) {
  console.log(`💳 Order paid: ${orderData.id}`)
  console.log(`💰 Payment amount: ${orderData.total_price}`)
  
  // 處理付款完成邏輯
}

function handleOrderCancelled(orderData, eventId) {
  console.log(`❌ Order cancelled: ${orderData.id}`)
  
  // 處理訂單取消邏輯
}

// 商品相關事件處理
function handleProductCreated(productData, eventId) {
  console.log(`🆕 New product created: ${productData.title}`)
  console.log(`🏷️ Product ID: ${productData.id}`)
  
  // 處理新商品邏輯
}

function handleProductUpdated(productData, eventId) {
  console.log(`📝 Product updated: ${productData.title}`)
  
  // 處理商品更新邏輯
}

function handleProductDeleted(productData, eventId) {
  console.log(`🗑️ Product deleted: ${productData.id}`)
  
  // 處理商品刪除邏輯
}

// 客戶相關事件處理
function handleCustomerCreated(customerData, eventId) {
  console.log(`👤 New customer: ${customerData.email}`)
  console.log(`🆔 Customer ID: ${customerData.id}`)
  
  // 處理新客戶邏輯
}

function handleCustomerUpdated(customerData, eventId) {
  console.log(`📝 Customer updated: ${customerData.email}`)
  
  // 處理客戶更新邏輯
}

// 通用事件處理
function handleGenericEvent(eventType, eventData, eventId) {
  console.log(`🔔 Generic event handler for: ${eventType}`)
  console.log(`📊 Event data:`, JSON.stringify(eventData, null, 2))
  
  // 處理未分類的事件
}

// Webhook 測試端點
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is ready',
    webhook_url: `${process.env.APP_URL || 'http://localhost:3000'}/webhook`,
    supported_events: [
      'orders/create',
      'orders/update', 
      'orders/paid',
      'orders/cancelled',
      'products/create',
      'products/update',
      'products/delete',
      'customers/create',
      'customers/update'
    ],
    timestamp: new Date().toISOString()
  })
})

module.exports = router
