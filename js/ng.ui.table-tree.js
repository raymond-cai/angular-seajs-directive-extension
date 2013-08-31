define(function(require){
	var $ = require('jquery');
	var template = require('template.js');
	var tplTableTree = require('../tpl/tableTree.tpl');

	var moduleName = 'ng.ui.table-tree';
	return {
		init: function(){
			window.console.log('Begin init module ' + moduleName);
			if(angular.isModuleExists && angular.isModuleExists(moduleName)){
				window.console.log('Module already exists!' + moduleName);
				return;
			}

			var md = angular.module(moduleName, []);
			
			// table tree
			// *** *** *** *** *** *** *** *** *** ***
			// *** *** *** *** *** *** *** *** *** ***
			md.directive('uiTableTree', ['$parse', function($parse){
				'use strict';
				return {
					restrict: 'A',
					require: 'ngModel',

// begin link ***
link: function(scope, el, attrs, ctrl){
	var opts = scope.$eval(attrs.uiTableTree) || {};
	console.log('Init table tree : ' + attrs.ngModel);
	console.log(opts);

	// must be TABLE
	if('TABLE' != el[0].nodeName){
		console.log('Init table tree failed : ' + attrs.ngModel + ' not a table element!');
		return;
	}

	if(ctrl){
		ctrl.$render = function(){
			// model must be set and is an array
			if(!ctrl.$modelValue || !angular.isArray(ctrl.$modelValue)){
				return;
			}

			var tableBody = el.find('tbody');
			tableBody.empty();

			var tableHead = el.find('thead');
			var headerCodeLl = [];
			if(tableHead.length){
				var headerCodeKey = 'ui-table-tree-header-code';
				headerCodeLl = tableHead.find('th').map(function(){
					return $(this).attr(headerCodeKey);
				}).get();
			}

			if(!headerCodeLl.length){
				return;
			}

			// add style
			el.addClass('ng-ui-table-tree');

			var tpl = template.format(tplTableTree, {ll: ctrl.$modelValue, 
				headerCodeLl: headerCodeLl, code: opts.code || 'code'});
			tableBody.append(tpl);

			var getLevel = function(elTr){
				var level = 1;

				var switchExpand = elTr.find('span.expand');
				var classLl = switchExpand.attr('class').split(' ');
				var i = 0;
				for(; i < classLl.length; i++){
					var one = classLl[i];
					if(one.contains('level')){
						level = one.substring('level'.length);
						break;
					}
				}

				return level;
			};

			tableBody.find('a.link').click(function(e){
				e.preventDefault();
				e.stopPropagation();

				var code = $(this).attr('ui-table-tree-code');
				if(code && opts.fn){
					var getter = $parse(opts.fn);
					var fnTarget = getter(scope);
					if(fnTarget){
						scope.$apply(function(){
							fnTarget(code);
						});
					}
				}

				return false;
			});

			// bind events
			tableBody.find('span.expand').click(function(e){
				var switchExpand = $(this);
				var isCollapse = switchExpand.is('.collapse');
				
				var tr = switchExpand.closest('tr');
				var allTrLl = tableBody.children('tr');

				var level = getLevel(tr);

				var thisIndex = allTrLl.index(tr);
				var nextSaveLevelTrLl = allTrLl.filter(':gt(' + thisIndex + ')').filter(function(){
					return getLevel($(this)) == level;
				});

				var childrenTrLl;
				if(nextSaveLevelTrLl.length){
					var nextSaveLevelTr = nextSaveLevelTrLl.eq(0);
					var nextIndex = allTrLl.index(nextSaveLevelTr);
					childrenTrLl = allTrLl.slice(thisIndex + 1, nextIndex);
				}else{
					childrenTrLl = allTrLl.slice(thisIndex + 1);
				}

				// exists sub node
				if(childrenTrLl && childrenTrLl.length){
					if(isCollapse){
						switchExpand.removeClass('collapse');
						childrenTrLl.stop().addClass('hide-level' + level);
					}else{
						switchExpand.addClass('collapse');

						// when last time is collapse donot show
						childrenTrLl.removeClass('hide-level' + level);
					}
				}
			});
		};
	}

	ctrl.$render();
}
// end link ***

				};
			}]);
		} // end init
	};
});