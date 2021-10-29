import { ClientPort, ActionHandler } from '../core';
import { SendAction, SendPacketData } from '../core';
import { GearBoxActions } from './actions';

export class ClientConnector extends ClientPort {
    constructor() {
        super('gearbox-client');

        if (!this.rebind()) {
            throw new Error('Failed to connect to background script');
        }
    }

    onsent<S>(callback: ActionHandler<SendPacketData, S>) {
        return this.on(SendAction, callback);
    }

    fetch(query: object, payload?: any) {
        return GearBoxActions.fetch(this, { what: 'plugins', query, payload });
    }

    update<T>(data: T, payload?: any) {
        return GearBoxActions.update(this, { what: 'plugins', data, payload });
    }

    unmount(uid: string) {
        return GearBoxActions.unmount(this, { uid });
    }

    execute(uid: string, code?: string) {
        return GearBoxActions.execute(this, { plugin: { uid: uid }, code });
    }

    fire(sender: string, event: string) {
        return GearBoxActions.fire(this, { sender, event });
    }
}
