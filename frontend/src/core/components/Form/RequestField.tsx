import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DropdownChangeEvent, DropdownProps } from 'primereact/dropdown';
import type { MultiSelectChangeEvent, MultiSelectProps } from 'primereact/multiselect';
import type { FieldValues, RegisterOptions } from 'react-hook-form';

import api from '../../client';
import { DropdownField } from './DropdownField';
import { MultiSelectField } from './MultiSelectField';

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

export interface BaseFieldProps {
    icon?: string;
    label?: string;
    optionFilter?: (options?: Record<string, unknown>[]) => Record<string, unknown>[] | undefined;
    onObjectChange?: (value: any) => void;
    params?: object;
    path: string;
    rules?: RegisterOptions<FieldValues, string>;
    serverFilter?: boolean;
}

interface DropdownFieldProps extends BaseFieldProps, Omit<DropdownProps, 'value'> {
    multi?: false;
}

interface MultiSelectFieldProps extends BaseFieldProps, Omit<MultiSelectProps, 'value'> {
    multi: true;
}

type RequestFieldProps = (DropdownFieldProps | MultiSelectFieldProps) & {
    name: string;
};

export const RequestField = ({
    disabled,
    optionFilter,
    onObjectChange,
    params,
    path,
    serverFilter = false,
    ...props
}: RequestFieldProps) => {
    const defaultParams = { orderBy: { name: 'asc' }, status: 1 };
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const finalParams = {
        ...defaultParams,
        ...params,
        ...(serverFilter && debouncedSearchTerm ? { search: debouncedSearchTerm } : {})
    };

    const { data, isFetching } = useQuery({
        queryKey: ['RequestField', path, finalParams],
        queryFn: async () => {
            const response = await api.get(path, { params: finalParams });
            return Array.isArray(response.data) ? response.data : (response.data.data || []);
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
        initialData: [],
    });

    const options = optionFilter ? optionFilter(data) : data;

    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const onFilterChange = (e: any) => {
        if (serverFilter) {
            setSearchTerm(e.filter);
        }
        if (props.onFilter) {
            props.onFilter(e);
        }
    };

    if (props.multi) {
        const handleMultiSelectChange = (e: MultiSelectChangeEvent) => {
            if (props.onChange) {
                props.onChange(e);
            }
            if (onObjectChange) {
                const valueField = props.optionValue || 'id';
                const selectedOptions = (options || []).filter(
                    (opt: any) => e.value.includes(getNestedValue(opt, valueField))
                );
                onObjectChange(selectedOptions);
            }
        };
        return (
            <MultiSelectField
                disabled={disabled}
                optionLabel='name'
                optionValue='id'
                {...props}
                options={options || []}
                onChange={handleMultiSelectChange}
            />
        );
    }

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        if (props.onChange) props.onChange(e);
        if (onObjectChange) {
            const valueField = props.optionValue || 'id';
            const selectedOption = (options || []).find(
                (opt: any) => getNestedValue(opt, valueField) === e.value
            );
            onObjectChange(selectedOption);
        }
    };

    return (
        <DropdownField
            disabled={disabled}
            optionLabel='name'
            optionValue='id'
            filter
            onFilter={onFilterChange}
            loading={isFetching}
            resetFilterOnHide={true}
            {...props}
            options={options || []}
            onChange={handleDropdownChange}
        />
    );
};
