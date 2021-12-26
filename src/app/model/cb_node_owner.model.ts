import { NodeOwner } from "./node_owner.model";

export class CbNodeOwner extends NodeOwner {
    nodename: string = '';

    get user_name(): string {
        return this.first_name;
    }

    set user_name(userName)  {
        this.first_name = userName;
    }

    set handle(handle) {
        this.username = handle;
    }

    get handle(): string {
        return this.username;
    }

    set new(isNew) {
        
    }

    get new(): boolean {
        return false;
    }

    get capacity_sat(): string {
        return '0';
    }
}