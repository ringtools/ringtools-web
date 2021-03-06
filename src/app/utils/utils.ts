import * as d3 from 'd3';
import { NodeOwner } from '../model/node_owner.model';
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
  nodeOwners: NodeOwner[]
) => {
  if (!node) return;

  let ret = nodeOwners.find((val) => {
    return val.pub_key == node.node.pub_key;
  });

  if (ret.username == 'None' || ret.username == 'undefined') {
    return ret.first_name;
  }
  return `@${ret.username}`;
};

const stringToBoolean = (string: string) => {
  switch(string.toLowerCase().trim()){
      case "true": 
      case "yes": 
      case "1": 
        return true;

      case "false": 
      case "no": 
      case "0": 
      case null: 
        return false;

      default: 
        return Boolean(string);
  }
}



const parseToEmoji = (ringName) => {
  let colorMap: Map<String, string> = new Map<string,string>([
    ['500K', '&#128308;'],
    ['1M', '&#128992;'],
    ['2M', '&#128993;'],
    ['3M', '&#128994;'],
    ['5M', '&#129001;'],
    ['10M', '&#128154;'],
    ['50M', '&#127752;'],
  ]);

  let capacity: String = ringName.match(/_(\d+[K|M])sats_/);

  if (capacity)
    return colorMap.get(capacity[1]);
  return '';
}

export { colorScale, getUsername, parseToEmoji, stringToBoolean };
