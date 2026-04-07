import type { ReactNode } from "react";

export interface AppModule {
    path: string;
    label: string;
    icon: string;
    element: ReactNode;
    showInMenu?: boolean;
    roles?: string[];
    order?: number;
    group?: string;
    groupIcon?: string;
    items?: AppModule[];
}