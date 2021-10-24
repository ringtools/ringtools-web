import { RoutingPolicy } from "./routing_policy.model";

export type ChannelEdge  = {
    channel_id: number
    chan_point: string

    last_update: number

    node1_pub: string
    node2_pub: string

    capacity: number

    node1_policy: RoutingPolicy
    node2_policy: RoutingPolicy
}