import { createContext } from 'react';

const defaultContextValue = {};

export const AppContext = createContext(
    defaultContextValue as AppContextDefaultValue,
);
