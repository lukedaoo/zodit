import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { DataProviderFactory } from '@database/provider/dataProviderFactory';
import { LocalStorageDataProvider } from '@database/provider/localStorageDataProvider';

DataProviderFactory.register('localStorage', LocalStorageDataProvider);

const dataProvider = DataProviderFactory.create({ name: 'localStorage' });

const DataProviderContext = createContext(dataProvider);

interface DataProviderProps {
    children: ReactNode;
}

export const DataProviderProvider: React.FC<DataProviderProps> = ({ children }) => {
    return (
        <DataProviderContext.Provider value={dataProvider}>
            {children}
        </DataProviderContext.Provider>
    );
};

export const useDataProvider = () => {
    const context = useContext(DataProviderContext);
    if (!context) {
        throw new Error('useDataProvider must be used within a DataProviderProvider');
    }
    return context;
};
