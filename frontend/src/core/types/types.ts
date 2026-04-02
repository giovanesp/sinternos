import type { MenuItem } from "primereact/menuitem";
import type { FC, ReactNode } from "react";

export type BreadcrumbProps =
    | {
        breadcrumb: MenuItem[];
        defaultBreadcrumb?: never;
        autoBreadcrumb?: never;
    }
    | {
        breadcrumb?: never;
        defaultBreadcrumb: string[];
        autoBreadcrumb?: never;
    }
    | {
        breadcrumb?: never;
        defaultBreadcrumb?: never;
        autoBreadcrumb: true | string;
    }
    | {
        breadcrumb?: undefined;
        defaultBreadcrumb?: undefined;
        autoBreadcrumb?: undefined;
    };

export type DataProviderProps = { children: ReactNode; isEdit?: boolean };

export type FormComponentProps = {
    headless?: boolean;
    onCancel: () => void;
    onSuccess: (save: Record<string, unknown>) => void;
};

export type FormModalProps = {
    component: FC<FormComponentProps>;
    header: ReactNode;
    name: string;
    optionValue?: string;
    params?: object;
    path: string;
    visible?: boolean;
};

type PlusProps = {
    hidden?: boolean;
    link?: boolean;
    order?: number;
    outlined?: boolean;
    raised?: boolean;
    rounded?: boolean;
    severity?: "secondary" | "success" | "info" | "warning" | "danger" | "help";
    text?: boolean;
};

export type MenuItemPlus = MenuItem & PlusProps;

export type Pagination<T> = {
    data: T[];
    pagination: {
        currentPage: number;
        hasMore: boolean;
        nextPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
};

export type PageRoutesComponent = FC &
    PlusProps & { expanded?: boolean; icon?: string; label?: string };

export type PageRoutesProps = {
    component?: PageRoutesComponent;
    menu?: MenuItemPlus;
    path?: string;
};

export type Modules = Record<
    string,
    { default: PageRoutesComponent; menu?: MenuItemPlus }
>;