import { Action } from '../../core';

export interface UnmountPacketData {
    uid: string;
}

export class UnmountAction extends Action<UnmountPacketData> {
    properties = ['uid'];
}
