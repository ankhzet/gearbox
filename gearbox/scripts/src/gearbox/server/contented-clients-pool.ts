import { ClientsPool } from '../../core';
import { GearBoxActions } from '../actions';
import { GearBoxClient } from './client';

export class ContentedClientsPool extends ClientsPool<GearBoxClient> {
    fire(sender: string, event: string, payload?: any[]) {
        return this.each((client) => {
            return GearBoxActions.fire(client, { sender, event, payload });
        });
    }

    execute(plugin: any, code: string) {
        return this.each((client) => {
            return GearBoxActions.execute(client, { plugin, code });
        });
    }
}
