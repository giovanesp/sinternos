import { InputSwitch, type InputSwitchProps } from 'primereact/inputswitch';
import { useContext } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FieldLabel } from '../FieldLabel';
import { Disabled } from '../../contexts/Disabled';

type InputSwitchFieldProps = {
    icon?: string;
    label?: string;
    name: string;
} & Omit<InputSwitchProps, 'checked'>;

export const InputSwitchField = ({
    className,
    disabled,
    icon,
    label,
    name,
    onChange,
    ...props
}: InputSwitchFieldProps) => {
    const { control } = useFormContext();
    const { field } = useController({ control, name });
    const isDisabled = useContext(Disabled);
    return (
        <div className={className ? `field ${className}` : 'field col'}>
            <FieldLabel icon={icon} label={label} name={name} />
            <div className='text-center mt-2'>
                <InputSwitch
                    {...props}
                    id={name}
                    checked={field.value}
                    disabled={disabled || isDisabled}
                    falseValue={0}
                    trueValue={1}
                    onChange={
                        disabled || isDisabled
                            ? undefined
                            : (e) => {
                                field.onChange(e.value);
                                onChange?.(e);
                            }
                    }
                />
            </div>
        </div>
    );
};
