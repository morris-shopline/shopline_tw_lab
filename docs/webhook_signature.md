# **Webhook Signature**

### **Intro 介紹**

The event sent to your endpoint will carry a signature in the query string like below:發送到您端點的事件將在查詢字串中攜帶如下的簽名：

Text  文字

`http://your-endpoint/?sign={signature}`

---

### **Pesudo-code 偽代碼**

The signature is used to verify the event is sent by us, and the body is meant by us.該簽名用於驗證事件是由我們發送的，並且主體是我們所意圖的。

We are using a *standard HMAC-SHA256 keyed hash* to generate this signature. The signature is created by combining a shared secret *(your app secret)* with the body of the request we're sending. Be aware that the process is deterministic and you must follow the steps below to produce the same signature.我們使用標準的 HMAC-SHA256 鍵值雜湊來生成這個簽名。簽名是通過將共享密鑰（您的應用程式密鑰）與我們發送的請求主體結合而成的。請注意，這個過程是確定性的，您必須遵循以下步驟以產生相同的簽名。

The following pesudo-code illustrate the process of the generation以下的偽代碼說明了生成的過程

JavaScript

`# step 1 - get all the messages
const appSecret = {your_app_secret}
const timestamp = req.header['x-shopline-developer-event-timestamp'] // obtain it from request header
const payload = req.body // obtain it from request body

# step 2 - serialization
const sortedPayload = sortByKeys(req.body) // sort the payload, see below section for sorting the payload
const stringifyPayload = JSON.stringify(sortedPayload); // stringify it
const message = timestamp + ":" + stringifyPayload // e.g. "1837193717:{message_string}"

# step 3 - generate signature
const hash = crypto
  .createHmac('sha256', appSecret) // use app secret as key to create hmac
  .update(message) // add the message
  .digest('hex'); // generate disgest`

---

### **Sorting the payload 對有效載荷進行排序**

Payload is in json format and should be sorted by its key alphabetically, see the following input-output example.有效載荷為 JSON 格式，應按其鍵的字母順序進行排序，請參見以下的輸入輸出示例。

JSON

`# Original json
{
  "b": 1,
  "c": { c: 1, b: 2, a: 3},
  "a": 3
}
# Sorted json
{
  "a": 3
  "b": 1
  "c": {
      a: 3
      b: 2
      c: 1
  }
}`

---

### **Known issues 已知問題**

Different programming languages handle string differently. Due to differences in how various programming languages and libraries handle strings, it is crucial to understand the impact.不同的程式語言對字串的處理方式各不相同。由於各種程式語言和函式庫在處理字串時存在差異，因此了解其影響至關重要。

For example, two libraries have unique ways of handling strings, especially when it comes to special characters. This can lead to discrepancies when stringifying JSON payloads, particularly if special characters are not correctly escaped or transformed.例如，兩個函式庫在處理字串方面有獨特的方式，特別是在處理特殊字符時。這可能會導致在將 JSON 負載轉換為字串時出現不一致，尤其是當特殊字符未正確轉義或轉換時。

1. **Understand Your Environment了解您的環境**Before starting, identify the programming language and libraries (JSON serialization) you are using may differ compared to SHOPLINE （Please feel free to contact us if you have any questions)
    
    在開始之前，請確認您所使用的程式語言和庫（JSON 序列化）可能與 SHOPLINE 不同（如有任何問題，請隨時與我們聯繫）
    
2. **Identify Special Characters識別特殊字符**Recognize which special characters may cause issues in your environment
    
    識別哪些特殊字符可能在您的環境中造成問題
    
3. **Adding Unescaping Logic 添加取消轉義邏輯**Identify any improperly escaped characters, then replace them with their correctly escaped versions
    
    識別任何未正確轉義的字符，然後將其替換為正確轉義的版本
    
4. **Webhook Signatures Webhook 簽名Pay special attention to webhook payloads, as improper handling of special characters can lead to signature mismatches.** Ensure that the payload you verify is the exact match of the payload sent by SHOPLINE, including how special characters are treated
    
    特別注意 webhook 負載，因為不當處理特殊字符可能導致簽名不匹配。確保您驗證的負載與 SHOPLINE 發送的負載完全匹配，包括特殊字符的處理方式
    
5. **Continuous Testing 持續測試**Regularly test your JSON payloads, especially after library updates or changes in your development environment, to ensure that special characters are handled consistently
    
    定期測試您的 JSON 負載，特別是在庫更新或開發環境變更後，以確保特殊字符的一致處理
    

escape string (example for ref.)轉義字串（參考範例）

`# Encoded URI related
\\u003c -> <
\\u003e -> >
\\u0026 -> &`

### **strong typed programming languages強類型程式語言**

If you are using strong typed programming languages as your backend, like GoLang, Java, etc. You might need to be aware of how your parse the payload we send you. For example, consider we send the following payload to you.如果您使用強類型程式語言作為後端，例如 GoLang、Java 等，您可能需要注意如何解析我們發送給您的負載。例如，考慮我們向您發送以下負載。

JSON

`{
 "quantity": 10 
}`

and in your backend, you might possibly parse this payload into在您的後端，您可能會將這個有效載荷解析為

JSON

`{
 "quantity: 10.0 
}`

If this is the case, you will generate a different signature and might fail when you compare the one that we send and the one that you have just generated.如果是這種情況，您將生成一個不同的簽名，並且在比較我們發送的簽名和您剛剛生成的簽名時可能會失敗。

> 📘More issues  更多問題
> 
> 
> If you have found issues in this part, please report to us and we will keep updating this part. cheers :)如果您在這部分發現問題，請告訴我們，我們會持續更新這部分。謝謝 :)
> 

---

### **Example 範例**

JavaScript

`const secret = "b5138dd0a7c04f674260e1d3b3a762347421396fc5fc1bee55a2c2653c4207bd" // dun worry, this secret is not for production use
const payload = {
    "event": "Application",
    "merchant_id": "5dad5d2604515400018dcc90",
    "resource": {
        "_id": "607fd9c2ff790b001cd23353",
        "merchant_id": "5dad5d2604515400018dcc90",
        "updated_at": "2021-04-21T08:36:17.892Z"
    },
    "topic": "application/uninstall"
}
const timestamp = "1618994178"

const sign = YourGenerationFunction(secret, payload, timestamp) // follow the steps above
sign == "ae8b68f6a26d8f95290c761d10dbce01c775fd4d734e942e643aee20c86ebf4b" // true`
