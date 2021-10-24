import { ChannelEdge } from "./channel_edge.model";
import { LightningNode } from "./lightning_node.model";

export type NodeInfo  = {
    node: LightningNode;
    channels: ChannelEdge[];
}