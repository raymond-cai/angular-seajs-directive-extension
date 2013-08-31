seajs.use('ng/ng.service.js', function(m){
	m.init();

	describe('Test Angular UI Module Service : ', function(){
		beforeEach(module('ng.service'));

		it('uiLog', inject(function(uiLog){
			var msg = 'message...';
			expect(uiLog.getMsg(msg).endsWith(msg)).toBe(true);
		}));

		// TODO
	});
})