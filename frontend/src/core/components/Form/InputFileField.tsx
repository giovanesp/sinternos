import { Button } from 'primereact/button';
import { Image } from 'primereact/image';
import { Tooltip } from 'primereact/tooltip';
import {
    type InputHTMLAttributes,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useFormContext } from 'react-hook-form';

import { PublicImage } from '../PublicImage';
import { FieldLabel } from '../FieldLabel';
import { Disabled } from '../../contexts/Disabled';

type InputFileFieldProps = {
    className?: string;
    currentIcon?: string;
    currentName?: string | null;
    disabled?: boolean;
    icon?: string;
    label?: string;
    name: string;
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'onBlur' | 'onChange' | 'value'
>;

export const InputFileField = ({
    className,
    currentIcon,
    currentName,
    disabled,
    icon,
    label,
    name,
    ...props
}: InputFileFieldProps) => {
    const maxFileSize = 2000000;
    const { formState, register, setValue, watch } = useFormContext();
    const value = watch(name) as FileList | undefined;
    const hasSelectedFile = value && value.length > 0;
    const hasTooltip =
        props.accept === 'image/*' && (hasSelectedFile || currentName);
    const isDisabled = useContext(Disabled);
    const [preview, setPreview] = useState<string | undefined>(undefined);

    useEffect(() => {
        console.log(value);
        if (!hasTooltip || !value?.[0]) return;
        const preview = URL.createObjectURL(value[0]);
        Promise.resolve().then(() => setPreview(preview));
        return () => {
            URL.revokeObjectURL(preview);
            setPreview(undefined);
        };
    }, [hasTooltip, value]);

    return (
        <div className={className ? `field ${className}` : 'field col'}>
            <FieldLabel
                icon={icon}
                label={label}
                limit={maxFileSize}
                name={name}
            />
            <input
                id={name}
                {...props}
                className='hidden'
                disabled={disabled || isDisabled}
                type='file'
                value={undefined}
                {...(disabled || isDisabled
                    ? { defaultValue: formState.defaultValues?.[name] }
                    : register(name))}
            />
            <div className={`flex justify-content-between file-field-${name}`}>
                <label
                    htmlFor={name}
                    className={[
                        'p-button p-button-raised w-full',
                        hasSelectedFile ? 'mr-2' : '',
                    ].join(' ')}
                >
                    <span
                        className={[
                            'mr-2 p-button-icon',
                            hasSelectedFile
                                ? 'pi pi-fw pi-upload'
                                : currentName
                                    ? currentIcon || 'pi pi-fw pi-file'
                                    : 'pi pi-fw pi-plus',
                        ].join(' ')}
                    />
                    <span
                        className='p-button-label'
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {hasSelectedFile
                            ? value instanceof FileList
                                ? `${value.length} arquivos`
                                : value
                            : currentName || 'Escolher'}
                    </span>
                </label>
                {hasSelectedFile && (
                    <Button
                        icon='pi pi-fw pi-times'
                        severity='danger'
                        onClick={() => setValue(name, undefined)}
                        type='button'
                    />
                )}
                {hasTooltip && (
                    <Tooltip target={`.file-field-${name}`} position='bottom'>
                        {hasSelectedFile ? (
                            <Image
                                imageStyle={{ maxWidth: '350px' }}
                                src={preview}
                            />
                        ) : (
                            <PublicImage
                                imageStyle={{ maxWidth: '350px' }}
                                src={preview}
                            />
                        )}
                    </Tooltip>
                )}
            </div>
        </div>
    );
};
