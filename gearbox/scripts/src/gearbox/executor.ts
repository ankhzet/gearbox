import { Plugin } from './plugin';

type PluginExecutionContext = {};

abstract class PluginExecutor {
    abstract execute(plugin: Plugin, context: PluginExecutionContext);
}

class Injector extends PluginExecutor {
    execute(plugin: Plugin, context: PluginExecutionContext) {
        chrome.tabs.executeScript({
            code: plugin.code,
        });
    }
}
