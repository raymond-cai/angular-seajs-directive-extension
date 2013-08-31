seajs.use('ng/ng.directive.js', function(m){
	m.init();

	describe('Test Angular UI Module Directive : ', function(){
		var $compile;
		var $rootScope;

		beforeEach(module('ng.directive'));
		beforeEach(inject(function(_$compile_, _$rootScope_){
			// The injector unwraps the underscores (_) from around the parameter names when matching
			$compile = _$compile_;
			$rootScope = _$rootScope_;
		}));

		// TODO
	});
})