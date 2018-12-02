import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Ng6DatepickerModule } from '../src';
import { DemoComponent } from './demo.component';

@NgModule({
  declarations: [DemoComponent],
  imports: [BrowserModule, Ng6DatepickerModule.forRoot()],
  bootstrap: [DemoComponent]
})
export class DemoModule {}
