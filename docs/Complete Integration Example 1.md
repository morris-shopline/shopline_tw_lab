# **Complete Integration Example 1**
## **Objective**

This guide shows:

- How to setup for a merchant
- Get access token to do action on behalf of merchant in background

## **Preparations**

### **Create a Developer Center App**

- **API Keys > OAuth**: Turn On "App Installation Token" Mode
- **App Scope**: Select required scopes
- **Installation > Advance Settings**: Setup Action Button with “External Page” setup to a landing page for handling user login from SHOPLINE.
- Submit for approval
- Register Webhook URL for Application > Install, Application > Uninstall, Access Tokens > Create, Access Tokens > Revoke

## **Webhooks Your App May Receive**

If ERP Mode is on, access token will be created after application installed. You may refer to the below table and perform corresponding actions.

| **Action** | **Webhook** | **What Your App Should Do** |
| --- | --- | --- |
| **Merchant Install App** | application/install | Setup basic settings for the merchant on your app **if not yet** (Beware of reauthorize case. Typically, should only perform once per merchant) |
|  | access_token/create | Store the token in DB(available only when ERP mode is ON) |
| **Merchant Re-Authorize App**(after app scope has changed) | application/install | (optional) |
|  | access_token/create | Update the token in DB(available only when ERP mode is ON) |
| **Merchant Uninstall App** | application/uninstall | Clean up for the merchant |
|  | access_token/revoke | Remove the token from DB(might receive multiple webhooks, one for each token) |

> ❗️Webhook Signature Verification
> 
> 
> To verify the webhooks are sent from SHOPLINE, make sure to verify the signature for the webhook payload.
> 
> Please refer to https://shopline-developers.readme.io/docs/webhook-signature
> 

> ❗️Webhook Sequence
> 
> 
> The webhook receiving sequence is not guaranteed. i.e. You may receive an "access_token/create" before the "application/install", vice versa.
> 

## **Example Webhook Payload**

### **application/install**

```
{
  "trace_id": "ce81d057-5d5d-48d8-aa03-4cb84c2d687c",
  "ts": "1679889632648615711",
  "event": "Application",
  "topic": "application/install",
  "merchant_id": "5f0bda5e4e5fca0010c81fef",
  "resource": {
    "_id": "642114e06425fdf32c617703",
    "app_settings": {
      "app_scripts_activated": false
    },
    "application_id": "64210a1e6425fdf32c5fff20",
    "application_version": "64210a1e6425fdf32c5fff25",
    "authorized_at": "2023-03-27T04:00:32.55Z",
    "authorized_grants_digest": "9545301da7846bb8f2a5529a97d705d9",
    "created_at": "2023-03-27T04:00:32.552Z",
    "deleted_at": null,
    "installed_by": "MERCHANT",
    "merchant_id": "5f0bda5e4e5fca0010c81fef",
    "requested_grants_digest": "9545301da7846bb8f2a5529a97d705d9",
    "updated_at": "2023-03-27T04:00:32.552Z"
  }
}

```

### **access_token/create**

```
{
  "trace_id": "c43aec22-cd6f-4fe5-9c62-e541aac68503",
  "ts": "1679889632695507901",
  "event": "AccessToken",
  "topic": "access_token/create"
  "merchant_id": "5f0bda5e4e5fca0010c81fef",
  "resource": {
    "_id": "642114e007c37f000d8d554d",
    "application_id": "64210a1e1663f1000af19359",
    "created_at": "2023-03-27T04:00:32.638Z",
    "expires_at": "2340-02-14T21:47:11.638Z",
    "expires_in": 9999999999,
    "resource_owner_id": {
      "id": "5f0bda5e4e5fca0010c81fef",
      "performer_id": "5f0bda5e6d881d006569eba4"
    },
    "scopes": "orders",
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI1YmFiYzEyOTM4MDAxZDMwMGI3OWJmNDViOGIzYWU1ZiIsImRhdGEiOnsibWVyY2hhbnRfaWQiOiI1ZjBiZGE1ZTRlNWZjYTAwMTBjODFmZWYiLCJhcHBsaWNhdGlvbl9pZCI6IjY0MjEwYTFlMTY2M2YxMDAwYWYxOTM1OSJ9LCJpc3MiOiJodHRwczovL2RldmVsb3BlcnMuc2hvcGxpbmVhcHAuY29tIiwiYXVkIjpbXSwic3ViIjoiNWYwYmRhNWU0ZTVmY2EwMDEwYzgxZmVmIn0.7TZFcuUQphO1lwJxAiFYT1cP0-5GQsMwWLiMkdTJ-I0",
    "updated_at": "2023-03-27T04:00:32.643Z"
  }
}

```

### **application/uninstall**

```
{
  "trace_id": "be106238-a66d-4a14-8750-91637185bb59",
  "ts": "1679889776022570525",
  "event": "Application",
  "topic": "application/uninstall",
  "merchant_id": "5f0bda5e4e5fca0010c81fef",
  "resource": {
    "_id": "6421151c35820856ae70bcfe",
    "app_settings": {
      "app_scripts_activated": false
    },
    "application_id": "64210a1e6425fdf32c5fff20",
    "application_version": "642114fa35820856ae70a3cf",
    "authorized_at": "2023-03-27T04:01:32.743Z",
    "authorized_grants_digest": "2bd38683c6c597a28775055a6d64c4fe",
    "created_at": "2023-03-27T04:01:32.743Z",
    "deleted_at": "2023-03-27T04:02:55.678Z",
    "installed_by": "MERCHANT",
    "merchant_id": "5f0bda5e4e5fca0010c81fef",
    "requested_grants_digest": "2bd38683c6c597a28775055a6d64c4fe",
    "updated_at": "2023-03-27T04:02:55.682Z"
  }
}

```

### **access_token/revoke**

```
{
  "trace_id": "821b1a2c-f156-4bcb-8d81-6301b2725e5f",
  "ts": "1679889775763564329",
  "event": "AccessToken",
  "topic": "access_token/revoke",
  "merchant_id": "5f0bda5e4e5fca0010c81fef",
  "resource": {
    "_id": "6421151c77ec41000a015239",
    "application_id": "64210a1e1663f1000af19359",
    "created_at": "2023-03-27T04:01:32.814Z",
    "expires_at": "2340-02-14T21:48:11.814Z",
    "expires_in": 9999999999,
    "resource_owner_id": {
      "id": "5f0bda5e4e5fca0010c81fef",
      "performer_id": "5f0bda5e6d881d006569eba4"
    },
    "revoked_at": "2023-03-27T04:02:55.707Z",
    "scopes": "orders products",
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI5YTQwODQwODIwMTE3NzZiM2IyZjQ5ZTJiZWViODY3YSIsImRhdGEiOnsibWVyY2hhbnRfaWQiOiI1ZjBiZGE1ZTRlNWZjYTAwMTBjODFmZWYiLCJhcHBsaWNhdGlvbl9pZCI6IjY0MjEwYTFlMTY2M2YxMDAwYWYxOTM1OSJ9LCJpc3MiOiJodHRwczovL2RldmVsb3BlcnMuc2hvcGxpbmVhcHAuY29tIiwiYXVkIjpbXSwic3ViIjoiNWYwYmRhNWU0ZTVmY2EwMDEwYzgxZmVmIn0.7q4EDMfR8Bf-i-7o0EmuCFXPXps4mGL3DxAZSjjBEPQ",
    "updated_at": "2023-03-27T04:02:55.707Z"
  }
}

```
