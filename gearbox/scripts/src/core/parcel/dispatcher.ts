import { Packet } from './packet';
import { ActionConstructor, ActionsRepository } from './actions';

export type ActionHandler<T, S> = (sender: S, data: T, packet: Packet<T>) => void;
export type DispatchHandler<T, S> = (sender: S, packet: Packet<T>) => void;
export type PacketHandlerDescriptor<T, S> = { handler: ActionHandler<T, S>; action?: ActionConstructor<T> | null };

export interface PacketDispatchDelegate<T> {
    dispatch<S>(sender: S, packet: Packet<T>): boolean;
}

export interface PacketHandler<S> {
    on<T>(action: ActionConstructor<T>, handler: ActionHandler<T, S>): this;
}

export class PacketDispatcher implements PacketDispatchDelegate<any> {
    repository: ActionsRepository;
    actionHandlers: { [handler: string]: DispatchHandler<any, any>[] } = {};

    private static DEFAULT = '*';

    constructor(repository: ActionsRepository) {
        this.repository = repository;
    }

    bind<T, C, S>(context: C, descriptors: PacketHandlerDescriptor<T, S> | PacketHandlerDescriptor<any, S>[]): C {
        if (descriptors instanceof Array) {
            for (const descriptor of descriptors) {
                this.bind(context, descriptor);
            }

            return context;
        }

        const method = descriptors.handler;
        let name = PacketDispatcher.DEFAULT;
        let handler;

        if (descriptors.action) {
            const action = this.repository.get(descriptors.action);

            name = descriptors.action.uid;
            handler = function (sender: S, packet) {
                return method.call(context, sender, action.unpack(packet.data), packet);
            };
        } else {
            handler = function (sender: S, packet) {
                return method.call(context, sender, packet.data, packet);
            };
        }

        (this.actionHandlers[name] || (this.actionHandlers[name] = [])).push(handler);

        return context;
    }

    dispatch<S>(sender: S, packet: Packet) {
        let handled = false;

        try {
            for (const action of [packet.action, PacketDispatcher.DEFAULT]) {
                const handlers = this.actionHandlers[action];

                if (handlers) {
                    handled = true;

                    for (const handler of handlers) {
                        handler(sender, packet);
                    }
                }
            }
        } catch (e) {
            // let address = e.stack.match(/[^\s]+:\d+(:\d+)/)[0].split(':');
            const stack = (e as Error).stack?.split('\n').slice(1).join('\n');
            packet.error = `${e}\n${stack}`;
            console.error(`Error while dispatching request:`, e);
        }

        return handled;
    }
}
