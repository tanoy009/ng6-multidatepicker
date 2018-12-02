# Angular 6 compatible Normal Datepciker along with Date range Calender with support of external data view
[![Build Status](https://travis-ci.org/tanoy009/ng6-multidatepicker.svg?branch=master)](https://travis-ci.org/tanoy009/ng6-multidatepicker)
[![codecov](https://codecov.io/gh/tanoy009/ng6-multidatepicker/branch/master/graph/badge.svg)](https://codecov.io/gh/tanoy009/ng6-multidatepicker)
[![npm version](https://badge.fury.io/js/ng6-multidatepicker.svg)](http://badge.fury.io/js/ng6-multidatepicker)
[![devDependency Status](https://david-dm.org/tanoy009/ng6-multidatepicker/dev-status.svg)](https://david-dm.org/tanoy009/ng6-multidatepicker?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/tanoy009/ng6-multidatepicker.svg)](https://github.com/tanoy009/ng6-multidatepicker/issues)
[![GitHub stars](https://img.shields.io/github/stars/tanoy009/ng6-multidatepicker.svg)](https://github.com/tanoy009/ng6-multidatepicker/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/tanoy009/ng6-multidatepicker/master/LICENSE)

## Demo
https://tanoy009.github.io/ng6-multidatepicker/

## Test Case.
In Pipeline will be updated in a while.

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Development](#development)
- [License](#license)

## About

angular 6 compatible multipurpose calendar with external data integration support and AOT enabled

## Installation

Install through npm:
```
npm install --save ng6-multidatepicker
```

Then include in your apps module:

```typescript
import { Component, NgModule } from '@angular/core';
import { Ng6DatepickerModule } from 'ng6-multidatepicker';

@NgModule({
  imports: [
    Ng6DatepickerModule.forRoot()
  ]
})
export class MyModule {}
```

Finally use in one of your apps components:
```typescript
import { Component } from '@angular/core';

@Component({
  template: '<ng6multi-datepicker (dateCallback)="dateCallback($event)"></ng6multi-datepicker>'
})
export class MyComponent {
	dateCallback(selectedDate: any) {
    //selectedDate will be a object which will give the selected date.
		//do any necessery stuff.
	}
}
```

List of settings that can be used to configure the module (all config. are optional):
```typescript
	uiSettings = {
    dateDisplayFormat: 'EEEE, MMM d, y',  //Any kind of date format will work i.e supported my native angular date filter pipe
    gridLayout: true,                     //Grid layout for the calendar (Default: true)
    disableYearMonthDropdown: false,      //We can disable the Year and month dropdown according to the need (Default: false)
    verticalInputAlignment: false,        //Vertical alignment of the two input box (Default: false)
    disableTooltip: false,                //Flag to disable the cell tooltip
    monthToShow: 2,                       //Number of months to be visible in the UI (Default: 2)
    fontSize: 14,                         //Font size of the date (Default: 14)
    individualCalendarCellWidth: 48,      //config to change the cell width
    individualCalendarCellHeight: 32,     //config to change the cell height
    selectedCellColor: '#3dbfd3',         //config to change the user selected cell color
    hoverCellColor: '#97f1ff'             //config to change the cell hover color
  };

  uiInputSettings = {
    fromDateWidth: '50%',                 //config to change the from date input box width
    fromDatePlaceholder: 'From Date',     //config to change the from date placeholder text (Default: 'From Date')
    fromDateLabelText: 'Select From Date',//config to change the from date label text (Default: 'Select From Date')
    fromDateLabelHide: false,             //config to hide the from date label (Default: false)
    fromDateMargin: '0',                  //config to set the from date input box margin if required (Default: 0)
    toDateWidth: '50%',                   //config to change the to date input box width
    toDatePlaceholder: 'To Date',         //config to change the to date placeholder text (Default: 'To Date')
    toDateLabelText: 'Select To Date',    //config to change the to date label text (Default: 'Select To Date')
    toDateLabelHide: false,               //config to hide the to date label (Default: false)
    toDateMargin: '0'                     //config to set the to date input box margin if required (Default: 0)
  };

  minDate                                 //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT) (Default is current system date)
  maxDate                                 //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT) (Default is 20 years from min date)
  defaultFromDate                         //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT)
  defaultToDate                           //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT)
  enableRangeSelect = true;               //config to enable and disable range select (Default: true)
  maximumDayInRange = 0;                  //config to set maximum range to which the user can select. (Default: 0 i.e no limit)
  isExternalDataAvailable = true;         //config to be set true if any external data to be shown inside the calendar
  promiseData?: Observable<any>;          //config to be used when 'isExternalDataAvailable' is set to true and the input should be an observable who returns data according to the format mentioned in doc.
  @Output()
  dateCallback                            //this output method will be called whenever user selects a date i.e either from date or to date or both.
  @Output()
  externalDataCallback                    //this output method will be called whenever a any month or year is changed to get the fresh latest data to be shown in the calender.
```
#### NOTE: 'defaultFromDate' and 'defaultToDate' can only be changed after component initialization. 'promiseData' should always return an observable. Please see the below code for better understanding.
```typescript
  import { Component } from '@angular/core';
  import { Observable } from 'rxjs';

  @Component({
    template: '<ng6multi-datepicker [promiseData]="ObservableObj" (externalDataCallback)="externalDataFetchCallback($event)"></ng6multi-datepicker>'
  })
  export class MyComponent {
    public ObservableObj: Observable<any>;

    returnFetchedData(data: any) {
      this.ObservableObj = new Observable((observer) => {
        // observable execution
        observer.next(data);
        observer.complete();
      });
    }

    externalDataFetchCallback(event: any) {
      //function to be called by component whenever there is a month or year change occurs.
      console.log(event);
      //after fetching necessary data via ajax call, call the below function
      //the format of the data should be in the below format(STRICT). Key should be any valid date string or date in millisecond.
      data = {
        '12/02/2019': {
          'key': 'price',                                     
          'value': '$500',                                    //value to be shown inside the calendar date cell
          'additionalTooltipMsg': 'any html or normal text',  //tooltip text to be shown while hover.(It can be any html with inline css or any normal text)
          'color': '#E62017'                                  //specific value color for the value. (default: black)
        },
        '13/02/2019': {
          'key': 'price',
          'value': '$200',
          'additionalTooltipMsg' : '',
          'color': '#E62017'
        }
      }
      this.returnFetchedData(data);
    }
  }
```

### You may also find it useful to view the [demo source](https://github.com/tanoy009/ng4-geoautocomplete/blob/master/demo/demo.component.ts).

### You can use it with system js as well

`'ng6-multidatepicker': 'npm:ng6-multidatepicker/bundles/ng6-multidatepicker.umd.js'`

### Usage without a module bundler
```
<script src="node_modules/ng6-multidatepicker/bundles/ng6-multidatepicker.umd.js"></script>
<script>
    // everything is exported ng6Calendar namespace
</script>
```

## Documentation
All documentation is auto-generated from the source via [compodoc](https://compodoc.github.io/compodoc/) and can be viewed here:
https://tanoy009.github.io/ng6-multidatepicker/docs/

## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM
* Install local dev dependencies: `npm install` while current directory is this repo

### Development server
Run `npm start` to start a development server on port 8000 with auto reload + tests.

### Testing
Run `npm test` to run tests once or `npm run test:watch` to continually run tests.

### Release
* Bump the version in package.json (once the module hits 1.0 this will become automatic)
```bash
npm run release
```

## License

MIT
