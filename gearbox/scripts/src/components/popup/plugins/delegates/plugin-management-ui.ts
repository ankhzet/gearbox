import { Plugin } from '../../../../gearbox';
import { PluginActionsUIDelegate } from './plugin-actions-ui';

export interface PluginManagementUIDelegate<P extends Plugin> extends PluginActionsUIDelegate<P> {
    listPlugins();
    createPlugin(): Promise<P>;
    showPlugin(uid: string): Promise<P>;
    editPlugin(uid: string): Promise<P>;
    savePlugin(uid: string, data): Promise<P>;
    removePlugin(uid: string): Promise<void>;
}
