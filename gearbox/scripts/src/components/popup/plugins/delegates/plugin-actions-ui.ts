import { Plugin } from '../../../../gearbox';

export interface PluginActionsUIDelegate<P extends Plugin> {
    executePlugin(uid: string);
}
