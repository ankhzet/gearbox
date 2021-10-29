import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { startCase } from 'lodash';

import { ClientConnector, PluginManager } from '../../gearbox';
import { PluginManagerContext } from '../hooks';
import { Breadcrumbs } from '../breadcrumbs';
import { Navbar } from './navbar';

export const App = ({ children }) => {
    const location = useLocation();
    const { connector, manager } = useMemo(() => {
        const connector = new ClientConnector();
        const manager = new PluginManager('plugins', connector);

        return {
            connector,
            manager,
        };
    }, []);
    const [error, setError] = useState('');

    useEffect(() => {
        connector.onsent((_, { what, data }) => {
            if (what !== 'error') {
                return;
            }

            setError(data);

            setTimeout(() => {
                setError('');
            }, 3000);
        });
    }, [connector]);

    const breadcrumbs = useMemo(() => {
        const parts = location.pathname.split('/').filter(Boolean);

        return parts.reduce((acc, part) => {
            const link = [acc[acc.length - 1]?.link || '', part].join('/');

            if (String(+part) === part) {
                acc.push({ title: part, link });
            } else {
                acc.push({ title: startCase(part), link });
            }

            return acc;
        }, [] as { title: string; link: string }[]);
    }, [location.pathname]);

    return (
        <PluginManagerContext.Provider value={manager}>
            <Navbar />

            <div className="col-lg-12">
                <Breadcrumbs crumbs={breadcrumbs} />

                {error && <div className="col-lg-12 danger">{error}</div>}

                {children}
            </div>
        </PluginManagerContext.Provider>
    );
};
