import { NodeInfo } from "./node_info.model";
import { RoutingPolicy } from "./routing_policy.model";

export type RingParticipant  = {
    channel_id?: Number | undefined | null;
    initiator: NodeInfo;
    receiver: NodeInfo;
    initiator_fee?: RoutingPolicy;
    receiver_fee?: RoutingPolicy;
}