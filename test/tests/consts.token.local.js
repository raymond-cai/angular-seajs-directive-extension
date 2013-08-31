seajs.use('token.local', function(TokenLocal){
	describe('Test TokenLocal : ', function(){
		it('getDataByUrl', function(){
			TokenLocal.setDataByUrl('/controller/newcore/FormAction/queryTaskLl.gy', {pager: {ll : [{reportId: '1234', digestKey: 'token_1234'}]}});
			expect(TokenLocal.getDataByKey('taskList').pager.ll[0].reportId).toEqual('1234');
		}); 

		it('getConfItem', function(){
			expect(TokenLocal.getConfItem('/controller/newcore/FormAction/queryTaskLl.gy', 'sign').path).toEqual('pager.ll.[]reportId');
		}); 

		it('getTokenObjByField', function(){
			var data = {reportId: '1234'};
			expect(TokenLocal.getTokenObjByField(data, 'reportId')).toEqual('1234');
		}); 

		/*
		seajs.use('token.local', function(TokenLocal){
			TokenLocal.setDataByUrl('/controller/newcore/FormAction/queryTaskLl.gy', 
				{pager: {ll : [{reportId: {val: '1234', digestKey: 'token_1234'}}]}});
			TokenLocal.getToken('/json/taskDetail.json', {reportId: '1234'})
		});
		*/
		it('getTokenObjByField2', function(){
			var data = [{reportId: {digestKey: 'abcd', val: '1234'}}];
			expect(TokenLocal.getTokenObjByField(data, '[]reportId', '1234').digestKey).toEqual('abcd');
		}); 

		it('getObjByPath', function(){
			var data = {"pager":{"ll":[{"reportId":{"digestKey":"1234","val":"9028600030110000151"}}]}};
			expect(TokenLocal.getObjByPath(data, 'pager.ll.[]reportId', 9028600030110000151).digestKey).toEqual('1234');
		}); 

		it('getToken', function(){
			TokenLocal.setDataByUrl('/controller/newcore/FormAction/queryTaskLl.gy', 
				{pager: {ll : [{reportId: {val: '1234', digestKey: 'token_1234'}}]}});
			expect(TokenLocal.getToken('/controller/newcore/FormAction/getReportInfo.gy', {reportId: '1234'})).toEqual('token_1234');
		}); 
	});
})