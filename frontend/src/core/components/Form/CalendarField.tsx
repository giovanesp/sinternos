import { Calendar, type CalendarProps } from 'primereact/calendar';
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

type CalendarFieldProps = {
    icon?: string;
    label?: string;
    name: string;
    rules?: RegisterOptions<FieldValues, string>;
} & Omit<CalendarProps, 'value'>;

export const CalendarField = ({
    className,
    disabled,
    icon,
    label,
    name,
    onChange,
    rules,
    ...props
}: CalendarFieldProps) => {
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
            <ErrorMessage
                invalid={fieldState.invalid}
                message={fieldState.error?.message}
            />
            <Calendar
                {...props}
                inputId={name}
                className={`w-full ${fieldState.invalid ? 'p-invalid' : ''}`}
                disabled={disabled || isDisabled}
                onChange={
                    disabled || isDisabled
                        ? undefined
                        : (e) => {
                            field.onChange(e);
                            onChange?.(e);
                        }
                }
                value={field.value}
            />
        </div>
    );
};
