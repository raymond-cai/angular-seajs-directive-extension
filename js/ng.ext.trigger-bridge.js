define(function(require){
	var moduleName = 'ng.ext.trigger-bridge';
	return {
		init: function(){
			window.console.log('Begin init module ' + moduleName);
			if(angular.isModuleExists && angular.isModuleExists(moduleName)){
				window.console.log('Module already exists!' + moduleName);
				return;
			}

			var md = angular.module(moduleName, []);

			md.factory('extTriggerBridgeService', function(){
				return {
					trigger: function(el, type, field, data){
						el.trigger(type || 'scopeChange', [field, data]);
					}, 

					triggerInWindow: function(win, elementId, type, field, data){
						// cross window, use jquery not jqLite in global
						if(win && win.$){
							var elDom = win.document.getElementById(elementId);
							win.$(elDom).trigger(type || 'scopeChange', [field, data]);
						}
					}
				};
			});

			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('extTriggerBridge', ['$parse', function($parse){
				'use strict';

				return {
					restrict: 'A',

// begin link ***
link: function(scope, el, attrs, ctrl){
	var opts = scope.$eval(attrs.extTriggerBridge) || {};
	console.log('Init extTriggerBridge - ' + JSON.stringify(opts));

	el.bind(opts.eventType || 'scopeChange', function(e, field, data){
		console.log('Trigger : '  + JSON.stringify(opts) + ' - ' + 
			field + 
			' - ' + 
			JSON.stringify(data));
		if(opts.setData){
			// set data
			if(data){
				var getter = $parse(field);
				var setter = getter.assign;

				var oldVal = getter(scope) || {};
				angular.extend(oldVal, data);
				scope.$apply(function(){
					setter(scope, oldVal);
				});
			}
		}else if(opts.callFn){
			// call function
			var fnTarget = $parse(field)(scope);
			if(!fnTarget || !angular.isFunction(fnTarget)){
				console.log('No function defined : ' + field);
			}else{
				scope.$apply(function(){
					fnTarget(data);
				});
			}
		}else{
			// emit event
			var eventName = field;
			scope.$apply(function(){
				scope.$emit(eventName, data);
			});
		}
	}); 
}
// end link ***

				}; // end link
			}]); // end directive
		} // end init
	};
});