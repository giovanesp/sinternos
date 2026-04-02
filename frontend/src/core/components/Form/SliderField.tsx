import { Slider, type SliderProps } from 'primereact/slider';
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

type SliderFieldProps = {
    icon?: string;
    label?: string;
    name: string;
    rules?: RegisterOptions<FieldValues, string>;
} & Omit<SliderProps, 'value'>;

export const SliderField = ({
    className,
    disabled,
    icon,
    label,
    name,
    onChange,
    rules,
    ...props
}: SliderFieldProps) => {
    const { control } = useFormContext();
    const { field, fieldState } = useController({ control, name, rules });
    const invalidClass = fieldState.invalid ? 'p-invalid' : '';
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
            <ErrorMessage
                invalid={fieldState.invalid}
                message={fieldState.error?.message}
            />
            <Slider
                {...props}
                id={name}
                className={`my-3 p-1 w-full ${invalidClass}`}
                disabled={disabled || isDisabled}
                onChange={
                    disabled || isDisabled
                        ? undefined
                        : (e) => {
                            field.onChange(e.value);
                            onChange?.(e);
                        }
                }
                value={field.value}
            />
        </div>
    );
};
