// Sentry 类实现
// @author muronggoudan
// @date 2018-07-20

import {
	report,
	polyfill,
	isFunction,
	isUndefined,
	isString,
	hasKey,
  pathFormatter,
  isPlainObject,
  extend,
  log,
  warn,
  error,
  debounce,
} from './utils';

import config from './config';

class Sentry {

  // 上报服务地址
  static server;
  // 上报接口地址
  static path;
  // 使能
  static enable;
  // 鉴权apikey
  static apikey;
  // 等待
  static delay;

	constructor (options = {}) {
    // 配置项
    this.options = options;
    // 通用模块
    this.commonModel = null;
    
    return this.mergeOptions(options) ? 
      this.init() : null;
	}
  
  // 入口方法
	init () {
    
    if (!this.enable.enable) return;
  
		let httpModel;
    let windowModel;

    this.commonModel = new CommonModel();
    this.enable.http && (httpModel = new HttpModel());
    this.enable.window && (windowModel = new WindowModel());
    this.enable.xhr && (new XHRModel());
    this.enable.promise && (new PromiseModel());
		
		// window 模块安装
		windowModel && this.commonModel.install(
			windowModel.errorType,
			windowModel.valid,
			windowModel.callback
		);
			
		// http 模块安装
		httpModel && this.commonModel.install(
			httpModel.errorType,
			httpModel.valid,
			httpModel.callback
    );
    
    return this;
  }
  
  // 合并选项
  mergeOptions (options) {
		if (!options.apikey) {
			warn('apikey缺失, 无法开启错误监控。');
			return false;
		} else {
      Sentry.apikey = options.apikey;
    }
	
    if (!options.server || !options.path) {
			warn('server或者path配置不存在, 无法上报错误信息。');
			return false;
    } else {
      Sentry.server = options.server;
      Sentry.path = options.path;
    }

    if (options.delay && options.delay !== true) {
      Sentry.delay = Number(options.delay);
    } else if (options.delay === 0 || options.delay === false) {
      Sentry.delay = 0;
    } else {
      Sentry.delay = config.delay;
    }
    
    if (options.module) {
      this.enable = extend(config.sentryGlobalConfig, options.module);
    } else {
      this.enable = config.sentryGlobalConfig;
    }

    return true;
  }
	
	// 安装Vue监听插件
	installVuePlugin (Vue) {
		const vuePluginModel = new VuePluginModel();
		vuePluginModel.vuePlugin(Vue, vuePluginModel.send);
	}
 	
	// 主动上报错误
	send (message) {
    // 插件关闭的情况
    if (!this.commonModel) return;

		if (!message || !isPlainObject(message)) {
			warn('上报失败, 上报信息必须为普通对象。');
			return;
		}
		
		this.commonModel.send({
			type: config.typeDict.diy,
			metaData: message,
		});
  }
  
}

// 公共类
class CommonModel {
	
	constructor () {
		// 存放捕获器
    this.stack = [];
    // 存放错误信息缓存
    this.messagesCache = [];
    this.reporter = debounce(() => {
      const commonMsg = this.getCommonReportMessage();
      const url = `${Sentry.server}${Sentry.path}`;
      this.messagesCache = this.messagesCache.map((item) => {
        return extend(item, commonMsg);
      });
  
      report(url, this.messagesCache);
    }, Sentry.delay);

		this.addErrorEventListener();
	}
	
	// 安装
	install (errorType, valid, callback) {
		this.stack.push({
			type: errorType,
			valid,
			callback,
		});
	}
			
	// 错误监听
	addErrorEventListener () {
		const _this = this;
		
		// DOM3级以及Opera部分错误类型不会冒泡 需要在捕获阶段获取
		window.addEventListener('error', (errorEvent) => {
		
			let i = 0,
			len = _this.stack.length;
				
			for (; i < len; i ++) {
				if (_this.stack[i].valid(errorEvent)) {
				
					_this.stack[i].callback.call(this, errorEvent);
					
					break;
				}
			}
			
			// 未捕获错误
			// Uncaught Error
			// @TODO 需要特殊处理
			
		}, true);
	}
  
  // 上报
  send (message) {
    this.messagesCache.push(message);
    this.reporter();
  }
  
  // 通用信息获取
  getCommonReportMessage () {
    // apikey
    const apikey = Sentry.apikey;
    // 版本信息
    const version = config.version;
    // url
    const url = window.location ? window.location.href ? window.location.href : '' : '';
    // 网页title
    const title = window.document ? window.document.title ? window.document.title : '' : '';
    // 浏览器UA
    const userAgent = window.navigator ? window.navigator.userAgent ? window.navigator.userAgent : '' : '';
    
    return {
    	apikey,
      title,
      url,
      version,
      userAgent,
    };
  }

}

// Vue 插件模块
// @TODO 传入到Vue类型鉴别
class VuePluginModel extends CommonModel {

	constructor () {
  	super();
  }

	// 格式化组件名称
  formatComponentName (vm) {
  	if (vm.$root === vm) {
    	return 'root instance';
    }
    
    let name = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name;
    
    return (
    	(name ? 'component <' + name + '>' : 'anonymous component') + 
      (vm._isVue && vm.$options.__file ? ' at ' + vm.$options.__file : '')
    );
  }
  
  // vue插件
  vuePlugin (Vue, callback) {
  	const _this = this;
    
    if (!Vue || !Vue.config) return;
    
    const _oldOnError = Vue.config.errorHandler;
    Vue.config.errorHandler = function VueErrorHandler (error, vm, info) {
      
    	let vueMessage = {
      	message: error.message,
        stack: error.stack,
      };
      
      let _errorMessageForReport = {
      	type: config.typeDict.vue,
        vueMessage,
        componentName: '',
        lifecycleHook: null,
      };
      
      // vm 和生命周期钩子不一定总是可用
      if (Object.prototype.toString.call(vm) === '[object Object]') {
      	_errorMessageForReport.componentName = _this.formatComponentName(vm);
      }
      
      if (typeof info !== 'undefined') {
      	_errorMessageForReport.lifecycleHook = info;
      }
      
      // 兼容旧方法
      if (typeof _oldOnError === 'function') {
      	_oldOnError.call(_this, error, vm, info);
      }
      
      _this.send(_errorMessageForReport);
      
    };
  }

}

// window错误模块
class WindowModel extends CommonModel {

	constructor () {
  	super();
    this.errorType = 'WindowError';
  }
  
  // 目前demo校验 onerror可捕获多错误target都是window
  // 后续健壮性继续考察
  valid (errorEvent) {
  	return errorEvent.target === window;
  }
  
  callback (errorEvent) {
  	let stack = {};
    
    if (errorEvent.error) {
    	stack.stack = errorEvent.error.stack || 'no stack';
      stack.name = errorEvent.error.name || 'no name';
    }
    
    const _errorMessageForReport = {
    	type: config.typeDict.window,
      colno: errorEvent.colno || 0,
      lineno: errorEvent.lineno || 0,
      message: errorEvent.message || 'no message',
      stack,
    };
    
    this.send(_errorMessageForReport);
  }
}

// 资源请求模块
class HttpModel extends CommonModel {

	constructor () {
  	super();
    this.errorType = 'ResourceError';
  }
  
  // 目前无法确切判断资源引用对象 但绝大部分不是window
  // 支持img/link/script等标签
  valid (errorEvent) {
  	return errorEvent.target !== window;
  }
  
  callback (errorEvent) {
    
  	const type = config.typeDict.http;
    const path = pathFormatter(errorEvent.path).reverse().join(' > ');
    const target = errorEvent.target.nodeName.toLocaleLowerCase();
    const resourceUrl = errorEvent.target.src;
    const outerHTML = errorEvent.target.outHTML;
    
    const _errorMessageForReport = {
    	type,
      path,
      target,
      resourceUrl,
      outerHTML,
    };
    
    this.send(_errorMessageForReport);
  }
  
}

// Promise模块
// 未处理的catch错误
class PromiseModel extends CommonModel {
  constructor () {
    super();
    this.install();
  }

  install () {
    window.addEventListener('unhandledrejection', (errorEvent) => {
      this.callback(errorEvent);
    });
  }

  callback (errorEvent) {
    const type = config.typeDict.promise;
    // 拒因
    const rejectionReason = errorEvent.reason;
    // promise其他信息
    const promiseDetail = {
      returnValue: errorEvent.returnValue,
      timeStamp: errorEvent.timeStamp,
      type: errorEvent.type,
    }

    const _errorMessageForReport = {
      type,
      rejectionReason,
      promiseDetail,
    };

    this.send(_errorMessageForReport);
  }
}

// xhr模块
class XHRModel extends CommonModel {

	constructor () {
    super();
    this.init();
  }
  
  init () {
  	this.instrumentBreadcrumbs();
  }
  
  wrap (options, func, _before) {
  	const _this = this;
    
    // 非函数单参数 返回options本身
    if (isUndefined(func) && !isFuntion(options)) {
    	return options;
    }
    
    // 函数单参数 封装函数
    if (isFunction(options)) {
    	func = options;
      options = undefined;
    }
    
    if (!isFunction(func)) {
    	return func;
    }
    
    // 避免二次封装
    try {
    	if (func.__sentry__) {
      	return func;
      }
      
      if (func.__sentry_wrapper__) {
      	return func.__sentry_wrapper__;
      }
    } catch (e) {
    	return func;
    }
    
    // 返回封装函数
    function wrapped () {
    	let args = [],
        i = arguments.length,
        // 深层封装 除非制定deep = false
        deep = !options || (options && options.deep !== false);
      
      // before 钩子函数
      if (_before && isFunction(_before)) {
      	_before.apply(this, arguments);
      }
      
      while (i--) args[i] = deep ? _this.wrap(options, arguments[i]) : arguments[i];
      
      try {
      	return func.apply(this, args);
      } catch (e) {
      	_this._ignoreNextError();
        
        // 手动捕获一个异常并且发送给平台
        // 目前函数内部细节比较多 专注捕获业务代码本身
        throw e;
      }
    }
    
    // 代理func函数上以及原型链上多属性
    for (var property in func) {
    	if (hasKey(func, property)) {
      	wrapped[property] = func[property];
      }
    }
    
    wrapped.prototype = func.prototype;
    
    // 将封装函数赋值给 _sentry_wrapper__
    func.__sentry_wrapper__ = wrapped;
    
    // 是否封装过多标志位
    wrapped.__sentry__ = true;
    // 储存原函数
    wrapped.__orig__ = func;
    
    return wrapped;
  }

  captureErrorRequest (obj) {
    // @TODO 响应时间
    // const crumb = extend({
    //   timestamp: now() / 1000
    // },
    //   obj
    // );
    const type = config.typeDict.xhr;
    const method = obj.data.method;
    const requestUrl = obj.data.url;
    const response = obj.data.response;
    const statusCode = obj.data.status_code;

    // 过滤4|5开头的错误
    // 需要过滤掉send接口 否则如果send接口不通 会造成无限递归
    // @TODO 开放接口 自定义状态码
    if (/^4|^5/.test(statusCode.toString()) && requestUrl.indexOf(config.path) === -1) {
      this.send({
        type,
        method,
        requestUrl,
        response,
        statusCode,
      })
    }
  }

  instrumentBreadcrumbs () {
    const _this = this;

    function wrapProp(prop, xhr) {
      if (prop in xhr && isFunction([xhr[prop]])) {
        polyfill(xhr, prop, function (orig) {
          return _this.wrap({
            mechanism: {
              type: 'istrument',
              data: {
                function: prop,
                handler: (orig && orig.name) || '<anonymous>',
              }
            }
          },
          orig
          );
        });
      }
    }

    if ('XMLHttpRequest' in window) {
      const xhrproto = window.XMLHttpRequest && window.XMLHttpRequest.prototype;
      
      // 代理open方法
      polyfill(
        xhrproto,
        'open',
        function (origOpen) {
          return function (method, url) {
            if (isString(url) && url.indexOf(_this._globalkey) === -1) {
              this.__sentry_xhr_ = {
                method,
                url,
                status_code: null,
              };
            }

            return origOpen.apply(this, arguments);
          };
        }
      );

      // 代理send方法
      polyfill(
        xhrproto,
        'send',
        function (origSend) {
          return function () {
            let xhr = this;
            function onreadystatechangeHandler() {
              if (xhr.__sentry_xhr_ && xhr.readyState === 4) {
                try {
                  xhr.__sentry_xhr_.status_code = xhr.status;
                  xhr.__sentry_xhr_.response = xhr.response;
                } catch (e) {
                  // do nothing
                }

                _this.captureErrorRequest({
                  type: 'http',
                  category: 'xhr',
                  data: xhr.__sentry_xhr_
                });
              }
            }

            const props = ['onload', 'onerror', 'onprogress'];

            for (let j = 0; j < props.length; j ++) {
              wrapProp(props[j], xhr);
            }

            if ('onreadystatechange' in xhr && isFunction(xhr.onreadystatechange)) {
              polyfill(
                xhr,
                'onreadystatechange',
                function (orig) {
                  return _this.wrap({
                    mechanism: {
                      type: 'instrument',
                      data: {
                        function: 'onreadystatechange',
                        handler: (orig && orig.name) || '<anonymous>',
                      }
                    }
                  },
                  orig,
                  onreadystatechangeHandler
                  );
                }
              );
            } else {
              xhr.onreadystatechange = onreadystatechangeHandler;
            }

            return origSend.apply(this, arguments);
          };
        }
      ) 
    }
  }
}
 
export {
  Sentry
}
