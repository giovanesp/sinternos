import React, { useState, type ReactNode, useRef, useEffect } from 'react';
import {
    DataTable,
    type DataTableFilterMeta,
    type DataTableProps,
    type DataTableRowClickEvent,
    type DataTableValueArray,
} from 'primereact/datatable';
import { Button } from 'primereact/button';
import { ButtonGroup } from 'primereact/buttongroup';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { useNavigate, useLocation } from 'react-router-dom';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export const DefaultDataTable = ({
    children,
    defaultNew,
    defaultRowClick,
    headerContent,
    onNew: providedOnNew,
    onReload,
    onExportCSV = false,
    filterView = true,
    noStatus = false,
    onRowClick: providedOnRowClick,
    onGlobalSearch,
    ...props
}: DataTableProps<DataTableValueArray> & {
    defaultNew?: boolean;
    defaultRowClick?: boolean;
    headerContent?: ReactNode;
    onNew?: () => void;
    onReload?: () => void;
    onExportCSV?: boolean;
    filterView?: boolean;
    noStatus?: boolean;
    onGlobalSearch?: (searchValue: string) => void;
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dtable = useRef<any>(null);

    const handleNew = () => navigate(`${location.pathname}/novo`);
    const handleRowClick = (event: DataTableRowClickEvent) =>
        navigate(`${location.pathname}/${event.data.id}`);

    const onNew = providedOnNew ?? (defaultNew ? handleNew : undefined);
    const onRowClick =
        providedOnRowClick ?? (defaultRowClick ? handleRowClick : undefined);

    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: 'contains' },
        status: { value: noStatus ? null : 1, matchMode: 'equals' },
    });

    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');

    const debouncedSearchValue = useDebounce(globalFilterValue, 500);

    useEffect(() => {
        if (props.lazy && onGlobalSearch) {
            onGlobalSearch(debouncedSearchValue);
        }
    }, [debouncedSearchValue, props.lazy]);

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGlobalFilterValue(value);

        if (!props.lazy) {
            const _filters = { ...filters };
            _filters.global = {
                ...(_filters.global ?? { matchMode: 'contains' }),
                value,
            };
            setFilters(_filters);
        }
    };

    const exportCSV = () => {
        if (dtable.current) {
            dtable.current.exportCSV({ selectionOnly: false });
        }
    };

    const renderHeader = () => (
        <div className='flex justify-between items-center flex-wrap gap-2 w-full no-print'>
            <div className='flex items-center gap-2 flex-wrap'>
                <ButtonGroup>
                    {onReload && (
                        <Button label="Recarregar" icon="pi pi-sync" severity="info" onClick={onReload} size="small" />
                    )}
                    {onNew && (
                        <Button icon='pi pi-plus' onClick={onNew} size='small' label='Novo' severity='success' />
                    )}
                    {onExportCSV && (
                        <Button icon='pi pi-file-excel' onClick={exportCSV} size='small' label='Exportar CSV' severity='success' />
                    )}
                    {defaultNew && (
                        <Button label="Novo" icon="pi pi-plus" severity="success" onClick={handleNew} size="small" />
                    )}
                    {headerContent}
                </ButtonGroup>
            </div>

            {filterView && (
                <div className="ml-auto">
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search" />
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Pesquisar..."
                            className="p-inputtext-sm w-12rem"
                        />
                    </IconField>
                </div>
            )}
        </div>
    );

    return (
        <DataTable
            ref={dtable}
            value={Array.isArray(props.value) ? props.value : []}
            filters={!props.lazy ? filters : props.filters}
            header={renderHeader()}
            onRowClick={onRowClick}
            paginator
            removableSort
            selectionMode={onRowClick ? 'single' : undefined}
            globalFilterFields={props.globalFilterFields}
            emptyMessage="Nenhum registro encontrado."
            sortMode='multiple'
            size='small'
            stripedRows
            style={{ fontSize: "0.85rem" }}

            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50, 100, 500, 1000]}

            {...props}
        >
            {children}
        </DataTable>
    );
};