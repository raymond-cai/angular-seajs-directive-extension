// file ng.config.js
define('ng/ng.config.js', function(require){
	var Consts = require('consts');
	// add/get token to/from http header when do ajax request
	var TokenLocal = require('token.local');

	var $ = require('jquery');
	// declare angular module name first
	var moduleName = 'ng.config';
	return {
		extend: function(){
			// watch ng-show model，if ng-show model = false, then hide tips dom in this ng-show div
			if(!angular.ngShowFilter){
				angular.ngShowFilter = function(modelName, el, isShow){
					window.console.log('Directive filter ngShow : ' + modelName + ' : ' + isShow);
					// refer angular.js toBoolean function 
					// ng-show only can be true or false
					if(true !== isShow){
						el.find('[ui-valid]').each(function(){
							var validId = $(this).attr('ui-valid-id');
							if(validId){
								$('#vtip_' + validId).hide();
							}
						});
					}
				};
			}
			// ajax filter in $HttpBackendProvider (not $HttpProvider - responseInterceptors)
			if(!angular.completeRequestInterceptor){
				angular.completeRequestInterceptor = function(url, status, response, headersString){
					window.console.log('Request filter status : ' + status);
					// window.console.log('Request filter response : ' + response);

					var headers = Consts.requestGetHeader(headersString);

					if('200' != status){
						window.console.log('Error when request filter : not 200 response!');
						if(Consts.requestFilterStatus){
							if(!Consts.requestFilterStatus(status, response, headers)){
								return false;
							}
						}
					}

					if('200' == status && response){
						// save token
						var tokenHeader = headers[Consts.tokenHeaderKey];
						if(tokenHeader){
							TokenLocal.setDataByUrl(Consts.getPathWithoutApp(url), tokenHeader);
						}

						var r;
						if(angular.isString(response)){
							// need to skip ng-include
							var firstChar = response.substring(0, 1);
							// json, if not json it may be html code or jsonp javascript expression, just return true and continue
							if(firstChar == '{' || firstChar == '['){
								try{
									r = JSON.parse(response);
								}catch(e){
									window.console.log('Error when request filter json parse : ' + response);
									return false; 
								}
							}
						}else if(angular.isObject(response)){
							r = response;
						}

						if(Consts.requestFilter){
							return Consts.requestFilter(r);
						}
					}

					return true;
				};
			} // /completeRequestInterceptor

			if(!angular.preSendRequestInterceptor){
				angular.preSendRequestInterceptor = function(config, reqHeaders){
					// check session
					if(Consts.sendRequestFilter && !Consts.sendRequestFilter(config, reqHeaders)){
						return false;
					}

					// add token
					var url = config.url;
					var token = TokenLocal.getToken(Consts.getPathWithoutApp(url), 
						config.data || config.params);
					if(token){
						reqHeaders[Consts.tokenHeaderKey] = token;
					}else{
						window.console.log('No token get : ' + url);
					}

					return true;
				};
			} // /preSendRequestInterceptor
		}, 

		init: function(){
			window.console.log('Begin init module ' + moduleName);
			if(angular.isModuleExists && angular.isModuleExists(moduleName)){
				window.console.log('Module already exists!' + moduleName);
				return;
			}

			this.extend();

			// define this angular module as a simple javascript object, add configurations
			var conf = {};

			// ... it sucks when using absolute url path
			// copy properties from Consts so that you only need to change one file
			var keys = ['appname', 'contextPre', 'context', 
				'logLevel', 'logQueueFlushSize', 'logPostMsg', 'logServerUrl', 
				'useToken', 'tokenHeaderKey'];
			var i = 0;
			for(; i < keys.length; i++){
				var key = keys[i];
				conf[key] = Consts[key];
			}

			// add servlet container context path to url
			conf.url = function(url){
				return this.appname + url;
			};

			conf.validClass = 'ng-valid';
			conf.invalidClass = 'ng-invalid';
			// jquery / plugins parameters
			conf.tipsStyle = 'default';
//			conf.tipsStyle = 'poshytip';
			conf.date = {dateFormat: 'yy-mm-dd'};

//			conf.date = {dateFormat: 'yy-mm-dd', 
//				showOn: 'button', 
//				buttonImage: '/images/calen_pic2.gif',
//				buttonImageOnly: true,
//
//				changeMonth: true, 
//				changeYear: true, 
//				showMonthAfterYear: false, 
//				yearSuffix: ''};

			conf.autocomplete = {minChars: 3, maxItemsToShow: 10};

			// bootstrap button style
//			conf.defaultPagiBtnClass = 'btn-large';
//			conf.defaultPagiCurrentBtnClass = 'btn-large btn-primary';

			conf.defaultPagiBtnClass = 'btn';
			conf.defaultPagiCurrentBtnClass = 'btn btn-blue';

			// dialog
			conf.dialogDraggable = {
				opacity: 0.6, 
				containment: 'body'
			};

			// ztree
			conf.ztree = {
				setting: {
					data: {
						simpleData: {
							enable: true
						}
					}
				}
			};

			conf.contextMenu = {
				contextMenuClass: 'contextMenuPlugin',
				gutterLineClass: 'gutterLine',
				headerClass: 'header',
				seperatorClass: 'divider',
				title: ''
			};

			var md = angular.module(moduleName, []);
			// ajax filter
//			md.config(['$httpProvider', function($httpProvider){
//				$httpProvider.responseInterceptors.push(function($q){
//					return function(promise){
//						return promise.then(function(response){
//							window.console.log('Request filter response : ' + response);
//						}, function(response){
//							window.console.log('Request filter response error : ' + response);
//						});
//					};
//				});
//			}]);
			md.value('ng.config', conf);
		}
	};
});
// file ng.filter.js
define('ng/ng.filter.js', function(require){
	var moduleName = 'ng.filter';
	return {
		init: function(){
			window.console.log('Begin init module ' + moduleName);
			if(angular.isModuleExists && angular.isModuleExists(moduleName)){
				window.console.log('Module already exists!' + moduleName);
				return;
			}

			var md = angular.module(moduleName, []);
			// filter function will be called twice, refer : 
			// http://stackoverflow.com/questions/11676901/is-this-normal-for-angularjs-filtering

			// use ngClassEven/Odd instead
			md.filter('trBg', function(){
				return function(index, oddStyleSuf) {
					var pre = index % 2 == 0 ? 'odd' : 'even';
					if(oddStyleSuf)
						pre += oddStyleSuf;
					return pre;
				};
			});
		}
	};
});
// file ng.service.js
define('ng/ng.service.js', function(require){
	require('ng/ng.config').init();

	// bgiframe gt ie6 not required
//	require('jquery.bgiframe');
	require('jquery.blockUI');
	require('jquery.poshytip');
	var $ = require('jquery');
	var _ = require('underscore');
	var Consts = require('consts');

	var moduleName = 'ng.service';

	return {
		init: function(){
			window.console.log('Begin init module ' + moduleName);
			if(angular.isModuleExists && angular.isModuleExists(moduleName)){
				window.console.log('Module already exists!' + moduleName);
				return;
			}

			// change plugin settings
			if($.dialog){
				$.dialog.setting.path = Consts.context + 'images/lhgdialog/';
			}

			var md = angular.module(moduleName, ['ng.config']);

			md.factory('uiPortalUtils', ['$window', 'uiLog', function(win, log){
				return {
					openTab: function(tabId, url, title, opts){
						if(!window.parent || !window.parent.PortalTab){
							log.w('No PortalTab defination!');

							// open new window if not in portal
							if(opts && opts.openForce){
								window.open(url, tabId);
							}

							return;
						}else{
							window.parent.PortalTab.open(tabId, url, title, opts);
						}
					},
					
					openTabByPost: function(tabId, url, title, opts, data){
						if(!window.parent || !window.parent.PortalTab){
							log.w('No PortalTab defination!');

							// open new window if not in portal
							if(opts && opts.openForce){
								window.open(url, tabId);
							}

							return;
						}else{
							window.parent.PortalTab.openByPost(tabId, url, title, opts, data);
						}
					}
				};
			}]);

			// log
			md.factory('uiLog', ['ng.config', '$window', function(conf, win){
				var logQueue = [];
				var levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
				return {
					// format to string
					getMsg: function(msg, level){
						if(!angular.isString(msg))
							msg = JSON.stringify(msg);

						level = level || 'INFO';

						var dat = new Date().format();
						return '[' + dat + '][' + level + ']' + msg;
					},

					// send to server
					postMsg: function(){
						if(!conf.logPostMsg)
							return;

						var url = conf.logServerUrl;
						var _this = this;
						$.ajax({
							url: url,
							type: 'POST', 
							async: false, 
							data: 'msg=' + JSON.stringify(logQueue),
							error: function(xhr){
								_this.e('POST log failed : ' + url);
							}, 

							success: function(){
								_this.i('POST log ok : ' + url);
								logQueue.clear();
							}
						});
					}, 

					isLevelEnabled: function(level){
						return levels.indexOf(conf.logLevel) <= levels.indexOf(level);
					}, 
						
					log: function(msg, level){
						if(win.console && win.console.log && this.isLevelEnabled(level)){
							win.console.log(this.getMsg(msg, level));
						}
					},

					d: function(msg){
						this.log(msg, 'DEBUG');
					}, 

					i: function(msg){
						this.log(msg, 'INFO');
					}, 

					w: function(msg){
						this.log(msg, 'WARN');
					}, 

					e: function(msg){
						this.log(msg, 'ERROR');
					},

					audit: function(msg){
						var str = this.getMsg(msg);
						if(win.console && win.console.log){
							win.console.log(str);
						}

						logQueue.push(str);
						if(logQueue.length > conf.logQueueFlushSize){
							this.postMsg();
						}
					}
				};
			}]);

			// use jquery ajax when do synchronized requests
			// pre filter after filter
			md.factory('jqueryAjax', ['$rootScope', 'uiLog', 'uiRequest', function($rootScope, uiLog, uiRequest){
				return function(config){
					var method = config.method ? angular.uppercase(config.method) : 'GET';
					var reqData = uiRequest.pairs(config.params || config.data);
					var reqHeaders = config.headers || {};

					// token
					var preFilterResult =  true;
					if(angular.preSendRequestInterceptor){
						preFilterResult = angular.preSendRequestInterceptor(config, reqHeaders);
					}

					if(!preFilterResult){
						// just return
						return {
							success: function(fn){
								// skip
								return this;
							}, 
							error: function(fn){
								fn(data, -1);
								$rootScope.$apply();

								return this;
							}
						}
					}

					var data;
					var headersString;
					var status = 200;
					$.ajax({
						url: config.url,
						type: method, 
						data: reqData, 
						async: false, 

						success: function(txt, status, jqXHR){
							headersString = jqXHR.getAllResponseHeaders();
							try{
								data = angular.isObject(txt) ? txt : JSON.parse(txt);
							}catch(e){
								data = {};
							}
						}, 

						error: function(){
							data = {};
							status = -2;
						}
					});

					var filterResult =  true;
					if(angular.completeRequestInterceptor){
						filterResult = angular.completeRequestInterceptor(config.url, status, data, headersString);
					}
					if(!filterResult){
						// just return
						return {
							success: function(fn){
								// skip
								return this;
							}, 
							error: function(fn){
								fn(data, -1);
								$rootScope.$apply();

								return this;
							}
						}
					}

					return {
						success: function(fn){
							fn(data, status);
							$rootScope.$apply();

							return this;
						}, 
						error: function(fn){
							if(-2 != status)
								return;

							fn(data, status);
							$rootScope.$apply();

							return this;
						}
					};
				};
			}]);

			// pagination model helper
			md.factory('uiPager', ['ng.config', 'uiLog', function(conf, log){
				return {
					gen: function(pager, opts){
						if(!pager){
							var pagi = {};
							pagi.totalPageLl = [];
							pagi.totalPage = 0;
							pagi.totalCount = 0;
							pagi.pageNum = 0;
							pagi.pageSize = 0;

							pagi.style = {};
							pagi.style.btnClass = conf.defaultPagiBtnClass;

							// first previous next last / buttons disabled
							pagi.ctrl = {};
							pagi.ctrl.isChoosePageDisabled = true;
							pagi.ctrl.isFirstPageDisabled = true;
							pagi.ctrl.isPrevPageDisabled = true;
							pagi.ctrl.isNextPageDisabled = true;
							pagi.ctrl.isLastPageDisabled = true;

							return pagi;
						}

						var pagi = {};

						// current page
						pagi.pageNum = pager.pageNum || 0;
						// number per page
						pagi.pageSize = pager.pageSize || 10;
						pagi.totalCount = pager.totalCount || 0;
						// no records
						if(!pagi.totalCount)
							pagi.pageNum = 0;

						pagi.totalPage = this.getTotalPage(pagi.totalCount, pagi.pageSize);
						pagi.totalPageLl = this.getTotalPageLl(pagi.totalPage, pagi.pageNum, opts);

						pagi.targetPageChoosed = _.find(pagi.totalPageLl, function(it){
							return it.pageNum == pagi.pageNum;
						});

						pagi.style = {};
						pagi.style.btnClass = conf.defaultPagiBtnClass;

						// first previous next last
						pagi.ctrl = {};
						pagi.ctrl.isFirstPageDisabled = pagi.totalCount == 0 || pagi.pageNum == 1;
						pagi.ctrl.isPrevPageDisabled = pagi.pageNum <= 1;
						pagi.ctrl.isNextPageDisabled = pagi.pageNum == pagi.totalPage;
						pagi.ctrl.isLastPageDisabled = pagi.totalPage <= 1 || pagi.pageNum == pagi.totalPage;
						pagi.ctrl.isChoosePageDisabled = pagi.totalPage <= 1;

						return pagi;
					},

					refresh: function(pagi){
						pagi.totalPage = this.getTotalPage(pagi.totalCount, pagi.pageSize);
						pagi.totalPageLl = this.getTotalPageLl(pagi.totalPage, pagi.pageNum);					
					}, 

					getTotalPageLl: function(totalPage, pageNum, opts){
						return _.map(_.range(1, totalPage + 1), function(it){
							var pagiBtnClass = conf.defaultPagiBtnClass;
							if(opts && opts.defaultBtnClass)
								pagiBtnClass = opts.defaultBtnClass;

							// model with button style
							// use ng-repeat to render different buttons
							var one = {};
							one.btnClass = pagiBtnClass;
							one.pageNum = it;

							if(pageNum == it){
								one.btnClass = conf.defaultPagiCurrentBtnClass;
								if(opts && opts.currentBtnClass)
									one.btnClass = opts.currentBtnClass;
							}

							return one;
						});	
					}, 

					getTotalPage: function(totalCount, pageSize){
						var r = totalCount % pageSize;
						var r2 = totalCount / pageSize;
						var result = r == 0 ? r2 : r2 + 1;
						return Math.floor(result);
					}
				};
			}]);

			// filter ajax request parameters
			md.factory('uiRequest', ['uiLog', function(log){
				return {
					// date -> string
					filter: function(params, conf, skipLl){
						if(!conf){
							// -> ui.config
							conf = {dateFormat: 'yyyy-MM-dd'};
						}

						var r = {};
						if(params){
							for(key in params){
								if(skipLl && skipLl.contains(key))
									continue;

								var val = params[key];
								if(angular.isDate(val)){
									r[key] = val.format(conf.dateFormat);
								}else{
									r[key] = val;
								}
							}
						}
						return r;
					},

					// parameters flatten
					// eg. {list: [{name: 'kerry']} -> {'list[0].name': 'kerry'}
					pairs: function(obj, name){
						if(obj == null)
							return null;

						if(!name)
							name = '';

						var type = Object.prototype.toString.call(obj);
						if(type == "[object Array]"){ 
							var pairs = {};
							var i = 0;
							for(; i < obj.length; i++){
								var item = obj[i];
								var sub = this.pairs(item, name + '[' + i + ']');
								_.extend(pairs, sub);
							} 
							return pairs;
						}else if(type == "[object Object]"){ 
							var pairs = {};
							for(key in obj){ 
								var subName = name == '' ? key : name + '.' + key;
								var sub = this.pairs(obj[key], subName);
								_.extend(pairs, sub);
							}
							return pairs;
						}else{ 
							var pairs = {};
							pairs[name] = obj;
							return pairs;
						} 
					}, 

					// url query parameters
					params: function(url){
						url = url || document.location.href;
						var data = {};
						var pos = url.indexOf('?');
						if(pos == -1)
							return data;

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
						return data;
					}
				};
			}]);

			// tips
			md.factory('uiTips', ['ng.config', 'uiLog', function(conf, log){
				return {
					tipsXoffset: 30, 
					tipsYoffset: 30, 

					on: function(el, msg, addClass){
						if(addClass){
							el.removeClass(conf.validClass).addClass(conf.invalidClass);
						}

						var offset = el.offset();
						// IE8 when set ng-show variable true, but offset top/left here is still 0
						if(!offset.top && !offset.left && el.is(':hidden')){
							offset = el.show().offset();
						}

						var top = (offset.top + this.tipsYoffset);
						var left = (offset.left + this.tipsXoffset);

						var id = el.attr('ui-valid-id');
						if(!id){
							id = Math.guid();
							el.attr('ui-valid-id', id);
						}

						if(id.contains('.')){
							id = id.replace(/\./g, '_');
						}

						var genTips = function(){
							// already exists, change css style
							if($("#vtip_" + id).size() > 0){
								$("#vtip_" + id).html('<img class="vtip_arrow " src="' + conf.context + 'images/vtip_arrow.png" />' + msg)
									.css({"display": "none", "top": top + "px", "left": left + "px"});
							}else{
								// generate new and append
								var html = '<p id="vtip_' + id + '" class="vtip"><img class="vtip_arrow" src="' + conf.context + 'images/vtip_arrow.png" />' + msg + '</p>';
								$(html).css({"display": "none", "top": top + "px", "left": left + "px"}).appendTo($('body'));
							}
						};

						var lastTip = el.data('last-tip');
						if(lastTip){
							if(lastTip == msg){
								// skip
							}else{
								if('poshytip' == conf.tipsStyle){
									// destroy first
									el.poshytip('destroy');
									el.data('last-tip', msg);
									el.poshytip({content: msg});
								}else{
									genTips();
									el.unbind('mouseover,mouseout').bind('mouseover', function(e){
										$("#vtip_" + id).css({left: (e.pageX - 12) + 'px'}).fadeIn();
									}).bind('mouseout', function(){
										$("#vtip_" + id).fadeOut();
									});
								}
							}
						}else{
							if('poshytip' == conf.tipsStyle){
								el.data('last-tip', msg);
								el.poshytip({content: msg});
							}else{
								genTips();
								el.unbind('mouseover,mouseout').bind('mouseover', function(e){
									$("#vtip_" + id).css({left: (e.pageX - 12) + 'px'}).fadeIn();
								}).bind('mouseout', function(){
									$("#vtip_" + id).fadeOut();
								});
							}
						}
					}, 

					off: function(el, removeClass){
						if(removeClass){
							el.removeClass(conf.invalidClass).addClass(conf.validClass);
						}

						var id = el.attr('ui-valid-id');
						if(!id){
							var offset = el.offset();
							var top = (offset.top + this.tipsYoffset);
							var left = (offset.left + this.tipsXoffset);
							id = top + '_' + left;
						}

						if(id.contains('.')){
							id = id.replace(/\./g, '_');
						}

						if('poshytip' == conf.tipsStyle){
							el.poshytip('destroy');
							el.data('last-tip', '');
						}else{
							$("#vtip_" + id).remove();
							el.unbind('mouseover,mouseout');
						}
					},

					// remove all tips div in a speicfic jQuery context
					offInContext: function(_context){
						if(!_context || !_context.size()){
							return;
						}

						_context.find('[ui-valid]').each(function(){
							var validId = $(this).attr('ui-valid-id') || '';
							if(validId){
								$('#vtip_' + validId).hide();
							}
						});
					}, 

					// *** loading block
					loading: function(fn, msg, opacity){
						msg = msg || 'Loading...';
						if(!angular.isNumber(opacity) || 0 != opacity){
							opacity = opacity || 0.5;
						}

						var tpl = '<div id="loading_inner">' + 
							'<div class="loading_inner_msg">' +
							msg + 
							'</div>' + 
						'</div>';

						$.blockUI({message: tpl, overlayCSS: {opacity: opacity}, onBlock: function(){
							if(fn){
								setTimeout(function(){
									fn();
								}, 10);
							}
						}});
					},

					unloading: function(delay){
						$.unblockUI({fadeOut: delay || 1000});
					}, 
					
					loadingFn: function(fn, msg, opacity, delay, syc){
						this.loading(fn, msg, opacity);
						// if fn is a synchronized callback, close blocking immediately
						if(syc){
							this.unloading(delay);
						}
					},

					alert: function(msg, fn){
						if(!$.dialog)
							return;

						$.dialog.alert(msg, fn);
					}, 

					confirm: function(msg, fn, fn2){
						if(!$.dialog)
							return;

						$.dialog.confirm(msg, fn, fn2);
					}, 

					prompt: function(msg, fn){
						if(!$.dialog)
							return;

						$.dialog.prompt(msg, fn);
					},
						
					tips: function(msg, delay, img, fn){
						if(!$.dialog)
							return;

						$.dialog.tips(msg, delay, img, fn);
					}
				};
			}]);

			// valid
			md.factory('uiValid', ['ng.config', 'uiLog', 'uiTips', '$parse', function(conf, log, tips, $parse){
				return {
					// call this method before submit your form or do a ajax request
					// because angular directive donot trigger auto
					checkForm: function($form, $scope){
						var formName = $form.$name;
						var _context = $('form[name="' + formName + '"]');

						var _elLl = _context.find('[ng-model][ui-valid]');
						if(!_elLl.size())
							return true;

						var _this = this;
						var flags = [];
						_elLl.each(function(){
							var _el = $(this);

							var modelName = _el.attr('ng-model');
							var getter = $parse(modelName);
							var modelValue = getter($scope);
							// not bind yet, nor valid
							if(modelValue === undefined){
								var rules = _el.attr('ui-valid');
								if(rules){
									var arr = rules.split(' ');
									// 'r' means required
									if(arr.contains('r')){
										flags.push(false);

										// select2 hide select element
										var selContainer = _el.siblings('.select2-container');
										if(selContainer.length)
											tips.on(selContainer, _el.attr('ui-valid-tips') || _this.getMsg('tips.valid'), true);
										else
											tips.on(_el, _el.attr('ui-valid-tips') || _this.getMsg('tips.valid'), true);
									}
								}
							}
						});
						return !flags.length || _.every(flags, function(it){
							return it;
						});
					}, 

					// check if val fit these valid rules
					check: function(val, rules, $scope, el){
						// no rules
						if(!rules)
							return {flag: true}; 

						var arr = rules.split(' ');
						// 'r' means required
						if(!arr.contains('r') && ('' == val || !val))
							return {flag: true};

						var i = 0;
						for(; i < arr.length; i++){
							var rule = arr[i];
							if(!rule)
								continue;

							var flag = true;
							if('r' == rule){
								// multiple select blank array == '' -> true
								// so return false
								flag = val != null && val != '';
							}else if(rule.contains(':')){
								// rules that complex
								flag = this.checkRule(val, rule.split(/:/), $scope, el);
							}else{
								var pat = this.pats[rule];
								if(pat instanceof RegExp){
									if(angular.isString(val)){
										flag = this.mat(val, pat);
									}else if(angular.isDate(val)){
										// date object need not regexp check
										flag = true;
									}
								}else if(angular.isFunction(pat)){
									flag = pat(val, el);
								}else{
									// only support regexp and function
									flag = false;
								}
							}

							if(!flag){
								var tips = el.attr('ui-valid-tips');
								var msg = this.getMsg(rule, tips) || this.getMsg('tips.valid');
								return {flag: flag, msg: msg};
							}
						}

						return {flag: true};
					},
					
					// eg. "fn:checkTarget" -> customized valid function
					// eg. "num:range:target_id:+100" -> return true when val - model val(target_id) < 100
					// eg. "date:range:target_id:+2" -> return true when val - model val(target_id) < 2
					// eg. "date:rangeout:target_id:+2" -> return true when val - model val(target_id) > 2
					// eg. "minlen:char:3"
					// eg. "maxval:float:3.23"
					checkRule: function(val, ruleArr, $scope, el){
						var len = ruleArr.length;
						var pre = ruleArr[0];

						// customized valid function defined in controller $scope
						if('fn' == pre){
							var fnName = ruleArr[1];
							var getter = $parse(fnName);
							var fn = getter($scope);
							if(!fn){
								return true;
							}

							return fn(val, el);
						}else if('num' == pre){
							if(len != 4){
								log.i('Invalid rules : ' + ruleArr);
								return false;
							}

							// val targetVal is int
							var getter = $parse(ruleArr[2]);
							var targetVal = getter($scope);
							if(!targetVal)
								return false;

							var rangeVal = parseInt(ruleArr[3]);
							if(ruleArr[1] == 'range' && val > targetVal + rangeVal)
								return false;
							if(ruleArr[1] == 'rangeout' && val < targetVal + rangeVal)
								return false;

							return true;
						}else if('date' == pre){
							if(len != 4){
								log.i('Invalid rules : ' + ruleArr);
								return false;
							}

							// val targetVal is Date object, when use mouse change input directly but not use datepicker
							// targetVal is a string
							var getter = $parse(ruleArr[2]);
							var targetVal = getter($scope);
							if(!targetVal || !angular.isDate(targetVal))
								return false;

							var rangeVal = parseInt(ruleArr[3]);
							if(ruleArr[1] == 'range' && val > targetVal.add(rangeVal))
								return false;
							if(ruleArr[1] == 'rangeout' && val < targetVal.add(rangeVal))
								return false;

							return true;
						}else if('minlen' == pre || 'maxlen' == pre){
							if(len != 3){
								log.i('Invalid rules : ' + ruleArr);
								return false;
							}

							var len = parseInt(ruleArr[2]);
							if(ruleArr[0] == 'minlen' && 
								(('byte' == ruleArr[1] && val.length < len) || 
								('char' == ruleArr[1] && val.charlen() < len)))
								return false;
							if(ruleArr[0] == 'maxlen' && 
								(('byte' == ruleArr[1] && val.length > len) || 
								('char' == ruleArr[1] && val.charlen() > len)))
								return false;
							return true;
						}else if('minval' == pre || 'maxval' == pre){
							if(len != 3){
								log.i('Invalid rules : ' + ruleArr);
								return false;
							}

							var targetVal = 'float' == ruleArr[1] ? parseFloat(ruleArr[2]) : parseInt(ruleArr[2]);
							var currentVal = val;
							if(pre == 'minval' && currentVal < targetVal)
								return false;
							if(pre == 'maxval' && currentVal > targetVal)
								return false;
							return true;
						}else if('ac' == pre){
							// autocomplete valid check
							if(len != 2){
								log.i('Invalid rules : ' + ruleArr);
								return false;
							}
							var getter = $parse(ruleArr[1]);
							var targetVal = getter($scope);
							// tips: label-value (format)
							return targetVal && val.split('-')[0] == targetVal;
						}else{
							return true;
						}
					}, 

					mat: function(val, pat){
						if(!pat)
							return true;

						return pat.test(val);
					}, 

					getMsg: function(rule, tips){
						// if develeper giving tips (ui-valid-tips) when using this directive, return giving tips
						// if ui-valid-tips="label:Your model label", prepend 'Your model label' to tips and return
						tips = tips || '';
						if(tips && !tips.contains(':')){
							return tips;
						}

						var msg = this.msgs[rule];
						if(rule){
							var ruleFirst = rule.split(':')[0];
							if(['ac', 'maxval', 'minval', 'maxlen', 'minlen'].contains(ruleFirst)){
								msg = this.msgs[ruleFirst];
							}
						}

						if(msg){
							var params0 = tips.contains(':') ? tips.split(/:/)[1] : '';
							var params1 = '';
							if(rule.startsWith('min') || rule.startsWith('max')){
								var ruleArr = rule.split(/:/);
								params1 = ruleArr[ruleArr.length - 1];
							}

							return msg.format(params0, params1);
						}else{
							log.i('No tips for : ' + rule);
							return tips;
						}
					}, 

					// add your valid function using this
					/*
					eg.
					var myModule = angular.module('myModule', ['ng.service']);
					myModule.run(['uiValid', function(uiValid){
						uiValid.regPat('rule.test', /^\d{2,3}$/, '数字两三个');
					}]);
					*/
					regPat: function(code, pat, msg){
						if(this.pats[code])
							return;

						this.pats[code] = pat;
						this.msgs[code] = msg;
					}, 

					// default rule / tips defination
					msgs: {
						'r': '{0}不能为空', 
						'date': '{0}不正确的日期格式格式，日期格式应该为yyyy-MM-dd', 
						'time': '{0}不正确的时间格式，时间格式应该为hh:mm', 
						'datetime': '{0}不正确的时间格式，时间格式应该为yyyy-MM-dd hh:mm:ss', 

						'int': '{0}必须为整数', 
						'posint': '{0}必须为正整数', 
						'float': '{0}必须为数字', 
						'float1': '{0}格式不正确(最多1位小数)', 
						'float2': '{0}格式不正确(最多2位小数)', 

						'idno': '{0}身份证号码为15或18位,18位除最后一位可为英文字符“X”外其它位数均为数字', 
						'email': '{0}电子邮件只允许字母、数字、“-”、“_”、“.”、@，且所有数字、字母、符号都为半角，字母可以大小写，有且仅包含一个@，字符长度不少于6位', 

						'carcode': '{0}车牌号必须是以汉字+大写字母开头，数字部分为4-8位', 
						'policy.no': '{0}不是有效的保单号码', 
						'report.no': '{0}不是有效的报案号码', 
						'claim.no': '{0}不是有效的赔案号码', 

						'mac': '{0}请输入正确MAC地址格式,包含数字0-9、字母A-F,如00-33-2D-7B-37-FE',

						'minlen': '{0}字符数不到规定长度{1}', 
						'maxlen': '{0}字符数超过规定长度{1}',
						'maxval': '{0}值超过上限{1}', 
						'minval': '{0}值小于下限{1}', 
						'ac': '请选择自动填充内容',
						'tips.valid': '校验不通过'
					}, 

					// default rule / regex defination
					pats: {
						'date': /^((\d{4})|(\d{2}))([-\./])(\d{1,2})\4(\d{1,2})$/, 
						'time': /^([0-1][0-9]|[2][0-3]):([0-5][0-9])(:([0-5][0-9]))?$/, 
						'datetime': /^((\d{4})|(\d{2}))([-\./])(\d{1,2})\4(\d{1,2}) ([0-1][0-9]|[2][0-3]):([0-5][0-9])(:([0-5][0-9]))?$/, 

						'int': /^[\-\+]?([0-9]+)$/, 
						'posint': /^\d+$/, 
						'float': /^[\-\+]?([0-9]+\.?([0-9]+)?)$/, 
						'float1': /^[\-\+]?([0-9]+(\.[0-9]{1})?)$/, 
						'float2': /^[\-\+]?([0-9]+(\.[0-9]{2})?)$/, 

						'idno': /^\d{6}(((19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])\d{3}([0-9]|x|X))|(\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])\d{3}))$/, 
						'email': /^([a-zA-Z\d\-\._]+)@([a-zA-Z\d\-\._]+)$/, 

						'carcode': /^(([^\x00-\xff]|[A-Za-z0-9]){2}([^\x00-\xff]|[A-Za-z0-9]){2,6})|([*]-[*])$/, 
						'policy.no': /^\d{19,20}$/,
						'report.no': /^\d{19,20}$/,
						'claim.no': /^\d{19,20}$/,

						'mac': /^([0-9A-F]{2})(([-][0-9A-F]{2}){5})$/
					}
				};
			}]);
		}
	};
});
// file ng.ui.js
define('ng/ng.ui.js', function(require){
	require('ng/ng.config').init();
	require('ng/ng.service').init();
	require('ng/ng.filter').init();

	require('jquery.autocomplete');
	require('jquery.bgiframe');
	require('jquery.ui');
	require('jquery.hotkeys');
	require('jquery.select2');

	var ag = window.angular;
	var moduleName = 'ng.ui';

	var _ = require('underscore');

	return {
		init: function(){
			window.console.log('Begin init module ' + moduleName);
			if(ag.isModuleExists && ag.isModuleExists(moduleName)){
				window.console.log('Module already exists!' + moduleName);
				return;
			}

			var md = ag.module(moduleName, ['ng.config', 'ng.service', 'ng.filter']);
			
			// datepicker
			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('uiDate', ['ng.config', 'uiLog', 'uiValid', 'uiTips', function(conf, log, valid, tips){
				'use strict';
				var options = {};
				if(ag.isObject(conf.date)){
					ag.extend(options, conf.date);
				}
				return {
					restrict: 'A',
					require: 'ngModel',
					link: function(scope, el, attrs, ctrl){
						var getOptions = function(){
							return ag.extend(ag.copy(options), scope.$eval(attrs.uiDate));
						};

						var init = function(){
							var opts = getOptions();
							log.i('Init datepicker : ' + attrs.ngModel);
							log.i(opts);

							if(ctrl){
								// update model when datepicker value changes
								var updateModel = function(targetValue, force){
									var date = force ? targetValue : el.datepicker("getDate");
									scope.$apply(function(){
										// change hours/minutes/seconds as format different
										// eg.yy-mm-dd 00:00
										if(date && opts.dateFormat.contains(' ')){
											var arr = opts.dateFormat.split(' ')[1].split(':');
											var hh = arr[0];
											var mm = arr.length > 1 ? arr[1] : 0;
											var ss = arr.length > 2 ? arr[2] : 0;
											date.setHours(hh);
											date.setMinutes(mm);
											date.setSeconds(ss);
										}

										// need to valid
										ctrl.$setViewValue(date);
									});
								};

								if(opts.onSelect){
									var userHandler = opts.onSelect;
									opts.onSelect = function(value, picker){
										updateModel();
										return userHandler(value, picker);
									};
								}else{
									opts.onSelect = function(value, picker){
										updateModel();
									};
								}

								// datepicker cannot input sometimes
								el.bind('change', function(){
									var targetDateVal;

									var changedDateVal = el.val();
									if(changedDateVal){
										var checkFlag = valid.check(changedDateVal, el.attr('ui-valid'), scope, el);
										if(!checkFlag.flag){
											// show tips
											tips.on(el, checkFlag.msg);
											targetDateVal = undefined;
										}else{
											// getDate is default today if input value is not 
											// check year/month/date is same
											var date = el.datepicker("getDate");
											var targetDateVal = date;
											if(date && changedDateVal){
												// need 01 eg if month/date < 10
												var pre1 = date.format('yyyyMMdd');
												var pre2 = changedDateVal.replace(/[\/\-:]/g, '').substr(0, 8);

												if(pre1 != pre2){
													tips.on(el, el.attr('ui-valid-tips') || valid.getMsg('tips.valid'));
													targetDateVal = undefined;
												}
											}
										}
									}else{
										targetDateVal = undefined;
									}

									if(targetDateVal){
										updateModel(targetDateVal, true);
									}else{
										// default today
										var today = new Date();
										el.datepicker('setDate', today);
										updateModel(today, true);

										// or set value undefined
//										el.val('');											
//										updateModel(undefined, true);
									}
								});

								// Update the date picker when the model changes
								// why execute twice ? 
								ctrl.$render = function(){
									var date = ctrl.$viewValue;
									if(isNaN(date))
										return;

									if (ag.isDefined(date) && date !== null && !ag.isDate(date)){
										log.i('!!!' + date + ' : ' + attrs.ngModel);
										throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string');
									}

									el.datepicker('setDate', date);
								};
							}

							// If we don't destroy the old one it doesn't update properly when the config changes
							el.datepicker('destroy');
							// Create the new datepicker widget
							el.datepicker(opts);
							// Force a render to override whatever is in the input text box
							ctrl.$render();
						};

						// Watch for changes to the directives options
						scope.$watch(getOptions, init, true);
					}
				};
			}]);

			// autocomplete
			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('uiAutocomplete', ['ng.config', 'uiLog', '$parse', function(conf, log, $parse){
				'use strict';
				var options = {};
				if(ag.isObject(conf.autocomplete)){
					ag.extend(options, conf.autocomplete);
				}
				return {
					restrict: 'A',
					require: 'ngModel',
					link: function(scope, el, attrs, ctrl){
						var getOptions = function(){
							return ag.extend(ag.copy(options), scope.$eval(attrs.uiAutocomplete));
						};

						var init = function(){
							var opts = getOptions();
							log.i('Init autocomplete : ' + attrs.ngModel);
							log.i(opts);

							if(!opts.url || !opts.targetModel){
								log.i('Init autocomplete fail : url/targetModel required : ' + attrs.ngModel);
								return;
							}

							if(ctrl){
								ctrl.$render = function(){
									// show value for input 
									var showLabel = ctrl.$viewValue;
									if(!showLabel){
										var targetModel = opts.targetModel;
										var getter = $parse(targetModel);
										var showValue = getter(scope);
										if(showValue){
											ctrl.$setViewValue(showValue);
											el.val(showValue);
										}
									}
								};
							}

							// json : 
							// [{data: {result: i}, value: 'Col' + i}]
							el.autocomplete({
								url: opts.url, 
								minChars: opts.minChars, 
								maxItemsToShow: opts.maxItemsToShow, 
								remoteDataType: 'json', 
								useCache: false,
								// do not request when value contains '-'
								fetchRemoteDataFilter: function(val){
									return val && val.indexOf('-') === -1;
								}, 
								processData: function(data) {
									var i, r = [];
									for(i = 0; i < data.length; i++){
										var item = data[i];
										// change here
										r.push({data: {result: item.v}, value: item.v + '-' + item.l});
									}
									return r;
								},
								onItemSelect: function(item){
									var val = item.data.result;
									var showLabel = item.value;

									var targetModel = opts.targetModel;
									var getter = $parse(targetModel);
									var setter = getter.assign;

									scope.$apply(function(){
										setter(scope, val);
										ctrl.$setViewValue(showLabel);
									});
								}
							});

							ctrl.$render();
						};

						// Watch for changes to the directives options
						scope.$watch(getOptions, init, true);
					}
				};
			}]);

			// select2
			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('uiSelect2', ['ng.config', 'uiLog', function(conf, log){
				'use strict';
				var options = {};
				if(ag.isObject(conf.select2)){
					ag.extend(options, conf.select2);
				}
				return {
					restrict: 'A',
					require: 'ngModel',
					link: function(scope, el, attrs, ctrl){
						var getOptions = function(){
							return ag.extend(ag.copy(options), scope.$eval(attrs.uiSelect2));
						};

						var isMultiple = (attrs.multiple !== undefined);
						var isSelect = el.is('select');

						var init = function(){
							var opts = getOptions();
							log.i('Init select2 : ');
							log.i(opts);

							if(isSelect){
								delete opts.multiple;
								delete opts.initSelection;
							}else if(isMultiple){
								opts.multiple = true;
							}

							if(ctrl){
								ctrl.$render = function () {
									if(isSelect){
										el.select2('val', ctrl.$modelValue);
									}else{
									}
								};

								if(opts.watch){
									scope.$watch(opts.watch, function(newVal, oldVal, scope){
										if(!newVal) 
											return;

										// Delayed so that the options have time to be rendered
										// function 'select2' executed twice
										setTimeout(function(){
											// isArray -> multiple
											if(ctrl.$viewValue && !ag.isArray(ctrl.$viewValue)){
												// because select2 use index but not value, 
												// so get index by target value (format: [{v: 'yourModelValue'}]) first
												// eg. ng-options="one.v as one.l for one in optsTest"
												var valueKey = opts.valueKey || 'v';
												var index = -1;
												var i = 0;
												for(; i < newVal.length; i++){
													if(newVal[i][valueKey] == ctrl.$viewValue){
														index = i;
														break;
													}
												}

												if(index != -1){
													el.select2('val', index).trigger('change');
												}else{
													el.select2();
												}
											}else{
												el.select2();
											}
										});
									});
								}
							}

							attrs.$observe('disabled', function(val){
								el.select2(val && 'disable' || 'enable');
							});

							el.val(scope.$eval(attrs.ngModel));
							setTimeout(function(){
								el.select2(opts);
							});
						};

						// Watch for changes to the directives options
						scope.$watch(getOptions, init, true);
					}
				};
			}]);

			// lhgdialog style
			md.directive('uiDialog', ['ng.config', 'uiLog', function(conf, log){
				'use strict';
				return {
					restrict: 'A',

					// use templateUrl instead amd/cmd
					templateUrl: conf.context + 'tpl/lhgdialog.tpl',
					replace: true, 
					transclude: true,

					scope: {
						// title='??'
						title: '@',
						visible: '@', 

						// using parent method
						onOk: '&',
						onCancel: '&'
					}, 

					compile: function(el, attrs, transclude){
						return {
							post: function(scope, el, attrs, ctrl){
								var opts = scope.$eval(attrs.uiDialog) || {};
								log.i('Compile dialog ui : ' + opts);

								el.find('.ui_min').click(function(e){
									el.find('.ui_icon, .ui_main, .ui_buttons').hide();
									el.find('.ui_res').css('display', 'inline-block');
									$(this).hide();
									return false;
								});
								el.find('.ui_res').click(function(e){
									el.find('.ui_icon, .ui_main, .ui_buttons').show();
									el.find('.ui_min').css('display', 'inline-block');
									$(this).hide();
									return false;
								});

								// jquery ui drag
								// locate center, after binding width changed, so need location center again
								// use jquery to get document.width as IE fails
								var innerTbl = el.find('table:first');
								// for div not with parent body, location center by tblWidth/tblHeight parameter
								var tblW = opts.tblWidth || innerTbl.width();
								var tblH = opts.tblHeight || innerTbl.height();

								var left = Math.floor($(window).width() - tblW) / 2;
								var top = Math.floor($(window).height() - tblH) / 2;
								if(left <= 0)
									left = 10;
								if(top <= 0)
									top = 10;

								var pos = {left: left + 'px', top: top + 'px'};
								el.find('div.ng-ui-dialog-wrapper').css(pos);

								// need lock, add block div
								if(opts.lock === true){
									var tplBlock = '<div class="ng-ui-dialog-block"></div>';
									el.prepend(tplBlock);
								}
								if(opts.draggable === true){
									var daggableOpts = {handle: '.ui_title_bar'};
									if(ag.isObject(conf.dialogDraggable)){
										ag.extend(daggableOpts, conf.dialogDraggable);
									}
									ag.extend(daggableOpts, opts);

									el.find('div.ng-ui-dialog-wrapper').draggable(daggableOpts); 
								}

								// min-height
								if(opts.height || opts.width){
									var props = {overflow: 'auto'};
									if(ag.isNumber(opts.height))
										props.height = '' + opts.height + 'px';
									if(ag.isNumber(opts.width))
										props.width = '' + opts.width + 'px';

									el.find('.ui_content').css(props);
								}
							} // /post
						}; 
					} // /compile
				};
			}]);

			// tabs
			md.directive('tabs', function(){
				'use strict';
				return {
					restrict: 'E',

					replace: true, 
					transclude: true,

					template: '<div class="ng-ui-tabbable">' +
						'<ul class="ng-ui-tabs">' +
							'<li ng-repeat="pane in panes" ng-class="{active: pane.selected}">' +
							'<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
							'</li>' +
						'</ul>' +
						'<div class="ng-ui-tab-content" ng-transclude></div>' +
					'</div>',

					scope: {}, 

					controller: function($scope){
						var panes = $scope.panes = [];
				 
						$scope.select = function(pane){
							angular.forEach(panes, function(pane){
								pane.selected = false;
							});
							pane.selected = true;
						};
				 
						this.addPane = function(pane){
							if(panes.length == 0){
								$scope.select(pane);
							}
							panes.push(pane);
						};
					}
				};
			}).directive('pane', function() {
				'use strict';
				return {
					require: '^tabs',
					restrict: 'E',
					transclude: true,
					replace: true,
					template: '<div class="ng-ui-tab-pane" ng-class="{active: selected}" ng-transclude>' + 
						'</div>',

					scope: { 
						title: '@' 
					},
					link: function(scope, el, attrs, ctrl){
						ctrl.addPane(scope);
					}
				};
			});

			md.directive('uiTabs', ['uiLog', 'uiTips', function(log, tips){
				'use strict';
				return {
					restrict: 'A',
					link: function(scope, el){
						var navs = el.find('.ng-ui-tabs > li');
						var contents = el.find('.ng-ui-tab-pane');

						if(!navs.length || !contents.length || navs.length != contents.length){
							log.i('Compile ui-tabs failed : tabs length not match!');
							return;
						}

						navs.find('a').click(function(e){
							e.preventDefault();
							e.stopPropagation();

							var navLinkLl = navs.find('a');
							var index = navLinkLl.index(this);

							navLinkLl.not(':eq(' + index + ')').parent().removeClass('active');
							navLinkLl.eq(index).parent().addClass('active');

							// tips off
							var lastVisitedContent = contents.not(':eq(' + index + ')').filter('.active');
							tips.offInContext(lastVisitedContent);

							contents.not(':eq(' + index + ')').removeClass('active');
							contents.eq(index).addClass('active');

							scope.$apply(function(){
								scope.$broadcast('TabFocus', index);
							});
							
							return false;
						});
					}
				};
			}]);

			// context menu
			md.directive('uiContextMenu', ['$parse', 'ng.config', 'uiLog', function($parse, conf, log){
				'use strict';
				var attrId = 'ui-context-menu-id';
				var options = {};
				if(ag.isObject(conf.contextMenu)){
					ag.extend(options, conf.contextMenu);
				}

				return {
					restrict: 'A',
					require: 'ngModel',

					link: function(scope, el, attrs, ctrl){
						var opts = ag.extend(ag.copy(options), scope.$eval(attrs.uiContextMenu));
						log.i('Create context menu...' + JSON.stringify(opts));

						if(!ctrl)
							return;

						// add uuid
						if(!el.attr(attrId)){
							el.attr(attrId, Math.guid());
						}
						
						var createMenu = function(){
							if(!ctrl.$modelValue || !ag.isArray(ctrl.$modelValue)){
								log.w('Context menu model must be an array!');
								return null;
							}

							var menuTpl = '<ul id="{2}" class="{0}"><div class="{1}"></div></ul>';
							var inner = menuTpl.format(opts.contextMenuClass, opts.gutterLineClass, el.attr(attrId));
							var menu = $(inner).appendTo(document.body);
							if(opts.title){
								 $('<li class="{0}"></li>'.format(opts.headerClass)).text(opts.title).appendTo(menu);
							}

							var itemTpl = '<li><a href="javascript:void(0);" ui-context-item-id="{0}"><span></span></a></li>';
							var i = 0;
							for(; i < ctrl.$modelValue.length; i++){
								var item = ctrl.$modelValue[i];
								if(item){
									var row = $(itemTpl.format(item.id || ''));

									var rowSpan = row.find('span');
									rowSpan.text(item.label);

									if(item.icon){
										var icon = $('<img>');
										icon.attr('src', conf.contextPre + '/' + item.icon);
										icon.insertBefore(rowSpan);
									}

									row.appendTo(menu);
								}else{
									 $('<li class="{0}"></li>'.format(opts.seperatorClass)).appendTo(menu);
								}
							}

							menu.bind('contextmenu', function(){return false;})
							return menu;
						};

						ctrl.$render = function(){
							var contextMenuId = el.attr(attrId);
							if(!contextMenuId){
								log.w('No context menu id!');
								return;
							}

							// dom already exists, remove first
							$('#' + contextMenuId).remove();

							el.unbind('contextmenu').bind('contextmenu', function(e){
								var thisContextMenu = $('#' + contextMenuId);
								var isAlreadyExists = thisContextMenu.length > 0;

								var menu = isAlreadyExists ? thisContextMenu : createMenu();
								if(!menu){
									log.w('No context menu model!');
									return;
								}

								var left = e.pageX + 5;
								var top = e.pageY;
								if (top + menu.height() >= $(window).height()){
									top -= menu.height();
								}
								if (left + menu.width() >= $(window).width()){
									left -= menu.width();
								}

								menu.css({zIndex: opts.zIndex || 1000001, left: left, top: top}).show();
								if(!isAlreadyExists){
									// Cover rest of page with invisible div that when clicked will cancel the popup.
									var bg = $('<div></div>')
										.css({left: 0, top: 0, width: '100%', height: '100%', position: 'absolute', zIndex: 1000000})
										.appendTo(document.body)
										.bind('contextmenu click', function(){
											bg.remove();
											menu.remove();
											return false;
										});

									menu.find('a').click(function(e){
										bg.remove();
										menu.remove();

										// call back, id as parameter
										var itemId = $(this).attr('ui-context-item-id');
										if(itemId && opts.fn){
											var getter = $parse(opts.fn);
											var fnTarget = getter(scope);
											if(fnTarget){
												scope.$apply(function(){
													fnTarget(itemId);
												});
											}
										}

										return false;
									});
								}
								// cancel browser context menu
								return false;
							});
						};// \ctrl.render
					}// \link
				};
			}]);

			// progress bar
			md.directive('uiProgressBar', ['uiLog', function(log){
				'use strict';
				return {
					require: 'ngModel',
					restrict: 'A',
					replace: true,
					template: '<div class="box ng-ui-progressbar">' + 
						'<div class="ng-ui-progressbar-text"></div>' + 
						'<div class="ng-ui-progressbar-value"></div>' + 
						'</div>',

					link: function(scope, el, attrs, ctrl){
						var opts = scope.$eval(attrs.uiProgressBar) || {};
						var textPre = opts.textPre || 'Completed';

						if(ctrl){
							ctrl.$render = function(){
								if(!ag.isNumber(ctrl.$modelValue) || ctrl.$modelValue < 0 || ctrl.$modelValue > 100){
									log.w('Progress bar model must be a number between 0-100!');
									return;
								}

								var textDiv = el.find('.ng-ui-progressbar-text');
								var valDiv = el.find('.ng-ui-progressbar-value');
								textDiv.text(textPre + ctrl.$modelValue + '%');
								valDiv.css({width: ctrl.$modelValue + '%'});
							};
						}
					}
				};
			}]);

			// slider
			md.directive('uiSlider', ['uiLog', function(log){
				'use strict';
				return {
					require: 'ngModel',
					restrict: 'A',

					link: function(scope, el, attrs, ctrl){
						var opts = scope.$eval(attrs.uiSlider) || {};
						el.slider({
							min: opts.min || 0,
							max: opts.max || 100,
							range: opts.range || 'min',
							value: opts.value || 0,
							slide: function(e, ui){
								var val = ui.value;

								if(val != ctrl.$modelValue){
									log.i('Slider value changed : ' + [ctrl.$modelValue, val]);
									scope.$apply(function(){
										ctrl.$setViewValue(val);
									});
								}
							}
						});

						if(ctrl){
							ctrl.$render = function(){
								if(!ag.isNumber(ctrl.$modelValue)){
									log.w('Slider model must be a number!');
									return;
								}

								el.slider('value', ctrl.$modelValue);
							};
						}
					}
				};
			}]);

			// shortcuts
			md.directive('uiShortkey', ['$parse', 'ng.config', 'uiLog', function($parse, conf, log){
				'use strict';
				var options = {};
				return {
					restrict: 'A',
					link: function(scope, el, attrs, ctrl){
						var getOptions = function(){
							return ag.extend(ag.copy(options), scope.$eval(attrs.uiShortkey));
						};

//						var init = function(){
							var opts = getOptions();
							log.i('Init shortkey : ');
							log.i(opts);

							if(!opts.key || !opts.method){
								log.i('Init shortkey fail : key/method required : ' + opts);
								return;
							}

							$.hotkeys.add(opts.key, function(){
								var getter = $parse(opts.method);
								var fn = getter(scope);
								if(fn)
									fn.call();
							});
//						};

						// Watch for changes to the directives options
						// attribute changed cause binding more than once
//						scope.$watch(getOptions, init, true);
					}
				};
			}]);

			// list watch
			md.directive('uiListWatch', ['$parse', 'uiLog', function($parse, log){
				'use strict';

				return {
					restrict: 'A',
					require: 'ngModel',

					// begin link ***
					link: function(scope, el, attrs, ctrl){
						var opts = scope.$eval(attrs.uiListWatch) || {};
						var fn = opts.fn;
						var targetProperty = opts.targetProperty;

						if(!targetProperty || !fn){
							log.w('Directive list watch targetProperty/fn required!');
							return;
						}

						var getter = $parse(opts.fn);
						var fnTarget = getter(scope);
						if(!fnTarget || !ag.isFunction(fnTarget)){
							log.w('Directive list watch fn should be a function!');
							return;
						}

						scope.$watch(attrs.ngModel, function(val){
							var getter = $parse(targetProperty);
							var setter = getter.assign;
							setter(scope, fnTarget(val));
						});
					}
					// end link ***

				}; // end link
			}]); // end directive

			// list radio
			md.directive('uiListRadio', ['$parse', function($parse){
				'use strict';

				return {
					restrict: 'A',

					link: function(scope, el, attrs){
						if(!el.is(':radio')){
							log.i('Init list radio failed : not a radio input!');
							return;
						}

						var opts = scope.$eval(attrs.uiListRadio) || {};
						if(!opts.model){
							log.i('Init list radio failed : model required!');
							return;
						}

						// donot use ng-model
						var model = opts.model;

						var getter = $parse(model);
						var setter = getter.assign;

						el.change(function(e, noRecurse){
							var isChecked = $(this).is(':checked');
							scope.$apply(function(){
								setter(scope, isChecked);
							});

							if(!noRecurse){
								var elName = el.attr('name');
								$(':radio[name="' + elName + '"]').not(el).trigger('change', ['noRecurse']);
							}
						});

						scope.$watch(model, function(isChecked){
							if(isChecked){
								if(!el.is(':checked'))
									el.attr('checked', true);
							}else{
								if(el.is(':checked'))
									el.removeAttr('checked');
							}
						});
					}
				}; // end link
			}]); // end directive

			// validation -> donot watch $validity/$required (binding ng-show etc.), use tips instead
			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('uiValid', ['$parse', 'ng.config', 'uiLog', 'uiValid', 'uiTips', function($parse, conf, log, valid, tips){
				'use strict';
				var uiValidAttrIdName = 'ui-valid-id';
				var uiValidRefered = {};
				return {
					restrict: 'A',
					require: 'ngModel',
					link: function(scope, el, attrs, ctrl){
						// add guid to this element
						var validId = el.attr(uiValidAttrIdName);
						if(!validId){
							validId = Math.guid();
							el.attr(uiValidAttrIdName, validId);
						}

						var getRules = function(){
							return attrs.uiValid;
						};

						var validFn = function(value){
							var rules = getRules();
							var r = valid.check(value, rules, scope, el);
							if(!r.flag){
								ctrl.$setValidity(attrs.ngModel, false);
								// select2 hide select element
								var selContainer = el.siblings('.select2-container');
								if(selContainer.length)
									tips.on(selContainer, r.msg);
								else
									tips.on(el, r.msg);
							}else{
								ctrl.$setValidity(attrs.ngModel, true);

								// select2 hide select element
								var selContainer = el.siblings('.select2-container');
								if(selContainer.length)
									tips.off(selContainer);
								else
									tips.off(el);
							}
							return r.flag;
						};

						var init = function(){
							var rules = getRules();
							log.i('Init valid : ' + attrs.ngModel);
							log.i(rules);

							if(!rules)
								return;

							// clear ctrl.$parsers
							// ng-show -> effect dom layout
							// donot use angluar valid function (in $parse array)
							// tips: donot use email/url directives provided by angular 
							if(ctrl.$parsers && ctrl.$parsers.length > 0){
								ctrl.$parsers.clear();
							}

							ctrl.$parsers.unshift(function(value){
								return validFn(value) ? value : undefined;
							});
						};

						// validation relative to other model
						var rules = getRules();
						if(rules){
							var arr = rules.split(' ');
							var watchedLl = [];
							var i = 0;
							for(; i < arr.length; i++){
								if(arr[i].contains(':')){
									var ruleArr = arr[i].split(':');
									if('num' == ruleArr[0] || 'date' == ruleArr[0] || 'watch' == ruleArr[0]){
										var modelName = ruleArr['watch' == ruleArr[0] ? 1 : 2];
										var modelArr = modelName.split(/,/);
										var j = 0;
										for(; j < modelArr.length; j++){
											var targetModelName = modelArr[j];
											if(!watchedLl.contains(targetModelName)){
												log.i('Add watch for valid check : ' + targetModelName);
												scope.$watch(targetModelName, function(){
													// valid again
													ctrl.$setViewValue(ctrl.$viewValue);
												});
												watchedLl.push(targetModelName);
												uiValidRefered[attrs.ngModel] = targetModelName + '|' + ruleArr[0];
											}
										}
									}
								}
							}
						}

						// Watch this model change and check if last bind failed (ctrl.$invalid === true)
						// eg. 
						/*
						<select ng-model="optionVal" ui-valid="r" 
							ng-options="one.code as one.name for one in optionList">
							<option value="">--to be choosed--</option>
						</select>
						var MyCtrl = function($scope){
							$scope.optionList = [];
							
							$scope.changeOptionListAndVal = function(){
								$scope.optionList = [{code: 'A', name: 'A'}];
								$scope.optionVal = 'A';

								// tips div should be removed
							};
						};
						*/
						scope.$watch(attrs.ngModel, function(){
							if(ctrl.$modelValue !== undefined){
								if(ctrl.$invalid || $('#vtip_' + el.attr(uiValidAttrIdName)).length){
									validFn(ctrl.$modelValue);
								}
							}
						});

						// Watch for changes to the directives options
						// if validation rules change, initialize again
						scope.$watch(getRules, function(){
							init();

							// not bind yet
							if(ctrl.$modelValue === undefined){
								// bind failed
								// check tips has showed
								var needValid = false;

								var validId = el.attr('ui-valid-id');
								if(validId){
									var elTips = $('#vtip_' + validId);
									if(elTips.length){
										// check again
										needValid = true;
									}
								}

								if(ctrl.$viewValue !== undefined){
									needValid = true;
								}

								if(needValid){
									ctrl.$setViewValue(ctrl.$viewValue);
								}
							}else{
								validFn(ctrl.$modelValue);
							}
						}, true);
					}
				};
			}]);

			// layout tips : most of time you donot need this directive
			// because it uses some class defined to add width to td/th
			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('uiLayoutCol', ['ng.config', 'uiLog', function(conf, log){
				'use strict';
				return {
					restrict: 'A',
					link: function(scope, el, attrs, ctrl){
						if('TR' != el[0].nodeName){
							log.i('Init uiLayoutCol failed : not a TR element!');
							return;
						}

						log.i('Relayout...');

						var _tds = el.children('td');
						if(_tds.size() == 2){
							_tds.filter(':first').addClass('l');
							_tds.filter(':last').addClass('r');
						}else if(_tds.size() == 4){
							_tds.filter(':even').addClass('l2');
							_tds.filter(':odd').addClass('r2');
						}else if(_tds.size() == 6){
							_tds.eq(0).addClass('l3');
							_tds.eq(1).addClass('r3');
							_tds.eq(2).addClass('l3');
							_tds.eq(3).addClass('r3');
							_tds.eq(4).addClass('l3');
							_tds.eq(5).addClass('r3last');
						}

						// siblings tr set td text-align to right if exists label 
						var _tds = el.siblings('tr').children('td');
						_tds.filter(function(){
							return $(this).find('label').size() > 0;
						}).addClass('ar');
						_tds.filter(function(){
							return $(this).find('label').size() == 0;
						}).addClass('al p_left5');

						// set vertical-align = middle for label
			//			el.siblings('tr').children('td').each(function(){
			//				var _td = $(this);
			//				if(_td.find('label').size() > 0){
			//					_td.addClass('ar');
			//					_td.find('label').addClass('vm');
			//				}
			//			});
					}
				};
			}]);

			// pagination view
			md.directive('uiPagi', ['ng.config', 'uiLog', function(conf, log){
				return {
					restrict: 'A',

					// use templateUrl instead amd/cmd
					// change to tpl/pagi.tpl to change view style
//					templateUrl: conf.context + 'tpl/pagi.tpl',
					templateUrl: conf.context + 'tpl/pagisel.tpl',
					replace: false, 

					scope: {
						// title='??'
						pagi: '=',

						// using parent method, what about parameters
						onChangePage: '&'
					}
				};
			}]);

			// sort
			md.directive('uiSort', ['ng.config', 'uiLog', '$parse', function(conf, log, $parse){
				'use strict';
				var options = {};
				return {
					restrict: 'A',
					link: function(scope, el, attrs, ctrl){
						var nodeName = el[0].nodeName;
						if('TD' != nodeName && 'TH' != nodeName){
							log.i('Sort bind failed : not a TD/TH element!');
							return;
						}

						var getOptions = function(){
							return scope.$eval(attrs.uiSort);
						};

						var init = function(){
							var opts = getOptions();
							log.i('Init sort : ');
							log.i(opts);

							if(!opts.targetModel){
								log.i('Init sort fail : targetModel required : ');
								return;
							}

							var sortModel = function(isUp){
								var fnCompareCallback;
								var fnCompare = opts.fnCompare;
								if(fnCompare){
									var getterCompare = $parse(fnCompare);
									var fnCompareCallback = getterCompare(scope);
								}

								var targetModel = opts.targetModel;
								var getter = $parse(targetModel);
								var model = getter(scope);
								if(model && ag.isArray(model)){
									var sortedModel = _.sortBy(model, function(it, index){
										if(fnCompareCallback){
											return fnCompareCallback(it, index, isUp);
										}else{
											if(!opts.field){
												return 0;
											}else{
												var val = it[opts.field];
												if(!val){
													return 0;
												}else if(ag.isDate(val)){
													return isUp ? val.getTime() : (0 - val.getTime());
												}else if(ag.isNumber(val)){
													return isUp ? val : (0 - val);
												}else if(ag.isString(val)){
													try{
														var intVal = parseFloat(val);
														return isUp ? intVal : (0 - intVal);
													}catch(e){
														log.w(e);
														return 0;
													}
												}else{
													return 0;
												}
											}
										}
									});
									scope.$apply(function(){
										var setter = getter.assign;
										setter(scope, sortedModel);
									});
								}else{
									log.w('Event trigger sort fail : targetModel required and must be a list!');
								}
							};

							var eventTriggerType = opts.eventTriggerType || 'click';

							// anchor
							if(opts.isLink){
								var link = el.find('a:first');
								if(!link.length){
									log.i('Init sort fail : do not contain a A element!');
									return;
								}

								link.unbind(eventTriggerType).bind(eventTriggerType, function(e){
									e.preventDefault();

									var isUp = !$(this).hasClass('ng-ui-sort-down');
									sortModel(isUp);

									if(isUp)
										$(this).addClass('ng-ui-sort-down');
									else
										$(this).removeClass('ng-ui-sort-down');

									return false;
								});
							}else{
								// add images and bind event
								var spans = el.find('span.ng-ui-sort');
								// already add and bind, unbind first
								if(spans.size()){
									spans.unbind(eventTriggerType);
								}else{
									var tpl = '<span class="ng-ui-sort {1}"><img src="{0}" /></span>';
									el.append(tpl.format(conf.context + 'images/actions/arrow-up.png', 'ng-ui-sort-up'));
									el.append(tpl.format(conf.context + 'images/actions/arrow-down.png', 'ng-ui-sort-down'));
		
									spans = el.find('span.ng-ui-sort');
								}

								spans.bind(eventTriggerType, function(){
									var isUp = $(this).attr('class').contains('up');
									sortModel(isUp);
								});
							}
						};

						// Watch for changes to the directives options
						scope.$watch(getOptions, init, true);
					}
				};
			}]);

			// PortalTab integration, open a new iframe tab when alinks/button click triggered
			md.directive('uiTab', ['ng.config', 'uiLog', 'uiPortalUtils', function(conf, log, PortalUtils){
				'use strict';
				return {
					restrict: 'A',
					link: function(scope, el, attrs, ctrl){
						if('A' != el[0].nodeName){
							log.i('Rebind open tab failed : not a A element!');
							return;
						}

						// need tabId
						var opts = scope.$eval(attrs.uiTab) || {};
//						if(!opts || !opts.tabId){
//							log.i('Skip bind tab open no tabId...');
//							return;
//						}

						log.i('Rebind open tab...' + JSON.stringify(opts));

						el.click(function(e){
							e.preventDefault();
							e.stopPropagation();

							var tabId = el.attr('tab-id') || opts.tabId;
							if(!tabId){
								log.i('Skip open tab as no tabId given...');
								return false;
							}

							var url = el.attr('href');
							var title = el.attr('title');
							PortalUtils.openTab(tabId, url, title, opts);

							return false;
						});
					}
				};
			}]);

			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			// delegate dom event binding
			md.directive('uiDelegateBind', ['$parse', 'uiLog', function($parse, log){
				'use strict';

				// link
				return {
					restrict: 'A',
					link: function(scope, el, attrs){
						var opts = scope.$eval(attrs.uiDelegateBind) || {};
						log.i('Init delegate bind : ');
						log.i(opts);

						if(!opts.tag || !opts.fn){
							log.i('Init delegate bind fail : tag/fn required : ' + opts);
							return;
						}

						el.delegate(opts.tag, opts.eventType || 'click', function(){
							var getter = $parse(opts.fn);
							var fnTarget = getter(scope);
							if(fnTarget){
								// pass attribute info as parameter
								var attrMap = {};
								var i = 0;
								for(; i < this.attributes.length; i++){
									var attr = this.attributes[i];
									attrMap[attr.name] = attr.value;
								};

								scope.$apply(function(){
									fnTarget(attrMap);
								});
							}
						});
					}
				};
			}]);
		} // end init
	};
});
// file ng.ui.ztree.js
define('ng/ng.ui.ztree.js', function(require){
	require('ng/ng.config').init();
	require('ng/ng.service').init();

	require('core/jquery.ztree.core-3.5.js');
	var $ = require('jquery');

	var moduleName = 'ng.ui.ztree';
	return {
		init: function(){
			window.console.log('Begin init module ' + moduleName);
			if(angular.isModuleExists && angular.isModuleExists(moduleName)){
				window.console.log('Module already exists!' + moduleName);
				return;
			}

			var md = angular.module(moduleName, ['ng.config', 'ng.service']);
			
			// ztree
			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('uiZtree', ['ng.config', 'uiLog', '$parse', function(conf, log, $parse){
				'use strict';
				var options = {};
				if(angular.isObject(conf.ztree)){
					angular.extend(options, conf.ztree);
				}
				return {
					restrict: 'A',
					require: 'ngModel',
					link: function(scope, el, attrs, ctrl){
						var getOptions = function(){
							return angular.extend(angular.copy(options), scope.$eval(attrs.uiZtree));
						};

						var init = function(){
							var opts = getOptions();
							log.i('Init ztree : ' + attrs.ngModel);
							log.i(opts);

							// must be UL
							if('UL' != el[0].nodeName){
								log.i('Init ztree failed : ' + attrs.ngModel + ' not a ul element!');
								return;
							}

							if(ctrl){
								ctrl.$render = function(){
									var viewValue = ctrl.$viewValue;
									if(!viewValue)
										return;

									var setting = opts.setting;
									if(opts.fn){
										var getter = $parse(opts.fn);
										var fnTarget = getter(scope);
										if(fnTarget){
											setting.callback = {
												onClick: function(event, treeId, treeNode){
													scope.$apply(function(){
														fnTarget(treeId, treeNode);
													});
												}
											};
										}
									}

									el.addClass('ztree');
									// destroy first ?
									$.fn.zTree.init(el, setting, viewValue);
								};
							}

							ctrl.$render();
						};

						// Watch for changes to the directives options
						scope.$watch(getOptions, init, true);
					}
				};
			}]);
		} // end init
	};
});
