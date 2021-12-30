import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DesignComponent } from './design/design.component';
import { BaseLayoutComponent } from './layout/base/base.component';
import { LoginComponent } from './login/login.component';
import { RingOnlyComponent } from './ring-only/ring-only.component';
import { SettingsComponent } from './settings/settings.component';
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
        path: 'watch', component: WatcherComponent
      },
    ]  
  },
  {
    path: 'ring-only', component: RingOnlyComponent
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
