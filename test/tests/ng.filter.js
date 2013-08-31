seajs.use('ng/ng.filter.js', function(m){
	m.init();

	describe('Test Angular UI Module Filter : ', function(){
		beforeEach(module('ng.filter'));

		it('trBg', inject(function($filter){
			var fn = $filter('trBg');
			expect(fn(0)).toBe('odd');
			expect(fn(1, 2)).toBe('even2');
		}));
	});
})