import { ClientPort } from './client-port';
import { Action, ActionPerformer } from './actions';

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

    find(predicate: (client: C) => boolean): C | void {
        for (const uid in this.clients) {
            const client = this.clients[uid];

            if (!predicate(client)) {
                return client;
            }
        }
    }

    each(callback: (client: C) => boolean): boolean {
        for (const uid in this.clients) {
            if (!callback(this.clients[uid])) {
                return false;
            }
        }

        return true;
    }

    filter(callback: (client: C) => boolean): this {
        const all: C[] = [];

        for (const uid in this.clients) {
            let client;

            if (callback((client = this.clients[uid]))) {
                all.push(client);
            }
        }

        return new (<any>this.constructor)(all);
    }

    broadcast<T>(action: ActionPerformer<T, Action<T>>, data: T, error?: string): boolean {
        return this.each((client) => {
            return action(client, data, error);
        });
    }
}
