import { ClientPort } from './parcel';

export class ClientsPool<C extends ClientPort> {
    private clients: { [uid: string]: C } = {};

    constructor(from?: C[]) {
        if (from) {
            for (const client of from) {
                this.add(client);
            }
        }
    }

    get size(): number {
        return Object.keys(this.clients).length;
    }

    add(client: C) {
        this.clients[client.uid] = client;
    }

    remove(client: C) {
        delete this.clients[client.uid];
    }

    has(client: C): boolean {
        return !!this.clients[client.uid];
    }

    each(callback: (client: C) => boolean) {
        for (const uid in this.clients) {
            if (!callback(this.clients[uid])) {
                return false;
            }
        }

        return true;
    }

    filter(callback) {
        const all: C[] = [];

        for (const uid in this.clients) {
            let client;

            if (callback((client = this.clients[uid]))) {
                all.push(client);
            }
        }

        return new (<any>this.constructor)(all);
    }
}
