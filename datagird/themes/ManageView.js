var TableManageView=Backbone.View.extend({
	el:'body',
	options:{
		code:false,
		checkbox:false,
		columns : [],
		emptyContent : 'no entries',
		onItemClick : Backbone.UI.noop,
		sortable : false,
		onSort : null,
		itemView : null,
		emptyContent : null,
		onItemClick : Backbone.UI.noop,
		maxHeight : null,
		url:null,
		pagerModel:new PagerModel()
	},
	tableView:null,
	pagerView:null,
	initialize:function(){
		if(this.options.pager){
			this.options.pagerModel.set({
				url:this.options.url,
				pageNo:this.options.pager.pageNo,
				pageSize:this.options.pager.pageSize,
				pageList:this.options.pager.pageList,
				parentEl:this.options.parentEl,
				
			})
		}
		$(this.options.parentEl).wrap("<div class='cs2c_datagrid'></div>");
		if(this.tableView){
			this.tableView.undelegateEvents();
		}
		this.tableView=new DatagridView(this.options);		
		if(this.options.pager){			
			//this.options.pager.datagridEl=this.options.parentEl;
			this.pagerView=new PagerView(this.options.pagerModel);
		}
		
	},
	events:{
		"click .datagrid_pager a.clickabled" : "doPage",
		'change select[class="pager_list"]':"autoRefresh"
	},
	
	doPage: function(e){
			this.pagerView.doPage(e);
			this.tableView.setCollection();
			if($(".pager_loading")){
				$(".pager_loading").removeClass("pager_loading") ;
			}
		
	},
	autoRefresh:function(){
			this.pagerView.autoRefresh();
			this.tableView.setCollection();
	}
    
})