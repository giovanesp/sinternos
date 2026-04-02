import { Chips } from 'primereact/chips';
import { useContext, useRef } from 'react';
import { type RegisterOptions, useController, useFormContext } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';
import { FieldLabel } from '../FieldLabel';
import { Disabled } from '../../contexts/Disabled';

type InputChipsFieldProps = {
    label?: string;
    name: string;
    separator?: string;
    max?: number;
    rules?: RegisterOptions;
    onChange?: (e: any) => void;
    className?: string;
    disabled?: boolean;
};

export const InputChipsField = ({
    className,
    disabled,
    separator,
    label,
    name,
    max,
    rules,
    onChange,
    ...props
}: InputChipsFieldProps) => {
    const { control } = useFormContext();
    const { field, fieldState } = useController({ control, name, rules });
    const invalidClass = fieldState.invalid ? 'p-invalid' : '';
    const isDisabledFromContext = useContext(Disabled);
    const isRequired = !!rules?.required;
    const finalDisabled = disabled || isDisabledFromContext;

    const chipsRef = useRef<any>(null);

    const handleBlur = (e: any) => {
        e.preventDefault();
        const inputElement = chipsRef.current?.getElement().querySelector('input');
        const inputValue = inputElement?.value;

        if (inputValue) {
            const newValues = [...(field.value || []), inputValue];
            field.onChange(newValues);
            inputElement.value = '';
        }

        field.onBlur();
    };

    return (
        <div className={className ? `field ${className} p-fluid` : 'field col'}>
            <FieldLabel
                isRequired={isRequired}
                label={label}
                name={name}
            />
            <ErrorMessage
                invalid={fieldState.invalid}
                message={fieldState.error?.message}
            />
            <Chips
                {...props}
                ref={chipsRef}
                id={name}
                disabled={finalDisabled}
                className={`w-full ${invalidClass}`}
                separator={separator}
                onChange={(e) => {
                    field.onChange(e.value);
                    onChange?.(e);
                }}
                onBlur={handleBlur}
                value={field.value}
                max={max}
            />
        </div>
    );
};
