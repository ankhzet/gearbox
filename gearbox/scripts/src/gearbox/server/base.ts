import { ActionHandler, ConnectAction, ServerPort } from '../../core';
import { GearBoxActions } from '../actions';
import { GearBoxClient } from './client';
import { ContentedClientsPool } from './contented-clients-pool';

export type ClientActionHandler<T> = ActionHandler<T, GearBoxClient>;

export class BaseServer extends ServerPort<GearBoxClient> {
    contented: ContentedClientsPool = new ContentedClientsPool();

    constructor() {
        super('gearbox', GearBoxActions, (port: chrome.runtime.Port) => {
            return new GearBoxClient(port).on(ConnectAction, this.connected.bind(this));
        });
    }

    disconnect(client: GearBoxClient) {
        this.clearAfterDisconnect(client);
        this.contented.remove(client);
    }

    clearAfterDisconnect(client: GearBoxClient) {}

    connected(client: GearBoxClient) {
        return this.contented.add(client);
    }
}
