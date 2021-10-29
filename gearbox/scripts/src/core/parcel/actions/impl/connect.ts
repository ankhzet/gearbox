import { Action } from '../action';

export interface ConnectPacketData {
    uid: string;
}

export class ConnectAction extends Action<ConnectPacketData> {
    properties = ['uid'];
}
