import { CbNodeOwner } from "./cb_node_owner.model";

export class RingSetting {
  id? : string;
  ringName!: string;
  cleanRingName!: string;
  ringParticipants!: CbNodeOwner[];
  ringSize: number;
  ringLeader?: CbNodeOwner;
}
