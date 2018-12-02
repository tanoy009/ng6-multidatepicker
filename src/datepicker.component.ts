import { Component, PLATFORM_ID, SimpleChanges, Input, Output, EventEmitter, OnInit, OnChanges, ElementRef, Inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalRef } from './windowRef.service';
import { DatepickerService } from './datepicker.service';
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
  selector: 'ng6multi-datepicker',
  template: `<div class="calendar">
    <div class="calender--input-wrapper" [ngClass]="{'calender--input-alignment': uiSettings.verticalInputAlignment}" *ngIf="enableRangeSelect">
      <div class="calender__input js-calenderFromTime" [ngStyle]="{'margin': uiInputSettings.fromDateMargin,'width': uiInputSettings.fromDateWidth}">
        <label *ngIf="!uiInputSettings.fromDateLabelHide">{{uiInputSettings.fromDateLabelText}}</label>
        <input type="text" readonly (click)="fromDateClicked()"  [value]="rangeSelected.from.date | date: uiSettings.dateDisplayFormat" class="calender--input" placeholder="{{uiInputSettings.fromDatePlaceholder}}"/>
      </div>
      <div class="calender__input js-calenderToTime" [ngStyle]="{'margin': uiInputSettings.toDateMargin,'width': uiInputSettings.toDateWidth}">
        <label *ngIf="!uiInputSettings.toDateLabelHide">{{uiInputSettings.toDateLabelText}}</label>
        <input type="text" readonly (click)="toDateClicked()" class="calender--input" [value]="rangeSelected.to.date | date: uiSettings.dateDisplayFormat" placeholder="{{uiInputSettings.toDatePlaceholder}}"/>
      </div>
    </div>
    <div class="calender--input-wrapper calender--input-alignment" *ngIf="!enableRangeSelect">
      <div class="calender__input js-calenderFromTime">
        <label *ngIf="!uiInputSettings.fromDateLabelHide">{{uiInputSettings.fromDateLabelText}}</label>
        <input type="text" readonly (click)="fromDateClicked()"  [value]="userDateSelected.dateInMillisecond | date: uiSettings.dateDisplayFormat" class="calender--input" placeholder="{{uiInputSettings.fromDatePlaceholder}}"/>
      </div>
    </div>
    <div [hidden]="calenderHideFlag" class="calendar__wrapper calender--triangle" [ngStyle]="{'width': ''+ defaultCalenderWidth*uiSettings.monthToShow +'px','top': calenderPosition.top+'px','left': calenderPosition.left+'px'}" [ngClass]="{'calendar__no-grid': !uiSettings.gridLayout,'calendar__disable-dropdown': uiSettings.disableYearMonthDropdown}">
      <div class="container calendar__heading calendar--full-width">
        <div class="calendar--full-width">
          <div class="calendar__arrow-left">
            <button type="button" [disabled]="(selectYearDropdown <= startYear) && (selectMonthDropdown === 0)" class="calendar--button" (click)='setPrevMonth()'><i></i></button>
          </div>
          <div class="calendar__month" *ngIf="!uiSettings.disableYearMonthDropdown">
            <div class="custom-select">
              <select  [(ngModel)]="selectMonthDropdown" (change)="monthChange($event.target.value)">
                <option *ngFor="let month of months" [value]="month.value">{{month.text}}</option>
              </select>
            </div>
          </div>
          <div class="calendar__year" *ngIf="!uiSettings.disableYearMonthDropdown">
            <div class="custom-select">
              <select [(ngModel)]="selectYearDropdown" (change)="yearChange($event.target.value)">
                <option *ngFor="let year of years" [value]="year">{{year}}</option>
              </select>
            </div>
          </div>
          <div class="calendar__arrow-right">
              <button type="button" class="calendar--button" [disabled]="(selectYearDropdown >= maxYear) && (selectMonthDropdown === 11)" (click)='setNextMonth()'> <i></i></button>
          </div>
        </div>
      </div>
      <div class="calendar__container">
        <table class="calendar__table calendar--full-width" *ngFor="let year of noOfCalenderView" [ngStyle]="{'width': ''+ individualCalendarWidth +'%','font-size': uiSettings.fontSize+'px'}">
          <thead>
            <tr>
              <th colspan="7" class="calendar__table--date">{{year | ng6CalendarDateFormat}}</th>
            </tr>
            <tr>
              <th *ngFor="let day of defaultDays" class="text-center">{{day}}</th>
            </tr>
          </thead>
          <tbody>
              <tr *ngFor="let days of dateObj[year]">
                <td *ngFor="let day of days;let i = index"
                  [ngClass]="{'disabled':day.isDisabled,'current-day':day.isCurrent,'selected-date':day.isSelected,'continue-date': day.isHovered,'cell-stripe': day.isDateRangeExceeded}"
                  [style.background-color]="day.isSelected ? uiSettings.selectedCellColor : day.isHovered || day.isMouseHover ? uiSettings.hoverCellColor : ''">
                  <div *ngIf="day.day" class="calender-tooltip" (click)="!day.isDisabled && dateClicked(day)" (mouseover)='dateHovered(day);day.isMouseHover = true' (mouseout)="day.isMouseHover = false">
                    <div class="text-center monthly-date" [ngStyle]="{'width': uiSettings.individualCalendarCellWidth+'px','height': uiSettings.individualCalendarCellHeight+'px'}">
                      <span>{{day.day}}</span>
                      <span *ngIf="day.data.value" class="monthly-date-val" [ngStyle]="{'color': day.data.color}">{{day.data.value}}</span>

                      <!-- tooltip -->
                      <div *ngIf="!uiSettings.disableTooltip" [hidden]="!(day.isDateRangeExceeded || day.data.additionalTooltipMsg)" class="calender-tooltiptext calender-tooltip-bottom">
                        <div *ngIf="day.data.additionalTooltipMsg" class="calender-tooltip--extra" [innerHTML]="day.data.additionalTooltipMsg"></div>
                        <div *ngIf="day.isDateRangeExceeded && day.data.additionalTooltipMsg"class="calender-tooltip--separator"></div>
                        <div *ngIf="day.isDateRangeExceeded" class="calender-tooltip--no-selection">Max Date Range Selection allowed upto {{maximumDayInRange}} days</div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  <div>
  `,
  styles: [`.calendar {
    background-color: #fff;
    width: 100%;
    min-width: 352px;
    position: relative;
  }

  .calendar--full-width {
      width: 100%;
      display: flex;
  }

  .calendar__container {
    display: flex;
  }

  .calendar__wrapper {
    box-shadow: 0 0 2px #ccc;
    background-color: #fff;
    padding: 10px 8px 8px 8px;
    position: absolute;
    z-index: 99;
  }

  .calendar--button {
      width: 100%;
      height: 100%;
      background: none;
      border: 1px solid #ccc;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
  }

  .calendar--button:focus {
    outline: none;
  }

  .calendar button[disabled] {
      background-color: #ccc;
      border-color: #ccc;
  }

  .calender--triangle:before,
  .calender--triangle:after {
    content: "";
    border-style: solid;
    position: absolute;
    width: 0;
    height: 0;
    left: 10px;
    border-radius: 1px;
  }

  .calender--triangle:before {
    border-width: 0px 11px 11px 11px;
    border-color: transparent transparent #ccc transparent;
    top: -11px;
  }

  .calender--triangle:after {
    border-width: 0px 11px 11px 11px;
    top: -10px;
    border-color: transparent transparent #fff transparent;
  }

  .calendar__arrow-left {
      width: 50px;
      height: 40px;
  }

  .calendar__arrow-left i {
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0OTIgNDkyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0OTIgNDkyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTE5OC42MDgsMjQ2LjEwNEwzODIuNjY0LDYyLjA0YzUuMDY4LTUuMDU2LDcuODU2LTExLjgxNiw3Ljg1Ni0xOS4wMjRjMC03LjIxMi0yLjc4OC0xMy45NjgtNy44NTYtMTkuMDMybC0xNi4xMjgtMTYuMTIgICAgQzM2MS40NzYsMi43OTIsMzU0LjcxMiwwLDM0Ny41MDQsMHMtMTMuOTY0LDIuNzkyLTE5LjAyOCw3Ljg2NEwxMDkuMzI4LDIyNy4wMDhjLTUuMDg0LDUuMDgtNy44NjgsMTEuODY4LTcuODQ4LDE5LjA4NCAgICBjLTAuMDIsNy4yNDgsMi43NiwxNC4wMjgsNy44NDgsMTkuMTEybDIxOC45NDQsMjE4LjkzMmM1LjA2NCw1LjA3MiwxMS44Miw3Ljg2NCwxOS4wMzIsNy44NjRjNy4yMDgsMCwxMy45NjQtMi43OTIsMTkuMDMyLTcuODY0ICAgIGwxNi4xMjQtMTYuMTJjMTAuNDkyLTEwLjQ5MiwxMC40OTItMjcuNTcyLDAtMzguMDZMMTk4LjYwOCwyNDYuMTA0eiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=);
      background-size: cover;
      height: 20px;
      width: 20px;
      display: inline-block;
  }

  .calendar__arrow-right {
      width: 50px;
      height: 40px;
  }

  .calendar__arrow-right i {
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0OTIuMDA0IDQ5Mi4wMDQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ5Mi4wMDQgNDkyLjAwNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zODIuNjc4LDIyNi44MDRMMTYzLjczLDcuODZDMTU4LjY2NiwyLjc5MiwxNTEuOTA2LDAsMTQ0LjY5OCwwcy0xMy45NjgsMi43OTItMTkuMDMyLDcuODZsLTE2LjEyNCwxNi4xMiAgICBjLTEwLjQ5MiwxMC41MDQtMTAuNDkyLDI3LjU3NiwwLDM4LjA2NEwyOTMuMzk4LDI0NS45bC0xODQuMDYsMTg0LjA2Yy01LjA2NCw1LjA2OC03Ljg2LDExLjgyNC03Ljg2LDE5LjAyOCAgICBjMCw3LjIxMiwyLjc5NiwxMy45NjgsNy44NiwxOS4wNGwxNi4xMjQsMTYuMTE2YzUuMDY4LDUuMDY4LDExLjgyNCw3Ljg2LDE5LjAzMiw3Ljg2czEzLjk2OC0yLjc5MiwxOS4wMzItNy44NkwzODIuNjc4LDI2NSAgICBjNS4wNzYtNS4wODQsNy44NjQtMTEuODcyLDcuODQ4LTE5LjA4OEMzOTAuNTQyLDIzOC42NjgsMzg3Ljc1NCwyMzEuODg0LDM4Mi42NzgsMjI2LjgwNHoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);
      background-size: cover;
      height: 20px;
      width: 20px;
      display: inline-block;
  }

  .calendar__month {
      width: calc(50% - 50px);
  }

  .calendar__year {
      width: calc(50% - 50px);
  }

  .calendar .current-day .monthly-date {
      color: blue;
      font-weight: 700;
  }

  .calendar__heading {
      padding: 0;
      margin-bottom: 10px;
      position: relative;
  }

  .calendar__table {
      border-collapse: collapse;
      display: table;
      border-spacing: 0px;
  }

  .calendar__table td,
  .calendar__table th {
      padding: 9px 0;
      text-align: center;
      vertical-align: top;
      border-top: 1px solid #eceeef;
  }


  .calendar__table thead {
      display: table-header-group;
      vertical-align: middle;
      border-color: inherit;
  }

  .calendar__table tr {
      display: table-row;
      vertical-align: inherit;
      border-color: inherit;
  }

  .calendar__table thead th {
      vertical-align: bottom;
      border-bottom: 2px solid #eceeef;
  }

  .calendar__table th {
      font-size: 80%;
  }

  .calendar__table tbody td {
      transition: all 0.3s ease-in-out;
      line-height: 1;
      padding: 0;
      position: relative;
  }

  .calendar__table tbody {
      display: table-row-group;
      vertical-align: middle;
      border-color: inherit;
  }

  .calendar__table tr {
      display: table-row;
      vertical-align: inherit;
      border-color: inherit;
  }

  .calendar .calendar__table td,
  .calendar .calendar__table th {
      border: 1px solid #eceeef;
  }

  .calendar__table tbody td:hover {
      cursor: pointer;
  }

  .calendar__table tbody td:hover .monthly-date {
      color: #353535;
  }

  .calendar__table--date {
      font-size: 16px !important;
      font-weight: 400;
      line-height: 1.1;
  }

  .calendar__table .text-center {
      text-align: center;
  }

  .calendar__table .price {
      margin-top: 10px;
  }

  .calendar__table .price span,
  .calendar__table .quantity span {
      width: 100%;
      font-weight: 400;
      opacity: 0.9;
      font-size: 13px;
  }

  .calendar__table .monthly-date {
      font-size: 76%;
      font-weight: 400;
      line-height: 1;
      padding: 5px 0;
      height: 35px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
  }

  .calendar__table .monthly-date span {
      display: inline-block;
      transform: scale(1, 1.5);
      -webkit-transform: scale(1, 1.5);
      /* Safari and Chrome */
      -moz-transform: scale(1, 1.5);
      /* Firefox */
      -ms-transform: scale(1, 1.5);
      /* IE 9+ */
      -o-transform: scale(1, 1.5);
      /* Opera */
  }

  .calendar__table .monthly-date-val {
    font-size: 10px;
    overflow: hidden;
    width: 100%;
    text-overflow: ellipsis;
    transform: scale(1, 1) !important;
      -webkit-transform: scale(1, 1) !important;
      /* Safari and Chrome */
      -moz-transform: scale(1, 1) !important;
      /* Firefox */
      -ms-transform: scale(1, 1) !important;
      /* IE 9+ */
      -o-transform: scale(1, 1) !important;
      /* Opera */
  }

  .calendar__table .continue-date .monthly-date {
      color: #047b8d;
  }

  .calendar__table .disabled {
      cursor: not-allowed !important;
      color: #949494;
  }

  .calendar__table .disabled:hover {
      background-color: transparent !important;
  }

  .calendar .custom-select {
    border: 1px solid #ccc;
  }

  .calendar .custom-select select{
    margin: 0;
    width: 100%;
    text-align: center;
    text-align-last: center;
    height: 38px;
    font-size: 17px;
    background: none;
    border: none;
  }

  .calendar .selected-date .monthly-date {
      color: #fff !important;
  }

  .calender--input-wrapper {
    display: flex;
    padding-bottom: 10px;
  }

  .calender__input {
    width: 50%;
  }

  .calender--input {
    width: 100%;
    height: 40px;
    padding: 4px 8px;
    margin-top: 8px;
    box-sizing: border-box;
  }

  .calendar .cell-stripe {
    background-image: repeating-linear-gradient(45deg, #dbdbdb, #dbdbdb 10px, #ecebeb 10px, #ecebeb 20px);
  }

  .calender--input-alignment {
    flex-direction: column;
  }

  .calender--input-alignment .calender__input{
    width: 100%;
    margin: 10px 0;
  }

  /* css code for calendar tooltip */

  .calender-tooltip {
    position: relative;
    /*display: inline-block;*/
  }
  .calender-tooltip .calender-tooltiptext {
    visibility: hidden;
    position: absolute;
    width: 120px;
    background-color: #555;
    color: #fff;
    text-align: center;
    font-size: 10px;
    padding: 5px;
    border-radius: 2px;
    z-index: 1;
    opacity: 0;
    transition: all 0.3s;
    transform: scale(1, 1);
    -webkit-transform: scale(1, 1);
    /* Safari and Chrome */
    -moz-transform: scale(1, 1);
    /* Firefox */
    -ms-transform: scale(1, 1);
    /* IE 9+ */
    -o-transform: scale(1, 1);
    /* Opera */
  }
  .calender-tooltip .calender-tooltip-bottom {
    top: 135%;
    left: 50%;
    margin-left: -60px;
  }
  .calender-tooltip .calender-tooltip-bottom::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent #555 transparent;
  }
  .calender-tooltip:hover .calender-tooltiptext {
    visibility: visible;
    opacity: 1;
    top: 117%;
  }

  .calender-tooltip .calender-tooltip--separator {
    padding-bottom: 5px;
    border-bottom: 1px solid #fff;
    width: 70px;
    margin: 0 auto 5px auto;
  }


  /* css code to remove the grid to give the militaristic feel */
  .calendar__no-grid .calendar__table {
    margin-left: 5px;
    margin-right: 5px;
  }
  .calendar__no-grid .calendar__table{
    border-spacing: 0px;
  }
  .calendar__no-grid tr td{
    border: none !important;
  }

  .calendar__no-grid thead tr th{
    border-bottom-width: 1px !important;
    border-top-width: 0px;
    border-left-width: 0px;
    border-right-width: 0px;
  }

  .calendar__disable-dropdown .calendar__heading {
    margin: 0;
  }

  .calendar__disable-dropdown.calendar__no-grid .calendar--button {
    border: none !important;
  }

  /* css code to restructure whhen dropdowns are removed */
  .calendar__disable-dropdown.calendar__no-grid {
    padding: 2px 8px 8px 8px;
  }
  .calendar__disable-dropdown .calendar__arrow-left {
    position: absolute;
    left: 0;
    top: 2px;
    height: 35px;
    width: 42px;
  }

  .calendar__disable-dropdown.calendar__no-grid .calendar__arrow-left,
  .calendar__disable-dropdown.calendar__no-grid .calendar__arrow-right {
    top: 0;
  }

  .calendar__disable-dropdown .calendar__arrow-right {
    position: absolute;
    right: 0;
    top: 2px;
    height: 35px;
    width: 42px;
  }

  .calendar__disable-dropdown .calendar__arrow-left .calendar--button {
    border: none;
    border-right: 1px solid #eceeef;
  }

  .calendar__disable-dropdown .calendar__arrow-right .calendar--button {
    border: none;
    border-left: 1px solid #eceeef;
  }
  `],
  host: {
    '(document:click)': 'closeAutocomplete($event)',
  }
})
export class DatepickerComponent implements OnInit, OnChanges {
  @Input() uiSettings: IuiSettings = {
    dateDisplayFormat: '',
    gridLayout: false,
    disableYearMonthDropdown: false,
    verticalInputAlignment: false,
    disableTooltip: false,
    monthToShow: 0,
    fontSize: 0,
    individualCalendarCellWidth: 0,
    individualCalendarCellHeight: 0,
    selectedCellColor: '',
    hoverCellColor: ''
  };
  @Input() uiInputSettings: IuiInputSettings = {
    fromDateWidth: '',
    fromDatePlaceholder: '',
    fromDateLabelText: '',
    fromDateLabelHide: false,
    fromDateMargin: '',
    toDateWidth: '',
    toDatePlaceholder: '',
    toDateLabelText: '',
    toDateLabelHide: false,
    toDateMargin: ''
  };
  @Input() minDate?: any;                                             //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT) (Default is current system date)
  @Input() maxDate?: any;                                             //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT) (Default is 20 years from min date)
  @Input() defaultFromDate?: any;                                     //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT)
  @Input() defaultToDate?: any;                                       //In Format MM/DD/YYYY as string or a Date object or Date in millisecond; (STRICT)
  @Input() enableRangeSelect?: boolean = true;                        //config to enable and disable date range selection (Default: true)
  @Input() maximumDayInRange?: number = 0;                            //config to set maximum range to which the user can select.
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

  private uiInputSettingsDefault: IuiInputSettings  = {
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

  private uiSettingsDefault: IuiSettings = {
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

	constructor(
    private _elmRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sanitizer: DomSanitizer,
    private _global: GlobalRef,
    private _datepickerService: DatepickerService) {}

	ngOnInit(): void {
    //initializing user input values
    this.uiSettings = this.setDefaultValues(this.uiSettings, this.uiSettingsDefault);
    this.uiInputSettings = this.setDefaultValues(this.uiInputSettings, this.uiInputSettingsDefault);
    //check if monthTOShow should be equal or more then 1
    if (this.uiSettings.monthToShow < 1) {
      this.uiSettings.monthToShow = 1;
      console.warn('Minimum value for monthToShow should be equal or more then 1');
    }

    //below code to determine the optimal calender width
    this.defaultCalenderWidth = (this.uiSettings.individualCalendarCellWidth * 7) + 25;

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
        this._datepickerService.processExternalData(data).subscribe((processedData) => {
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
      let _tempDate: any = {};
      _tempDate.date = dayObject.year + '-' + (dayObject.month + 1) + '-' + dayObject.day;
      _tempDate.day = dayObject;
      this.calenderHideFlag = true;
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
  //function to set default values and retain user input values
  private setDefaultValues(userValues: any, defaultValues: any): any {
    let _settings: any = {};
    let _keys: any = Object.keys(defaultValues);
    _keys.forEach((key) => {
      if (!userValues[key]) {
        _settings[key] = defaultValues[key];
      } else {
        _settings[key] = userValues[key];
      }
    });
    return _settings;
  }

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
    if (_date + '' !== 'Invalid Date') {
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
      if (this.uiSettings.verticalInputAlignment || !this.enableRangeSelect) {
        this.calenderPosition = {
          'top': coords.height + + coords.paddingTop + coords.marginTop + 10,
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
