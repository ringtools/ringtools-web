import * as d3 from 'd3';
import { CbNodeOwner } from '../model/cb_node_owner.model';
import { NodeInfo } from '../model/node_info.model';

const colorScale = d3
  .scaleLinear()
  .domain([1, 3.5, 6])
  // @ts-ignore
  .range(['#2c7bb6', '#ffffbf', '#d7191c'])
  // @ts-ignore
  .interpolate(d3.interpolateHcl);

const getUsername = (
  node: NodeInfo | undefined,
  cbNodeOwners: CbNodeOwner[]
) => {
  if (!node) return;

  let ret = cbNodeOwners.find((val) => {
    return val.pub_key == node.node.pub_key;
  });

  if (ret.handle == 'None') {
    return ret.user_name;
  }
  return `@${ret.handle}`;
};

export { colorScale, getUsername };
