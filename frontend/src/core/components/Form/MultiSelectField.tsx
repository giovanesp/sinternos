import { MultiSelect, type MultiSelectProps } from 'primereact/multiselect';
import { useContext } from 'react';
import {
    type FieldValues,
    type RegisterOptions,
    useController,
    useFormContext,
} from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';
import { FieldLabel } from '../FieldLabel';
import { Disabled } from '../../contexts/Disabled';

type MultiSelectFieldProps = {
    icon?: string;
    label?: string;
    multi?: boolean;
    name: string;
    rules?: RegisterOptions<FieldValues, string>;
} & Omit<MultiSelectProps, 'value'>;

export const MultiSelectField = ({
    className,
    disabled,
    icon,
    label,
    name,
    onChange,
    rules,
    ...props
}: MultiSelectFieldProps) => {
    const { control } = useFormContext();
    const { field, fieldState } = useController({ control, name, rules });
    const isDisabled = useContext(Disabled);
    const isRequired = !!rules?.required;

    const fieldValue = field.value === undefined || field.value === null ? [] : field.value;

    return (
        <div className={className ? `field ${className}` : 'field col'}>
            <FieldLabel
                icon={icon}
                isRequired={isRequired}
                label={label}
                name={name}
            />
            {!disabled && (
                <ErrorMessage
                    invalid={fieldState.invalid}
                    message={fieldState.error?.message}
                />
            )}
            <MultiSelect
                {...props}
                id={name}
                className={`w-full ${fieldState.invalid ? 'p-invalid' : ''} multiselect-wrap`}
                disabled={disabled || isDisabled}
                onChange={
                    disabled || isDisabled
                        ? undefined
                        : (e) => {
                            field.onChange(
                                e.value === undefined ? null : e.value,
                            );
                            onChange?.(e);
                        }
                }
                value={fieldValue}
            />
        </div>
    );
};
