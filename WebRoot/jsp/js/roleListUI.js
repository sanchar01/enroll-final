$(function() {
	$("#jqGrid").jqGrid({
		url : baseURL + 'sys/role/list.do',
		datatype : "json",
		colModel : [
			{
				label : '角色ID',
				name : 'roleId',
				index : "role_id",
				width : 45,
				key : true
			},
			{
				label : '角色名称',
				name : 'roleName',
				index : "role_name",
				width : 75
			},
			{
				label : '备注',
				name : 'remark',
				width : 100
			},
			{
				label : '创建时间',
				name : 'createTime',
				index : "createTime",
				width : 80,
				formatter : function(value, options, row) {
					var dateSeconds = parseInt(value);			
					var date = new Date(dateSeconds);
					date = date.Format("yyyy-MM-dd hh:mm:ss");
					return date;
				}
			}
		],
		viewrecords : true,
		height : 385,
		rowNum : 10,
		rowList : [ 10, 30, 50 ],
		rownumbers : true,
		rownumWidth : 25,
		autowidth : true,
		multiselect : true,
		pager : "#jqGridPager",
		jsonReader : {
			root : "page.list",
			page : "page.currPage",
			total : "page.totalPage",
			records : "page.totalCount"
		},
		prmNames : {
			page : "page",
			rows : "limit",
			order : "order"
		},
		gridComplete : function() {
			//隐藏grid底部滚动条
			$("#jqGrid").closest(".ui-jqgrid-bdiv").css({
				"overflow-x" : "hidden"
			});
		}
	});
});

var setting = {
	data : {
		simpleData : {
			enable : true,
			idKey : "menuId",
			pIdKey : "parentId",
			rootPId : -1
		},
		key : {
			url : "nourl"
		}
	},
	check : {
		enable : true,
		nocheckInherit : true
	}
};
var ztree;

var vm = new Vue({
	el : '#rrapp',
	data : {
		q : {
			roleName : null
		},
		showList : true,
		title : null,
		role : {}
	},
	methods : {
		query : function() {
			vm.reload();
		},
		add : function() {
			vm.showList = false;
			vm.title = "新增";
			vm.role = {};
			vm.getMenuTree(null);
		},
		update : function() {
			var roleId = getSelectedRow();
			if (roleId == null) {
				return;
			}

			vm.showList = false;
			vm.title = "修改";
			vm.getMenuTree(roleId);
		},
		del : function(event) {
			var roleIds = getSelectedRows();
			if (roleIds == null) {
				return;
			}
			confirm('确定要删除选中的角色？', function(){
				$.ajax({
					type : "POST",
					url : baseURL + "sys/role/delete.do",
					contentType : "application/json",
					data : JSON.stringify(roleIds),
					success : function(r) {
						if (r.code == 0) {
							alert('操作成功');
							vm.reload();
						} else {
							alert(r.msg);
						}
					}
				});
			});
		},
		getRole : function(roleId) {
			//            $.get(baseURL + "sys/role/info/"+roleId, function(r){
			//            	vm.role = r.role;
			//                
			//                //勾选角色所拥有的菜单
			//    			var menuIds = vm.role.menuIdList;
			//    			for(var i=0; i<menuIds.length; i++) {
			//    				var node = ztree.getNodeByParam("menuId", menuIds[i]);
			//    				ztree.checkNode(node, true, false);
			//    			}
			//    		});           
			$.ajax({
				type : "POST",
				url : baseURL + "sys/role/info.do",
				data : "roleId=" + roleId,
				success : function(r) {
					vm.role = r.role;

					//勾选角色所拥有的菜单
					var menuIds = vm.role.menuIdList;
					for (var i = 0; i < menuIds.length; i++) {
						var node = ztree.getNodeByParam("menuId", menuIds[i]);
						ztree.checkNode(node, true, false);
					}
				}
			});
		},
		saveOrUpdate : function() {
			//获取选择的菜单
			var nodes = ztree.getCheckedNodes(true);
			var menuIdList = new Array();
			for (var i = 0; i < nodes.length; i++) {
				menuIdList.push(nodes[i].menuId);
			}
			vm.role.menuIdList = menuIdList;

			var url = vm.role.roleId == null ? "sys/role/save.do" : "sys/role/update.do";
			$.ajax({
				type : "POST",
				url : baseURL + url,
				contentType : "application/json",
				data : JSON.stringify(vm.role),
				success : function(r) {
					if (r.code === 0) {
						alert('操作成功');
						vm.reload();
					} else {
						alert(r.msg);
					}
				}
			});
		},
		getMenuTree : function(roleId) {
			//加载菜单树
			$.get(baseURL + "sys/menu/perms.do", function(r) {
				ztree = $.fn.zTree.init($("#menuTree"), setting, r.menuList);
				//展开所有节点
				ztree.expandAll(true);

				if (roleId != null) {
					vm.getRole(roleId);
				}
			});
		},
		reload : function() {
			vm.showList = true;
			var page = $("#jqGrid").jqGrid('getGridParam', 'page');
			$("#jqGrid").jqGrid('setGridParam', {
				postData : {
					'roleName' : vm.q.roleName
				},
				page : page
			}).trigger("reloadGrid");
		}
	}
});