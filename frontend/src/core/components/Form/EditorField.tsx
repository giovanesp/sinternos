import { Editor, type EditorProps } from 'primereact/editor';
import { InputTextarea } from 'primereact/inputtextarea';
import { type MouseEvent, useContext, useState } from 'react';
import {
    type FieldValues,
    type RegisterOptions,
    useController,
    useFormContext,
} from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';
import { FieldLabel } from '../FieldLabel';
import { Disabled } from '../../contexts/Disabled';
import { Fetching } from '../../contexts/Fetching';

type EditorFieldProps = {
    label?: string;
    name: string;
    rules?: RegisterOptions<FieldValues, string>;
} & Omit<EditorProps, 'onBlur' | 'onChange' | 'value'>;

export const EditorField = ({
    className,
    disabled,
    height,
    label,
    name,
    rules,
    ...props
}: EditorFieldProps) => {
    const { control } = useFormContext();
    const { field, fieldState } = useController({ control, name, rules });
    const editorClassName = `w-full ${fieldState.invalid ? 'p-invalid' : ''}`;
    const [editor, setEditor] = useState(true);
    const isDisabled = useContext(Disabled);
    const isFetching = useContext(Fetching);
    const isRequired = !!rules?.required;

    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setEditor(!editor);
    };

    return (
        <div className={className ? `field ${className}` : 'field col'}>
            <FieldLabel
                icon='pi pi-fw pi-code'
                isRequired={isRequired}
                label={label}
                name={name}
                onClick={onClick}
            />
            <ErrorMessage
                invalid={fieldState.invalid}
                message={fieldState.error?.message}
            />
            {!editor || field.value === undefined || isFetching ? (
                <InputTextarea
                    id={name}
                    className={editorClassName}
                    disabled={disabled || isDisabled}
                    onChange={
                        disabled || isDisabled
                            ? undefined
                            : (e) => field.onChange(e.target.value)
                    }
                    style={{ height }}
                    value={field.value}
                />
            ) : (
                <Editor
                    {...props}
                    id={name}
                    className={editorClassName}
                    disabled={disabled || isDisabled}
                    onBlur={undefined}
                    onChange={undefined}
                    onTextChange={
                        disabled || isDisabled
                            ? undefined
                            : (e) => field.onChange(e.htmlValue)
                    }
                    value={field.value}
                    style={{ height, ...props.style }}
                />
            )}
        </div>
    );
};
