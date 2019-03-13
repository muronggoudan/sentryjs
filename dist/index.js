!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();for(var r in n)("object"==typeof exports?exports:e)[r]=n[r]}}(window,function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){e.exports=n(1)},function(e,t,n){"use strict";n.r(t);var r={version:"1.0.1",sentryGlobalConfig:{enable:!0,window:!0,http:!0,xhr:!0,promise:!0},typeDict:{diy:"000",window:"001",http:"002",xhr:"003",vue:"004",promise:"005"},delay:1e3};function o(e,t,n){if(null===e)return;const r=e[t];e[t]=n(r),e[t].__sentry__=!0,e[t].__orig__=r}function s(e){return"function"==typeof e}function i(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function a(e,t){return Object.assign({},e,t)}function c(e){console.warn.call(console,`[Sentry Warning] : ${e}`)}function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}n.d(t,"Sentry",function(){return u});class u{constructor(e={}){return this.options=e,this.commonModel=null,this.mergeOptions(e)?this.init():null}init(){if(!this.enable.enable)return;let e,t;return this.commonModel=new p,this.enable.http&&(e=new h),this.enable.window&&(t=new y),this.enable.xhr&&new m,this.enable.promise&&new f,t&&this.commonModel.install(t.errorType,t.valid,t.callback),e&&this.commonModel.install(e.errorType,e.valid,e.callback),this}mergeOptions(e){return e.apikey?(u.apikey=e.apikey,e.server&&e.path?(u.server=e.server,u.path=e.path,e.delay&&!0!==e.delay?u.delay=Number(e.delay):0===e.delay||!1===e.delay?u.delay=0:u.delay=r.delay,e.module?this.enable=a(r.sentryGlobalConfig,e.module):this.enable=r.sentryGlobalConfig,!0):(c("server或者path配置不存在, 无法上报错误信息。"),!1)):(c("apikey缺失, 无法开启错误监控。"),!1)}installVuePlugin(e){const t=new d;t.vuePlugin(e,t.send)}send(e){this.commonModel&&(e&&function(e){return"[object Object]"===Object.prototype.toString.call(e)}(e)?this.commonModel.send({type:r.typeDict.diy,metaData:e}):c("上报失败, 上报信息必须为普通对象。"))}}l(u,"server",void 0),l(u,"path",void 0),l(u,"enable",void 0),l(u,"apikey",void 0),l(u,"delay",void 0);class p{constructor(){this.stack=[],this.messagesCache=[],this.reporter=function(e,t){let n=!1;return(...r)=>{n||(n=!0,setTimeout(()=>{n=!1,e.apply(this,r)},t))}}(()=>{const e=this.getCommonReportMessage(),t=`${u.server}${u.path}`;this.messagesCache=this.messagesCache.map(t=>a(t,e)),function(e,t){return new Promise(n=>{const r=JSON.stringify(t);(new Image).src=`${e}?_=${encodeURIComponent(r)}&_t=${(new Date).getTime()}`,n()})}(t,this.messagesCache).then(()=>{this.messagesCache.splice(0)})},u.delay),this.addErrorEventListener()}install(e,t,n){this.stack.push({type:e,valid:t,callback:n})}addErrorEventListener(){const e=this;window.addEventListener("error",t=>{let n=0,r=e.stack.length;for(;n<r;n++)if(e.stack[n].valid(t)){e.stack[n].callback.call(this,t);break}},!0)}send(e){this.messagesCache.push(e),this.reporter()}getCommonReportMessage(){const e=u.apikey,t=r.version,n=window.location&&window.location.href?window.location.href:"";return{apikey:e,title:window.document&&window.document.title?window.document.title:"",url:n,version:t,userAgent:window.navigator&&window.navigator.userAgent?window.navigator.userAgent:""}}}class d extends p{constructor(){super()}formatComponentName(e){if(e.$root===e)return"root instance";let t=e._isVue?e.$options.name||e.$options._componentTag:e.name;return(t?"component <"+t+">":"anonymous component")+(e._isVue&&e.$options.__file?" at "+e.$options.__file:"")}vuePlugin(e,t){const n=this;if(!e||!e.config)return;const o=e.config.errorHandler;e.config.errorHandler=function(e,t,s){let i={message:e.message,stack:e.stack},a={type:r.typeDict.vue,vueMessage:i,componentName:"",lifecycleHook:null};"[object Object]"===Object.prototype.toString.call(t)&&(a.componentName=n.formatComponentName(t)),void 0!==s&&(a.lifecycleHook=s),"function"==typeof o&&o.call(n,e,t,s),n.send(a)}}}class y extends p{constructor(){super(),this.errorType="WindowError"}valid(e){return e.target===window}callback(e){let t={};e.error&&(t.stack=e.error.stack||"no stack",t.name=e.error.name||"no name");const n={type:r.typeDict.window,colno:e.colno||0,lineno:e.lineno||0,message:e.message||"no message",stack:t};this.send(n)}}class h extends p{constructor(){super(),this.errorType="ResourceError"}valid(e){return e.target!==window}callback(e){const t={type:r.typeDict.http,path:function(e){return e.map(e=>window===e?"window":(e.nodeName||"").toLocaleLowerCase())}(e.path).reverse().join(" > "),target:e.target.nodeName.toLocaleLowerCase(),resourceUrl:e.target.src,outerHTML:e.target.outHTML};this.send(t)}}class f extends p{constructor(){super(),this.install()}install(){window.addEventListener("unhandledrejection",e=>{this.callback(e)})}callback(e){const t={type:r.typeDict.promise,rejectionReason:e.reason,promiseDetail:{returnValue:e.returnValue,timeStamp:e.timeStamp,type:e.type}};this.send(t)}}class m extends p{constructor(){super(),this.init()}init(){this.instrumentBreadcrumbs()}wrap(e,t,n){const r=this;if(function(e){return void 0===e}(t)&&!isFuntion(e))return e;if(s(e)&&(t=e,e=void 0),!s(t))return t;try{if(t.__sentry__)return t;if(t.__sentry_wrapper__)return t.__sentry_wrapper__}catch(e){return t}function o(){let o=[],i=arguments.length,a=!e||e&&!1!==e.deep;for(n&&s(n)&&n.apply(this,arguments);i--;)o[i]=a?r.wrap(e,arguments[i]):arguments[i];try{return t.apply(this,o)}catch(e){throw r._ignoreNextError(),e}}for(var a in t)i(t,a)&&(o[a]=t[a]);return o.prototype=t.prototype,t.__sentry_wrapper__=o,o.__sentry__=!0,o.__orig__=t,o}captureErrorRequest(e){const t=r.typeDict.xhr,n=e.data.method,o=e.data.url,s=e.data.response,i=e.data.status_code;/^4|^5/.test(i.toString())&&-1===o.indexOf(r.path)&&this.send({type:t,method:n,requestUrl:o,response:s,statusCode:i})}instrumentBreadcrumbs(){const e=this;function t(t,n){t in n&&s([n[t]])&&o(n,t,function(n){return e.wrap({mechanism:{type:"istrument",data:{function:t,handler:n&&n.name||"<anonymous>"}}},n)})}if("XMLHttpRequest"in window){const n=window.XMLHttpRequest&&window.XMLHttpRequest.prototype;o(n,"open",function(t){return function(n,r){return function(e){return"[object String]"===Object.prototype.toString.call(e)}(r)&&-1===r.indexOf(e._globalkey)&&(this.__sentry_xhr_={method:n,url:r,status_code:null}),t.apply(this,arguments)}}),o(n,"send",function(n){return function(){let r=this;function i(){if(r.__sentry_xhr_&&4===r.readyState){try{r.__sentry_xhr_.status_code=r.status,r.__sentry_xhr_.response=r.response}catch(e){}e.captureErrorRequest({type:"http",category:"xhr",data:r.__sentry_xhr_})}}const a=["onload","onerror","onprogress"];for(let e=0;e<a.length;e++)t(a[e],r);return"onreadystatechange"in r&&s(r.onreadystatechange)?o(r,"onreadystatechange",function(t){return e.wrap({mechanism:{type:"instrument",data:{function:"onreadystatechange",handler:t&&t.name||"<anonymous>"}}},t,i)}):r.onreadystatechange=i,n.apply(this,arguments)}})}}}}])});