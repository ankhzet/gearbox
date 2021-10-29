import { ClientPort, Packet } from './core';
import { GearBoxActions, ExecuteAction, ExecutePacketData } from './gearbox';

class ContentfullChannel extends ClientPort {
    constructor() {
        super('gearbox-content', window.location.href);
        this.on(ExecuteAction, this.executed);

        if (!this.rebind()) {
            throw new Error('Failed to connect to background script');
        } else {
            this.connect();
        }
    }

    notifyDisconnect() {
        if (!this.port) {
            return;
        }

        // Actions.postpone(this, 'clear');
    }

    executed(sender, { plugin, code }: { plugin: any; code?: string }, packet: Packet<ExecutePacketData>) {
        console.log('executing', plugin, code, packet);

        const handler = eval(`(context, args) => (${code}).apply(context, args)`);

        return handler(plugin, [
            {
                dom: document,
                fire: (event, ...payload) => GearBoxActions.fire(this, { sender: plugin.uid, event, payload }),
                unmount: () => GearBoxActions.unmount(this, { uid: plugin.uid }),
            },
        ]);
    }
}

((channel, interval) => {
    console.log('Injecting GearBox...');

    window.onbeforeunload = function () {
        return channel.notifyDisconnect();
    };

    let timer;
    const checker = () => {
        const prev = channel.touched;
        const delta = +new Date() - prev;

        console.log('[GB]', 'touched:', prev);

        if (delta > interval || !prev) {
            if (prev) {
                console.log(`[GB]`, `Last request ${delta} msec ago (${interval} delay for reconnect)`);
            }

            if (!channel.rebind()) {
                console.log('[GB]', 'Failed to connect to extension, reloading');
                window.location.reload();
            } else {
                console.log('[GB]', 'Bound port');
            }
        }

        if (interval && !timer) {
            timer = window.setInterval(checker, interval / 10);
        }
    };

    if (document.readyState === 'complete') {
        checker();
    } else {
        window.onload = () => {
            checker();
        };
    }
})(new ContentfullChannel(), 30 * 1000);
