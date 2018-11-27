import { Component, PLATFORM_ID, Inject, Input, Output, EventEmitter, OnInit, OnChanges, ElementRef } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalRef } from './windowRef.service';
import { CalendarService } from './calendar.service';
import { Observable } from 'rxjs';

export interface Settings {
  geoPredictionServerUrl?: string;
  geoLatLangServiceUrl?: string;
  geoLocDetailServerUrl?: string;
  geoCountryRestriction?: any;
  geoTypes?: any;
  geoLocation?: any;
  geoRadius?: number;
  serverResponseListHierarchy?: any;
  serverResponseatLangHierarchy?: any;
  serverResponseDetailHierarchy?: any;
  resOnSearchButtonClickOnly?: boolean;
  useGoogleGeoApi?: boolean;
  inputPlaceholderText?: string;
  inputString?: string;
  showSearchButton?: boolean;
  showRecentSearch?: boolean;
  showCurrentLocation?: boolean;
  recentStorageName?: string;
  noOfRecentSearchSave?: number;
  currentLocIconUrl?: string;
  searchIconUrl?: string;
  locationIconUrl?: string;
}

@Component({
  selector: 'ng4multi-calendar',
  templateUrl: './src/calendar.html',
  styleUrls: ['./src/calendar.css'],
})
export class CalendarComponent implements OnInit,OnChanges {
  @Input() minDate?: any;                                   //In Format MM/DD/YYYY as string or a Date object or time in millisecond; (STRICT) (Default is current system date)
  @Input() maxDate?: any;                                 //In Format MM/DD/YYYY as string or a Date object or time in millisecond; (STRICT) (Default is 20 years from current system date)
	@Input() monthToShow?: number = 2;                      //Number of months to be visible in the UI (Default: 1)
  @Input() sideBySide?: boolean = true;                   //Number of months to be visible in the UI Horizontally (Default: 1)
	@Input() enableRangeSelect?: boolean = true;            //Number of months to be visible in the UI Horizontally (Default: 1)
	@Input() fontSize?: number = 14;                        //Number of months to be visible in the UI Horizontally (Default: 1)
  @Input() maximumDayInRange?: number = 10                //If range is selected then the maximum range to which the user can select.
  @Input() gridLayout?: boolean = true                   //If Grid layout for the calendar (Default: true)
  @Input() disableYearMonthDropdown: boolean = false;     //We can disable the Year and month dropdown accoording to the need (Default: false)
  @Input() verticalInputAlignment: boolean = false;       //Vertical alignment of the two input box (Default: false)
  @Input() dateDisplayFormat: string = 'EEEE, MMM d, y';  //Any kind of date format will work i.e supported my native angular date filter pipe
  @Input() isExternalDataAvailable: boolean = true;
  @Input() promiseData?: Observable<any>;
  @Output()
  externalDateCallback: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  dateCallback: EventEmitter<any> = new EventEmitter<any>();
	public _appConstant: any = {
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: [{
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
    }]
  };
  public minYear: number;
  public maxYear: number;
	public defaultDays: any = this._appConstant.days;
	public years: any = [];
	public months: any = this._appConstant.months;
	public dateObj: any = {};
	public userDateSelected: any = [];
  public individualCalendarWidth: number = 0;
  public calenderHideFlag: boolean = true;
  public fromTimeClicked: boolean = false;
  public toTimeClicked: boolean = false;
  public rangeSelected: any = {
    from: {},
    to: {}
  };
  public calenderPosition = {top: 0,left:0};
  public defaultCalenderWidth = 336;
  public individualCalendarCellWidth = 45;
  public individualCalendarCellHeight = 35;
  externalData: any = {};
	selectMonthDropdown: number = 0;
	selectYearDropdown: number = 0;
	currentDate: any = new Date();
	currentMonth: number = this.currentDate.getMonth();
	currentYear: number = this.currentDate.getFullYear();
	currentDay: number = this.currentDate.getDate();
	startDay: number = this.currentDay;
	startMonth: number = this.currentMonth;
	startYear: number = this.currentYear;
	noOfCalenderView: any = [];
	constructor(private _elmRef: ElementRef, private sanitizer: DomSanitizer) {}

	ngOnInit(): any {

    //check if monthTOShow should be equal or more then 1
    if(this.monthToShow < 0) {
      this.monthToShow = 1;
      console.warn("Minimum value for monthToShow should be equal or more then 1");
    }
    if (this.sideBySide) {
      this.individualCalendarWidth = Math.floor(100 / this.monthToShow);
    }else {
      this.individualCalendarWidth = 100;
    }

		if (this.minDate) {
			this.minDate = new Date(this.minDate);
		} else {
			this.minDate = new Date();
    }

    if (this.maxDate) {
			this.maxDate = new Date(this.maxDate);
		} else {
      //default 20 years from the current date if max Date is not given.
			this.maxDate = new Date(this.minDate.getTime()+630720000000);
    }

    //check if minDate is less then max date and vice versa
    if(!this.isPastDate(this.minDate.getDate(), this.minDate.getMonth(), this.minDate.getFullYear(), this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate())) {
      console.error("From Date is more then To date");
      return;
    }

		this.startMonth = this.minDate.getMonth();
		this.startYear = this.minDate.getFullYear();
    this.startDay = this.minDate.getDate();

    //below condition checks for validity of max and min year.
    this.minYear = this.startYear;
    this.maxYear = this.maxDate.getFullYear();


		if (this.startYear > this.maxYear) {
			this.startYear = this.maxYear;
		}
		//below code generate year dropdown and also generate initial calendar
		this.generateYears(this.minYear, this.maxYear);
		this.generateInitialCalander(this.monthToShow, this.startMonth, this.startYear);
  }

  ngOnChanges(changes:any):void {
    if(this.isExternalDataAvailable && changes.promiseData && changes.promiseData.currentValue) {
      this.promiseData.subscribe(data =>{
        console.log("in subscribe Data");
        console.log(data);
        this.externalData = data;
        this.integrateAsyncDataWithCurrentView();
      })
    }
  }

	public generateYears(minYear: number, maxYear: number): void {
		this.years = [];
		for (let i: number = minYear; i <= maxYear; i++) {
			this.years.push(i);
		}
	}

	generateInitialCalander(noOfMonths: number, month: number, year: number): void {
		this.noOfCalenderView = [];
		this.dateObj = [];
		for (let i: number = 0; i < noOfMonths; i++) {
			let _month: number = month + i;
			let _year: number = year;
			if (_month > 11) {
				_month = 0;
				_year = _year + 1;
			}
			this.setMonthly(_month, _year);
			this.noOfCalenderView.push(_year + '-' + _month);
		}
		// code to initialise the month and year dropdown modal value selection
		this.selectYearDropdown = parseInt(this.noOfCalenderView[0].split('-')[0]);
		this.selectMonthDropdown = parseInt(this.noOfCalenderView[0].split('-')[1]);
	}

	public isPastDate(day: number, month: number, year: number, startYear: number, startMonth: number, startDay: number): boolean {
		// function to check if a date is a past date from current date.
		let _isPast: boolean = false;
		if (year < startYear) {
			_isPast = true;
		} else if ((month < startMonth) && (year <= startYear)) {
			_isPast = true;
		} else if ((day < (startDay - 1)) && (month <= startMonth) && (year <= startYear)) {
			_isPast = true;
		}
		return _isPast;
	}

	public isCurrentDate(day: number, month: number, year: number): boolean {
		// function to check if a date is a current date
		if (((day + 1) === this.currentDay) && (month === this.currentMonth) && (year === this.currentYear)) {
			return true;
		}
		return false;
	}

	public daysInMonth(month: number, year: number): number {    //month starts from 0 to 11;
		// function to calculate and return total number of days present in a month.
		let _monthStart: any = new Date(year, month, 1);
		let _monthEnd: any = new Date(year, month + 1, 1);
		let _monthLength: number = (_monthEnd - _monthStart) / (1000 * 60 * 60 * 24);
		return _monthLength;
	}

	public getTotalDaysNumber(dayNumber: number, month: number, year: number): number {
		// function to get total number of days starting from 1st jan of a year to the passed month of the same year.
		let _yearStartDate: any = new Date(year, 0, 1);
		let _monthEnd: any = new Date(year, month, dayNumber + 1);
		let _totalLength: number = (_monthEnd - _yearStartDate) / (1000 * 60 * 60 * 24);
		return _totalLength + 1; //addition of one value is done to sync with backend api
	}

	public setDayObject(dayNumber: number, month: number, year: number): object {
    // function to set and generate day object for the calendar.
    let _startDate = {
      'day': this.minDate.getDate(),
      'month': this.minDate.getMonth(),
      'year': this.minDate.getFullYear()
    }
    let _endDate = {
      'day': this.maxDate.getDate(),
      'month': this.maxDate.getMonth(),
      'year': this.maxDate.getFullYear()
    }
		let _dayObj: any = {
			'day': dayNumber + 1,
      'month': month,
      'year' : year,
      'dateInMillisecond': new Date(year + '-' + (month + 1) + '-' + (dayNumber + 1)).getTime(),
			'isDisabled': false,
			'isCurrent': this.isCurrentDate(dayNumber, month, year),
			'isSelected': false,
      'isHovered': false,
      'isDateRangeExceeded': false,
      'data': {
        'key': '',
        'value': 0,
        'color': '',
        'additionalTooltipMsg': ''
      }
    };
    _dayObj.isDisabled = !this.dateValidityCheck(_startDate, _endDate, _dayObj);
    _dayObj.isDateRangeExceeded = this.isInDateRange(_dayObj);
    _dayObj = this.setExternalDataWithEachDayObj(_dayObj);
		return _dayObj;
	}

	public setMonthly(month: number, year: number): void {
		// function to set a month data in an object againt the passed argument value.
		if (!this.dateObj[year + '-' + month]) {
			this.dateObj[year + '-' + month] = [];
			let index: number = 0;
			let dayQty: number = this.daysInMonth(month, year);
			let firstDay: any = new Date(year, month, 1, 0, 0, 0, 0).getDay();
			let _tempArray: any = [];
			for (var i: number = 0; i < firstDay; i++) {
				_tempArray.push({});
			}
			this.dateObj[year + '-' + month].push(_tempArray);
			for (let dayNumber = 0; dayNumber < dayQty; dayNumber++) {
				this.setDayObject(dayNumber, month, year);
				let _dayObj: any = this.setDayObject(dayNumber, month, year);
				if (((dayNumber + firstDay) >= 7) && ((dayNumber + firstDay) % 7 === 0)) {
					this.dateObj[year + '-' + month].push([]);
					index = index + 1;
				}
				this.dateObj[year + '-' + month][index].push(_dayObj);
			}
		}
	}


	public generateMonth(year: number, month: number, status?: any): void {
		// function to generate month data on demand and display it
		if ((month < 0) && (status === 'pre')) {
			month = 11;
			year = year - 1;
		} else if ((month > 11) && (status === 'next')) {
			if (month > 11) {
				month = 0;
				year = year + 1;
			}
		}
		this.setMonthly(month, year);
		if (status === 'pre') {
			this.noOfCalenderView.unshift(year + '-' + month);
			this.noOfCalenderView.pop();
		} else {
			this.noOfCalenderView.push(year + '-' + month);
			this.noOfCalenderView.shift();
		}
		//code to update the month and year dropdown
		this.selectYearDropdown = parseInt(this.noOfCalenderView[0].split('-')[0]);
		this.selectMonthDropdown = parseInt(this.noOfCalenderView[0].split('-')[1]);
	}


	public setPrevMonth(): void {
		// FUNCTION BINDED WITH VIEW. Calander to go to previous month
		let month: number = parseInt(this.noOfCalenderView[0].split('-')[1]);
		let year: number = parseInt(this.noOfCalenderView[0].split('-')[0]);
		month = month - 1;
		this.generateMonth(year, month, 'pre');
	}

	public setNextMonth(): void {
		// FUNCTION BINDED WITH VIEW. Calander to go to next month
		let month: number = parseInt(this.noOfCalenderView[this.noOfCalenderView.length - 1].split('-')[1]);
		let year: number = parseInt(this.noOfCalenderView[this.noOfCalenderView.length - 1].split('-')[0]);
		month = month + 1;
		this.generateMonth(year, month, 'next');
	}

	public yearChange(year: any): void {
		// FUNCTION BINDED WITH VIEW. Calendar to go to the selected year
		year = parseInt(year);
		let month: number = parseInt(this.noOfCalenderView[0].split('-')[1]);
		for (let i: number = 0; i < this.noOfCalenderView.length; i++) {
			let _month: number = month + i;
			let _year: number = year;
			if (_month > 12) {
				_year = _year + 1;
				_month = _month - 12;
			}
			this.generateMonth(_year, _month, 'next');
		}
	}

	public monthChange(month: any): void {
		// FUNCTION BINDED WITH VIEW. Calendar to go to the selected month
		month = parseInt(month);
		let year: number = parseInt(this.noOfCalenderView[0].split('-')[0]);
		for (let i: number = 0; i < this.noOfCalenderView.length; i++) {
			let _month: number = month + i;
			let _year: number = year;
			if (_month > 12) {
				_year = year + 1;
				_month = _month - 12;
			}
			this.generateMonth(_year, _month, 'next');
		}
  }

  public daysInBetween = function(date1_ms, date2_ms) {
    var one_day=1000*60*60*24;    // One day in milliseconds
    var difference_ms = date2_ms - date1_ms;        // Convert back to days and return
    return Math.round(difference_ms/one_day) + 1;
  }

	public dateClicked(dayObject: any, days: any): void {
    if (!this.enableRangeSelect) {
      if (!dayObject.isSelected && this.userDateSelected.isSelected) {
        this.userDateSelected.isSelected = false;
      }
      dayObject.isSelected = true;
      this.userDateSelected = dayObject;
      let _tempDate: string = dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day;
      this.dateCallback.emit(_tempDate);
    }else {
      if(this.fromTimeClicked) {
        dayObject.isSelected = true;
        if(this.rangeSelected.from.day) {
          this.rangeSelected.from.day.isSelected = false;
        }
        this.rangeSelected.from = {'day': dayObject, 'date': dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day};
        if(this.rangeSelected.to.day) {
          var _toDatObj = Object.assign({}, this.rangeSelected.to.day);
          var _tempPastDate = this.isPastDate(dayObject.day, dayObject.month, dayObject.year, _toDatObj.year, _toDatObj.month, _toDatObj.day);
          var _insideLimit = !this.maximumDayInRange || (this.daysInBetween(this.rangeSelected.from.day.dateInMillisecond , _toDatObj.dateInMillisecond) <= this.maximumDayInRange);
          if(!_tempPastDate || !_insideLimit) {
            this.rangeSelected.to.day.isSelected = false;
            this.rangeSelected.to = {};
            this.removeDateHovered();
          }else {
            this.datehovered(_toDatObj, true);
          }
        }
        this.toDatePopupOpenCoords();
        this.toTimeClicked = true;
        this.fromTimeClicked = false;
      }else if(this.toTimeClicked){
        var _fromDatObj = Object.assign({}, this.rangeSelected.from.day);
        var _tempPastDate = this.isPastDate(dayObject.day, dayObject.month, dayObject.year, _fromDatObj.year, _fromDatObj.month, _fromDatObj.day);
        if(_tempPastDate) {
          if(this.rangeSelected.from.day) {
            this.rangeSelected.from.day.isSelected = false;
          }
          if(this.rangeSelected.to.day) {
            this.rangeSelected.to.day.isSelected = false;
          }
          dayObject.isSelected = true;
          this.rangeSelected.from = {'day': dayObject, 'date': dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day};
          this.rangeSelected.to = {};
          this.datehovered(dayObject, true);
        }else {
          //condition to check if the selected to time is within the maximum day range selected.
          if(!this.maximumDayInRange || this.daysInBetween(this.rangeSelected.from.day.dateInMillisecond , dayObject.dateInMillisecond) <= this.maximumDayInRange) {
            if(this.rangeSelected.to.day) {
              this.rangeSelected.to.day.isSelected = false;
            }
            dayObject.isSelected = true;
            this.rangeSelected.to = {'day': dayObject, 'date': dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day};
            this.datehovered(dayObject, true);
            // scope.calenderHideFlag = true;
          }
        }
      }
      this.checkIfDateInDateRange();
      this.componentCallback();
    }
	}

  dateValidityCheck(fromDate: any, toDate: any, selectedDate: any) {
    let _currentDate: any = (selectedDate.month + 1) + '/' +  selectedDate.day + '/' + selectedDate.year;
    _currentDate = new Date(_currentDate);
    let _minDate: any = (fromDate.month + 1) + '/' +  fromDate.day + '/' + fromDate.year;
    _minDate = new Date(_minDate);
    let _maxDate: any = (toDate.month + 1) + '/' +  toDate.day + '/' + toDate.year;
    _maxDate = new Date(_maxDate);
    if (_currentDate > _minDate && _currentDate < _maxDate ) {
      return true;
    }else {
      return false;
    }
  }

  isInDateRange(dayObject: any) {
    if(this.fromTimeClicked || !this.maximumDayInRange || dayObject.isDisabled) {
      return false;
    }else {
      if(this.rangeSelected.from.day) {
        if(this.daysInBetween(this.rangeSelected.from.day.dateInMillisecond , dayObject.dateInMillisecond) <= this.maximumDayInRange) {
          return false;
        }else {
          return true;
        }
      }else {
        return false;
      }
    }
  }

  datehovered(dayObject: any, forceExecute?: boolean): void {
    if (this.enableRangeSelect && this.rangeSelected.from.day && (!this.rangeSelected.to.day || forceExecute)) {
      let _months: any = Object.keys(this.dateObj);
      for(let i: number = 0; i < _months.length; i++) {
        for  (let j: number = 0; j < this.dateObj[_months[i]].length; j++) {
          for (let k: number = 0; k < this.dateObj[_months[i]][j].length; k++) {
            if (this.dateObj[_months[i]][j][k].day && !this.dateObj[_months[i]][j][k].isDisabled && !this.dateObj[_months[i]][j][k].isDateRangeExceeded) {
              let _fromDatObj: any = Object.assign({}, this.rangeSelected.from.day);
              let _dateObj: any = Object.assign({}, this.dateObj[_months[i]][j][k]);
							let _dateValid: boolean = false;
              _dateValid = this.dateValidityCheck(_fromDatObj, dayObject, _dateObj);
              if (_dateValid) {
                this.dateObj[_months[i]][j][k].isHovered = true;
              }else {
                this.dateObj[_months[i]][j][k].isHovered = false;
              }
            }
          }
        }
      }
    }
  }

  checkIfDateInDateRange(forceDisableFlag?: boolean): void {
    if (this.enableRangeSelect) {
      let _months: any = Object.keys(this.dateObj);
      for(let i: number = 0; i < _months.length; i++) {
        for  (let j: number = 0; j < this.dateObj[_months[i]].length; j++) {
          for (let k: number = 0; k < this.dateObj[_months[i]][j].length; k++) {
            if(forceDisableFlag) {
              this.dateObj[_months[i]][j][k].isDateRangeExceeded = false;
            }else if (this.dateObj[_months[i]][j][k].day && !this.dateObj[_months[i]][j][k].isDisabled) {
              this.dateObj[_months[i]][j][k].isDateRangeExceeded = this.isInDateRange(this.dateObj[_months[i]][j][k]);
            }
          }
        }
      }
    }
  }

  removeDateHovered(): void {
    if (this.enableRangeSelect && this.rangeSelected.from.day && !this.rangeSelected.to.day) {
      let _months: any = Object.keys(this.dateObj);
      for(let i: number = 0; i < _months.length; i++) {
        for  (let j: number = 0; j < this.dateObj[_months[i]].length; j++) {
          for (let k: number = 0; k < this.dateObj[_months[i]][j].length; k++) {
            if (this.dateObj[_months[i]][j][k].day && !this.dateObj[_months[i]][j][k].isDisabled && this.dateObj[_months[i]][j][k].isHovered) {
              this.dateObj[_months[i]][j][k].isHovered = false;
            }
          }
        }
      }
    }
  }

  integrateAsyncDataWithCurrentView() {
    console.log('in integrated');
    console.log(this.externalData);
    if(this.dateObj) {
      for (let key in this.dateObj) {
        if (this.dateObj.hasOwnProperty(key)) {
          let monthObj = this.dateObj[key];
          monthObj.forEach((weekObj) => {
            weekObj.forEach((dayObj) => {
              console.log(dayObj);
              dayObj = this.setExternalDataWithEachDayObj(dayObj);
            })
          })
        }
      }
    }
    console.log(this.dateObj);
  }

  setExternalDataWithEachDayObj(dayObj) {
    if((typeof(this.externalData) == 'object') && this.externalData[dayObj.year]) {
      var year = dayObj.year;
      var month = dayObj.month;
      var day = dayObj.day;
      dayObj.anomalyLoading = false;
      dayObj.data.key = this.externalData[year] ? (this.externalData[year][month] ? (this.externalData[year][month][day] ? this.externalData[year][month][day].key: '') : '') : '';
      dayObj.data.value = this.externalData[year] ? (this.externalData[year][month] ? (this.externalData[year][month][day] ? this.externalData[year][month][day].value : 0) : 0) : 0;
      dayObj.data.color = this.externalData[year] ? (this.externalData[year][month] ? (this.externalData[year][month][day] ? this.externalData[year][month][day].color : '') : '') : '';
      dayObj.data.additionalTooltipMsg = this.externalData[year] ? (this.externalData[year][month] ? (this.externalData[year][month][day] ? (this.externalData[year][month][day].additionalTooltipMsg ? this.sanitizer.bypassSecurityTrustHtml(this.externalData[year][month][day].additionalTooltipMsg) :'') : '') : '') : '';
      // dayObj.scale = scope.scaleAnomalyData(dayObj.anomalyCount, dayObj.anomalyScore, year);
    }
    return dayObj;
  }

  fromDatePopupOpenCoords(){
    var coords = this._elmRef.nativeElement.querySelector('.js-calenderFromTime').getBoundingClientRect();
    if(this.verticalInputAlignment || !this.enableRangeSelect) {
      this.calenderPosition = {'top':coords.height + 20,'left':0};
    }else {
      this.calenderPosition = {'top':coords.height + 10,'left':0};
    }

  }

  toDatePopupOpenCoords() {
    var coords = this._elmRef.nativeElement.querySelector('.js-calenderToTime').getBoundingClientRect();
    var coordsFrom = this._elmRef.nativeElement.querySelector('.js-calenderFromTime').getBoundingClientRect();
    if(this.verticalInputAlignment) {
      this.calenderPosition = {'top':(coords.height+coordsFrom.height)+ 40,'left':0};
    }else {
      this.calenderPosition = {'top':coords.height+ 10,'left':coordsFrom.width + 2};
    }
  }


  singleDateClicked(): void {
    this.fromDatePopupOpenCoords();
    this.calenderHideFlag = false;
    this.fromTimeClicked = false;
    this.toTimeClicked = false;
  }

  fromDateClicked(): void {
    //FUNCTION BINDED WITH VIEW
    this.fromDatePopupOpenCoords();
    this.checkIfDateInDateRange(true)
    this.calenderHideFlag = false;
    this.fromTimeClicked = true;
    this.toTimeClicked = false;
  }

  toDateClicked(): void {
    //FUNCTION BINDED WITH VIEW
    this.toDatePopupOpenCoords();
    this.calenderHideFlag = false;
    this.fromTimeClicked = false;
    this.toTimeClicked = true;
  }

  //function to close the autocomplete list when clicked outside. (binded with view)
  public closeCalender(event: any): any {
    // this.calenderHideFlag = true;
    this.removeDateHovered();
  }

  componentCallback(): void {
    // console.log('in component callback');
    // console.log(this.rangeSelected);
    let _sendData: any = {};
    _sendData.dates = this.rangeSelected;
    _sendData.isNewDataNeeded = false;
    // console.log(this.dateObj);
    if(this.isExternalDataAvailable) {
      let years = [];
      for (var key in this.dateObj) {
        if (this.dateObj.hasOwnProperty(key)) {
          let _year = key.split('-')[0];
          if(years.indexOf(_year)<0) {
            years.push(_year);
          }
        }
      }
      _sendData.yearDataNeeded = years;
      _sendData.isNewDataNeeded = true;
    }
    this.dateCallback.emit(_sendData);
  }
}
