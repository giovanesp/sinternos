import { Button } from 'primereact/button';
import { type MouseEventHandler, useContext } from 'react';

import { FieldLabel } from '../FieldLabel';
import { Disabled } from '../../contexts/Disabled';

type ButtonFieldProps = {
    buttonLabel: string;
    className?: string;
    disabled?: boolean | 0 | 1;
    icon?: string;
    label?: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
};

export const ButtonField: React.FC<ButtonFieldProps> = (props: ButtonFieldProps) => {
    const isDisabled = useContext(Disabled);
    const className = props.className
        ? `field ${props.className}`
        : 'field col';
    return (
        <div className={className}>
            <FieldLabel icon={props.icon} label={props.label} />
            <Button
                className='w-full'
                disabled={!!props.disabled || isDisabled}
                label={props.buttonLabel}
                onClick={props.onClick}
                raised
                severity='secondary'
                text
                type='button'
            />
        </div>
    );
};
