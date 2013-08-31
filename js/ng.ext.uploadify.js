define(function(require){
	var Consts = require('consts');
	// include use script tag
	var $ = require('jquery');

	var moduleName = 'ng.ext.uploadify';
	return {
		init: function(){
			window.console.log('Begin init module ' + moduleName);
			if(angular.isModuleExists && angular.isModuleExists(moduleName)){
				window.console.log('Module already exists!' + moduleName);
				return;
			}

			var md = angular.module(moduleName, []);
			
			// uploadify
			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('extUploadify', ['$parse', function($parse){
				'use strict';
				return {
					restrict: 'A',
					require: '?ngModel',

// begin link ***
link: function(scope, el, attrs, ctrl){
	var opts = scope.$eval(attrs.extUploadify) || {};
	console.log('Init uploadify : ' + attrs.ngModel);
	console.log(JSON.stringify(opts));

	if(!opts.uploader){
		console.log('Parameter required : uploader!');
		return;
	}
	// get absolute url path
	opts.uploader = Consts.getAppPath(opts.uploader);

	// default parameters
	var props = {auto: true, multi: false, width: 80, height: 25, 
		buttonText: 'Choose File', fileObjName: 'file', debug: true};
	props.swf = Consts.getAppPath('framework/uploadify/uploadify.swf');
	
	// 重新设置formData
	props.onSelect = function(file){
		if(opts.paramsModel){
			var formData = $parse(opts.paramsModel)(scope);
			this.settings['formData'] = formData;
		}
	};

	props.onUploadError = function(file, errorCode, errorMsg, errorString){
		console.log('Upload error : ' + errorCode);
		console.log(errorMsg);
		console.log(errorString);
	};

	props.onUploadSuccess = function(file, data, response){
		console.log(file);
		console.log(data);
		if(data && opts.fnSuccess){
			var jsonObj;
			try{
				jsonObj = JSON.parse(data);
			}catch(e){
			}

			var getter = $parse(opts.fnSuccess);
			var fnTarget = getter(scope);
			if(fnTarget){
				scope.$apply(function(){
					fnTarget(file, jsonObj, response);
				});
			}
		}
	};

	angular.extend(props, opts);

	console.log(JSON.stringify(props));
	el.uploadify(props);
}
// end link ***

				};
			}]);
		} // end init
	};
});