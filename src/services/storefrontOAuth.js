const axios = require('axios')

/**
 * Storefront OAuth 服務
 * 根據 Integration Guide for Merchant Customer Authentication 實作
 */

// SHOPLINE Open API 基礎 URL
const SHOPLINE_API_BASE = 'https://open.shopline.io/v1'

/**
 * 建立 Storefront OAuth Application
 * 當商家安裝應用程式時，如果尚未建立 storefront oauth application，應該呼叫此函數
 * 
 * @param {string} appToken - App Installation Token
 * @param {string} merchantId - 商家 ID
 * @param {string} name - OAuth Application 名稱
 * @param {string|Array} redirectUris - 重定向 URI（可以是字串或陣列）
 * @returns {Promise<Object>} OAuth Application 資訊
 */
async function createStorefrontOAuthApplication(appToken, merchantId, name, redirectUris) {
  try {
    // 將 redirectUris 轉換為字串格式（用 \n 分隔）
    const redirectUriString = Array.isArray(redirectUris) 
      ? redirectUris.join('\n') 
      : redirectUris

    const payload = {
      name: name,
      redirect_uri: redirectUriString,
      is_redirect_to_simplified_login: false
    }

    console.log('🔧 Creating Storefront OAuth Application:')
    console.log(`   Merchant ID: ${merchantId}`)
    console.log(`   Name: ${name}`)
    console.log(`   Redirect URIs: ${redirectUriString}`)

    const response = await axios.post(
      `${SHOPLINE_API_BASE}/storefront/oauth_applications`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${appToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('✅ Storefront OAuth Application created successfully:')
    console.log(`   ID: ${response.data.id}`)
    console.log(`   App ID: ${response.data.app_id}`)
    console.log(`   App Secret: ${response.data.app_secret ? 'Present' : 'Not provided'}`)
    console.log(`   Name: ${response.data.name}`)

    return response.data
  } catch (error) {
    console.error('❌ Failed to create Storefront OAuth Application:', error.response?.data || error.message)
    throw error
  }
}

/**
 * 刪除 Storefront OAuth Application
 * 當商家卸載應用程式時，應該清理相關的 OAuth Application
 * 
 * @param {string} appToken - App Installation Token
 * @param {string} oauthAppId - OAuth Application ID
 * @returns {Promise<boolean>} 是否成功刪除
 */
async function deleteStorefrontOAuthApplication(appToken, oauthAppId) {
  try {
    console.log('🗑️ Deleting Storefront OAuth Application:')
    console.log(`   OAuth App ID: ${oauthAppId}`)

    await axios.delete(
      `${SHOPLINE_API_BASE}/storefront/oauth_applications/${oauthAppId}`,
      {
        headers: {
          'Authorization': `Bearer ${appToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('✅ Storefront OAuth Application deleted successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to delete Storefront OAuth Application:', error.response?.data || error.message)
    throw error
  }
}

/**
 * 取得商家資訊（包含 storefront URL）
 * 
 * @param {string} appToken - App Installation Token
 * @param {string} merchantId - 商家 ID
 * @returns {Promise<Object>} 商家資訊
 */
async function getMerchantInfo(appToken, merchantId) {
  try {
    console.log('🔍 Getting merchant info:')
    console.log(`   Merchant ID: ${merchantId}`)

    const response = await axios.get(
      `${SHOPLINE_API_BASE}/merchants/${merchantId}`,
      {
        headers: {
          'Authorization': `Bearer ${appToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('✅ Merchant info retrieved:')
    console.log(`   ID: ${response.data.id}`)
    console.log(`   Brand Home URL: ${response.data.brand_home_url}`)
    console.log(`   Email: ${response.data.email}`)
    console.log(`   Handle: ${response.data.handle}`)

    return response.data
  } catch (error) {
    console.error('❌ Failed to get merchant info:', error.response?.data || error.message)
    throw error
  }
}

/**
 * 執行 Storefront OAuth Token 交換
 * 當客戶完成授權後，使用授權碼換取 access token
 * 
 * @param {string} merchantStorefrontUrl - 商家商店前台 URL
 * @param {string} clientId - Storefront OAuth App ID
 * @param {string} clientSecret - Storefront OAuth App Secret
 * @param {string} code - 授權碼
 * @param {string} redirectUri - 重定向 URI
 * @returns {Promise<Object>} Token 資訊
 */
async function exchangeStorefrontToken(merchantStorefrontUrl, clientId, clientSecret, code, redirectUri) {
  try {
    const payload = {
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    }

    console.log('🔄 Exchanging Storefront OAuth token:')
    console.log(`   Storefront URL: ${merchantStorefrontUrl}`)
    console.log(`   Client ID: ${clientId}`)
    console.log(`   Code: ${code ? 'Present' : 'Missing'}`)

    const response = await axios.post(
      `${merchantStorefrontUrl}/oauth/token`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('✅ Storefront OAuth token exchanged successfully:')
    console.log(`   Access Token: ${response.data.access_token ? 'Present' : 'Not provided'}`)
    console.log(`   Token Type: ${response.data.token_type}`)
    console.log(`   Expires In: ${response.data.expires_in} seconds`)
    console.log(`   Scope: ${response.data.scope}`)
    console.log(`   User ID: ${response.data.user?._id}`)
    console.log(`   User Email: ${response.data.user?.email}`)
    console.log(`   Merchant ID: ${response.data.merchant?._id}`)

    return response.data
  } catch (error) {
    console.error('❌ Failed to exchange Storefront OAuth token:', error.response?.data || error.message)
    throw error
  }
}

/**
 * 取得 Storefront OAuth Token 資訊
 * 使用 access token 取得詳細的用戶和商家資訊
 * 
 * @param {string} merchantStorefrontUrl - 商家商店前台 URL
 * @param {string} accessToken - Storefront OAuth Access Token
 * @returns {Promise<Object>} Token 詳細資訊
 */
async function getStorefrontTokenInfo(merchantStorefrontUrl, accessToken) {
  try {
    console.log('🔍 Getting Storefront OAuth token info:')
    console.log(`   Storefront URL: ${merchantStorefrontUrl}`)

    const response = await axios.get(
      `${merchantStorefrontUrl}/oauth/token/info`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('✅ Storefront OAuth token info retrieved:')
    console.log(`   Resource Owner ID: ${response.data.resource_owner_id}`)
    console.log(`   Scope: ${response.data.scope}`)
    console.log(`   Expires In: ${response.data.expires_in} seconds`)
    console.log(`   Application UID: ${response.data.application?.uid}`)
    console.log(`   User ID: ${response.data.user?._id}`)
    console.log(`   User Email: ${response.data.user?.email}`)
    console.log(`   User Name: ${response.data.user?.name}`)
    console.log(`   Merchant ID: ${response.data.merchant?._id}`)
    console.log(`   Merchant Email: ${response.data.merchant?.email}`)

    return response.data
  } catch (error) {
    console.error('❌ Failed to get Storefront OAuth token info:', error.response?.data || error.message)
    throw error
  }
}

module.exports = {
  createStorefrontOAuthApplication,
  deleteStorefrontOAuthApplication,
  getMerchantInfo,
  exchangeStorefrontToken,
  getStorefrontTokenInfo
}
