import { createContext, type Dispatch, type SetStateAction } from 'react';

import type { FormModalProps } from '../types/types';

export const Modals = createContext<{
    modals?: Record<string, FormModalProps>;
    setModals: Dispatch<
        SetStateAction<Record<string, FormModalProps> | undefined>
    >;
}>({ setModals: () => { } });