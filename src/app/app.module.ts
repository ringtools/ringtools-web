import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StatsTableComponent } from './stats-table/stats-table.component';
import { SettingsComponent } from './settings/settings.component';
import { NavigationComponent } from './navigation/navigation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DesignComponent } from './design/design.component';
import { VisModule } from './vis/vis.module';
import { NgChartsModule } from 'ng2-charts';
import { WatcherComponent } from './watcher/watcher.component';
import { DragulaModule } from 'ng2-dragula';
import { RofCircleComponent } from './rof-circle/rof-circle.component';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { environment } from '../environments/environment';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducers, metaReducers } from './reducers';
import { CbNodeOwnerEffects } from './effects/cb-node-owner.effects';
import { LoginComponent } from './login/login.component';
import { BaseLayoutComponent } from './layout/base/base.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { ToastComponent } from './toast/toast.component';

const config: SocketIoConfig = { 
  url: environment.WS_ENDPOINT ? environment.WS_ENDPOINT : "", 
  options: { 
    transports: ['websocket'], 
    reconnection: true 
  }  
};

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    StatsTableComponent,
    SettingsComponent,
    NavigationComponent,
    DesignComponent,
    WatcherComponent,
    RofCircleComponent,
    LoginComponent,
    BaseLayoutComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    VisModule,
    NgChartsModule,
    DragulaModule.forRoot(),
    SocketIoModule.forRoot(config),
    EffectsModule.forRoot([
      CbNodeOwnerEffects
    ]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    StoreModule.forRoot(reducers, { metaReducers }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    NgOtpInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
