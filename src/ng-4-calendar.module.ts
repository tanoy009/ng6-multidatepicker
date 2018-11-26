import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from './calendar.component';
import { Ng4CalendarDateFromatPipe } from './dateformat.filter';
import { CalendarService } from './calendar.service';
import { LocalStorageService } from './storage.service';
import { GlobalRef, BrowserGlobalRef } from './windowRef.service';
@NgModule({
  declarations: [
    CalendarComponent,
    Ng4CalendarDateFromatPipe
  ],
  imports: [
    CommonModule,
    HttpModule,
    FormsModule
  ],
  exports: [
    CalendarComponent,
    Ng4CalendarDateFromatPipe
  ],
  providers : [{ provide: GlobalRef, useClass: BrowserGlobalRef }, CalendarService, LocalStorageService]
})
export class Ng4CalendarModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: Ng4CalendarModule
    };
  }

}
