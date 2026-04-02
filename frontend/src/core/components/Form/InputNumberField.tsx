import { InputNumber, type InputNumberProps } from 'primereact/inputnumber';
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

type InputNumberFieldProps = {
    icon?: string;
    label?: string;
    name: string;
    rules?: RegisterOptions<FieldValues, string>;
} & Omit<InputNumberProps, 'value'>;

export const InputNumberField = ({
    className,
    disabled,
    icon,
    label,
    name,
    onChange,
    rules,
    ...props
}: InputNumberFieldProps) => {
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
            <InputNumber
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
