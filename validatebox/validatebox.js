$(function () {
	validateBoxView = Backbone.View.extend({
		el : $('body'),
		options:{
			id:null,//页面input输入框的id
			tipmsg:null,//提示信息
			reqmsg:null,//必填项提示信息
			reg_exp:null   //正则表达式
		},
		initialize : function() {
			_.bindAll(this,'render','inputValidate','inputFocus','inputBlur');
			$('#'+this.options.id+'').bind('input',this.inputValidate);
			$('#'+this.options.id+'').bind('focus',this.inputFocus);
			$('#'+this.options.id+'').bind('blur',this.inputBlur);
			$('#'+this.options.id+'').bind('mouseover',this.inputFocus);
			$('#'+this.options.id+'').bind('mouseout',this.inputBlur);
			this.render();
		},
		render : function() {//tip的页面元素
			$('#' + this.options.id + '').after('<span class="validate_tip"></span>');
		},
		inputValidate:function(){
			this.content = $('#'+this.options.id+'').val();
			$('#'+this.options.id+'').next().text(this.options.tipmsg);
			if(this.options.reg_exp.test(this.content)){
				$('#'+this.options.id+'').next().hide();
				return true;
			}else{
				$('#'+this.options.id+'').next().show();
				return false;
			}
			this.cssPosition();
		},
		inputFocus:function(){
			if($('#'+this.options.id+'').val()){//有值的时候
				this.inputValidate();
			}else{
				$('#'+this.options.id+'').next().text(this.options.reqmsg);
			    	$('#'+this.options.id+'').attr("required")?$('#'+this.options.id+'').next().show():$('#'+this.options.id+'').next().hide();
			    	this.cssPosition();	
			}
		},
		inputBlur:function(){
			$('#'+this.options.id+'').next().hide();
		},
		cssPosition:function(){
			var p_y = $('#' + this.options.id + '').offset().top;
			var p_x = $('#' + this.options.id + '').offset().left + $('#' + this.options.id + '').width() + 5;
			$('#' + this.options.id + '').next().css({
				left : p_x,
				top : p_y
			});
		}
	});
}());
