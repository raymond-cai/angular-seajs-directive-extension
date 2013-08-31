<div class="pagi">
	<span>总记录数 : </span><span class="num">{{pagi.totalCount}}</span>
	<span>总页数 : </span><span class="num">{{pagi.totalPage}}</span>
	<span>当前页数 : </span><span class="num">{{pagi.pageNum}}</span>

	<button class="{{one.btnClass}}" ng-click="onChangePage({cp: one.pageNum, event: $event})" 
		ng-repeat="one in pagi.totalPageLl">{{one.pageNum}}</button>
</div>