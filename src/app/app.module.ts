import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DynamicRingComponent } from './dynamic-ring/dynamic-ring.component';
import { StatsTableComponent } from './stats-table/stats-table.component';
import { SettingsComponent } from './settings/settings.component';
import { NavigationComponent } from './navigation/navigation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DesignComponent } from './design/design.component';
import { VisModule } from './vis/vis.module';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DynamicRingComponent,
    StatsTableComponent,
    SettingsComponent,
    NavigationComponent,
    DesignComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    VisModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
