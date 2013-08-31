define(function(require){
	var $ = require('jquery');
	var moduleName = 'ng.ext.auto-fill';
	return {
		init: function(){
			window.console.log('Begin init module ' + moduleName);
			if(angular.isModuleExists && angular.isModuleExists(moduleName)){
				window.console.log('Module already exists!' + moduleName);
				return;
			}

			var md = angular.module(moduleName, []);

			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('extAutoFill', ['$parse', function($parse){
				'use strict';

				return {
					restrict: 'A',
					require: 'ngModel',

// begin link ***
link: function(scope, el, attrs, ctrl){
	if('INPUT' != el[0].nodeName){
		console.log('Init extAutoFill failed : not a INPUT element!');
		return;
	}

	var opts = scope.$eval(attrs.extAutoFill) || {};
	console.log('Init extAutoFill ' + attrs.ngModel + ' - ' + JSON.stringify(opts));

	var minChars = opts.minChars || 3;
	var maxItemsToShow = opts.maxItemsToShow || 10;
	var endChar = opts.endChar || '@';

	if(!opts.srcList)
		return;

	el.autocomplete({
		getData: function(val){
			var srcList = $parse(opts.srcList)(scope);
			if(!srcList || !angular.isArray(srcList))
				return [];

			var list = [];

			var i = 0;
			for(; i < srcList.length; i++){
				list.push(opts.prepend ? (val + srcList[i]) : srcList[i]);
			}

			return list;
		}, 
		minChars: minChars, 
		maxItemsToShow: maxItemsToShow, 
		useCache: false,
		filterResults: false, 
		// do not request when value ends with '@' user given
		fetchRemoteDataFilter: function(val){
			return val && val.endsWith(endChar);
		}, 
		// item -> {data: {}, value: ''}
		onItemSelect: function(item){
			scope.$apply(function(){
				// TODO
				ctrl.$setViewValue(opts.prepend ? item.value : (el.val() + item.value));
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