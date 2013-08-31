define(function(require){
	var Consts = require('consts');
	var Uploader = require('ext.uploader.js');
	var $ = require('jquery');

	var moduleName = 'ng.ext.uploader';
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
			md.directive('extUploader', ['$parse', function($parse){
				'use strict';
				return {
					restrict: 'A',
					require: '?ngModel',

// begin link ***
link: function(scope, el, attrs, ctrl){
	var opts = scope.$eval(attrs.extUploader) || {};
	console.log('Init uploader : ' + attrs.ngModel);
	console.log(JSON.stringify(opts));

	if(!opts.uploader){
		console.log('Parameter required : uploader!');
		return;
	}
	opts.uploader = Consts.getAppPath(opts.uploader);

	// default parameters
	var props = {};
	props.on_select = function(file_name){
		if(opts.paramsModel){
			var getter = $parse(opts.paramsModel);
			el.data('formData', getter(scope));
		}
	};
	props.on_before_upload = function(file_name){
		el.attr('disabled', true).addClass('disabled');
		el.siblings('span.tips').text('Uploading...').css('display', 'inline').show();
	};
	props.on_complete = function(file_name, json){
		el.removeAttr('disabled').removeClass('disabled');
		el.siblings('span.tips').hide();

		if(json.error){
			alert(json.error);
			return;
		}

		console.log(file_name);
		console.log(JSON.stringify(json));

		if(opts.fn){
			var getter = $parse(opts.fn);
			var fnTarget = getter(scope);
			if(fnTarget){
				scope.$apply(function(){
					fnTarget(file_name, json);
				});
			}
		}
	};
	angular.extend(props, opts);

	new Uploader(el, props).init_upload();
}
// end link ***

				};
			}]);
		} // end init
	};
});