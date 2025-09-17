const express = require('express')
const axios = require('axios')
const router = express.Router()

const SHOPLINE_API_BASE = 'https://open-api.shoplineapp.com'

// 中間件：檢查認證狀態
const requireAuth = (req, res, next) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Please authenticate first by visiting /auth/login' 
    })
  }
  
  // 檢查 token 是否過期
  if (req.session.tokenExpiresAt && Date.now() > req.session.tokenExpiresAt) {
    return res.status(401).json({ 
      error: 'Token expired', 
      message: 'Please re-authenticate by visiting /auth/login' 
    })
  }
  
  next()
}

// 建立 API 請求標頭
const getApiHeaders = (accessToken) => {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// 商店資訊
router.get('/shop', requireAuth, async (req, res) => {
  try {
    const response = await axios.get(`${SHOPLINE_API_BASE}/shop`, {
      headers: getApiHeaders(req.session.accessToken)
    })
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Shop API error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch shop information',
      details: error.response?.data || error.message
    })
  }
})

// 商品列表
router.get('/products', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const response = await axios.get(`${SHOPLINE_API_BASE}/products`, {
      headers: getApiHeaders(req.session.accessToken),
      params: { page, limit }
    })
    
    res.json({
      success: true,
      data: response.data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Products API error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch products',
      details: error.response?.data || error.message
    })
  }
})

// 單一商品
router.get('/products/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const response = await axios.get(`${SHOPLINE_API_BASE}/products/${id}`, {
      headers: getApiHeaders(req.session.accessToken)
    })
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Product API error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch product',
      details: error.response?.data || error.message
    })
  }
})

// 訂單列表
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const params = { page, limit }
    if (status) params.status = status
    
    const response = await axios.get(`${SHOPLINE_API_BASE}/orders`, {
      headers: getApiHeaders(req.session.accessToken),
      params
    })
    
    res.json({
      success: true,
      data: response.data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Orders API error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch orders',
      details: error.response?.data || error.message
    })
  }
})

// 單一訂單
router.get('/orders/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const response = await axios.get(`${SHOPLINE_API_BASE}/orders/${id}`, {
      headers: getApiHeaders(req.session.accessToken)
    })
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Order API error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch order',
      details: error.response?.data || error.message
    })
  }
})

// 客戶列表
router.get('/customers', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const response = await axios.get(`${SHOPLINE_API_BASE}/customers`, {
      headers: getApiHeaders(req.session.accessToken),
      params: { page, limit }
    })
    
    res.json({
      success: true,
      data: response.data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Customers API error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch customers',
      details: error.response?.data || error.message
    })
  }
})

// API 測試端點
router.get('/test', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'API connection successful',
    auth_info: {
      authenticated: true,
      scope: req.session.scope ? req.session.scope.split(',') : [],
      expires_at: req.session.tokenExpiresAt ? new Date(req.session.tokenExpiresAt).toISOString() : null
    },
    available_endpoints: [
      'GET /api/shop - 商店資訊',
      'GET /api/products - 商品列表',
      'GET /api/products/:id - 單一商品',
      'GET /api/orders - 訂單列表',
      'GET /api/orders/:id - 單一訂單',
      'GET /api/customers - 客戶列表'
    ],
    timestamp: new Date().toISOString()
  })
})

module.exports = router
