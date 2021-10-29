import { ChannelEdge } from "./channel_edge.model";
import { LightningNode } from "./lightning_node.model";

export class NodeInfo {
    node!: LightningNode;
    channels!: ChannelEdge[];
    total_capacity?: string;

    get id(): string {
        return this.node?.pub_key;
    }

    hasChannelWith(pub_key: string | undefined) {
        let hasChannel:number | null = null;

        for (let edge of this.channels) {
            if (edge.node1_pub == pub_key || edge.node2_pub == pub_key) {
                hasChannel = edge.channel_id;
            }
        }
        console.log(this.node.pub_key, pub_key, hasChannel)

        return hasChannel;
    }

    getChannelPolicies(pub_key: string | undefined) {
        let hasChannel:number | null = null;

        for (let edge of this.channels) {
            if (edge.node1_pub == pub_key || edge.node2_pub == pub_key) {
                hasChannel = edge.channel_id;
            }
        }

        return hasChannel;
    }
}