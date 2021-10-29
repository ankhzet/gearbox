import { ClientPort } from './client-port';
import { Port } from './port';
import { ActionHandler, PacketDispatcher, PacketHandler } from './dispatcher';
import { ActionConstructor, ActionsRepository, ConnectAction } from './actions';
import { Packet } from './packet';
import { ClientsPool } from './clients-pool';

export type ClientFactory<C extends ClientPort> = (port: chrome.runtime.Port) => C;

export abstract class ServerPort<C extends ClientPort> extends Port implements PacketHandler<C> {
    private readonly factory: ClientFactory<C>;
    private readonly dispatcher: PacketDispatcher;
    protected readonly clients: ClientsPool<C> = new ClientsPool();

    protected constructor(name: string, repository: ActionsRepository, factory: ClientFactory<C>) {
        super(name);
        this.factory = factory;
        this.dispatcher = new PacketDispatcher(repository);

        chrome.runtime.onConnect.addListener((port) => {
            if (!this.isRelatedDataChannel(port.name)) {
                return;
            }

            let client;

            if ((client = this.reconnect(port))) {
                client.connect();
                return;
            }

            if ((client = this.connect(port))) {
                port.onDisconnect.addListener(() => {
                    this.disconnect(client);
                });
            }
        });
    }

    connect(port: chrome.runtime.Port): C {
        const tabId = port.sender?.tab?.id;
        const client = this.factory(port);

        client.tabId = tabId;

        return client
            .on(null, (sender: C, data: unknown, packet: Packet) => this.dispatcher.dispatch(client, packet))
            .on(ConnectAction, this.connected);
    }

    disconnect(client: C) {
        this.clients.remove(client);
    }

    reconnect(port: chrome.runtime.Port): C | false {
        const tabId = port.sender?.tab?.id;
        const found = tabId && this.clients.find((client) => tabId === client.tabId);

        if (found) {
            found.bind(port);

            return found;
        }

        return false;
    }

    on<T>(action: ActionConstructor<T>, handler: ActionHandler<T, C>): this {
        return this.dispatcher.bind(this, { action, handler });
    }

    connected = (client: C) => {
        return this.clients.add(client);
    };

    isRelatedDataChannel(name: string): boolean {
        return name.startsWith(Port.specifier(this.name));
    }

    clientsInTab(query: chrome.tabs.QueryInfo, callback: (clients: ClientsPool<C>) => void) {
        chrome.tabs.query(query, (tabs) => {
            const ids = tabs.map((tab) => tab.id);
            const clients = this.clients.filter((client) => ids.indexOf(client.tabId) >= 0);

            console.log(ids, this.clients, clients);

            callback(clients);
        });
    }

    clientsInActiveTab(callback: (clients: ClientsPool<C>) => void) {
        this.clientsInTab({ active: true, lastFocusedWindow: true }, callback);
    }
}
