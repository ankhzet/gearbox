import { ActionHandler, SendPacketData, ServerPort } from '../../core';
import { GearBoxActions } from '../actions';
import { GearBoxClient } from './client';

export type ClientActionHandler<T> = ActionHandler<T, GearBoxClient>;

export class GearBoxServer extends ServerPort<GearBoxClient> {
    force: {
        send: ClientActionHandler<SendPacketData>;
    };

    constructor() {
        super('gearbox', GearBoxActions, (port) => new GearBoxClient(port));

        this.force = {
            send: (client, data) => GearBoxActions.send(client, data),
        };
    }
}
