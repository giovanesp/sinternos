import React from 'react';
import type { ReactNode } from "react";
import { BreadCrumb } from 'primereact/breadcrumb';
import { Card } from 'primereact/card';
import type { CardPassThroughOptions } from 'primereact/card';
import { useLocation } from 'react-router-dom';
import { appModules } from '../loader';
import { menuNavLink } from './MenuNavLink';

interface PageProps {
    children?: ReactNode;
    title?: string;
    autoBreadcrumb?: boolean;
    className?: string;
    pt?: CardPassThroughOptions;
}

export const Page: React.FC<PageProps> = ({ children, title, autoBreadcrumb = true, className, pt }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const breadcrumbModel = pathnames.map((_, index) => {
        const url = `/${pathnames.slice(0, index + 1).join('/')}`;
        const module = appModules.find(m => m.path === url);

        return {
            label: module?.label || pathnames[index].charAt(0).toUpperCase() + pathnames[index].slice(1),
            url: url,
            template: menuNavLink
        };
    });

    const home = { icon: 'pi pi-home', url: '/', template: menuNavLink };
    const pageTitle = title || breadcrumbModel[breadcrumbModel.length - 1]?.label;

    return (
        <div className={`p-1 md:p-2 ${className}`}>
            <Card
                title={pageTitle}
                subTitle={autoBreadcrumb && <BreadCrumb model={breadcrumbModel} home={home} className="p-0 border-none bg-transparent" />}
                pt={pt}
                className="shadow-sm border-round"
            >
                <div className='small w-full h-full'>
                    {children}
                </div>
            </Card>
        </div>
    );
};