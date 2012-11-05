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
			$('.cs2c_validatebox').bind('input',this.inputValidate);
			$('.cs2c_validatebox').bind('focus',this.inputFocus);
			$('.cs2c_validatebox').bind('blur',this.inputBlur);
			this.render();
		},
		render : function() {//tip的页面元素
			var $validatetip = $('<span class="validate_tip"></span>');
			var p_x = $('#'+this.options.id+'').offset().left + $('#'+this.options.id+'').width() + 5;
			$validatetip.insertAfter('#'+this.options.id+'');
			$validatetip.css("left",p_x);
		},
		inputValidate:function(){
			this.content = $('#'+this.options.id+'').val();
			$('#'+this.options.id+'').next().text(this.options.tipmsg);
			!this.options.reg_exp.test(this.content) ? $('#'+this.options.id+'').next().show():$('#'+this.options.id+'').next().hide();
		},
		inputFocus:function(){
			if($('#'+this.options.id+'').val()){//有值的时候
				this.inputValidate();
			}else{
				$('#'+this.options.id+'').next().text(this.options.reqmsg);
			    $('#'+this.options.id+'').attr("required")?$('#'+this.options.id+'').next().show():$('#'+this.options.id+'').next().hide();	
			}
		},
		inputBlur:function(){
			$('#'+this.options.id+'').next().hide();
		}
	});
}());
