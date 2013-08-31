describe('Test extend prototype methods : ', function(){
	it('Number round', function(){
		expect(2.532.round()).toBe(2.53);
	}); 
	it('Number toFixed', function(){
		expect(2.53264.toFixed(3)).toBe(2.533);
	}); 
	it('String charlen', function(){
		expect('aaa'.charlen()).toBe(3);
//		expect('我'.charlen()).toBe(2);
	}); 
	it('String format', function(){
		expect('aa{0}{1}bb'.format('1', '2')).toBe('aa12bb');
	}); 
	it('String trim', function(){
		expect(' aabb  '.trim()).toBe('aabb');
	}); 
	it('String contains', function(){
		expect(' aabb  '.contains('aa')).toBe(true);
	}); 
	it('String startsWith', function(){
		expect('aabb'.startsWith('aa')).toBe(true);
	}); 
	it('String endsWith', function(){
		expect('bbaabb'.endsWith('bb')).toBe(true);
	}); 
	it('String capitalize', function(){
		expect('aabb'.capitalize()).toBe('Aabb');
	}); 
	it('String compare', function(){
		expect('aabb'.compare('aabbcc')).toBe(-1);
	}); 
	it('String replaceLen', function(){
		expect('aabbabab'.replaceLen(6, 2, 'cd')).toBe('aabbabcd');
	}); 
	it('String replaceChar', function(){
		expect('aabbabab'.replaceChar('a', 'b', 4)).toBe('aabbbbbb');
		expect('aabbabab'.replaceChar('a', function(ch, i){
			return 'B' + i;
		}, 4)).toBe('aabbB0bB1b');
	}); 
	it('Array remove', function(){
		var arr = [1, 2];
		arr.remove(1);
		expect(arr).toEqual([1]);
	}); 
	it('Array removeByIndexLl', function(){
		var arr = [1, 2, 3];
		arr.removeByIndexLl([1, 2]);
		expect(arr).toEqual([1]);
	}); 
	it('Array clear', function(){
		var arr = [1, 2, 3];
		arr.clear();
		expect(arr).toEqual([]);
	}); 
	it('Array contains', function(){
		var arr = [1, 2, 3];
		expect(arr.contains(2)).toBe(true);
	}); 
	it('Array diff', function(){
		var arr = [1, 2, 3];
		expect(arr.diff([1])).toEqual([2, 3]);
	}); 
	it('Array merge', function(){
		var arr = [1, 2, 3];
		arr.merge([4, 5])
		expect(arr).toEqual([1, 2, 3, 4, 5]);
	}); 
	it('Array indexOf', function(){
		var arr = [{name: 'kerry'}];
		expect(arr.indexOf('kerry', 'name')).toBe(0);
	}); 
	it('Array lastIndexOf', function(){
		var arr = [{name: 'kerry'}, {name: 'tom'}, {name: 'kerry'}];
		expect(arr.lastIndexOf('kerry', 'name')).toBe(2);
	}); 
	it('Array unique', function(){
		var arr = [{name: 'kerry'}, {name: 'tom'}, {name: 'kerry'}];
		var arr2 = [{name: 'tom'}, {name: 'kerry'}];
		expect(arr.unique('name')).toEqual(arr2);
	}); 
	it('Array max', function(){
		var arr = [{age: 1}, {age: 2}];
		expect(arr.max('age')).toEqual(2);
	}); 
	it('Array min', function(){
		var arr = [{age: 1}, {age: 2}];
		expect(arr.min('age')).toEqual(1);
	}); 
	it('Date format', function(){
		var dat = new Date(2013, 4, 1);
		expect(dat.format('yyyy-MM-dd')).toEqual('2013-05-01');
	}); 
	it('Date formatTime', function(){
		var dat = new Date(2013, 4, 1);
		expect(dat.formatTime('23:59:00').format()).toEqual('2013-05-01 23:59:00');
	}); 
	it('Date getTime2', function(){
		var dat = new Date(2013, 4, 1);
		var dat2 = new Date(2013, 4, 1);
		dat2.formatTime('23:59:00');
		expect(dat.formatTime('23:59:00').getTime2()).toEqual(dat2.getTime() - dat2.getTimezoneOffset() / 60 * 3600 * 1000);
	}); 
	it('Date diff', function(){
		var dat = new Date(2013, 4, 1);
		var dat2 = new Date(2013, 4, 2);
		expect(dat.diff(dat2)).toBe(-1);
	}); 
	it('Date add', function(){
		var dat = new Date(2013, 4, 1);
		var dat2 = new Date(2013, 4, 2);
		expect(dat.add(1)).toEqual(dat2);
	}); 
	it('Date addMonth', function(){
		var dat = new Date(2013, 4, 1);
		var dat2 = new Date(2013, 5, 1);
		expect(dat.addMonth(1)).toEqual(dat2);
	}); 
	it('Date addYear', function(){
		var dat = new Date(2012, 1, 29);
		var dat2 = new Date(2013, 1, 28);
		expect(dat.addYear(1)).toEqual(dat2);
	}); 
	it('Date parse2', function(){
		var dat = new Date(2013, 4, 1);
		expect(Date.parse2('2013-05-01')).toEqual(dat);
	}); 
	it('Date parse3', function(){
		var obj = {year: 113, month: 4, date: 1, hours: 0, minutes: 0, seconds: 0};
		var dat = new Date(2013, 4, 1);
		expect(Date.parse3(obj)).toEqual(dat);
	}); 
	it('Math floatAdd', function(){
//		expect(3.3344 + 3.33).toBe(6.6644);
		expect(Math.floatAdd(2.3344, 4.33)).toBe(6.6644);
	}); 
	it('Math floatSub', function(){
//		expect(6.6644 - 3.33).toBe(3.3344);
		expect(Math.floatSub(6.6644, 4.33)).toBe(2.3344);
	}); 
	it('Math floatMul', function(){
//		expect(6.6644 * 3.3333).toBe(22.21444452);
		expect(Math.floatMul(6.6644, 3.3333)).toBe(22.21444452);
	});
	it('Math floatDiv', function(){
//		expect(22.21444452 / 3.3333).toBe(6.6644);
		expect(Math.floatDiv(22.21444452, 3.3333)).toBe(6.6644);
	});
	it('Math floorNum', function(){
		expect(Math.floorNum(22.21444452, 2)).toBe(22.21);
	});
}); 