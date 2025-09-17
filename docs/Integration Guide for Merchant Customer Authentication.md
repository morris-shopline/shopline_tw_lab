# **Integration Guide for Merchant Customer Authentication**

## **Objective**

Get current logged-in customer on storefront from external domain through OAuth2.0 mechanism.

## **Preparation**

### **Create Developer Center App**

- **App Scope**:
    - `Merchant` > `Show`
    - `Storefront Oauth Applications` > `Show`, `Create`, `Delete`
- Submit for approval
- **Webhook**: Register for `Application > Install`, `Application > Uninstall` , `Access Token > Create` and `Access Token > Revoke` webhooks.

---

When merchant installs your app, the follow setup should be done.

## **When Merchant Install / Uninstall App**

### **Step1: Obtain Open API Access Token when Merchant Install App**

Please refer to this guide to obtain access tokens. https://shopline-developers.readme.io/docs/complete-integration-example-1

### **Step2: Setup Up Storefront OAuth Application when Merchant Install App**

When receiving `application/install` or `access_token/create` webhook, if the merchant has not yet create a storefront oauth application for your app, your app should call open api to create one. Then, store the information in a database for later use.

Endpoint: `POST https://open.shopline.io/v1/storefront/oauth_applications`

Request HTTP Headers:

| **header** | **remarks** |
| --- | --- |
| Authorization | Bearer "{{app_token}}" |

Request Payload:

| **field** | **remarks** |
| --- | --- |
| name | a name of the storefront oauth application for reference. |
| redirect_uri | the redirect_uri for performing storefront oauth.must use https."\n" separated for multiple redirect_uri. |
| is_redirect_to_simplified_login | false |

Sample Request

```
{
    "name": "My App",
    "redirect_uri": "https://localhost:3000/oauth/callback\nhttps://example.com/oauth/callback",
    "is_redirect_to_simplified_login": false
}

```

Sample Response

```
{
    "id": "64216f96b5fe7500018ac2a6",
    "app_id": "RLTdkWrfX51RaJ_zLUWIbektFiRyDn08yAH-oS0CIeM",
    "app_secret": "JJ8gsA0ISbqEsl1mTHF8Nt29MQPJRlYLMpYHcTDFbgk",
    "name": "My App",
    "redirect_uri": "https://localhost:3000/oauth/callback\nhttps://example.com/oauth/callback"
}

```

### **Clean up when Merchant Uninstall App**

Endpoint: `DELETE https://open.shopline.io/v1/storefront/oauth_applications/{{id}}`

Request HTTP Headers:

| **header** | **remarks** |
| --- | --- |
| Authorization | Bearer "{{app_token}}" |

---

Now, you have completed the setup for a merchant. The following are the steps your app should handle when your app need to authenticate for a customer.

## **Perform OAuth for Customer**

### **Step1: Get merchant's storefront URL (`brand_home_url`)**

Given a merchant_id, you are able to lookup merchant's storefront URL (brand_home_url).

Endpoint: `GET https://open.shopline.io/v1/merchants/{{merchant_id}}`

Request HTTP Headers:

| **header** | **remarks** |
| --- | --- |
| Authorization | Bearer "{{app_token}}" |

Sample Response

```
{
    "id": "5f0e8941c68746000897e1f7",
    ...
    "brand_home_url": "https://terence.shoplineapp.com"
}

```

> 🚧Use database / cache to reduce requests to Open API
> 
> 
> As the `brand_home_url` does not change frequently, it is suggested to store in database or cache with an expiry date.
> 

### **Step2: Redirect User to authorize url (in browser):**

URL: `https://{{merchant-online-store-url}}/oauth/authorize`

| **query param** | **remarks** |
| --- | --- |
| response_type | "code" |
| client_id | the "app_id" in storefront oauth application |
| redirect_uri | one of the redirect_uri in storefront oauth application |
| scope | "shop" |
| state | a random string |

Example:

```
https://{{merhant-online-store-url}}/oauth/authorize?client_id=RLTdkWrfX51RaJ_zLUWIbektFiRyDn08yAH-oS0CIeM&redirect_uri=https:%2F%2Flocalhost:3000%2Foauth%2Fcallback&response_type=code&scope=shop&state=XnB3x95ominXFdVL22C4v

```

### **Step 3: Return to redirect_uri and Perform Token Exchange (in server)**

After user has signed in, the browser will be redirected to the `redirect_uri` with query string `code` and `state` . e.g. `{{redirect_uri}}?code=xxx&state=yyy`.

Your server should

- check if the `state` matches the current session.
- call the below endpoint with the `code` to obtain an access token.

Endpoint: `POST https://{{merchant-online-store-url}}/oauth/token`

Request:

| **field** | **remarks** |
| --- | --- |
| grant_type | "authorization_code" |
| code | code from the query string in oauth callback |
| client_id | the "app_id" in storefront oauth application |
| client_secret | the "app_secret" in storefront oauth application |
| redirect_uri | the redirect_uri used in current oauth request |

Sample Request:

```
{
    "client_id": "RLTdkWrfX51RaJ_zLUWIbektFiRyDn08yAH-oS0CIeM",
    "client_secret": "JJ8gsA0ISbqEsl1mTHF8Nt29MQPJRlYLMpYHcTDFbgk",
    "redirect_uri": "https://localhost:3000/oauth/callback",
    "grant_type": "authorization_code",
    "code": "2gT1eMi3fiLtk5oMbwt3ghzuOKsIJWRQSNy8WRfWqrU"
}

```

Sample Response:

```
{
    "access_token": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI5MDkzYTk3MDg1NDIwNjkzY2ZkMTI1YWMyNzA3NDYyMCIsImRhdGEiOnsidXNlcl9pZCI6IjYzYzNiZjFkODBiYWQzMTM3NmIwNmQ0ZCJ9LCJpc3MiOiI2NDIxNmY5NmI1ZmU3NTAwMDE4YWMyYTYiLCJhdWQiOltdLCJzdWIiOiI2M2MzYmYxZDgwYmFkMzEzNzZiMDZkNGQifQ.rOY3Y2KrzRUWacR6gtotHp4iabzNW81lohieJiBYazY",
    "token_type": "Bearer",
    "expires_in": 15778476,
    "refresh_token": "UPYxqAPOaSBwgQ3du9XW9nmetswm5Ka8t6gUawTEGas",
    "scope": "shop",
    "created_at": 1679995078,
    "merchant": {
        "_id": "5f0e8941c68746000897e1f7",
        "email": "terence@shoplineapp.com",
        "handle": "terence897",
        "name": "Terence Shop"
    },
    "user": {
        "_id": "63c3bf1d80bad31376b06d4d",
        "email": "testuser@g.com",
        "locale_code": "en",
        "name": "test user"
    }
}

```

### **Step 4: Get Detail User Info**

After obtaining an access token, you should call below endpoint to request for the user info.

Endpoint: `Get https://{{merchant-online-store-url}}/oauth/token/info`

Request HTTP Headers:

| **header** | **remarks** |
| --- | --- |
| Authorization | Bearer "{{access_token_from_storefront_oauth}}" |

Sample Response:

```
{
    "resource_owner_id": "63c3bf1d80bad31376b06d4d",
    "scope": [
        "shop"
    ],
    "expires_in": 15778436,
    "application": {
        "uid": "RLTdkWrfX51RaJ_zLUWIbektFiRyDn08yAH-oS0CIeM"
    },
    "created_at": 1679995078,
    "user": {
        "_id": "63c3bf1d80bad31376b06d4d",
        "country_calling_code": null,
        "email": "testuser@g.com",
        "locale_code": "en",
        "mobile_phone": null,
        "name": "test user"
    },
    "merchant": {
        "_id": "5f0e8941c68746000897e1f7",
        "email": "terence@shoplineapp.com",
        "handle": "terence",
        "name": "Terence Shop"
    }
}

```

## **Multi-tenancy**

A customer may access multiple merchants in the same browser in different tabs. If you app only has a cookie session per browser, make sure data from different merchants don't collide with each other.

e.g. express.js, you may store your req.session in this way:

```
req.session = {
  subSessions: [
    // a sucessful logged in sub-session
    {
      merchantId: '5f0e8941c68746000897e1f7',
      userId: '63c3bf1d80bad31376b06d4d',
    },
    // a sub-session performing oauth
    {
      oauthInfo: {
        requestedMerchantId: '5f0e8941c68746000897e1f9',
        requestedUserId: '63c3bf1d80bad31376b06d4e',
        state: 'xyz',
        returnTo: 'https://..."
      }
    }
  ]
}

```

Include `requested_merchant_id` and `requested_user_id` query params for each request from the browser. So that you know which sub-session to use.

e.g.

```
// requireAuth middleware
const requireAuth = async (req, res, next) => {
  const requestedMerchantId = req.query.requested_merchant_id;
  const requestedUserId = req.query.requested_user_id;

  if (!requestedMerchantId || !requestedUserId) {
    return res.send(422).send("missing requested merchant id or user id");
  }

  if (req.session.sessions === undefined) {
    req.session.sessions = [];
  }

  let currentSession = req.session.subSessions.find((session) => {
    return (
      session.merchantId == requestedMerchantId &&
      session.userId == requestedUserId
    );
  });

  ...
}

```

```
// oauth callback handler
const callback = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  let currentSession = (req.session.subSessions || []).find((session) => {
    return session.oauth.state == state;
  });

  if (!currentSession) {
    return res.send(400).send("bad request");
  }

  ...
}

```
