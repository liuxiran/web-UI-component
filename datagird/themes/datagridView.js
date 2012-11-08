var DatagridView=Backbone.View.extend({
	tagName:'div',
	className:'datagrid_wrap',
	itemViews:[],
	collectionEl:null,
	searchKey:'',
	allModels:[],
	collection:new Backbone.Collection(),
	

	initialize:function(options){
		this.options=options;
		//console.log(this.options);
		if(this.options.data){
			this.allModels=(_(function(){
				var data=[];
				_(this.options.data).each(function(item){
					data.push(item);
				})
				return data;
			}).bind(this))();
			
			
			//this.collection=new Backbone.Collection(this.options.data);
		}
		
		//����û�ָ��url�������urlȥ��ȡ����
		if(this.options.url){
			this.allModels=(_(function(){
				var tempdata=[];
				$.ajaxSetup({async:false});								
				$.getJSON(this.options.url,function(data){
					_(data).each(function(item){
						tempdata.push(item);
					})						
				})
				return tempdata;
			}).bind(this))()
		}	
			
			//console.log(this.allModels.length);		
			/*
			TestModels = Backbone.Collection.extend({
				parse: _(function(response) {
					//console.log(response);
					var data = [];
					this.options.pagerModel.set({total:response.length});
					if(!this.options.pagination&&this.options.pager){						
						var pageNo=this.options.pagerModel.get("pageNo");
						var pageSize=this.options.pagerModel.get("pageSize");
						var startNo=(pageNo-1)*pageSize;
						var endNo=(total<pageNo*pageSize)?total:(pageNo*pageSize-1);
						_.each(response, function(obj,index){
							if(index>=startNo&&index<=endNo){
								data.push(obj);
							}
							
						});
					}else{
						_.each(response, function(obj,index){
								data.push(obj);
						});
					} 
					return data;
				}).bind(this)		
			});
			var testModels=new TestModels;
			testModels.fetch({url:this.options.url});
			
			this.collection=testModels;
			*/
			
		this.setCollection();
		if(this.collection) {
			this.collection.bind('add', this._onItemAdded, this);
			//if(this.options.renderOnChange){
				this.collection.bind('change', this._onItemChanged, this);
			//}
			this.collection.bind('remove', this._onItemRemoved, this);
			this.collection.bind('refresh', this.render, this);
			this.collection.bind('reset', this.render, this);
      }
	  this._sortState = {reverse : true};
	  this.render();
	},
	
	events:{

		"mouseover .datagrid_th,.datagrid_body tr" : "addHeightlight",
		"mouseout th,.datagrid_body tr" : "removeHeightlight",
		"click .select_all" : "selectAllRow"
	},
	
	setCollection:function(){
		//���collection����������
		this.options.pagerModel.set({total:this.allModels.length});
		var tempModels=[];
		this.collection.each(_(function(model) {
			tempModels.push(model);
		}).bind(this));
								
		for(var i=0;i<tempModels.length;i++){							
			this.collection.remove(tempModels[i]);
		}
		
		if(!this.options.pagination&&this.options.pager){	
			var total=this.allModels.length;
			var pageNo=this.options.pagerModel.get("pageNo");
			var pageSize=this.options.pagerModel.get("pageSize");
			var startNo=(pageNo-1)*pageSize;
			var endNo=(total<pageNo*pageSize)?total:(pageNo*pageSize-1);
			
			for(var i=0;i<total;i++){
				if(i>=startNo&&i<=endNo){
					this.collection.add(new Backbone.Model(this.allModels[i]));
				}
			}
		}else{
			for(var i=0;i<total;i++){
					this.collection.add(new Backbone.Model(this.allModels[i]));
			}
		} 
		
		
	},
	
	render : function() {
		//console.log("datagrid.el:"+$(this.el).attr("class"));
		//console.log(this.collection.length)
		//console.log("render");
		$(this.el).empty();
		this.itemViews = {};
		$(this.el).parent().prev().remove();
		//$(this.el).parent().addClass('datagrid');
		
		//��Ⱦtoolbar
		this._renderToolBar();		
		// ����classΪdatagrid_body��div�����ڴ�������б�
		//��ʼ��collectionEl����
		var container = $.el.div({className : 'datagrid_body'},
			this.collectionEl = $.el.table({
				cellPadding : '0',
				cellSpacing : '0'
			})
		);

      $(this.el).toggleClass('clickable', this.options.onItemClick !== Backbone.UI.noop);
	  
      // generate a table row for our headings
      var headingRow = $.el.tr();
      var sortFirstColumn = false;
      var firstHeading = null;
      
	  //���ݲ���code,checkbox���ж��Ƿ����checkbox�к�����У�
	  //�����������б�ͷ������������td

		if(this.options.code){
			//console.log(this.options.code);
			var th = $.el.th({},
			  $.el.div({
				className :'datagrid_cell_code'           
			  })		   
			  ).appendTo(headingRow);
		}
			  
		if(this.options.checkbox){
				var th = $.el.th({
			  },
			  $.el.div({
				className :'datagrid_cell'           
			  }, $.el.input({className:'select_all',type : 'checkbox', style:'margin:0 6px;'}))		   
			  ).appendTo(headingRow);
				
		}	
	  
	  //Ȼ���ٽ�������columns
	  _(this.options.columns).each(_(function(column, index, list) {
			
			var label = _(column.title).isFunction() ? column.title() : column.title;		
			var width = !!column.width ? parseInt(column.width, 10) + 5 : null;
			var style = width ? 'width:' + width + 'px; max-width:' + width + 'px; ' : '';
			style += column.sortable ? 'cursor: pointer; ' : '';
			column.comparator = _(column.comparator).isFunction() ? column.comparator : function(item1, item2) {
			  return item1.get(column.content) < item2.get(column.content) ? -1 :
				item1.get(column.content) > item2.get(column.content) ? 1 : 0;
			};
			var firstSort = (sortFirstColumn && firstHeading === null);
			var sortHeader = this._sortState.content === column.content || firstSort;
			
			
			var sortLabel = $.el.span(
				{
				  className : 'datagrid_sort_icon'
				}, 
				sortHeader ? (this._sortState.reverse && !firstSort ? $.el.img({ 
					src : 'themes/images/datagrid_sort_desc.gif'
				}) : $.el.img({ 
					src : 'themes/images/datagrid_sort_asc.gif'
				})) : ''
			  
			);

			var onclick = column.sortable ? (_(column.onSort).isFunction() ?
			  _(function(e) { column.onSort(column); }).bind(this) :
			  _(function(e, silent) { this._sort(column, silent); }).bind(this)) : Backbone.UI.noop;

			var th = $.el.th(
				{
					className:'datagrid_th',
					style : style, 
					onclick : onclick
				},
				$.el.div({
					className :'datagrid_cell',
					style : style			
				},
				$.el.span({
					className : 'wrapper' + (sortHeader ? ' sorted' : '')
				}, label), 
				column.sortable ?sortLabel:null) 
			  ).appendTo(headingRow);

			if (firstHeading === null) firstHeading = th;
      }).bind(this));
	  
      if (sortFirstColumn && !!firstHeading) {
		firstHeading.onclick(null, true);
      }

      // Add the heading row to it's very own table so we can allow the
      // actual table to scroll with a fixed heading.
	  this.el.appendChild($.el.div({className :'datagrid_header'},
	  $.el.table({         
          cellPadding : '0',
          cellSpacing : '0'
        }, headingRow)));

      // now we'll generate the body of the content table, with a row
      // for each model in the bound collection
		var tableBody=this.collectionEl ;
		
	  // this.collectionEl.appendChild(tableBody);

      // if the collection is empty, we render the empty content
      if(!_(this.collection).exists()  || this.collection.length === 0) {
			this._emptyContent = _(this.options.emptyContent).isFunction() ?
			  this.options.emptyContent() : this.options.emptyContent;
			this._emptyContent = $.el.tr($.el.td(this._emptyContent));

			if(!!this._emptyContent) {
			  tableBody.appendChild(this._emptyContent);
			}
      }

      // otherwise, we render each row
      else {
		
			_(this.collection.models).each(function(model, index) {
				  
				  var item = this._renderItem(model, index);
				  tableBody.appendChild(item);
			  //console.log($(".opt_delete").size());
			}, this);
		
      }

      // wrap the list in a scroller
      if(_(this.options.maxHeight).exists()) {
			var style = 'max-height:' + this.options.maxHeight + 'px';
			var scroller = new Backbone.UI.Scroller({
			  content : $.el.div({style : style}, container)
			}).render();

			this.el.appendChild(scroller.el);
      }
      else {
        this.el.appendChild(container);
      }

     // this._updateClassNames();
	  
	  $(this.options.parentEl).append(this.el);
	  this.resizeTable();
      return this;
    },
	
	
	resizeTable:function(){
		 var width=0; 
 		_($(".datagrid_header table th")).each(function(ele) {
			  width+= parseInt($(ele).outerWidth());
         });
		//$(this.el).css("width",width);
		$(".cs2c_datagrid").css("width",width);
	 
		//$(".datagrid_header ").css("width",width);
		//$(".datagrid_body ").css("width",width);	
		
	},
	
	
	 _onItemAdded : function(model, list, options) {
		  
		  if(!!this.itemViews[model.cid]) {
			return;
		  }

		  // remove empty content if it exists
		  if(!!this._emptyContent) {
			if(!!this._emptyContent.parentNode) this._emptyContent.parentNode.removeChild(this._emptyContent);
			this._emptyContent = null;
		  }
		   
		  // render the new item
		  var properIndex = list.indexOf(model);
		  //console.log("list:"+JSON.stringify(list));
		  //console.log("model:"+JSON.stringify(model));
		  //console.log("options:"+JSON.stringify(options))
		  var el = this._renderItem(model, properIndex);

		  // insert it into the DOM position that matches it's position in the model
		  var anchorNode = this.collectionEl.childNodes[properIndex];
		  this.collectionEl.insertBefore(el, _(anchorNode).isUndefined() ? null : anchorNode);

		  // update the first / last class names
		 // this._updateClassNames();
    },

    _onItemChanged : function(model) {
		  var view = this.itemViews[model.cid];
		  // re-render the individual item view if it's a backbone view
		  if(!!view && view.el && view.el.parentNode) {
			view.render();
			this._ensureProperPosition(view);
		  }

		  // otherwise, we re-render the entire collection
		  else {
			this.render();
		  }
    },

    _onItemRemoved : function(model) {

		  var view = this.itemViews[model.cid];
		  if(!!view ){
			$(view).remove();
			delete(this.itemViews[model.cid]);
			//this._updateClassNames();
		  }
    },

    _updateClassNames : function() {
		  var children = this.collectionEl.childNodes;
		  if(children.length > 0) {
			_(children).each(function(child) {
			  $(child).removeClass('first');
			  $(child).removeClass('last');
			});
			$(children[0]).addClass('first');
			$(children[children.length - 1]).addClass('last');
		  }
    },

    _ensureProperPosition : function(view) {
		  if(_(this.model.comparator).isFunction()) {
			//console.log("comparator:"+this.model.comparator);
			this.model.sort({silent : true});
			var itemEl = view.el.parentNode;
			var currentIndex = _(this.collectionEl.childNodes).indexOf(itemEl, true);
			var properIndex = this.model.indexOf(view.model);
			if(currentIndex !== properIndex) {
			  itemEl.parentNode.removeChild(itemEl);
			  var refNode = this.collectionEl.childNodes[properIndex];
			  if(refNode) {
				this.collectionEl.insertBefore(itemEl, refNode);
			  }
			  else {
				this.collectionEl.appendChild(itemEl);
			  }
			}
		  }
    },
	
	
	_renderToolBar:function(){
		//console.log("renderToolBar");
		//generate a div element with a table as childNode ++++++
		if(this.options.toolbar){
			//console.log("toolbar:"+this.options.toolbar)
			var toolbarContainer=$.el.div({className:'datagrid_toolbar'});
			var toolSpan='';
			
			_(this.options.toolbar).each(_(function(elem){
				//console.log(this.collection);
				if(elem.type=="searchbox"){
					$.el.input({id:elem.id?elem.id:'',className:'cs2c_searchbox',style:'width: 149px'}).appendTo(toolbarContainer);	
				}else{		
					var className='button';
					if(elem.disabled){
						className='button_disabled';					
					}
					var button=$.el.a({id:elem.id,className:className},$.el.span({className:elem.iconCls},elem.text)).appendTo(toolbarContainer);					
					if(elem.handler&&_(elem.handler).isFunction()&& !elem.disabled){
						$(button).click(_(elem.handler).bind(this));
					}
				}
				
				
			}).bind(this));
			
			$(this.options.parentEl).before(toolbarContainer);
			//ȷ���Ƿ񴴽�������
			if($(".cs2c_searchbox").size()>0){
				_($(".cs2c_searchbox")).each(_(function(searchbox){
					var tempthis=this;
					
					var demotest1 = new searchBoxView({
						'id':$(searchbox).attr("id"),
						'url':'ajaxjson.json',
						'enterfunc':_(function(){
								
								var filterValues=[];
								var searchValue=$('#'+$(searchbox).attr("id")).val();
								$.ajaxSetup({async:false});
								$.getJSON(this.options.url,function(data){
									
									var testPattern = eval( "/^"+searchValue+".*$/");
									$.each(data,function(index,obj){
										if(testPattern.test(obj.name)){
											filterValues.push(obj);
										}
									});
									
									
									//console.log(this.allModels.length);
								
								})
								this.allModels=filterValues;
								this.setCollection();
						}).bind(this)
					});
				}).bind(this))
			
			}
			
		}
	},
	
	
    _renderItem : function(model, index) {
     
		var rowIndex=index
		var row = $.el.tr({className:rowIndex%2==0 ? '':'datagrid_row_even'});
		row.model=model;
		row.selected=false;
        // for each model, we walk through each column and generate the content
		//�����Ƚ���frozenColumns�����������ж�
	 
	 
	 if(this.options.code){				
				var td = $.el.td({			
			  },
			  $.el.div({
				className :'datagrid_cell_code'           
			  },rowIndex+1)		   
			  ).appendTo(row);}
			if(this.options.checkbox){
				var td = $.el.td({
			  },
			  $.el.div({
				className :'datagrid_cell'           
			  }, $.el.input({type : 'checkbox', style:'margin:0 6px;'}))		   
			  ).appendTo(row);				
			}
	 
	  
	  //Ȼ�����columns����
	  _(this.options.columns).each(function(column, index, list) {
			var width = !!column.width ? parseInt(column.width, 10) + 5 : null;
		
			var style = width ? 'width:' + width + 'px; max-width:' + width + 'px': null;
		
			var content = this.resolveContent(model, column.content);
			//modified
			if(column.formatter&& _(column.formatter).isFunction()){
				content=column.formatter(content,model,rowIndex);
			
			}		
		
			//���Ӳ���ͼ��
			if(column.operations &&_(column.operations).isFunction()){
				var opts=[];
				var operations=column.operations();
				_(operations).each(function(operation){
					var optFun=null;
					if(operation.optName=="opt_delete"){
						optFun=_(function(){
							if(confirm(operation.optMsg)){
								this.allModels.pop();
								this.options.pagerModel.set({'pageNo':1});
								this.setCollection();
								//this.collection.remove(model);
							}else{
								alert("��ȡ���˸ò�����");
							};
						
						}).bind(this)
					}
					var operateSpan=$.el.span({
						className:operation.optName,
						onclick:optFun
				
					},
					operation.showName+" "
					)
				
					opts.push(operateSpan);
				},this);
			
				content=opts;
			}
		//$(row).append('<td class="'+_(list).nameForIndex(index)+'" style="'+style+'"><div //class="datagrid_cell" style="'+style+'">'+content+'</div></td>')
		//$(row).append('<td style="'+style+'"><div class="datagrid_cell" style="'+style+'">'+content+'</div></td>')
		
			row.appendChild($.el.td({
				style : style
				}, $.el.div({className : 'datagrid_cell', style : style}, content))
			);
      }, this);

      // bind the item click callback if given
      if(this.options.onItemClick) {
		$(row).click(_(function(){this.selectRow(row);this.options.onItemClick(model)}).bind(this))
      }
		
      this.itemViews[model.cid] = row;
      return row;
    },

    _sort : function(column, silent) {
		  this._sortState.reverse = !this._sortState.reverse;
		  this._sortState.content = column.content;
		  var comp = column.comparator;
		  if (this._sortState.reverse) {
			comp = function(item1, item2) {
			  return -column.comparator(item1, item2);
			};
		  }
		  this.collection.comparator = comp;
		  this.collection.sort({silent : !!silent});
    },
	
	
	addHeightlight:function(e){
		//alert($(e.currentTarget).attr("class"));
		if(($(e.currentTarget).attr("class")).indexOf("datagrid_row_selected")<0){
			$(e.currentTarget).addClass("datagrid_over").siblings().removeClass(
				"datagrid_over");
			}
		
						
	},

	
	
	removeHeightlight:function(e){
		$(e.currentTarget).removeClass(
					"datagrid_over");		
	},
	
	judgement:function(elem){		
		
		 var flag=true;
			
				_($(".datagrid_body input[type='checkbox']")).each(function(elem){
			if(!elem.checked){
				flag=false
				};
			});
			if(flag){
				$(".datagrid_header .select_all")[0].checked= true;
			}else{
				$(".datagrid_header .select_all")[0].checked= false;
			}
	},
	
	
	selectRow:function(row){
		//alert(row.selected);
		if(row.selected){
			row.selected=false;
			$(row).removeClass("datagrid_row_selected");
		}else{
				row.selected=true;
				$(row).addClass("datagrid_row_selected");
			}
		var ck=$(row).find("input[type='checkbox']")[0];
		if(ck){
			if(row.selected){
				ck.checked=true;
			}else{
				ck.checked=false;
			}
			
			this.judgement();
		}
			
			
	},

	
	selectAllRow : function(e) {

		var inputs = $("input[type=checkbox]");// ������е�inputԪ��
		var data = $(e.currentTarget)[0];
		

		// ���ԭ��Ϊȫѡ����ȫ��ȡ��������ȫ��ѡ��
		if (data.checked) {
			$(".datagrid_body tr").addClass("datagrid_row_selected");
			_.each(inputs, function(input) {
				input.checked = true;
			});
			_.each(this.itemViews,function(row){
				row.selected=true;
			})
			
		} else {
			$(".datagrid_body tr").removeClass("datagrid_row_selected"); 
			_.each(inputs, function(input) {
				input.checked = false;
			});
			_.each(this.itemViews,function(row){
				row.selected=false;
			})
		}

	}
	
});