import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { GlobalRef } from './windowRef.service';
import { Http } from '@angular/http';
import { LocalStorageService } from './storage.service';
import 'rxjs/Rx';

@Injectable()
export class CalendarService {
  constructor(private _http: Http, @Inject(PLATFORM_ID) private platformId: Object,
  private _global: GlobalRef, private _localStorageService: LocalStorageService) {

  }

}
