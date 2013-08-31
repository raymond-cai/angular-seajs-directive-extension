define(function(require){
	var moduleName = 'ng.ext.list-watch';
	return {
		init: function(){
			window.console.log('Begin init module ' + moduleName);
			if(angular.isModuleExists && angular.isModuleExists(moduleName)){
				window.console.log('Module already exists!' + moduleName);
				return;
			}

			var md = angular.module(moduleName, []);
			
			// watch list each property
			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('extListWatch', ['$parse', function($parse){
				'use strict';

				return {
					restrict: 'A',
					require: 'ngModel',

// begin link ***
link: function(scope, el, attrs, ctrl){
	var opts = scope.$eval(attrs.extListWatch) || {};
	var fn = opts.fn;
	var targetProperty = opts.targetProperty;

	if(!targetProperty || !fn){
		window.console.log('Directive list watch targetProperty/fn required!');
	}

	var getter = $parse(opts.fn);
	var fnTarget = getter(scope);

	scope.$watch(attrs.ngModel, function(val){
		var getter = $parse(targetProperty);
		var setter = getter.assign;
		setter(scope, fnTarget(val));
	});
}
// end link ***

				}; // end link
			}]); // end directive
		} // end init
	};
});