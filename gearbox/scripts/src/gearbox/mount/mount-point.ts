interface Mountable {
    uid: string;
}

export interface MountedInstance<C> {
    mount(context: C);
    unmount(context: C);
}

export interface MountPoint<I extends MountedInstance<C>, C> {
    instance(uid: string): I | void;
    mount(context: C, plugin: Mountable): I | void;
    unmount(context: C, plugin: Mountable);
}

export type MountCallback<T extends Mountable, I, C> = (context: C, meta: T) => I;

export class BaseMountPoint<T extends Mountable, I extends MountedInstance<C>, C> implements MountPoint<I, C> {
    private readonly callback: MountCallback<T, I, C>;
    private readonly mounted: { [uid: string]: I } = {};

    constructor(callback: MountCallback<T, I, C>) {
        this.callback = callback;
    }

    instance(uid: string): I | void {
        return this.mounted[uid];
    }

    mount(context: C, mountable: T): I | void {
        let instance = this.instance(mountable.uid);

        if (instance && !this.unmount(context, mountable)) {
            return;
        }

        this.mounted[mountable.uid] = instance = this.callback(context, mountable);

        instance.mount(context);

        return instance;
    }

    unmount(context: C, mountable: T) {
        const instance = this.instance(mountable.uid);

        if (!instance) {
            return true;
        }

        instance.unmount(context);

        delete this.mounted[mountable.uid];

        return true;
    }
}
