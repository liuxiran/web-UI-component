$(function () {
	/*全局变量*/
	var variable = function(){
		this.searchbox_lenup = 0;//方向键‘上’的计数
		this.searchbox_lendown = 0;//方向键‘下’的计数
		this.searchbox_lentemp = 0;//判断
	};
	var globalvar = new variable();//实例化全局变量类
	/**
	 * 每一个候选词条的view
	 * 使用方法：new searchListView({'inputid':xxx,'content':xxx,'divheight':'xxxpx'});其中inputid是必选项，其余是可选项
	 * 页面生成：<div>content</div>这样一个DOM元素
	 * 该元素具有事件：onclick->selectItem;onmouseover->pointItem;onmouseout->itemBlur
	 **/
	searchItemView = Backbone.View.extend({
		options : {
			inputid:null,//页面input框的id
			content:null,//该词条显示的文字
			divheight:'25px'//该词条所在div的高度,默认是25px
		},
		tagName : "div",//每一条一个div
		initialize : function() {
			_.bindAll(this,'render','selectItem','pointItem','itemBlur');
			$(this.el).bind('click',this.selectItem);
			$(this.el).bind('mouseover',this.pointItem);
			$(this.el).bind('mouseout',this.itemBlur);
			this.render();
		},
		render: function() {
			$(this.el).text(this.options.content);
			$(this.el).height(this.options.divheight);
			return this;
		},
		selectItem : function() {
			$('#'+this.options.inputid+'').val($(this.el).text());
			this.empitylist();			
		},
		pointItem : function() {
			$(this.el).siblings().removeClass("highlight");
			$(this.el).addClass("highlight");	
		},
		itemBlur : function() {
			$(this.el).removeClass("highlight");
		},
		empitylist : function() {
			var $boxnode = $('#'+this.options.inputid+'').next();
			$boxnode.hide();
			$boxnode.children().eq(1).empty();
			$boxnode.children().eq(0).val($('#'+this.options.inputid+'').val());
		}
	});
	/**
	 * 搜索框的主view，主要用来处理input框的事件
	 * 使用方法：new searchBoxView({'id':xxx,'url':xxx,'scroll':'auto','itemheight':25,'itemnum':10});其中id和url是必选项，其余可选
	 * 页面在对应的input的输入框下方生成以下DOM元素：
	 * <div class="searchbox">
	 *	 <input type="hidden" class="searchbox-orgword">用来存储用户每次输入的字符串，以及判断该input框中内容的变化是否是因输入引发的
	 *	 <div class="searchbox-searchlist" ></div>用来包裹所有的候选词条
	 * </div>
	 * 事件处理：input->searchItemsList;keydown->itemsDircSelect
	 **/
	searchBoxView = Backbone.View.extend({
		el : $('body'),
		options:{
			id:null,//页面input输入框的id
			url:null,//进行ajax过程中的action的地址，此处post的data名称是固定的，为postdata，在写对应的action的时候需要注意
			scroll:'auto',//词条下拉框是否有滚动条，参数可以填两个，auto：有滚动条，hidden：无滚动条
			itemheight:25,//每一个词条的宽度，默认是25，作用是用来计算整个下拉框的最大高度和给searchItemView中的divheight传值
			itemnum:10//下拉框中无滚动条时显示词条的最大数目
		},
		initialize : function() {
			_.bindAll(this,'render','searchItemsList','itemsDircSelect');
			var tempthis = this;
			$(document).click(function(event){//点击输入框以外任意区域下拉框消失
				event = event || window.event;
				var p_x = $('#'+tempthis.options.id+'').offset().left;
				var p_w = $('#'+tempthis.options.id+'').offset().left + $('#'+tempthis.options.id+'').width();
				var p_y = $('#'+tempthis.options.id+'').offset().top;
				var p_h = $('#'+tempthis.options.id+'').offset().top + $('#'+tempthis.options.id+'').height();
				if(event.clientX<p_x || event.clientX>p_w || event.clientY<p_y || event.clientY>p_h){
					var testview = new searchItemView({'inputid':tempthis.options.id});
					testview.empitylist();
				}
			});
			$('.cs2c_searchbox').bind('input',this.searchItemsList);
			$('.cs2c_searchbox').bind('keydown',this.itemsDircSelect);
			this.render();
		},
		render : function() {
			var s_width = $('#'+this.options.id+'').width();
			var $searchbox = $('<div class="search-box"></div>');
			$searchbox.width(s_width);
			$searchbox.insertAfter('#'+this.options.id+'');
			$searchbox.append('<input type="hidden" class="searchbox-orgword">');
			$searchbox.append('<div class="searchbox-searchlist" ></div>');
		},
		searchItemsList : function() {
			this.searchlist = [];//返回关键词数组
			this.optionlist = [];//返回附加选项数组
			this.hiddeninput = $('#'+this.options.id+'').next().children().eq(0);
			this.listnode = $('#'+this.options.id+'').next().children().eq(1);
			this.content = $('#'+this.options.id+'').val();//输入框中输入的内容
			var orgcontent = this.hiddeninput.val();//隐藏输入框中的内容
			var itemheight = this.options.itemheight +"px";
			var listmaxheight = this.options.itemheight * this.options.itemnum +"px";
			$('#'+this.options.id+'').next().css("left",$('#'+this.options.id+'').offset().left);
			this.listnode.empty();
			this.dataInterface();
			if(this.content == orgcontent){
				return false;
			} else{
				this.hiddeninput.val(this.content);
				for(var i=0;i<this.searchlist.length;i++){
					this.itemview = new searchItemView({'inputid':this.options.id,'content':this.searchlist[i],'divheight':itemheight});
					this.listnode.append(this.itemview.el);
					this.listnode.css({'overflow-y':this.options.scroll,'max-height':listmaxheight});
				}
				this.searchlist.length == 0 ? this.itemview.empitylist() : $('#'+this.options.id+'').next().show();
			}
		},
		itemsDircSelect : function(event) {
			event = event || window.event;
			if (event.which == 38 || event.which == 40) {
				this.searchnode = this.listnode.children();//所有词条的数组
			    this.listlen = this.searchnode.length;//所有词条的条数总和
			    this.orgcontent = this.hiddeninput.val();
			    var scrolltop = this.listnode.scrollTop();
			    if (globalvar.searchbox_lentemp != this.listlen) {
					globalvar.searchbox_lenup = this.listlen;
					globalvar.searchbox_lendown = -1;
				}
				for (var i = 0; i < this.listlen; i++) {
					if (this.searchnode.eq(i).hasClass('highlight')) {
						globalvar.searchbox_lenup = globalvar.searchbox_lendown = i;
					}
				}
				this.searchnode.removeClass('highlight');
				switch (event.which) {
					case 38://向上键
						globalvar.searchbox_lenup--;
						if (globalvar.searchbox_lenup == -1) {
							$('#'+this.options.id+'').val(this.orgcontent);
							globalvar.searchbox_lenup = this.listlen;
						} else {
							scrolltop = scrolltop -this.options.itemheight;
							this.searchnode.eq(globalvar.searchbox_lenup).addClass('highlight');
							$('#'+this.options.id+'').val(this.searchnode.eq(globalvar.searchbox_lenup).text());
							this.listnode.scrollTop(scrolltop);
						}
						break;
					case 40://向下键
						globalvar.searchbox_lendown++;
						if (globalvar.searchbox_lendown == this.listlen) {
							$('#'+this.options.id+'').val(this.orgcontent);
							globalvar.searchbox_lendown = -1;
						} else {
							scrolltop = scrolltop +this.options.itemheight;
							this.searchnode.eq(globalvar.searchbox_lendown).addClass('highlight');
							$('#'+this.options.id+'').val(this.searchnode.eq(globalvar.searchbox_lendown).text());
							this.listnode.scrollTop(scrolltop);
						}
						break;
					default:
						break;
					}
					globalvar.searchbox_lentemp = this.listlen;
				}
			},
			dataInterface : function() {//数据处理过程
				$.ajaxSetup({async:false});
				var tempthis = this;
				$.post(this.options.url,{"postdate":$.trim(this.content)},function(data){
					$.each(data.msg.values,function(index,obj){
						tempthis.searchlist[index] = obj.key;//关键字
						tempthis.optionlist[index] = obj.options;//附加属性
					});
				});
				$.ajaxSetup({async:true});
			}
		});
	}());
