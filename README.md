### Sentry上报字段
#### 目前是设计将所有字段放在一张表里面 通过errorType取不同字段达到目的

---
>Original

1. createTime -- 创建时间
2. stat
3. serverIp
4. clientIp

---
>common info 每种信息都会带的通用信息

1. apikey
2. title
3. url
4. type
5. version
6. userAgent
7. * metaData

---
>window window错误信息

1. message
2. stack
3. colno
4. lineno

---
>http 资源引用错误

1. path
2. target
3. resourceUrl
4. outerHTML

---
>xhr xhr请求错误信息

1. method
2. status
3. response
4. requestUrl

---
>vue vue错误上报

1. vueMessage
2. lifecycleHook
3. componentName