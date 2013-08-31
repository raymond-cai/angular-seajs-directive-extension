/**
 * Number rounding
 **/
Number.prototype.round = function(precision) {
	precision = precision || 2;
	var digit = Math.round(this * Math.pow(10, precision)) / Math.pow(10, precision);
	var tempStr = digit + "";
	var pt = tempStr.indexOf(".");
	var tail;
	if(pt > 0){
		tail = tempStr.length - pt - 1;
	}else if(precision > 0){
		tail = 0;
		digit = digit + ".";
	}
	while(tail < precision){
		digit = digit + "0";
		tail++;
	}
	return parseFloat(digit);
};

/**
 * Number rounding
 **/
Number.prototype.toFixed = function(precision){
	precision = precision || 2;
	return parseInt(this * Math.pow(10, precision) + 0.5, 10) / Math.pow(10, precision);
};

/**
 * get length including CJK
 **/
String.prototype.charlen = function() {
	var arr = this.match(/[^\x00-\xff]/ig);
	return this.length + (arr === null ? 0 : arr.length);
};

/**
 * format string (replace {0-9} by arguments) -> refer printf %s
 **/
String.prototype.format = function() {
	var args = arguments;
	return this.replace(/\{(\d+)\}/g, 
		function(m, i){
			return args[i];
		});
};

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, '');
};

String.prototype.contains = function(sub) {
	return this.indexOf(sub) != -1;
};

String.prototype.startsWith = function(str) {
	return this.indexOf(str) === 0;
};

String.prototype.endsWith = function(str) {
	var index = this.lastIndexOf(str);
	return index != -1 && index + str.length == this.length;
};

String.prototype.capitalize = function() {
	if(this.length === 0){
		return this;
	}

	var first = this.substr(0, 1).toUpperCase();
	var spare = this.substr(1, this.length);
	return first + spare;
};

/**
 * compare by length
 **/
String.prototype.compare = function(b) {
	if(!b){
		return -1;
	}

	if(this.length != b.length){
		return this.length > b.length ? 1 : -1;
	}

	var i = 0;
	for (; i < this.length; i++){
		var val = this.charCodeAt(i) - b.charCodeAt(i);
		if(val !== 0){
			return val < 0 ? -1 : 1;
		}
	}

	return 0;
};

/**
 * replace one fragment
 **/
String.prototype.replaceLen = function(start, len, replaced) {
	if(!len){
		return this;
	}

	if(start >= this.length){
		return this;
	}

	var returnSeg = '';
	var returnSeg2 = '';
	var i = 0;
	for (; i < this.length; i++){
		var c = this.charAt(i);
		if(i < start){
			returnSeg += c;
		}

		if(i >= start + len){
			returnSeg2 += c;
		}
	}

	return returnSeg + replaced + returnSeg2;
};

/**
 * ...
 **/
String.prototype.replaceChar = function(target, replaced, start) {
	if(!target){
		return this;
	}

	if(!start){
		start = 0;
	}

	var returnVal = this.substring(0, start);
	var index = 0;
	for (var i = start; i < this.length; i++) {
		var c = this.charAt(i);
		target = typeof target == 'function' ? target.call(this, c, index) : target;
		if (c == target) {
			returnVal += typeof replaced == 'function' ? replaced.call(this, c, index) : replaced;
			while (i < this.length - 1 && this.charAt(i + 1) == c) {
				i++;
			}
			index++;
		}else{
			returnVal += c;
		}
	}

	return returnVal;
};

Array.prototype.remove = function(index){
	this.splice(index, 1);
};

/**
 * remove more than one by index
 **/
Array.prototype.removeByIndexLl = function(ll) {
	ll.sort();
	for(var i = ll.length - 1; i >= 0; i--){
		this.splice(ll[i], 1);
	}
};

Array.prototype.clear = function() {
	this.splice(0, this.length);
};

Array.prototype.contains = function(el) {
	var i;
	for(i = 0; i < this.length; i++) { 
		if(this[i] == el){
			return true;  
		}
	}  
	return false;  
};

Array.prototype.diff = function(arr) {
	var r = [];
	var i;
	for(i = 0; i < this.length; i++) { 
		if(!arr.contains(this[i])){
			r.push(this[i]);
		}
	}
	return r;
};

Array.prototype.merge = function(arr) {
	if(arr){
		var i;
		for(i = 0; i < arr.length; i++) {  
			this.push(arr[i]);
		}  
	}
	return this;
};

Array.prototype.indexOf = function(val, field){
	var i = 0;
	for(; i < this.length; i++){
		if(this[i] && (field ? this[i][field] == val : this[i] == val)){
			return i;
		}
	}
	return -1;
};

Array.prototype.lastIndexOf = function(val, field){
	var max = -1;
	var i = 0;
	for(; i < this.length; i++){
		if(this[i] && (field ? this[i][field] == val : this[i] == val)){
			max = i;
		}
	}
	return max;
};

Array.prototype.unique = function(field){
	var arr = [];
	var arr2 = [];

	var i = 0;
	for(; i < this.length; i++){
		if(field && typeof field == 'function'){
			var val = field(this[i]);
			if(!arr2.contains(val)){
				arr2.push(val);
				arr.push(this[i]);
			}
		}else {
			var valRaw = field ? this[i][field] : this[i];
			var index = this.lastIndexOf(valRaw, field);
			if(index == i){
				arr.push(this[i]);
			}
		}
	}

	return arr;
};

Array.prototype.max = function(field){
	var result = -1;

	var i = 0;
	for(; i < this.length; i++){
		var val = field ? this[i][field] : this[i];
		if(val > result){
			result = val;
		}
	}

	return result;
};

Array.prototype.min = function(field){
	var result = null;

	var i = 0;
	for(; i < this.length; i++){
		var val = field ? this[i][field] : this[i];
		if(result === null){
			result = val;
		}

		if(val < result){
			result = val;
		}
	}

	return result;
};

Date.prototype.format = function(pat){
	var year = this.getFullYear();
	var month = this.getMonth() + 1;
	var day = this.getDate();
	var hour = this.getHours();
	var minute = this.getMinutes();
	var second = this.getSeconds();
	month = month > 9 ? month : "0" + month;
	day = day > 9 ? day : "0" + day;
	hour = hour > 9 ? hour : "0" + hour;
	minute = minute > 9 ? minute : "0" + minute;
	second = second > 9 ? second : "0" + second;
	if(!pat){
		pat = "yyyy-MM-dd HH:mm:ss";
	}
	pat = pat.replace(/yyyy/g, year);
	pat = pat.replace(/MM/g, month);
	pat = pat.replace(/dd/g, day);
	pat = pat.replace(/HH/gi, hour);
	pat = pat.replace(/mm/g, minute);
	pat = pat.replace(/ss/g, second);
	return pat;
};

Date.prototype.formatTime = function(pat){
	pat = pat || '00:00:00';
	var arr = pat.split(':');
	var hh = arr[0];
	var mm = arr.length > 1 ? arr[1] : 0;
	var ss = arr.length > 2 ? arr[2] : 0;

	if('HH' != hh){
		this.setHours(hh);
	}
	if('mm' != mm){
		this.setMinutes(mm);
	}
	if('ss' != ss){
		this.setSeconds(ss);
	}
	return this;
};

// getTime and fix timezone offset
Date.prototype.getTime2 = function(){
	return this.getTime() - this.getTimezoneOffset() / 60 * 3600 * 1000;
};

// diff by day
Date.prototype.diff = function(date){
	return Math.ceil((this - date) / (1000 * 60 * 60 * 24));
};

// add days
Date.prototype.add = function(days){
	return new Date(this.getTime() + days * (1000 * 60 * 60 * 24));
};

// add months
Date.prototype.addMonth = function(months){ 
	months = months || 1;
	var tmpDate = this.getDate(); 
	this.setMonth(this.getMonth() + months);
	// 2-28 -> 2-29
	if(tmpDate != this.getDate()){
		this.setDate(0); 
	}
	return this; 
};

// add years
Date.prototype.addYear = function(years){ 
	years = years || 1;
	var tmpDate = this.getDate(); 
	this.setYear(this.getFullYear() + years);
	if(tmpDate != this.getDate()){
		this.setDate(0); 
	}
	return this; 
};

// string 'yyyy-MM-dd' -> date
Date.parse2 = function(str){
	if(!str){
		return new Date();
	}
	var rstr = str.replace(/(\d{4})([-\./])(\d{1,2})\2(\d{1,2})/, "$3/$4/$1");
	return new Date(Date.parse(rstr));
};

// json date obj -> date
Date.parse3 = function(obj){
	var str = (1900 + obj.year) + '-' + (obj.month + 1) + '-' + obj.date + ' ' + 
		obj.hours + ':' + obj.minutes + ':' + obj.seconds;
	return Date.parse2(str);
};

// loss precision fix
Math.floatAdd = function(arg1, arg2) {   
	var r1, r2, m;   
	try{ r1 = arg1.toString().split(".")[1].length; } catch(e) { r1 = 0; }
	try{ r2 = arg2.toString().split(".")[1].length; } catch(e) { r2 = 0; }
	m = Math.pow(10, Math.max(r1, r2));
	return ((arg1 * m) + (arg2 * m)) / m;
};

Math.floatSub = function(arg1, arg2) {   
	var r1, r2, m, n;   
	try{ r1 = arg1.toString().split(".")[1].length; } catch(e) { r1 = 0; }
	try{ r2 = arg2.toString().split(".")[1].length; } catch(e) { r2 = 0; }
	m = Math.pow(10, Math.max(r1, r2));   
	// use accurate one
	n = (r1 >= r2) ? r1 : r2;   
	return (((arg1 * m) - (arg2 * m)) / m).toFixed(n);   
};

Math.floatMul = function(arg1, arg2) {    
	var m=0, s1=arg1.toString(), s2=arg2.toString();    
	try{ m += s1.split(".")[1].length; } catch(e){}
	try{ m += s2.split(".")[1].length; } catch(e){}  
	return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
};
  
Math.floatDiv = function(arg1, arg2) {    
	var t1=0, t2=0, r1, r2;    
	try{ t1 = arg1.toString().split(".")[1].length; } catch(e){}    
	try{ t2 = arg2.toString().split(".")[1].length; } catch(e){}    
	r1 = Number(arg1.toString().replace(".",""));   
	r2 = Number(arg2.toString().replace(".",""));
	return (r1 / r2) / Math.pow(10, t1 - t2);    
};

Math.floorNum = function(num, precision) {
	var multiNo = Math.pow(10, precision || 2);
	return Math.floor(num * multiNo) / multiNo;
};

// guid
Math.guid = function() {
	var guid = '';
	var i = 1;
	for(; i <= 32; i++){
		var n = Math.floor(Math.random() * 16.0).toString(16);
		guid += n;
		if(i == 8 || i == 12 || i == 16 || i == 20){
			guid += "-";
		}
	}
	return guid; 
};

// Avoid `console` errors in browsers that lack a console.
// From html5-boilerplate
(function() {
	var method;
	var noop = function noop() {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if(!console[method]){
			console[method] = noop;
		}
	}
}());