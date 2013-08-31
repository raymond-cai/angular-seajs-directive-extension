<div ng-show="visible" class="ng-ui-dialog">
<div class="ng-ui-dialog-wrapper">
<table class="ui_border ui_state_visible ui_state_focus">
	<tbody>
		<tr>
			<td class="ui_lt"></td>
			<td class="ui_t"></td>
			<td class="ui_rt"></td>
		</tr>
		<tr>
			<td class="ui_l"></td>
			<td class="ui_c">
			<div class="ui_inner">
			<table class="ui_dialog">
				<tbody>
					<tr>
						<td colspan="2">
						<div class="ui_title_bar">
							<div class="ui_title" unselectable="on" style="cursor: move;">{{title}}</div>
							<div class="ui_title_buttons">
								<a class="ui_min" href="javascript:void(0);" title="最小化" style="display: inline-block;">
									<b class="ui_min_b"></b>
								</a>
								<a class="ui_res" href="javascript:void(0);" title="还原" style="display: none;">
									<b class="ui_res_b"></b>
									<b class="ui_res_t"></b>
								</a>
								<a class="ui_close" href="javascript:void(0);" title="关闭(esc键)" style="display: inline-block;" ng-click="onCancel()">×</a>
							</div>
						</div>
						</td>
					</tr>
					<tr>
						<td class="ui_icon" style="display: none;"></td>
						<td class="ui_main" style="width: auto; height: auto;">
							<div class="ui_content" style="padding: 5px;" ng-transclude>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			</div>
			</td>
			<td class="ui_r"></td>
		</tr>
		<tr>
			<td class="ui_lb"></td>
			<td class="ui_b"></td>
			<td class="ui_rb" style="cursor: se-resize;"></td>
		</tr>
	</tbody>
</table>
</div>
</div>