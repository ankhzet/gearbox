import { Action } from '../action';

export interface UpdatePacketData {
    what: string;
    data: any;
    payload?: any;
}

export class UpdateAction extends Action<UpdatePacketData> {
    properties = ['what', 'data', 'payload'];
}
