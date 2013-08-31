<table style="height: 100%; width: 100%" cellpadding="0" cellspacing="0">
	<tbody>
		<tr>
			<td width="40%">
<div class="header">
	<span></span>
</div>
<select multiple="multiple" size="10">
</select>
			</td>

			<td width="20%" class="ng-ui-itemselector-toolbar">
<div>
	<div class="ng-ui-icon ng-ui-itemselector-tbar-add" title="右移" ng-click="from2to()"></div>
	<div class="ng-ui-icon ng-ui-itemselector-tbar-space" title=""></div>
	<div class="ng-ui-icon ng-ui-itemselector-tbar-remove" title="左移" ng-click="to2from()"></div>
</div>
			</td>

			<td width="40%">
<div class="header">
	<span></span>
</div>
<select multiple="multiple" size="10">
	<option ng-repeat="one in toList">{{one.label}}</option>
</select>
			</td>
		</tr>
	</tbody>
</table>