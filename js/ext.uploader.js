define(function(require){
	var $ = require('jquery');
	var Uploader = function(el, params){
		this._el = el;
		this.input_id = el.attr('id') || 'btn_uploader';
		this._input = null, 
		this._options = {  
			input_file_name : 'qqfile',   
			uploader : '',   
			params : {},   
	  
			allow_ext_ll : ['gif', 'jpg', 'png'],   
			size_limit : 1024 * 1024 * 5,   
	  
			messages : {  
				type : '不支持的文件类型！',   
				empty : '请选择上传文件！',   
				size : '上传文件大小超过限制！'  
			},   
	  
			on_complete : function(file_name, json){},   
			on_select : function(){file},
			on_before_upload : function(){file},
			on_progress : function(){},
		};

		if(params)
			$.extend(this._options, params);
	};
		
	Uploader.prototype.init_upload = function(){  
		if(this._el.size() == 0){  
			throw new Error('上传按钮目标不存在！');  
		}  
		this._el.css({  
			position: 'relative',  
			overflow: 'hidden',  
			// Make sure browser button is in the right side  
			// in Internet Explorer  
			direction: 'ltr'  
		});  
		// ie sucks, use span prefer
//		var ua = navigator.userAgent.toLowerCase()
//		if(this._el[0].nodeName == 'BUTTON' && /msie/.test(ua)){
//			this._el.click(function(){
//				alert('xxx');
//				this._el.find('input').trigger('change');
//			});
//		}
  
		this.input_reset();  
	};
	  
	Uploader.prototype.input_reset = function(){  
		if(this._input){  
			this._input.remove();     
		}                  
		this._input = Uploader.create_input(this._el, this._options['input_file_name']);  

		console.log('Uploader create input end...');
		var _self = this;
		this._input.change(function(){ 
			if(_self._el.hasClass('disabled'))
				return;

			_self.input_change();  
		});  
	};  
	  
	Uploader.prototype.input_change = function(){  
		var file_name = this.file_get_name();  
		this._options.on_select(file_name);  

		var r = this.file_valid(this._input[0]);  
		if (r.error){    
			alert(this._options.messages[r.error]);  
		}else{
			this._options.on_before_upload(file_name);  
			this.upload();
		}
		this.input_reset();  
	}; 
  
	Uploader.prototype.file_get_name = function(){  
		return this._input.val().replace(/.*(\/|\\)/, "");  
	}; 
  
	Uploader.prototype.file_valid = function(file){  
		var name,size,ext;  
   
		if (file.value){  
			// it is a file input              
			// get input value and remove path to normalize  
			name = file.value.replace(/.*(\/|\\)/, "");  
			ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();  
		} else {  
			// fix missing properties in Safari  
			name = file.fileName != null ? file.fileName : file.name;  
			size = file.fileSize != null ? file.fileSize : file.size;  
		}  
  
		if (!this._options.allow_ext_ll.contains(ext)){              
			return {error: 'type'};  
		} else if (size === 0 || !name || name.trim() == ''){              
			return {error: 'empty'};  
		} else if (size && this._options.size_limit &&   
			size > this._options.size_limit){              
			return {error: 'size'};          
		}  
		return {error: false};                  
	}; 
  
	Uploader.prototype.upload = function(){
		var params = this._options.params;
		var form_data = this._el.data('formData');
		if(form_data)
			$.extend(params, form_data);

		var file_name = this.file_get_name();  
				  
		var _iframe = Uploader.create_iframe(this.input_id);  
		var _form = Uploader.create_form(_iframe,   
			this._options.uploader, params);  
		_form.append(this._input);  
  
		_self = this;  
  
		_iframe.load(function(){  
			iframe = _iframe[0];  
			if (!iframe.parentNode){  
				return;  
			}  
			if (iframe.contentDocument &&  
				iframe.contentDocument.body &&  
				iframe.contentDocument.body.innerHTML == "false"){  
				return;  
			}  
  
			_self._options.on_complete(file_name,   
				Uploader.get_json_iframe(iframe));  
			  
			// timeout added to fix busy state in FF3.6  
			setTimeout(function(){  
			   _iframe.remove();  
			}, 1);  
		});  
  
		_form.submit();          
		_form.remove();         
	};
  
	Uploader.prototype.cancel = function(){          
		var _iframe = $("iframe[name='" + this.input_id + "']");  
		if (_iframe.size() > 0){  
			// to cancel request set src to something else  
			// we use src="javascript:false;" because it doesn't  
			// trigger ie6 prompt on https  
			_iframe.attr('src', 'javascript:false;');  
			_iframe.remove();  
		}  
	};

	Uploader.create_iframe = function(id){  
		var _iframe = $('<iframe src="javascript:false;" name="' + id + '" />');  
		// src="javascript:false;" removes ie6 prompt on https  
		_iframe.attr('id', id).css('display', 'none');  
		$(document.body).append(_iframe);  
		return _iframe;  
	};
  
	// need url encode
	Uploader.create_form = function(_iframe, uploader, params){  
		var _form = $('<form method="post" enctype="multipart/form-data"></form>');  

		var tplInput = '<input type="hidden" name="{0}" value="{1}" />';
		var query_str = '?1=1';  
		for (var key in params){  
			_form.append(tplInput.format(key, params[key]));
//			query_str += '&' + key + '=' + encodeURIComponent(params[key]);  
		}  
  
		_form.attr('action', uploader + query_str);  
		_form.attr('target', _iframe.attr('name'));  
		_form.css('display', 'none');  
		$(document.body).append(_form);  
		return _form;  
	}; 
  
	Uploader.create_input = function(_el, name){                  
		var _input = $("<input />");  
		  
		_input.attr("type", "file");  
		_input.attr("name", name);  
		// IE and Opera, unfortunately have 2 tab stops on file input  
		// which is unacceptable in our case, disable keyboard access  
		if (window.attachEvent){  
			// it is IE or Opera  
			_input.attr('tabIndex', "-1");  
		}     
		  
		_input.css({  
			position: 'absolute',  
			// in Opera only 'browse' button  
			// is clickable and it is located at  
			// the right side of the input  
			right: 0,  
			top: 0,  
			'z-index': 1,  
			'font-size': '13px',  
			margin: 0,  
			padding: 0,  
			cursor: 'pointer',  
			opacity: 0  
		});  
		  
		_el.append(_input);  
		return _input;              
	};
  
	Uploader.get_json_iframe = function(iframe){  
		// iframe.contentWindow.document - for IE<7  
		var doc = iframe.contentDocument ? iframe.contentDocument: iframe.contentWindow.document;
		var txt = doc.body.innerHTML;
		// trip tags
		if(txt)
			txt = txt.replace(/<(?:.|\s)*?>/g, ''); 

		try{  
			return JSON.parse(txt);
		} catch(err){  
			return {error: doc.body.innerHTML};  
		}
	};

	return Uploader;
});