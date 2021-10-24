import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

import { DataSet } from 'vis-data/esnext';

import { Data,  Edge, Node, Options } from 'vis-network/esnext';
import { VisNetworkDirective } from './network/vis-network.directive';
import { VisNetworkService } from './network/vis-network.service';

export {
  VisNetworkDirective,
  VisNetworkService,
  Data,
  DataSet,
  Edge,
  Options,
  Node,
};


@NgModule({
  declarations: [
    VisNetworkDirective,
  ],
  imports: [
    CommonModule
  ],
  exports: [VisNetworkDirective],
  providers: [VisNetworkService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class VisModule { }
