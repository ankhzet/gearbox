import { Port } from './port';
import { ActionHandler, PacketDispatcher } from './dispatcher';
import { ActionConstructor, Actions, ConnectAction } from './actions';
import { Packet } from './packet';

export class ClientPort extends Port {
    tabId?: number;
    uid: string;
    touched = 0;
    dispatcher: PacketDispatcher = new PacketDispatcher(Actions);

    constructor(name: string, uid = `${Math.random()}`) {
        super(name);
        this.uid = uid;

        this.on(ConnectAction, this.connectable);
    }

    disconnect() {
        this.port && this.port.disconnect();
    }

    rebind(port?: chrome.runtime.Port) {
        return this.bind(port || chrome.runtime.connect({ name: this.name }));
    }

    connect(): boolean {
        return Actions.connect(this, { uid: this.uid });
    }

    bind(port?: chrome.runtime.Port) {
        if (!port) {
            return;
        }

        if (this.port) {
            if (port === this.port) {
                return;
            }

            this.port.onMessage.removeListener(this.process);
            this.port.onMessage.removeListener(this.reset);
        }

        port.onMessage.addListener(this.process);
        port.onDisconnect.addListener(this.reset);

        return (this.port = port);
    }

    on<T, H>(action: ActionConstructor<T> | null, handler: ActionHandler<T, H>): this {
        return this.dispatcher.bind(this, { handler, action });
    }

    send(action, data?, error?): boolean {
        if (!this.port) {
            return false;
        }

        const packet = {
            sender: this.uid,
            action: action,
            data: data,
            error: null,
        };

        if (error) {
            packet.error = error;
        }

        this.port.postMessage(packet);

        return true;
    }

    process = (packet: Packet, sender) => {
        this.touched = Date.now();

        if (this.dispatcher.dispatch(this, packet)) {
            if (packet.error) {
                Actions.send(this, { what: 'error', data: packet });
            }
        }
    };

    reset = () => {
        this.port = null;
    };

    connectable(sender, { uid }) {
        this.uid = uid;
    }
}
