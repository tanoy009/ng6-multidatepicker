import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { DatepickerComponent } from './datepicker.component';
import { DatepickerService } from './datepicker.service';
import { Ng6CalendarDateFormatPipe } from './dateformat.filter';
import { LocalStorageService } from './storage.service';
import { GlobalRef, BrowserGlobalRef } from './windowRef.service';
@NgModule({
  declarations: [
    DatepickerComponent,
    Ng6CalendarDateFormatPipe
  ],
  imports: [
    CommonModule,
    HttpModule,
    FormsModule
  ],
  exports: [
    DatepickerComponent,
    Ng6CalendarDateFormatPipe
  ],
  providers : [{ provide: GlobalRef, useClass: BrowserGlobalRef }, DatepickerService, LocalStorageService]
})
export class Ng6DatepickerModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: Ng6DatepickerModule
    };
  }

}
