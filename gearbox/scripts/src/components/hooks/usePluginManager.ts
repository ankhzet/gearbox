import React, { useContext } from 'react';

import { PluginManager } from '../../gearbox';

export const PluginManagerContext = React.createContext<PluginManager>(null as any);

export const usePluginManager = () => {
    return useContext(PluginManagerContext);
};
