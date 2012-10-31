/*
 *log1
 *backbone改写的搜索框demo第一版
 *所有操作全部实现，但没有数据获取与绑定的过程
*/
/*
 *log2
 *backbone改写的搜索框demo第二版
 *基于第一版的基础，添加样式接口，包括1、每个词条的高度；2、单屏词条的总条数；3、下拉框是否可滚动
*/
$(function () {
	var cs2c = {};
	cs2c.UI = {};
	cs2c.UI.variable = function(){
		this.searchbox_lenup = 0;//方向键‘上’的计数
		this.searchbox_lendown = 0;//方向键‘下’的计数
		this.searchbox_lentemp = 0;//判断
	}
	var globalvar = new cs2c.UI.variable();//实例化全局变量类

	searchListView = Backbone.View.extend({
		options:{
			inputid:null,
			content:null,
			divheight:null	
		},
		tagName:"div",//每一条一个div
		initialize: function () {
			_.bindAll(this,'render','selectItem','pointItem','itemBlur');
			$(this.el).bind('click',this.selectItem);
			$(this.el).bind('mouseover',this.pointItem);
			$(this.el).bind('mouseout',this.itemBlur);
			this.render();
		},
		render: function(){
			$(this.el).text(this.options.content);
			$(this.el).height(this.options.divheight);
			return this;
		},
		selectItem:function(){
			$('#'+this.options.inputid+'').val($(this.el).text());
			this.empitylist();			
		},
		pointItem:function(){
			$(this.el).siblings().removeClass("highlight");
			$(this.el).addClass("highlight");	
		},
		itemBlur:function(){
			$(this.el).removeClass("highlight");
		},
		empitylist:function(){
			this.boxnode = $('#'+this.options.inputid+'').next();
			this.boxnode.hide();
			this.boxnode.children().eq(1).empty();
			this.boxnode.children().eq(0).val($('#'+this.options.inputid+'').val());
		}
	});//这个view结束，生成<div>name</div>一个候选项
	searchBoxView = Backbone.View.extend({
		el : $('body'),
		options:{
			id:null,
			url:null,//post的地址
			scroll:"auto",
			itemheight:25,
			itemnum:10
		},
		events : {
			"input .cs2c_searchbox":"searchItemsList",
			"keydown .cs2c_searchbox" :"itemsDircSelect"
		},
		initialize : function(){
			_.bindAll(this,'render','searchItemsList','itemsDircSelect');
			var tempthis = this;
			$(document).click(function(event){
				event = event || window.event;
				var p_x = $('#'+tempthis.options.id+'').offset().left;
				var p_w = $('#'+tempthis.options.id+'').offset().left + $('#'+tempthis.options.id+'').width();
				var p_y = $('#'+tempthis.options.id+'').offset().top;
				var p_h = $('#'+tempthis.options.id+'').offset().top + $('#'+tempthis.options.id+'').height();
				if(event.clientX<p_x || event.clientX>p_w || event.clientY<p_y || event.clientY>p_h){
					var testview = new searchListView({'inputid':tempthis.options.id});
					testview.empitylist();
				}
			});
			this.render();
		},
		render : function(){
			var $searchbox = $('<div class="searchbox"></div>');
			$searchbox.insertAfter('#'+this.options.id+'');
			$searchbox.append('<input type="hidden" class="searchbox-orgword">');
			$searchbox.append('<div class="searchbox-searchlist" ></div>');
		},
		searchItemsList : function(){
			this.content = $('#'+this.options.id+'').val();
			this.orgcontent = $('#'+this.options.id+'').next().children().eq(0).val();
			this.itemheight = this.options.itemheight +"px";
			this.listmaxheight = this.options.itemheight * this.options.itemnum +"px";
			
			if(this.content == this.orgcontent){
				return false;
			} else{
				$('#'+this.options.id+'').next().children().eq(0).val(this.content);
				this.itemview = new searchListView({'inputid':this.options.id,'content':this.content,'divheight':this.itemheight});
				if ($.trim(this.content) != "") {
					$('#'+this.options.id+'').next().children().eq(1).append(this.itemview.el);
					$('#'+this.options.id+'').next().children().eq(1).css({"overflow-y":this.options.scroll,"max-height":this.listmaxheight});
					$('#'+this.options.id+'').next().show();
				} else {
					this.itemview.empitylist();
				}
			}
		},
		itemsDircSelect:function(event){
			event = event || window.event;
			if (event.which == 38 || event.which == 40) {
				var i = 0;
				this.listnode = $('#'+this.options.id+'').next().children().eq(1);
			   	this.searchnode = this.listnode.children();
			    this.listlen = this.searchnode.length;
			    
				if (globalvar.searchbox_lentemp != this.listlen) {
					globalvar.searchbox_lenup = this.listlen;
					globalvar.searchbox_lendown = -1;
				}
				for (i = 0; i < this.listlen; i++) {
					if (this.searchnode.eq(i).hasClass('highlight')) {
						globalvar.searchbox_lenup = globalvar.searchbox_lendown = i;
					}
				}
				this.searchnode.removeClass('highlight');
				if ($.trim($('#'+this.options.id+'').val()) == "") {
					return false;
				} else {
					switch (event.which) {
					case 38://向上键
						globalvar.searchbox_lenup--;
						if (globalvar.searchbox_lenup == -1) {
							$('#'+this.options.id+'').val(this.orgcontent);
							globalvar.searchbox_lenup = this.listlen;
						} else {
							this.searchnode.eq(globalvar.searchbox_lenup).addClass('highlight');
							$('#'+this.options.id+'').val(this.searchnode.eq(globalvar.searchbox_lenup).text());
						}
						break;
					case 40://向下键
						globalvar.searchbox_lendown++;
						if (globalvar.searchbox_lendown == this.listlen) {
							$('#'+this.options.id+'').val(this.orgcontent);
							globalvar.searchbox_lendown = -1;
						} else {
							this.searchnode.eq(globalvar.searchbox_lendown).addClass('highlight');
							$('#'+this.options.id+'').val(this.searchnode.eq(globalvar.searchbox_lendown).text());
						}
						break;
					default:
						break;
					}
					globalvar.searchbox_lentemp = this.listlen;
					}
				}
			}
		});
	}());
