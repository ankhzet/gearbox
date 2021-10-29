import { ClientPort, ActionHandler } from '../../core';
import { SendAction, SendPacketData } from '../../core';
import { GearBoxActions } from '../actions';

export class ClientConnector extends ClientPort {
    constructor() {
        super('gearbox-client');

        if (!this.rebind()) {
            throw new Error('Failed to connect to background script');
        } else {
            this.connect();
        }
    }

    onsent<S>(callback: ActionHandler<SendPacketData, S>) {
        return this.on(SendAction, callback);
    }

    fetch(what: string, query: object, payload?: any) {
        return GearBoxActions.fetch(this, { what, query, payload });
    }

    update<T>(what: string, data: T, payload?: any) {
        return GearBoxActions.update(this, { what, data, payload });
    }
}
