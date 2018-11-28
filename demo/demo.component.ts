import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'ng4multi-calendar-demoapp',
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
  public ObservableObj: Observable<any>;
  public userSettings2: any = {
    showRecentSearch: false,
    geoCountryRestriction: ['in'],
    searchIconUrl: 'http://downloadicons.net/sites/default/files/identification-search-magnifying-glass-icon-73159.png'
  };
  public userSettings3: any = {
    showCurrentLocation: false,
    resOnSearchButtonClickOnly: true,
    inputPlaceholderText: 'Type anything and you will get a location',
    recentStorageName: 'componentData3'
  };
  public userSettings4: any = {
    showSearchButton: false,
    currentLocIconUrl: 'https://cdn4.iconfinder.com/data/icons/proglyphs-traveling/512/Current_Location-512.png',
    locationIconUrl: 'http://www.myiconfinder.com/uploads/iconsets/369f997cef4f440c5394ed2ae6f8eecd.png',
    recentStorageName: 'componentData4',
    noOfRecentSearchSave: 8
  };
  public userSettings5: any = {
    geoCountryRestriction: ['in'],
    geoTypes: ['establishment']
  };
  public userSettings6: any = {
    geoLocation: [37.76999, -122.44696],
    geoRadius: 5
  };
  public userSettings7: any = {
    useGoogleGeoApi: false,
    geoLocDetailServerUrl: 'https://www.simplymovein.com/api/v4/get-location',
    geoPredictionServerUrl: 'https://www.simplymovein.com/api/v4/search-location',
    geoLatLangServiceUrl: 'https://www.simplymovein.com/api/v4/geocode',
    serverResponseListHierarchy: ['data', 'items'],
    serverResponseatLangHierarchy: ['data'],
    serverResponseDetailHierarchy: ['data'],
    recentStorageName: 'componentData5'
  };

  public userSettings7_1: any = {
    useGoogleGeoApi: false,
    geoLocDetailServerUrl: 'https://www.XXX.com/api/v4/get-location',
    geoPredictionServerUrl: 'https://www.XXX.com/api/v4/search-location',
    geoLatLangServiceUrl: 'https://www.XXX.com/api/v4/geocode',
    serverResponseListHierarchy: ['data', 'items'],
    serverResponseatLangHierarchy: ['data'],
    serverResponseDetailHierarchy: ['data'],
    recentStorageName: 'componentData5'
  };

  constructor() {
    // this.test();
  }

  mockCalenderDataGenerator(year, noOfDays){
    let _data = {};
    for(let p = 0;p<year.length;p++) {
      _data[year[p]] = {};
      for(let i = 0;i<12;i++) {
        _data[year[p]][i] = {};
        for(let j = 1;j<noOfDays;j++) {
            _data[year[p]][i][j]= {
                'key': 'price',
                'value': '$'+ Math.floor(Math.random() * 100) + 10,
                'additionalTooltipMsg': '<div>This is</div><div>Test2</div>',
                'color': j < 10 ? '#E62017'  : '#FD38AE'
            }
        }
      }
    }
    return _data;
  }
  test(year) {
    console.log("in test");
    setTimeout(()=>{
      console.log("after settimeout");
      console.log(year);
      this.ObservableObj = new Observable((observer) => {

        // observable execution
        let _mockData = this.mockCalenderDataGenerator(year, 25);
        console.log("after exe");
        observer.next(_mockData);
        observer.complete();
    })
    }, 3000);
  }

  externalDataFetchCallback(event: any) {
    console.log("in fetch");
    console.log(event);
    this.test(event.yearDataNeeded);
  }

  dateCallback(event: any) {
    console.log('date selected');
    console.log(event);
  }

  getCodeHtml(data: any): any {
    let _temp: any = JSON.stringify(data);
    _temp = _temp.split(',').join(',<br>');
    _temp = _temp.split('{').join('{<br>');
    _temp = _temp.split('}').join('<br>}');
    return _temp;
  }
  autoCompleteCallback1(data: any): any {
    this.componentData1 = JSON.stringify(data);
  }

  autoCompleteCallback2(data: any): any {
    this.componentData2 = JSON.stringify(data);
  }

  autoCompleteCallback3(data: any): any {
    this.componentData3 = JSON.stringify(data);
  }

  autoCompleteCallback4(data: any): any {
    this.componentData4 = JSON.stringify(data);
  }

  autoCompleteCallback5(data: any): any {
    this.componentData5 = JSON.stringify(data);
  }

  autoCompleteCallback6(data: any): any {
    this.componentData6 = JSON.stringify(data);
  }
  autoCompleteCallback7(data: any): any {
    this.componentData7 = JSON.stringify(data);
  }

}
