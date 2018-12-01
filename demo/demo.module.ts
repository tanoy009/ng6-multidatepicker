import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Ng6CalendarModule } from '../src';
import { DemoComponent } from './demo.component';

@NgModule({
  declarations: [DemoComponent],
  imports: [BrowserModule, Ng6CalendarModule.forRoot()],
  bootstrap: [DemoComponent]
})
export class DemoModule {}
