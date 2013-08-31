// global framework configuration
(function(global){
	var getCookie = function(cookieName){
		var cookieStart = document.cookie.indexOf(cookieName);
		var cookieEnd = document.cookie.indexOf(";", cookieStart);
		return cookieStart == -1 ? '' : unescape(document.cookie.substring(cookieStart + cookieName.length + 1, (cookieEnd > cookieStart ? cookieEnd : document.cookie.length)));
	};
	global.sid = getCookie('JSESSIONID');

	// servlet servlet context path
	var appnameLocal = global.appname == null ? 'webx' : global.appname;
	if(appnameLocal.startsWith('/')){
		appnameLocal = appnameLocal.substring(1);
	}
	var contextPre = appnameLocal !== '' ? ('/' + appnameLocal) : '';

	var conf = {
		version: '1.0',

		// seajs config
		seajsConf: {
			preload: [
				'plugin-text'
			]
		}, 

		// replace file path when run module 'main'
		moduleDirReplace: true, 
		moduleDirTarget: 'js', 
		moduleDirSrc: 'docc', 

		// *** *** *** *** *** *** *** *** *** ***
		// *** *** *** *** *** *** *** *** *** ***
		// login url
		loginUrl: '/webx/login.html', 
		// need relogin - donot change here
		loginStatusKey: 'LOGIN_STATUS', 
		loginStatusNO: 'no_login', 
		loginStatusYES: 'login', 

		// *** *** *** *** *** *** *** *** *** ***
		// *** *** *** *** *** *** *** *** *** ***
		logLevel: 'INFO', 
		// browser logs flush size
		logQueueFlushSize: 20, 
		// send browser logs to server flag
		logPostMsg: false, 
		// server url
		logServerUrl: contextPre + '/controller/test/TestAction/log.gy', 

		// *** *** *** *** *** *** *** *** *** ***
		// *** *** *** *** *** *** *** *** *** ***
		// token url
		useToken: true, 
//		tokenHeaderKey: 'x-iCore_fa-digest', 
		tokenHeaderKey: 'X-Pa-Token', 

		// context name -> servlet container context-name
		appname: appnameLocal, 
		contextPre: contextPre, 
		context: contextPre + '/framework/', 

		getAppPath: function(suf){
			var mid = '/';
			if(suf && suf.startsWith('/'))
				mid = '';
			return this.contextPre + mid + suf;
		}, 

		getPathWithoutApp: function(url){
			if(this.contextPre && url.startsWith(this.contextPre)){
				return url.substring(this.contextPre.length);
			}
		}, 

		// 会话失效后是否重新登陆的开关
		changeLocationIfSessionInvalid: true, 
		sendRequestFilter: function(config, reqHeaders){
			var cookieName = 'JSESSIONID';
			var cookieVal = getCookie(cookieName);
			// 如果没有JSESSIONID cookie，就忽略
			if(global.sid && cookieVal != global.sid){
				alert('会话失效！请重新登陆！');

				// blockUI close
				if(global.$ && global.$.unblockUI){
					$.unblockUI({fadeOut: 1000});
				}

				// change location
				if(this.changeLocationIfSessionInvalid){
					global.PortalAuth.login();
				}
				return false;
			}

			return true;
		}, 

		// ajax json filter
		requestFilter: function(r){
			// add your code here
			// need login first
			if(r && r[this.loginStatusKey] == this.loginStatusNO){
				global.PortalAuth.login();
				return false;
			}else{
				return true;
			}
		},
			
		requestGetHeader: function(headersString){
			var headers = {};
			if(!headersString){
				return headers;
			}

			var arr = headersString.split('\n');
			var i = 0;
			for(; i < arr.length; i++){
				var line = arr[i];
				var index = line.indexOf(':');
				if(index != -1){
					var key = line.substr(0, index).trim();
					var val = line.substr(index + 1).trim();
					headers[key] = val;
				}
			}
			return headers;
		}, 

		requestFilterStatus: function(status, response, headers){
			// add your code here
			var flag = true;

			if(status == 0){
				alert('系统无响应！');
				flag = false;
			}else if(status >= 500){
				var msg = '系统错误！';

				// get some http header value to show
				// adapt to PingAn iCore framework 
				var errorMsg = headers['x-iCore_fa-errorMsg'];
				if(errorMsg){
					// uri解码
					msg = decodeURIComponent(errorMsg);
				}

				alert(msg);

				flag = false;
			}else if(status == 403){
				alert('资源访问受限！');
				flag = false;
			}else if(status == 404){
				alert('访问资源不存在！');
				flag = false;
			}else if(status == 405){
				alert('请求方法不被接受！');
				flag = false;
			}else if(status == 401){
				// token invalid
				alert('访问资源未通过令牌验证！');
				flag = false;
			}

			if(!flag){
				// blockUI close
				if(global.$ && global.$.unblockUI){
					$.unblockUI({fadeOut: 1000});
				}
			}
			return flag;
		}, 

		dump: ''
	};
	global.PawaConf = conf;

	// server jsonp response -> PortalAuth.login({'LOGIN_STATUS': 'no_login'});
	// if not jsonp call PortalAuth.login
	if(!global.PortalAuth){
		global.PortalAuth = {};
		global.PortalAuth.login = function(data){
			global.top.document.location.href = conf.loginUrl;
		};
	}

	// overwrite console error method
//	if(global.console && global.console.error){
//		var old = global.console.error;
//		global.console.error = function(msg){
//			old(msg);
//			alert(msg);
//		};
//	}

	if(conf.seajsConf){
		global.seajs.config(conf.seajsConf);
	}
})(this);

// consts as a module
define('consts', window.PawaConf);
define('utils', function(require, exports, module){
	// cookie helper
	exports.getCookie = function(cookieName){
		var cookieStart = document.cookie.indexOf(cookieName);
		var cookieEnd = document.cookie.indexOf(";", cookieStart);
		return cookieStart == -1 ? '' : unescape(document.cookie.substring(cookieStart + cookieName.length + 1, (cookieEnd > cookieStart ? cookieEnd : document.cookie.length)));
	};

	exports.setCookie = function(cookieName, cookieValue, seconds, path, domain, secure) {
		var expires = new Date();
		expires.setTime(expires.getTime() + seconds);
		document.cookie = escape(cookieName) + '=' + escape(cookieValue)
			+ (expires ? '; expires=' + expires.toGMTString() : '')
			+ (path ? '; path=' + path : '/')
			+ (domain ? '; domain=' + domain : '')
			+ (secure ? '; secure' : '');
	};

	// query parameters
	exports.params = function(url){
		url = url || document.location.href;
		var data = {};
		var pos = url.indexOf('?');
		if(pos != -1){
			var query = url.substring(pos);
			if(query){
				var ll = query.substring(1).split('&');
				var i = 0;
				for(; i < ll.length; i++){
					var arr = ll[i].split('=');
					if(arr.length == 2)
						data[arr[0]] = arr[1];
				}
			}
		}
		return data;
	};
});

// token令牌
define('token.local', function(require){
	// token客户端保存对象
	var TokenLocal = {local: {}, digestKey: 'digestKey', valKey: 'val'};

	// token配置 TODO
	TokenLocal.req = window.tokenConf || [
		{url: '/controller/newcore/FormAction/queryTaskLl.gy', key: 'taskList', path: 'pager.ll.[]reportId', type: 'sign'}, 
		{url: '/controller/newcore/FormAction/getReportInfo.gy', key: 'taskList', field: 'reportId', type: 'verify'}
	];
	TokenLocal.trimUrlQuery = function(url){
		if(!url)
			return url;

		var pos = url.indexOf('?');
		if(pos != -1){
			return url.substring(0, pos);
		}else{
			return url;
		}
	};
	TokenLocal.getDataByKey = function(key){
		return this.local[key];
	};
	TokenLocal.setDataByKey = function(key, data){
		this.local[key] = typeof data === 'string' ? JSON.parse(data) : data;
	};
	TokenLocal.setDataByUrl = function(url, data){
		var item = this.getConfItem(url, 'sign');
		if(!item){
			return;
		}
		this.setDataByKey(item.key, data);
	};
	// 是否匹配
	TokenLocal.matPathUrl = function(url, urlConfig){
		if(!urlConfig.contains('{')){
			return -1;
		}

		var pat = /\//;
		var arr = url.split(pat);
		var arrConfig = urlConfig.split(pat);
		if(arr.length != arrConfig.length){
			return -1;
		}

		var i = 0;
		for(; i < arr.length; i++){
			var token = arr[i];
			var tokenConfig = arrConfig[i];

			if(token != tokenConfig){
				if(!tokenConfig.contains('{')){
					return -1;
				}else{
					// 匹配了
					return i;
				}
			}
		}

		return -1;
	};
	TokenLocal.getParams = function(url, urlConfig, index){
		var pat = /\//;
		var arr = url.split(pat);
		var arrConfig = urlConfig.split(pat);

		var patWrapper = /^\{(.+)\}$/;
		var data = {};
		var i = index;
		for(; i < arr.length; i++){
			var token = arr[i];
			var tokenConfig = arrConfig[i];

			var mat = tokenConfig.match(patWrapper);
			if(!mat){
				// 配置错误
				break;
			}else{
				var key = mat[1];
				data[key] = token;
			}
		}
		return data;
	};

	// 根据url/type从配置从获取配置信息
	// get configuration item by url and type
	// type is 'sign' or 'verify' means sign token after request or get token before request
	TokenLocal.getConfItem = function(url, type){
		if(!url){
			return null;
		}
		type = type || 'sign';
		url = this.trimUrlQuery(url);

		if('verify' == type){
			var i = 0;
			for(; i < this.req.length; i++){
				var one = this.req[i];
				if(type == one.type){
					if(url == one.url){
						return one;
					}else{
						var index = TokenLocal.matPathUrl(url, one.url);
						if(index != -1){
							one.params = TokenLocal.getParams(url, one.url, index);
							return one;
						}
					}
				}
			}
		}else{
			var i = 0;
			for(; i < this.req.length; i++){
				var one = this.req[i];
				if(url == one.url && type == one.type){
					return one;
				}
			}
		}

		return null;
	};

	TokenLocal.getConfItemByKey = function(key, type){
		if(!key){
			return null;
		}
		type = type || 'sign';

		var i = 0;
		for(; i < this.req.length; i++){
			var one = this.req[i];
			if(key == one.key && type == one.type){
				return one;
			}
		}

		return null;
	};

	TokenLocal.getTokenObjByField = function(data, field, val){
		if(!data){
			return null;
		}

		var arrPre = '[]';
		// 如果不是数组，就直接取对象属性
		// check if is an array, return property value if not
		if(!field.startsWith(arrPre)){
			return data[field];
		}

		if(!Object.prototype.toString.apply(data) == '[object Array]'){
			return null;
		}

		// 数组内对象的值
		var fieldName = field.substring(arrPre.length);
		var i = 0;
		for(; i < data.length; i++){
			var one = data[i];
			if(!fieldName){
				// 简单对象
				// simple object eg string number boolean
				if(one && one[TokenLocal.valKey] == val){
					return one;
				}
			}else{
				// 复杂对象，就根据属性判断
				// object {}
				var inner = one[fieldName];
				if(inner && inner[TokenLocal.valKey] == val){
					return inner;
				}
			}
		}

		return null;
	};

	// get object by path given
	// eg. path -> query.reportId 
	// data -> {query: {reportId: '1234'}} 
	// return => '1234'
	TokenLocal.getObjByPath = function(data, path, val){
		if(!path || !data){
			return null;
		}

		var arr = path.split(/\./);
		var i = 0;
		for(; i < arr.length; i++){
			var field = arr[i];
			data = this.getTokenObjByField(data, field, val);
			if(!data){
				return null;
			}
		}

		return data;
	};

	// 获取ajax上传参数中的目标值，根据该值再去本地保存的tokens中获取令牌
	// get target value from post/get parameters, then get token from local already saved
	TokenLocal.getToken = function(url, params){
		var item = this.getConfItem(url, 'verify');
		if(!item){
			return null;
		}
		var itemSave = this.getConfItemByKey(item.key, 'sign');
		if(!itemSave){
			return null;
		}

		var data = this.getDataByKey(item.key);

		// 合并参数
		params = params || {};
		if(item.params){
			for(key in item.params){
				params[key] = item.params[key];
			}
		}

		var val = this.getObjByPath(params, item.path);

		var tokenItem = this.getObjByPath(data, itemSave.path, val);
		return tokenItem ? tokenItem[TokenLocal.digestKey] : null;
	};

	return TokenLocal;
});

// module execution dispatcher
define('main', function(require){
	var Consts = require('consts');
	var Utils = require('utils');

	var url = document.location.href;
	var data = Utils.params(url);

	var path = url;
	var pos = url.indexOf('?');
	if(pos != -1){
		path = path.substring(0, pos - 1);
	}

	// get target module (cmd/amd)
	var protocol = document.location.protocol;
	var hostname = document.location.hostname;
	var port = document.location.port;
	var pathPre = protocol + '//' + hostname;
	if(path.contains(':' + port)){
		pathPre = pathPre + ':' + port;
	}

	var pathAbs = path.substring(pathPre.length);

	var arr = pathAbs.split(/\//);
	// context reset
	if(Consts.appname != arr[1]){
		Consts.appname = arr[1];
	}

	// target module's javascript file's name is same as html file by default 
	var targetModuleName = pathAbs;
	// javascript file in another directory
	if(Consts.moduleDirReplace && Consts.moduleDirTarget && Consts.moduleDirSrc){
		targetModuleName = targetModuleName.replace(Consts.moduleDirSrc, Consts.moduleDirTarget);
	}

	var mat = pathAbs.match(/^.+\.(html|jsp|do|json|text)$/);
	if(mat){
		var arr = targetModuleName.split(/\./);
		arr.splice(arr.length - 1, 1);
		targetModuleName = arr.join('.') + '.js';
	}else{
		targetModuleName += '.js';
	}
	if(targetModuleName.endsWith('.js.js')){
		targetModuleName = targetModuleName.substr(0, targetModuleName.length - 3);
	}

	if(data.moduleBind){
		require.async(targetModuleName, function(m){
			m.ready(data);
		});
	}else{
		// create anonymous angular module and bootstrap
		require('ng/ng.ui').init();
		require.async(targetModuleName, function(m){
			var moduleNameTemp = Math.guid();
			var tempModule = angular.module(moduleNameTemp, ['ng.ui']);
			m.ready(tempModule, data);
			window.angular.bootstrap(document, [moduleNameTemp]);
		});
	}
});