import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DesignComponent } from './design/design.component';
import { SettingsComponent } from './settings/settings.component';
import { WatcherComponent } from './watcher/watcher.component';

const routes: Routes = [
  {
    path: '', component: DashboardComponent,  pathMatch: 'full'
  },
  {
    path: 'settings', component: SettingsComponent
  },
  {
    path: 'design', component: DesignComponent
  },
  {
    path: 'watch', component: WatcherComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
