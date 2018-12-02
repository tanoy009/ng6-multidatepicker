import { Component } from '@angular/core';
import { Observable, observable } from 'rxjs';
import { asElementData } from '@angular/core/src/view';
import { sanitizeIdentifier } from '@angular/compiler';

@Component({
  selector: 'ng6multi-calendar-demoapp',
  templateUrl: './demo/demo.component.html'
})
export class DemoComponent {

	public componentData1: any = '';
  public componentData2: any = '';
  public componentData3: any = '';
  public componentData4: any = '';
  public componentData5: any = '';
  public componentData6: any = '';
  public componentData7: any = '';
  public componentData8: any = '';
  public componentData9: any = '';
  public componentData10: any = '';
  public componentData11: any = '';
  public externalDataFetchComponentCallback: any = '';
  public externalDataInputFormat: any  = {
    '11/03/2018': {
      'key': 'price',
      'value': '$600',
      'additionalTooltipMsg': '<div>Any tooltip message per cell</div>',
      'color': '#FD38AE'
    },
    '11/04/2018': {
      'key': 'price',
      'value': '$200',
      'additionalTooltipMsg': '',
      'color': '#FD38AE'
    }
  };
  public ObservableObj: Observable<any>;
  public userSettings2: any = {
    enableRangeSelect: false,
    uiInputSettings: {
      'fromDateLabelText': 'Select Date',
      'fromDatePlaceholder': 'Any custom placeholder Date'
    }
  };
  public userSettings3: any = {
    'minDate': '11/04/2018',
    'maxDate': '03/03/2019',
    'defaultFromDate': '11/08/2018',
    'defaultToDate': '12/12/2018'
  };
  public userSettings4: any = {
    'maximumDayInRange': 15
  };
  public userSettings5: any = {
    'uiSettings': {
      gridLayout: true,
      dateDisplayFormat: 'MMM d, y'
    }
  };
  public userSettings6: any = {
    'uiSettings': {
      fontSize: 10,
      disableYearMonthDropdown: true
    }
  };
  public userSettings7: any = {
    'uiSettings': {
      gridLayout: true,
      individualCalendarCellWidth: 70,
      individualCalendarCellHeight: 50,
      selectedCellColor: '#3AA757',
      hoverCellColor: '#7ed093'
    }
  };

  public userSettings8: any = {
    'uiSettings': {
      monthToShow: 1
    }
  };

  public userSettings9: any = {
    'uiInputSettings': {
      fromDateWidth: '40%',
      toDateWidth: '40%',
      fromDateMargin: '0 10px 0 0',
      toDateMargin: '0 0 0 10px'
    }
  };

  public userSettings10: any = {
    'uiSettings': {
      monthToShow: 1,
      verticalInputAlignment: true
    },
    'uiInputSettings': {
      fromDateMargin: '0 0 20px 0'
    }
  };

  public userSettings11: any = {
    'uiInputSettings': {
      fromDateWidth: '40%',
      toDateWidth: '40%',
      fromDateMargin: '0 10px 0 0',
      toDateMargin: '0 0 0 10px'
    },
    'uiSettings': {
      fontSize: 12,
      individualCalendarCellHeight: 38
    },
    isExternalDataAvailable: true,
    promiseData: 'this.ObservableObj'
  };

  constructor() {}

  mockCalenderDataGenerator(year: any, noOfDays: number): any {
    let _data: any = {};
    for (let p: number = 0; p < year.length; p++) {
      for (let i: number = 1; i <= 12; i++) {
        for (let j: number = 1; j < noOfDays; j++) {
            let _dateStr: string = i + '-' + j + '-' + year[p];
            let _date: any = new Date(_dateStr).getTime();
            _data[_date] = {
                'key': 'price',
                'value': '$' + Math.floor(Math.random() * 100) + 10,
                'additionalTooltipMsg': '<div>Any tooltip message</div>',
                'color': j < 10 ? '#E62017' : '#FD38AE'
            };
        }
      }
    }
    return _data;
  }

  fetchData(year: any): void {
    //instate of setTimeout, any ajax call can be made
    setTimeout(() => {
      this.ObservableObj = new Observable((observer) => {

        // observable execution
        // instate of mock data actual ajax data with described format should be fed ack to the calendar component.
        // data format
        // THE OBJECT KEY can be any valid date string like(MM/DD/YYYY) or date in millisecond.
        this.externalDataInputFormat = {
          '11/03/2018': {
            'key': 'price',
            'value': '$600',
            'additionalTooltipMsg': '<div>Any tooltip message per cell</div>',
            'color': '#FD38AE'
          },
          '11/04/2018': {
            'key': 'price',
            'value': '$200',
            'additionalTooltipMsg': '',
            'color': '#FD38AE'
          }
        };
        let _mockData: any = this.mockCalenderDataGenerator(year, 25);
        observer.next(_mockData);
        observer.complete();
    });
    }, 1000);
  }

  externalDataFetchCallback(event: any): void {
    console.log('in external data fetch');
    console.log(event);
    this.fetchData(event.yearDataNeeded);
    this.externalDataFetchComponentCallback = JSON.stringify(event);
  }

  getCodeHtml(data: any): any {
    let _temp: any = JSON.stringify(data);
    _temp = _temp.split(',').join(',<br>');
    _temp = _temp.split('{').join('{<br>');
    _temp = _temp.split('}').join('<br>}');
    return _temp;
  }

  dateCallback1(data: any): void {
    console.log(data);
    this.componentData1 = JSON.stringify(data);
  }

  dateCallback2(data: any): void {
    console.log(data);
    this.componentData2 = JSON.stringify(data);
  }

  dateCallback3(data: any): void {
    console.log(data);
    this.componentData3 = JSON.stringify(data);
  }

  dateCallback4(data: any): void {
    console.log(data);
    this.componentData4 = JSON.stringify(data);
  }

  dateCallback5(data: any): void {
    console.log(data);
    this.componentData5 = JSON.stringify(data);
  }

  dateCallback6(data: any): void {
    console.log(data);
    this.componentData6 = JSON.stringify(data);
  }

  dateCallback7(data: any): void {
    console.log(data);
    this.componentData7 = JSON.stringify(data);
  }

  dateCallback8(data: any): void {
    console.log(data);
    this.componentData8 = JSON.stringify(data);
  }

  dateCallback9(data: any): void {
    console.log(data);
    this.componentData9 = JSON.stringify(data);
  }

  dateCallback10(data: any): void {
    console.log(data);
    this.componentData10 = JSON.stringify(data);
  }

  dateCallback11(data: any): void {
    console.log(data);
    this.componentData11 = JSON.stringify(data);
  }
}
