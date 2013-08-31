define(function(require){
	var _ = require('underscore');
	var tplItemSelector = require('../tpl/itemSelector.tpl');

	var moduleName = 'ng.ui.item-selector';
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
			md.directive('uiItemSelector', ['$parse', function($parse){
				'use strict';

				var tplOption = '<option value="{0}">{1}</option>';
				return {
					restrict: 'A',
					require: 'ngModel',
					template: tplItemSelector, 

					link: function(scope, el, attrs, ctrl){
						var opts = scope.$eval(attrs.uiItemSelector) || {};
						// option value and text
						var valueKey = opts.valueKey || 'value';
						var labelKey = opts.labelKey || 'label';
	
						var fromTitle = opts.fromTitle || '选择项';
						var toTitle = opts.toTitle || '已选择项';

						var headers = el.find('.header');
						var selects = el.find('select');

						headers.eq(0).find('span').text(fromTitle);
						headers.eq(1).find('span').text(toTitle);

						var appendSelectOption = function(ll, select){
							var tplArr = [];
							_.each(ll, function(it){
								tplArr.push(tplOption.format(it[valueKey], it[labelKey]));
							});

							select.html(tplArr.join(''));
						};

						var moveItem = function(llFrom, llTo, llCode){
							if(!llCode || !llCode.length){
								return;
							}

							var choosedList = [];
							var unChoosedList = [];
							
							_.each(llFrom, function(it){
								if(llCode.indexOf(it[valueKey]) != -1){
									choosedList.push(it);
								}else{
									unChoosedList.push(it);
								}
							});

							if(choosedList && choosedList.length){
								llFrom = unChoosedList;

								var listTarget = llTo || [];
								llTo = listTarget.merge(choosedList);
							}

							return llFrom;
						}; 

						// add
						el.find('.ng-ui-itemselector-tbar-add').unbind('click').bind('click', function(e){
							var choosedOption = selects.eq(0).find('option:selected');
							if(!choosedOption.length)
								return;

							choosedOption.remove().appendTo(selects.eq(1));

							var codeList = choosedOption.map(function(){
								return this.value;
							}).get();
							scope.$apply(function(){
								ctrl.$modelValue.from = moveItem(ctrl.$modelValue.from, ctrl.$modelValue.to, codeList);
							});
						});
						// remove
						el.find('.ng-ui-itemselector-tbar-remove').unbind('click').bind('click', function(e){
							var choosedOption = selects.eq(1).find('option:selected');
							if(!choosedOption.length)
								return;

							choosedOption.remove().appendTo(selects.eq(0));

							var codeList = choosedOption.map(function(){
								return this.value;
							}).get();
							scope.$apply(function(){
								ctrl.$modelValue.to = moveItem(ctrl.$modelValue.to, ctrl.$modelValue.from, codeList);
							});							
						});

						if(ctrl){
							ctrl.$render = function(){
								// clear first
								selects.empty();

								if(!ctrl.$modelValue){
									return;
								}

								var fromList = ctrl.$modelValue.from;
								var toList = ctrl.$modelValue.to;

								if(fromList){
									appendSelectOption(fromList, selects.eq(0));
								}
								if(toList){
									appendSelectOption(toList, selects.eq(1));
								}
							};
						}
					}
					// end link ***
				};
			}]);
		} // end init
	};
});