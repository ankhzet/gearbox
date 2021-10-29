import { ActionConstructor, Action } from './action';

import { ConnectPacketData, ConnectAction } from './impl';
import { FetchPacketData, FetchAction } from './impl';
import { SendPacketData, SendAction } from './impl';
import { UpdatePacketData, UpdateAction } from './impl';
import { FirePacketData, FireAction } from './impl';
import { ClientPort } from '../client-port';

export type ActionPerformer<T, A extends Action<T>> = (port: ClientPort, data?: T, error?: string) => boolean;

export interface ActionsRepository {
    get<T>(constructor: ActionConstructor<T>): Action<T>;
}

class BaseActions {
    private static _cache: { [action: string]: ActionPerformer<any, any> } = {};
    private static _registry: { [action: string]: Action<any> } = {};

    static register(constructor: ActionConstructor<any>) {
        return (this._registry[constructor.uid] = new constructor());
    }

    static get<T>(constructor: ActionConstructor<T>) {
        return this._registry[constructor.uid] || this.register(constructor);
    }

    static registered(name: string) {
        return this._registry[name];
    }

    static action<T, A extends Action<T>>(name: string): ActionPerformer<T, A> {
        const performer = this._cache[name];

        if (performer) {
            return performer;
        }

        const action = this._registry[name];

        return (this._cache[name] = action.send);
    }
}

export class Actions extends BaseActions {
    static get connect(): ActionPerformer<ConnectPacketData, ConnectAction> {
        const action = ConnectAction.uid;

        if (!this.registered(action)) {
            this.register(ConnectAction);
        }

        return this.action(action);
    }

    static get fetch(): ActionPerformer<FetchPacketData, FetchAction> {
        const action = FetchAction.uid;

        if (!this.registered(action)) {
            this.register(FetchAction);
        }

        return this.action(action);
    }

    static get send(): ActionPerformer<SendPacketData, SendAction> {
        const action = SendAction.uid;

        if (!this.registered(action)) {
            this.register(SendAction);
        }

        return this.action(action);
    }

    static get update(): ActionPerformer<UpdatePacketData, UpdateAction> {
        const action = UpdateAction.uid;

        if (!this.registered(action)) {
            this.register(UpdateAction);
        }

        return this.action(action);
    }

    static get fire(): ActionPerformer<FirePacketData, FireAction> {
        const action = FireAction.uid;

        if (!this.registered(action)) {
            this.register(FireAction);
        }

        return this.action(action);
    }
}
