import { CbNodeOwner } from "./cb_node_owner.model";
import { NodeOwner } from "./node_owner.model";

export class RingSetting {
  id? : string;
  ringName!: string;
  cleanRingName!: string;
  ringParticipants!: NodeOwner[];
  ringSize: number;
  ringLeader?: NodeOwner;
}
