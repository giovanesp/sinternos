import { InputText, type InputTextProps } from 'primereact/inputtext';
import { useContext } from 'react';
import {
    type FieldValues,
    type RegisterOptions,
    useFormContext,
} from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';
import { FieldLabel } from '../FieldLabel';
import { Disabled } from '../../contexts/Disabled';
import { slugify } from '../../helpers/slugify';

type InputSlugFieldProps = {
    icon?: string;
    label?: string;
    name: string;
    origin: string;
    rules?: RegisterOptions<FieldValues, string>;
} & Omit<InputTextProps, 'onBlur' | 'onChange' | 'value'>;

export const InputSlugField = ({
    className,
    disabled,
    icon,
    label,
    name,
    origin,
    rules,
    ...props
}: InputSlugFieldProps) => {
    const { formState, register, setValue, watch } = useFormContext();
    const { defaultValues, errors } = formState;
    const isDisabled = useContext(Disabled);
    const isRequired = !!rules?.required;
    const value = slugify(watch(origin) ?? '');
    if (!isDisabled) {
        setValue(name, value);
    }
    return (
        <div className={className ? `field ${className}` : 'field col'}>
            <FieldLabel
                icon={icon}
                isRequired={isRequired}
                label={label}
                name={name}
            />
            {!disabled && <ErrorMessage error={errors[name]} />}
            <InputText
                {...props}
                id={name}
                className={`w-full ${errors[name] ? 'p-invalid' : ''}`}
                disabled={disabled || isDisabled}
                value={undefined}
                {...(disabled || isDisabled
                    ? { defaultValue: defaultValues?.[name] }
                    : register(name, rules))}
            />
        </div>
    );
};
