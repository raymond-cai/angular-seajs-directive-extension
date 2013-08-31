<div class="dis_ib m_right4 fs13">
	<span class="colorblue m_right6">总 页 数
		<strong class="colorred">{{pagi.totalPage}}</strong>
	</span>
	<span class="colorblue m_right6">当前页数
		<strong class="colorred">{{pagi.pageNum}}</strong>
	</span>
	<span class="colorblue m_right6">总记录数
		<strong class="colorred">{{pagi.totalCount}}</strong>
	</span>
	<span class="colorblue m_right6">跳转到第
		<span><select 
			class="w60" 
			ng-disabled="pagi.ctrl.isChoosePageDisabled" 
			ng-change="onChangePage({cp: pagi.targetPageChoosed.pageNum, event: $event})" 
			ng-model="pagi.targetPageChoosed" 
			ng-options="one.pageNum for one in pagi.totalPageLl"></select>页</span>
	</span>
</div>
<div class="dis_ib">
	<div class="btn-group">
		<button class="{{pagi.style.btnClass}}" ng-click="onChangePage({cp: 1, event: $event})" ng-disabled="pagi.ctrl.isFirstPageDisabled">第一页</button>
		<button class="{{pagi.style.btnClass}}" ng-click="onChangePage({cp: pagi.pageNum - 1, event: $event})" ng-disabled="pagi.ctrl.isPrevPageDisabled">上一页</button>
		<button class="{{pagi.style.btnClass}}" ng-click="onChangePage({cp: pagi.pageNum + 1, event: $event})" ng-disabled="pagi.ctrl.isNextPageDisabled">下一页</button>
		<button class="{{pagi.style.btnClass}}" ng-click="onChangePage({cp: pagi.totalPage, event: $event})" ng-disabled="pagi.ctrl.isLastPageDisabled">最后一页</button>
	</div>
</div>