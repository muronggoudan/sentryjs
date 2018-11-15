import config from './config';

export function report(message) {
	const xhr = new XMLHttpRequest();
  const reportPort = config.protocol.indexOf('https') > -1 ? config.httpsServerPort : config.httpServerPort;
  const reportUrl = `${config.protocol}//${config.serverIP}:${reportPort}${config.path}`;
  const reportParams = JSON.stringify(message);
  
  xhr.open('POST', reportUrl);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(reportParams);
  xhr.onreadystatechange = () => {
  	if (4 === xhr.readyState && 200 === xhr.status) {
    	console.log('[Sentry Log] : 异常上报成功');
    }
  };
}

export function polyfill(obj, name, replacement) {
	if (obj === null) return;
  
  const orig = obj[name];
  obj[name] = replacement(orig);
  obj[name].__sentry__ = true;
  obj[name].__orig__ = orig;
}

export function isFunction(fn) {
	return typeof fn === 'function';
}

export function isUndefined(what) {
	return what === void 0;
}

export function isString(what) {
	return Object.prototype.toString.call(what) === '[object String]';
}

export function hasKey(object, key) {
	return Object.prototype.hasOwnProperty.call(object, key);
}

export function pathFormatter(path) {
	return path.map((item) => {
  	if (window === item) return 'window';
    
    const nodeName = item.nodeName || '';
    return nodeName.toLocaleLowerCase();
  });
}

export function extend(obj1, obj2) {
	return Object.assign({}, obj1, obj2);
}
