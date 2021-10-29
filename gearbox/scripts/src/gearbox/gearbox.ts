import { GearboxDB } from './gearbox-db';

import {
    Packet,
    ActionConstructor,
    ActionHandler,
    DataServer,
    FireAction,
    FirePacketData,
    SendAction,
    SendPacketData,
} from '../core';

import { ExecuteAction, ExecutePacketData, GearBoxActions, UnmountAction, UnmountPacketData } from './actions';
import { ClientActionHandler, GearBoxClient, GearBoxServer } from './server';
import { PluginsDepot } from './plugins-depot';
import { PluginsProviderHelper } from './plugins-provider-helper';

export class GearBox extends GearBoxServer {
    db: GearboxDB = new GearboxDB();
    dataServer: DataServer;
    plugins = new PluginsDepot(this);
    pluginsHelper: PluginsProviderHelper;

    declare force: {
        send: ClientActionHandler<SendPacketData>;
        execute: ClientActionHandler<ExecutePacketData>;
    };

    constructor() {
        super();

        this.force.execute = (client: GearBoxClient, data: ExecutePacketData) => {
            return GearBoxActions.execute(client, data);
        };

        this.on(SendAction, this._handle_send);

        this.on(ExecuteAction, this._handle_execute);
        this.on(UnmountAction, this._handle_unmount);
        this.on(FireAction, this._handle_fire);

        this.dataServer = new DataServer(this, this.db);

        this.pluginsHelper = new PluginsProviderHelper(this.dataServer, this.plugins);
    }

    on<T>(action: ActionConstructor<T>, handler: ActionHandler<T, GearBoxClient>): this {
        return super.on(action, (sender, data, packet) => {
            this._handle(sender, packet);

            return handler.call(this, sender, data, packet);
        });
    }

    fire(uid: string, event: string, ...payload) {
        const instance = this.plugins.instance(uid);

        if (instance) {
            return instance.fire(event, this, ...payload);
        }
    }

    execute({ uid }, code?: string) {
        this.clientsInActiveTab((clients) => {
            const instance = this.plugins.instance(uid);

            if (instance) {
                clients.broadcast(GearBoxActions.execute, {
                    plugin: instance.raw(),
                    code: (code || '').toString(),
                });
            }
        });
    }

    /**
     * Interacting with clients
     */

    _handle_send(client: GearBoxClient, { what, data: payload }: SendPacketData) {
        switch (what) {
            case 'error': {
                console.error(
                    `Client reported error during ${payload.action}:`,
                    '\n',
                    JSON.stringify(payload.data),
                    '\n',
                    `\t`,
                    payload.error,
                );
                break;
            }
        }
    }

    _handle_unmount(client: GearBoxClient, { uid }: UnmountPacketData) {
        const plugin = this.plugins.get(uid);

        if (!plugin) {
            throw new Error(`Plugin with uid "${uid}" not found`);
        }

        this.plugins.unmount(plugin);
    }

    _handle_fire(client: GearBoxClient, { sender, event, payload }: FirePacketData) {
        this.fire(sender, event, payload);
    }

    _handle_execute(client: GearBoxClient, { plugin: data, code }: ExecutePacketData) {
        const plugin = this.plugins.get(data.uid);

        if (!plugin) {
            // todo: error handling!
            throw new Error(`Plugin with uid "${data.uid}" not found`);
        }

        this.execute(plugin, code);
    }

    _handle(client: GearBoxClient, packet: Packet) {
        console.log(`Client [${packet.sender}] requested to '${packet.action}':`);
        console.log(`\tsupplied data:`, packet.data);
    }
}
