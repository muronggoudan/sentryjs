// 工具类
// @author muronggoudan
// @date 2018-07-20

import config from './config';

// 上报信息工具方法
export function report(url, message) {
  const reportParams = JSON.stringify(message);
  const img4Report = new Image();
  img4Report.src = `${url}?_=${encodeURIComponent(reportParams)}`;
}

export function polyfill(obj, name, replacement) {
	if (obj === null) return;
  
  const orig = obj[name];
  obj[name] = replacement(orig);
  obj[name].__sentry__ = true;
  obj[name].__orig__ = orig;
}

// 判断是不是function
export function isFunction(fn) {
	return typeof fn === 'function';
}

// 判断是不是undefined
export function isUndefined(what) {
	return what === void 0;
}

// 判断是不是string
export function isString(what) {
	return Object.prototype.toString.call(what) === '[object String]';
}

export function isPlainObject(what) {
	return Object.prototype.toString.call(what) === '[object Object]';
}

// hasOwnProperty
export function hasKey(object, key) {
	return Object.prototype.hasOwnProperty.call(object, key);
}

// 格式化路径
export function pathFormatter(path) {
	return path.map((item) => {
  	if (window === item) return 'window';
    
    const nodeName = item.nodeName || '';
    return nodeName.toLocaleLowerCase();
  });
}

// 是否在浏览器中
export function inBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// 简化版extend
export function extend(obj1, obj2) {
	return Object.assign({}, obj1, obj2);
}

// log
export function log(message) {
  console.log.call(console, `[Sentry Log] : ${message}`);
}

// warn
export function warn(message) {
  console.warn.call(console, `[Sentry Warning] : ${message}`);
}

// error
export function error(message) {
  console.error.call(console, `[Sentry Error] : ${message}`);
}

// 防抖函数
export function debounce(fn, wait) {
  let scheduled = false;
  return (...args) => {
    if (!scheduled) {
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        fn.apply(this, args);
      }, wait);
    }
  };
}
