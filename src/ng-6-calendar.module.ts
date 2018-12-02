import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from './calendar.component';
import { CalendarService } from './calendar.service';
import { Ng6CalendarDateFormatPipe } from './dateformat.filter';
import { LocalStorageService } from './storage.service';
import { GlobalRef, BrowserGlobalRef } from './windowRef.service';
@NgModule({
  declarations: [
    CalendarComponent,
    Ng6CalendarDateFormatPipe
  ],
  imports: [
    CommonModule,
    HttpModule,
    FormsModule
  ],
  exports: [
    CalendarComponent,
    Ng6CalendarDateFormatPipe
  ],
  providers : [{ provide: GlobalRef, useClass: BrowserGlobalRef }, CalendarService, LocalStorageService]
})
export class Ng6CalendarModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: Ng6CalendarModule
    };
  }

}
