import { SendPacketData } from '../../core';
import { GearBoxActions } from '../actions';
import { BaseServer, ClientActionHandler } from './base';
import { GearBoxClient } from './client';
import { ContentedClientsPool } from './contented-clients-pool';

export { ClientActionHandler };

export class GearBoxServer extends BaseServer {
    force: {
        send: ClientActionHandler<SendPacketData>;
    };

    constructor() {
        super();

        this.force = {
            send: (client: GearBoxClient, data: SendPacketData) => {
                return GearBoxActions.send(client, data);
            },
        };
    }

    clientsInActiveTab(callback: (clients: ContentedClientsPool) => void) {
        chrome.tabs.query(
            {
                active: true,
                lastFocusedWindow: true,
            },
            (tabs) => {
                const ids = tabs.map((tab) => tab.id);

                console.log(ids, this.contented);

                callback(this.contented.filter((client) => ids.indexOf(client.tabId) >= 0));
            },
        );
    }
}
