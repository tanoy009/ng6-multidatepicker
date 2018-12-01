import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ng6CalendarDateFormat'
})
export class Ng6CalendarDateFormatPipe implements PipeTransform {
  transform(value: any, args1?: number): string {
  	value = value.split('-');
  	let days: any = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Satday'];
  	let filter: string = '';
		let monthArr: any = [{
      'text': 'January',
      'value': 0
    }, {
      'text': 'February',
      'value': 1
    }, {
      'text': 'March',
      'value': 2
    }, {
      'text': 'April',
      'value': 3
    }, {
      'text': 'May',
      'value': 4
    }, {
      'text': 'June',
      'value': 5
    }, {
      'text': 'July',
      'value': 6
    }, {
      'text': 'August',
      'value': 7
    }, {
      'text': 'September',
      'value': 8
    }, {
      'text': 'October',
      'value': 9
    }, {
      'text': 'November',
      'value': 10
    }, {
      'text': 'December',
      'value': 11
    }];
	  let _year: number = parseInt(value[0]);
	  let _month: number = parseInt(value[1]);
	  let _dayOfWeek: any = '';
	  if (args1) {
	  	_dayOfWeek = new Date(_year, _month, args1, 0, 0, 0, 0).getDay();
	  	_dayOfWeek = days[_dayOfWeek];
	  }
	  for (let i: number = 0; i < monthArr.length; i++) {
	  	if (monthArr[i].value === _month) {
	  		if (_dayOfWeek) {
	  			filter = _dayOfWeek + ', ' + monthArr[i].text + ' ' + args1 + ', ' + _year;
	  		} else {
	  			filter = monthArr[i].text + ', ' + _year;
	  		}
	  		break;
	  	}
	  }
    return filter;
  }
}
