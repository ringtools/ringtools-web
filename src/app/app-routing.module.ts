import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DesignComponent } from './design/design.component';
import { BaseLayoutComponent } from './layout/base/base.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { VisualComponent } from './visual/visual.component';
import { WatcherComponent } from './watcher/watcher.component';

const routes: Routes = [
  {
    path: '', component: BaseLayoutComponent,
    children: [
      {
        path: '', component: DashboardComponent, pathMatch: 'full'
      },
      {
        path: 'settings', component: SettingsComponent
      },
      {
        path: 'design', component: DesignComponent
      },
      {
        path: 'visual', component: VisualComponent
      },
      {
        path: 'watch', component: WatcherComponent
      },
    ]  
  },
  
  {
    path: 'login', component: LoginComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
