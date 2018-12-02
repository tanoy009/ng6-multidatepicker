import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { GlobalRef } from './windowRef.service';
import { Observable } from 'rxjs';

@Injectable()
export class DatepickerService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
  private _global: GlobalRef) {

  }

  processExternalData(rawDate: any): Observable<any> {
    return new Observable((observer) => {
      let data: any = this.restructureData(rawDate);
      observer.next(data);
      observer.complete();
    });
  }

  private restructureData(rawData: any): any {
    let _processedData: any = {};
    if (rawData && (typeof(rawData) === 'object')) {
      let _keys: any = Object.keys(rawData);
      _keys.forEach((key) => {
        let _keyNum: any = isNaN(key);
        if (!_keyNum) {
          _keyNum = parseInt(key);
        } else {
          _keyNum = key;
        }
        let _date: any = new Date(_keyNum);
        if (_date + '' !== 'Invalid Date') {
          _date = new Date(_date.setHours(0, 0, 0, 0));
          let _year: number = _date.getFullYear();
          let _month: number = _date.getMonth();
          let _day: number = _date.getDate();
          if (!_processedData[_year]) {
            _processedData[_year] = {};
          }
          if (!_processedData[_year][_month]) {
            _processedData[_year][_month] = {};
          }
          _processedData[_year][_month][_day] = rawData[_keyNum];
        }
      });
    }
    return _processedData;
  }
}
