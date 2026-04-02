import { Dropdown, type DropdownProps } from 'primereact/dropdown';
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

type DropdownFieldProps = {
    icon?: string;
    label?: string;
    name: string;
    rules?: RegisterOptions<FieldValues, string>;
} & Omit<DropdownProps, 'value'>;

export const DropdownField = ({
    className,
    disabled,
    icon,
    label,
    name,
    onChange,
    rules,
    ...props
}: DropdownFieldProps) => {
    const { control } = useFormContext();
    const { field, fieldState } = useController({ control, name, rules });
    const isDisabled = useContext(Disabled);
    const isRequired = !!rules?.required;
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
            <Dropdown
                {...props}
                id={name}
                className={`w-full ${fieldState.invalid ? 'p-invalid' : ''}`}
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
                value={field.value}
            />
        </div>
    );
};
