import { Component, PLATFORM_ID, SimpleChanges, Input, Output, EventEmitter, OnInit, OnChanges, ElementRef, Inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalRef } from './windowRef.service';
import { CalendarService } from './calendar.service';
import { Observable } from 'rxjs';

export interface  IuiSettings {
  dateDisplayFormat: string;            //Any kind of date format will work i.e supported my native angular date filter pipe
  gridLayout: boolean;                  //Grid layout for the calendar (Default: true)
  disableYearMonthDropdown: boolean;    //We can disable the Year and month dropdown according to the need (Default: false)
  verticalInputAlignment: boolean;      //Vertical alignment of the two input box (Default: false)
  disableTooltip: boolean;              //Flag to disable the cell tooltip
  monthToShow: number;                  //Number of months to be visible in the UI (Default: 2)
  fontSize: number;                     //Font size of the date (Default: 14)
  individualCalendarCellWidth: number;  //config to change the cell width
  individualCalendarCellHeight: number; //config to change the cell height
  selectedCellColor: string;            //config to change the user selected cell color
  hoverCellColor: string;               //config to change the cell hover color
}

export interface IuiInputSettings {
  fromDateWidth: string;                //config to change the from date input box width
  fromDatePlaceholder: string;          //config to change the from date placeholder text (Default: 'From Date')
  fromDateLabelText: string;            //config to change the from date label text (Default: 'Select From Date')
  fromDateLabelHide: boolean;           //config to hide the from date label (Default: false)
  fromDateMargin: string;               //config to set the from date input box margin if required (Default: 0)
  toDateWidth: string;                  //config to change the to date input box width
  toDatePlaceholder: string;            //config to change the to date placeholder text (Default: 'To Date')
  toDateLabelText: string;              //config to change the to date label text (Default: 'Select To Date')
  toDateLabelHide: boolean;             //config to hide the to date label (Default: false)
  toDateMargin: string;                 //config to set the to date input box margin if required (Default: 0)
}

export interface IdateObject {
  'day': number;
  'month': number;
  'year' : number;
  'dateInMillisecond': number;
  'isDisabled': boolean;
  'isCurrent': boolean;
  'isSelected': boolean;
  'isHovered': boolean;
  'isMouseHover': boolean;
  'isDateRangeExceeded': boolean;
  'data': any;
}

@Component({
  selector: 'ng6multi-calendar',
  templateUrl: './src/calendar.html',
  styleUrls: ['./src/calendar.css'],
  host: {
    '(document:click)': 'closeAutocomplete($event)',
  }
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() uiSettings: IuiSettings = {
    dateDisplayFormat: 'EEEE, MMM d, y',
    gridLayout: false,
    disableYearMonthDropdown: false,
    verticalInputAlignment: false,
    disableTooltip: false,
    monthToShow: 2,
    fontSize: 14,
    individualCalendarCellWidth: 48,
    individualCalendarCellHeight: 32,
    selectedCellColor: '#3dbfd3',
    hoverCellColor: '#97f1ff'
  };
  @Input() uiInputSettings: IuiInputSettings = {
    fromDateWidth: '50%',
    fromDatePlaceholder: 'From Date',
    fromDateLabelText: 'Select From Date',
    fromDateLabelHide: false,
    fromDateMargin: '0',
    toDateWidth: '50%',
    toDatePlaceholder: 'To Date',
    toDateLabelText: 'Select To Date',
    toDateLabelHide: false,
    toDateMargin: '0'
  };
  @Input() minDate?: any;                                             //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT) (Default is current system date)
  @Input() maxDate?: any;                                             //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT) (Default is 20 years from min date)
  @Input() defaultFromDate?: any;                                     //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT)
  @Input() defaultToDate?: any;                                       //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT)
  @Input() enableRangeSelect?: boolean = true;                        //config for number of months to be visible in the UI Horizontally (Default: 1)
  @Input() maximumDayInRange?: number = 10;                           //config to set maximum range to which the user can select.
  @Input() isExternalDataAvailable?: boolean = true;                  //config to be set true if any external data to be shown inside the calendar
  @Input() promiseData?: Observable<any>;                             //config to be used when 'isExternalDataAvailable' is set to true and the input should be an observable who returns data according to the format mentioned in doc.
  @Output()
  dateCallback: EventEmitter<any> = new EventEmitter<any>();          //this output method will be called whenever user selects a date i.e either from date or to date or both.
  @Output()
  externalDataCallback: EventEmitter<any> = new EventEmitter<any>();  //this output method will be called whenever a any month or year is changed to get the fresh latest data to be shown in the calender.

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
  public calenderHideFlag: boolean = true;
  public fromTimeClicked: boolean = false;
  public toTimeClicked: boolean = false;
  public rangeSelected: any = {
    from: {},
    to: {}
  };
  public calenderPosition: any = {top: 0, left: 0};
  public defaultCalenderWidth: number = 0;
  ngInitInitializedFlag: boolean = false;
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
	constructor(
    private _elmRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sanitizer: DomSanitizer,
    private _global: GlobalRef,
    private _calendarService: CalendarService) {}

	ngOnInit(): void {
    //check if monthTOShow should be equal or more then 1
    if (this.uiSettings.monthToShow < 0) {
      this.uiSettings.monthToShow = 1;
      console.warn('Minimum value for monthToShow should be equal or more then 1');
    }

    //below code to determine the optimal calender width
    this.defaultCalenderWidth = (this.uiSettings.individualCalendarCellWidth * 7) + 10;

		if (this.minDate) {
			this.minDate = new Date(this.minDate);
		} else {
			this.minDate = new Date();
    }

    if (this.maxDate) {
			this.maxDate = new Date(this.maxDate);
		} else {
      //default 20 years from the min date if max Date is not given.
			this.maxDate = new Date(this.minDate.setHours(0, 0, 0, 0) + 630720000000);
    }

    //code to set the input width according to selection
    if (!this.enableRangeSelect) {
      this.uiInputSettings.fromDateWidth = '100%';
    }

    if (this.uiSettings.verticalInputAlignment && this.enableRangeSelect) {
      this.uiInputSettings.fromDateWidth = '100%';
      this.uiInputSettings.toDateWidth = '100%';
    }

    //check if minDate is less then max date and vice versa
    if (!this.isPastDate(this.minDate.getDate(), this.minDate.getMonth(), this.minDate.getFullYear(), this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate())) {
      console.error('From Date is more then To date');
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
    this.generateInitialCalender(this.uiSettings.monthToShow, this.startMonth, this.startYear);

    //below code to set default date if available during initialization
    if (this.defaultFromDate) {
      this.setDefaultDates(this.defaultFromDate, 0);
    }

    if (this.defaultToDate) {
      this.setDefaultDates(0, this.defaultToDate);
    }
    this.ngInitInitializedFlag = true;

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isExternalDataAvailable && changes.promiseData && changes.promiseData.currentValue) {
      this.promiseData.subscribe(data => {
        this._calendarService.processExternalData(data).subscribe((processedData) => {
          this.externalData = processedData;
          this.integrateAsyncDataWithCurrentView();
        });
      });
    }
    if (changes['defaultFromDate'] && this.ngInitInitializedFlag && (changes['defaultFromDate'].previousValue !== changes['defaultFromDate'].currentValue)) {
      this.setDefaultDates(this.defaultFromDate, 0);
    }
    if (changes['defaultToDate'] && this.ngInitInitializedFlag && (changes['defaultToDate'].previousValue !== changes['defaultToDate'].currentValue)) {
      if (this.rangeSelected.from.date) {
        this.setDefaultDates(0, this.defaultToDate);
      } else {
        console.error('"To date" cannot be default selected without "from date" selected');
      }

    }
  }

  //public functions binded with view
  //function to be called when any date is clicked my user.
	public dateClicked(dayObject: any): void {
    if (!this.enableRangeSelect) {
      if (!dayObject.isSelected && this.userDateSelected.isSelected) {
        this.userDateSelected.isSelected = false;
      }
      dayObject.isSelected = true;
      this.userDateSelected = dayObject;
      let _tempDate: string = dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day;
      this.dateCallback.emit(_tempDate);
    } else {
      if (this.fromTimeClicked) {
        if (this.rangeSelected.from.day) {
          this.rangeSelected.from.day.isSelected = false;
        }
        this.rangeSelected.from = {'day': dayObject, 'date': dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day};
        if (this.rangeSelected.to.day) {
          let _toDatObj: IdateObject = Object.assign({}, this.rangeSelected.to.day);
          let _tempPastDate: boolean = this.isPastDate(dayObject.day, dayObject.month, dayObject.year, _toDatObj.year, _toDatObj.month, _toDatObj.day);
          let _insideLimit: boolean = !this.maximumDayInRange || (this.daysInBetween(this.rangeSelected.from.day.dateInMillisecond , _toDatObj.dateInMillisecond) <= this.maximumDayInRange);
          if (!_tempPastDate || !_insideLimit) {
            this.rangeSelected.to.day.isSelected = false;
            this.rangeSelected.to = {};
            this.removeDateHovered();
          } else {
            this.dateHovered(_toDatObj, true);
          }
        }
        dayObject.isSelected = true;
        this.toDatePopupOpenCoords();
        this.toTimeClicked = true;
        this.fromTimeClicked = false;
      } else if (this.toTimeClicked) {
        let _fromDatObj: IdateObject = Object.assign({}, this.rangeSelected.from.day);
        let _tempPastDate: boolean = this.isPastDate(dayObject.day, dayObject.month, dayObject.year, _fromDatObj.year, _fromDatObj.month, _fromDatObj.day);
        if (!_fromDatObj.dateInMillisecond) {
          dayObject.isSelected = true;
          this.rangeSelected.from = {'day': dayObject, 'date': dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day};
          this.rangeSelected.to = {};
          this.dateHovered(dayObject, true);
        } else if (_tempPastDate) {
          if (this.rangeSelected.from.day) {
            this.rangeSelected.from.day.isSelected = false;
          }
          if (this.rangeSelected.to.day) {
            this.rangeSelected.to.day.isSelected = false;
          }
          dayObject.isSelected = true;
          this.rangeSelected.from = {'day': dayObject, 'date': dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day};
          this.rangeSelected.to = {};
          this.dateHovered(dayObject, true);
        } else if (dayObject.dateInMillisecond !== this.rangeSelected.from.day.dateInMillisecond) {
          //condition to check if the selected to time is within the maximum day range selected.
          if (!this.maximumDayInRange || this.daysInBetween(this.rangeSelected.from.day.dateInMillisecond , dayObject.dateInMillisecond) <= this.maximumDayInRange) {
            if (this.rangeSelected.to.day) {
              this.rangeSelected.to.day.isSelected = false;
            }
            dayObject.isSelected = true;
            this.rangeSelected.to = {'day': dayObject, 'date': dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day};
            this.dateHovered(dayObject, true);
            this.calenderHideFlag = true;
          }
        }
      }
      this.checkIfDateInDateRange();
      this.componentCallback();
    }
  }

  //public function to be called when any date cell is hovered.
  public dateHovered(dayObject: any, forceExecute?: boolean): void {
    if (this.enableRangeSelect && this.rangeSelected.from.day && (!this.rangeSelected.to.day || forceExecute)) {
      let _months: any = Object.keys(this.dateObj);
      _months.forEach((month) => {
        this.dateObj[month].forEach((weeks) => {
          weeks.forEach((day) => {
            if (day.day && !day.isDisabled && !day.isDateRangeExceeded) {
              let _fromDatObj: any = Object.assign({}, this.rangeSelected.from.day);
              let _dateObj: any = Object.assign({}, day);
							let _dateValid: boolean = false;
              _dateValid = this.dateValidityCheck(_fromDatObj, dayObject, _dateObj);
              if (_dateValid) {
                day.isHovered = true;
              } else {
                day.isHovered = false;
              }
            }
          });
        });
      });
    }
  }

  //function to be called when from date clicked and enableRangeSelect flag is disabled.
  public singleDateClicked(): void {
    this.fromDatePopupOpenCoords();
    this.calenderHideFlag = false;
    this.fromTimeClicked = false;
    this.toTimeClicked = false;
  }

  //function to be called when from date input is clicked and enableRangeSelect flag is enabled.
  public fromDateClicked(): void {
    //FUNCTION BINDED WITH VIEW
    this.fromDatePopupOpenCoords();
    this.checkIfDateInDateRange(true);
    if (this.calenderHideFlag) {
      this.externalDataFetchCallback();
    }
    this.calenderHideFlag = false;
    this.fromTimeClicked = true;
    this.toTimeClicked = false;
  }

  //function to be called when to date input is clicked and enableRangeSelect flag is enabled.
  public toDateClicked(): void {
    //FUNCTION BINDED WITH VIEW
    this.toDatePopupOpenCoords();
    if (this.calenderHideFlag) {
      this.externalDataFetchCallback();
    }
    this.calenderHideFlag = false;
    this.fromTimeClicked = false;
    this.toTimeClicked = true;
    if (this.enableRangeSelect && this.rangeSelected.from.day) {
      this.checkIfDateInDateRange();
    }
  }

  //function to be called when left arrow input is clicked.
  public setPrevMonth(): void {
		// FUNCTION BINDED WITH VIEW. Calander to go to previous month
		let month: number = parseInt(this.noOfCalenderView[0].split('-')[1]);
		let year: number = parseInt(this.noOfCalenderView[0].split('-')[0]);
		month = month - 1;
    this.generateMonth(year, month, 'pre');
    this.externalDataFetchCallback();
	}

  //function to be called when right arrow input is clicked.
	public setNextMonth(): void {
		// FUNCTION BINDED WITH VIEW. Calander to go to next month
		let month: number = parseInt(this.noOfCalenderView[this.noOfCalenderView.length - 1].split('-')[1]);
		let year: number = parseInt(this.noOfCalenderView[this.noOfCalenderView.length - 1].split('-')[0]);
		month = month + 1;
    this.generateMonth(year, month, 'next');
    this.externalDataFetchCallback();
	}

  //function to be called when year dropdown is changed.
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
    this.externalDataFetchCallback();
	}

  //function to be called when month dropdown is changed.
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
    this.externalDataFetchCallback();
  }

  //function to be called when any click event happens in the document.
  public closeAutocomplete(event: any): any {
    //below condition checks if click happened inside the calendar or outside.
    if (!this._elmRef.nativeElement.contains(event.target)) {
      this.calenderHideFlag = true;
      this.removeDateHovered();
    }
  }

  //components callbacks
  public componentCallback(): void {
    this.dateCallback.emit(this.rangeSelected);
    // console.log("callback");
    // console.log(this.dateObj);
  }

  //component callback when isExternalDataAvailable is set to true in order to get new data to be seen in the calendar.
  public externalDataFetchCallback(): void {
    let _sendData: any = {};
    if (this.isExternalDataAvailable) {
      let years: any = [];
      for (var key in this.dateObj) {
        if (this.dateObj.hasOwnProperty(key)) {
          let _year: string = key.split('-')[0];
          if (years.indexOf(_year) < 0) {
            years.push(_year);
          }
        }
      }
      _sendData.yearDataNeeded = years;
      this.externalDataCallback.emit(_sendData);
    }
  }

  //private functions start

  // function to check if a date is a past date from current date.
  private isPastDate(day: number, month: number, year: number, startYear: number, startMonth: number, startDay: number): boolean {
    let _isPast: boolean = false;
    if (year < startYear) {
      _isPast = true;
    } else if ((month < startMonth) && (year <= startYear)) {
      _isPast = true;
    } else if ((day < startDay) && (month <= startMonth) && (year <= startYear)) {
      _isPast = true;
    }
    return _isPast;
  }

  // function to check if a date is a current date
  private isCurrentDate(day: number, month: number, year: number): boolean {
    if (((day + 1) === this.currentDay) && (month === this.currentMonth) && (year === this.currentYear)) {
      return true;
    }
    return false;
  }

  // function to set and generate day object for the calendar.
  private setDayObject(dayNumber: number, month: number, year: number): IdateObject {
    let _startDate: object = {
      'day': this.minDate.getDate(),
      'month': this.minDate.getMonth(),
      'year': this.minDate.getFullYear()
    };
    let _endDate: object = {
      'day': this.maxDate.getDate(),
      'month': this.maxDate.getMonth(),
      'year': this.maxDate.getFullYear()
    };
    let _dayObj: IdateObject = {
      'day': dayNumber + 1,
      'month': month,
      'year' : year,
      'dateInMillisecond': new Date(year + '-' + (month + 1) + '-' + (dayNumber + 1)).setHours(0, 0, 0, 0),
      'isDisabled': false,
      'isCurrent': this.isCurrentDate(dayNumber, month, year),
      'isSelected': false,
      'isHovered': false,
      'isMouseHover': false,
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

  // function to set a month data in an object against the passed argument value.
  private setMonthly(month: number, year: number): void {
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
      for (let dayNumber: number = 0; dayNumber < dayQty; dayNumber++) {
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

  // function to calculate and return total number of days present in a month.
  private daysInMonth(month: number, year: number): number {    //month starts from 0 to 11;
    let _monthStart: any = new Date(year, month, 1);
    let _monthEnd: any = new Date(year, month + 1, 1);
    let _monthLength: number = (_monthEnd - _monthStart) / (1000 * 60 * 60 * 24);
    return _monthLength;
  }

  // function to calculate total number of days present between two dates.
  private daysInBetween(date1_ms: number, date2_ms: number): number {
    let one_day: number = 1000 * 60 * 60 * 24;    // One day in milliseconds
    let difference_ms: number = date2_ms - date1_ms;        // Convert back to days and return
    return Math.round(difference_ms / one_day) + 1;
  }

  // function to check if a date lays between two given dates.
  private dateValidityCheck(fromDate: any, toDate: any, selectedDate: any): boolean {
    let _currentDate: any = (selectedDate.month + 1) + '/' +  selectedDate.day + '/' + selectedDate.year;
    _currentDate = new Date(_currentDate);
    let _minDate: any = (fromDate.month + 1) + '/' +  fromDate.day + '/' + fromDate.year;
    _minDate = new Date(_minDate);
    let _maxDate: any = (toDate.month + 1) + '/' +  toDate.day + '/' + toDate.year;
    _maxDate = new Date(_maxDate);
    if (_currentDate > _minDate && _currentDate < _maxDate ) {
      return true;
    } else {
      return false;
    }
  }

  // function to check if a date in range of given date limits.
  private isInDateRange(dayObject: any): boolean {
    if (this.fromTimeClicked || !this.maximumDayInRange || dayObject.isDisabled) {
      return false;
    } else {
      if (this.rangeSelected.from.day) {
        if (this.daysInBetween(this.rangeSelected.from.day.dateInMillisecond , dayObject.dateInMillisecond) <= this.maximumDayInRange) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

  // function to set date object disabled if any date is exceeding the date range limit if set.
  private checkIfDateInDateRange(forceDisableFlag?: boolean): void {
    if (this.enableRangeSelect) {
      let _months: any = Object.keys(this.dateObj);
      for (let i: number = 0; i < _months.length; i++) {
        for (let j: number = 0; j < this.dateObj[_months[i]].length; j++) {
          for (let k: number = 0; k < this.dateObj[_months[i]][j].length; k++) {
            if (forceDisableFlag) {
              this.dateObj[_months[i]][j][k].isDateRangeExceeded = false;
            } else if (this.dateObj[_months[i]][j][k].day && !this.dateObj[_months[i]][j][k].isDisabled) {
              this.dateObj[_months[i]][j][k].isDateRangeExceeded = this.isInDateRange(this.dateObj[_months[i]][j][k]);
            }
          }
        }
      }
    }
  }

  // function to remove the date object hover false.
  private removeDateHovered(): void {
    if (this.enableRangeSelect && this.rangeSelected.from.day && !this.rangeSelected.to.day) {
      let _months: any = Object.keys(this.dateObj);
      for (let i: number = 0; i < _months.length; i++) {
        for (let j: number = 0; j < this.dateObj[_months[i]].length; j++) {
          for (let k: number = 0; k < this.dateObj[_months[i]][j].length; k++) {
            if (this.dateObj[_months[i]][j][k].day && !this.dateObj[_months[i]][j][k].isDisabled && this.dateObj[_months[i]][j][k].isHovered) {
              this.dateObj[_months[i]][j][k].isHovered = false;
            }
          }
        }
      }
    }
  }

  // function to integrate the external async data with the current view.
  private integrateAsyncDataWithCurrentView(): void {
    if (this.dateObj) {
      for (let key in this.dateObj) {
        if (this.dateObj.hasOwnProperty(key)) {
          let monthObj: any = this.dateObj[key];
          monthObj.forEach((weekObj) => {
            weekObj.forEach((dayObj) => {
              dayObj = this.setExternalDataWithEachDayObj(dayObj);
            });
          });
        }
      }
    }
  }

  // function to update the incoming external data with the current day object..
  private setExternalDataWithEachDayObj(dayObj: IdateObject): IdateObject {
    if ((typeof(this.externalData) === 'object') && this.externalData[dayObj.year]) {
      let year: number = dayObj.year;
      let month: number = dayObj.month;
      let day: number = dayObj.day;
      dayObj.data.key = this.externalData[year] ? (this.externalData[year][month] ? (this.externalData[year][month][day] ? this.externalData[year][month][day].key : '') : '') : '';
      dayObj.data.value = this.externalData[year] ? (this.externalData[year][month] ? (this.externalData[year][month][day] ? this.externalData[year][month][day].value : 0) : 0) : 0;
      dayObj.data.color = this.externalData[year] ? (this.externalData[year][month] ? (this.externalData[year][month][day] ? this.externalData[year][month][day].color : '') : '') : '';
      dayObj.data.additionalTooltipMsg = this.externalData[year] ? (this.externalData[year][month] ? (this.externalData[year][month][day] ? (this.externalData[year][month][day].additionalTooltipMsg ? this.sanitizer.bypassSecurityTrustHtml(this.externalData[year][month][day].additionalTooltipMsg) : '') : '') : '') : '';
    }
    return dayObj;
  }

  // function to set default date if set by user.
  private setDefaultDates(startDate?: number, endDate?: number): void {
    if (startDate) {
      let _dayObj: IdateObject = this.getDateObjectFromTimeStamp(startDate);
      let _year: number = _dayObj.year;
      let _month: number = _dayObj.month;
      this.fromTimeClicked = true;
      this.toTimeClicked = false;
      this.dateClicked(_dayObj);
      this.selectMonthDropdown = _month;
      this.selectYearDropdown = _year;
      this.noOfCalenderView = [];
      this.noOfCalenderView.push(_year + '-' + _month);
      for (let i: number = 0; i < this.uiSettings.monthToShow - 1; i++) {
        _month = _month + 1;
        if (_month > 11) {
          _month = 0;
          _year = _year + 1;
        }
        if (!this.dateObj[_year + '-' + _month]) {
          this.setMonthly(_month, _year);
        }
        this.noOfCalenderView.push(_year + '-' + _month);
      }
    }
    if (endDate) {
      let _dayObj: IdateObject = this.getDateObjectFromTimeStamp(endDate);
      this.fromTimeClicked = false;
      this.toTimeClicked = true;
      this.dateClicked(_dayObj);
    }
  }

  // function to extract the date object from date.
  private getDateObjectFromTimeStamp(date: any): IdateObject {
    let _date: any = new Date(date);
    let _dateObj: IdateObject;
    if (_date != 'Invalid Date') {
      _date = new Date(_date.setHours(0, 0, 0, 0));
      let _year: number = _date.getFullYear();
      let _month: number = _date.getMonth();
      let _key: string = _year + '-' + _month;
      let _inMillisecond: number = _date.getTime();
      if (!this.dateObj[_key]) {
        this.setMonthly(_month, _year);
      }
      let monthObj: any = this.dateObj[_key];
      monthObj.forEach((weekObj) => {
        weekObj.forEach((dayObj) => {
          if (dayObj.dateInMillisecond === _inMillisecond) {
            _dateObj = dayObj;
          }
        });
      });
    }
    return _dateObj;
  }

  // function to get the UI coordinates of the from date.
  private fromDatePopupOpenCoords(): void {
    let elem: any = this._elmRef.nativeElement.querySelector('.js-calenderFromTime');
    if (elem) {
      let coords: any = this.getElemStyle(elem);
      console.log(coords);
      if (this.uiSettings.verticalInputAlignment || !this.enableRangeSelect) {
        this.calenderPosition = {
          'top': coords.height + 10,
          'left': coords.marginLeft + coords.paddingLeft
        };
      } else {
        this.calenderPosition = {
          'top': coords.height + coords.paddingTop + coords.marginTop + 10,
          'left': coords.marginLeft + coords.paddingLeft
        };
      }
    }

  }

  // function to get the UI coordinates of the to date.
  private toDatePopupOpenCoords(): void {
    let elem: any = this._elmRef.nativeElement.querySelector('.js-calenderToTime');
    if (elem) {
      let coords: any = this.getElemStyle(elem);
      let fromElem: any = this._elmRef.nativeElement.querySelector('.js-calenderFromTime');
      let coordsFrom: any = this.getElemStyle(fromElem);
      if (this.uiSettings.verticalInputAlignment) {
        this.calenderPosition = {
          'top': coords.height + coordsFrom.height + coords.paddingTop + coords.marginTop + coordsFrom.paddingTop + coordsFrom.paddingBottom + coordsFrom.marginTop + coordsFrom.marginBottom + 10,
          'left': coords.paddingLeft + coords.marginLeft
        };
      } else {
        this.calenderPosition = {
          'top': coords.height + coords.paddingTop + coords.marginTop + 10,
          'left': coordsFrom.width + coords.paddingLeft + coords.marginLeft + coordsFrom.paddingLeft + coordsFrom.paddingRight + coordsFrom.marginLeft + coordsFrom.marginRight};
      }
    }

  }

  // function to get the UI applied style.
  private getElemStyle(elem: any): any {
    if (isPlatformBrowser(this.platformId)) {
      let cords: any = elem.getBoundingClientRect();
      let _window: any = this._global.nativeGlobal;
      let styles: any = elem.currentStyle || _window.getComputedStyle(elem);
      cords.height = parseFloat(styles.height);
      cords.marginLeft = parseFloat(styles.marginLeft);
      cords.marginRight = parseFloat(styles.marginRight);
      cords.paddingRight = parseFloat(styles.paddingRight);
      cords.paddingLeft = parseFloat(styles.paddingLeft);
      cords.marginTop = parseFloat(styles.marginTop);
      cords.marginBottom = parseFloat(styles.marginBottom);
      cords.paddingTop = parseFloat(styles.paddingTop);
      cords.paddingBottom = parseFloat(styles.paddingBottom);
      return cords;
    } else {
      return {};
    }
  }

  // function to generate year dropdown data according to the year range.
  private generateYears(minYear: number, maxYear: number): void {
    this.years = [];
    for (let i: number = minYear; i <= maxYear; i++) {
      this.years.push(i);
    }
  }

  // function to generate per month data according to input arguments.
  private generateMonth(year: number, month: number, status?: any): void {
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

  // function to generate initial calendar on component initialization.
  private generateInitialCalender(noOfMonths: number, month: number, year: number): void {
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
  //private functions ends
}
