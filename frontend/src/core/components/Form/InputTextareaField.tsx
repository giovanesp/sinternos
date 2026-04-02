import {
    InputTextarea,
    type InputTextareaProps,
} from 'primereact/inputtextarea';
import { useContext } from 'react';
import {
    type FieldValues,
    type RegisterOptions,
    useFormContext,
} from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';
import { FieldLabel } from '../FieldLabel';
import { Disabled } from '../../contexts/Disabled';

type InputTextFieldProps = {
    icon?: string;
    label?: string;
    helps?: string;
    name: string;
    rules?: RegisterOptions<FieldValues, string>;
} & Omit<InputTextareaProps, 'value'>;

export const InputTextareaField = ({
    className,
    disabled,
    icon,
    label,
    name,
    onBlur,
    onChange,
    rules,
    helps,
    ...props
}: InputTextFieldProps) => {
    const { formState, register } = useFormContext();
    const { errors } = formState;
    const isDisabled = useContext(Disabled);
    const isRequired = !!rules?.required;
    const registerProps = register(name, rules);
    return (
        <div className={className ? `field ${className}` : 'field col'}>
            <FieldLabel
                icon={icon}
                isRequired={isRequired}
                label={label}
                name={name}
            />
            {!disabled && <ErrorMessage error={errors[name]} />}
            <InputTextarea
                {...props}
                id={name}
                className={`w-full ${errors[name] ? 'p-invalid' : ''}`}
                disabled={disabled || isDisabled}
                value={undefined}
                {...{
                    ...registerProps,
                    onBlur: (e) => {
                        registerProps.onBlur(e);
                        onBlur?.(e);
                    },
                    onChange: (e) => {
                        registerProps.onChange(e);
                        onChange?.(e);
                    },
                }}
            />
            {helps &&
                <small id={`${name}-help`}>
                    {helps}
                </small>
            }
        </div>
    );
};
