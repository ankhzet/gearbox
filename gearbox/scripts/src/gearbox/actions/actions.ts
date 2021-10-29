import { ActionPerformer, Actions } from '../../core';

import { ExecutePacketData, ExecuteAction } from './execute';
import { UnmountPacketData, UnmountAction } from './unmount';

export class GearBoxActions extends Actions {
    static get execute(): ActionPerformer<ExecutePacketData, ExecuteAction> {
        const action = ExecuteAction.uid;

        if (!this.registered(action)) {
            this.register(ExecuteAction);
        }

        return this.action(action);
    }

    static get unmount(): ActionPerformer<UnmountPacketData, UnmountAction> {
        const action = UnmountAction.uid;

        if (!this.registered(action)) {
            this.register(UnmountAction);
        }

        return this.action(action);
    }
}
