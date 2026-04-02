import { type ReactNode, useContext, useEffect, useState } from 'react';
import { useForm, FormProvider, type FieldValues } from 'react-hook-form';
import { Button } from 'primereact/button';
import { useNavigate, useLocation } from 'react-router-dom';

import { Disabled } from '../contexts/Disabled';
import { Fetching } from '../contexts/Fetching';
import { Modals } from '../contexts/Modals';
import type { FormModalProps } from '../types/types';
import { FormModal } from './FormModal';

import { InputTextField } from './Form/InputTextField';
import { InputTextareaField } from './Form/InputTextareaField';
import { DropdownField } from './Form/DropdownField';
import { CalendarField } from './Form/CalendarField';
import { InputMaskField } from './Form/InputMaskField';
import { InputFileField } from './Form/InputFileField';
import { InputNumberField } from './Form/InputNumberField';
import { RequestField } from './Form/RequestField';
import { MultiSelectField } from './Form/MultiSelectField';
import { InputChipsField } from './Form/ChipsField';
import { InputSwitchField } from './Form/InputSwitchField';
import { InputSlugField } from './Form/InputSlugField';
import { ButtonField } from './Form/ButtonField';
import { EditorField } from './Form/EditorField';

type FormProps = {
    children: ReactNode;
    className?: string;
    defaultCancel?: boolean;
    defaultTranslations?: boolean;
    disabled?: boolean;
    hideButtons?: boolean;
    initialData?: FieldValues;
    onCancel?: () => void;
    onSubmit: (data: Record<string, unknown>) => Promise<boolean | void>;
    onTranslations?: () => void;
};


export const Form = (props: FormProps) => {
    const btnClassName = 'flex flex-column-reverse gap-2 md:flex-row';
    const submitClassName = `${btnClassName} md:justify-content-end`;
    const translationClassName = `${btnClassName} md:justify-content-between`;

    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname.split('/');

    const onCancel =
        props.onCancel ??
        (props.defaultCancel
            ? () => navigate(pathname.slice(0, -1).join('/') || '/')
            : undefined);
    const onTranslations =
        props.onTranslations ??
        (props.defaultTranslations
            ? () => navigate(`${location.pathname}/translations`)
            : undefined);

    const methods = useForm({ defaultValues: props.initialData });
    const isFetching = useContext(Fetching);
    const disabled =
        methods.formState.isSubmitting || isFetching || props.disabled;
    useEffect(() => methods.reset(props.initialData), [props.initialData]);

    const [modals, setModals] = useState<Record<string, FormModalProps>>();

    const onSubmit = async (data: Record<string, unknown>) => {
        try {
            if (await props.onSubmit(data)) {
                onCancel?.();
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className='grid'>
            <div className='col-12'>
                <FormProvider {...methods}>
                    <form
                        className={props.className}
                        onSubmit={methods.handleSubmit(onSubmit)}
                        style={{ fontSize: "0.85rem" }}
                    >
                        <div className='formgrid grid'>
                            <Disabled.Provider value={disabled}>
                                <Modals.Provider value={{ modals, setModals }}>
                                    {props.children}
                                </Modals.Provider>
                            </Disabled.Provider>
                        </div>
                        {!props.hideButtons && (
                            <div className={translationClassName}>
                                {onTranslations ? (
                                    <Button
                                        disabled={methods.formState.isSubmitting}
                                        icon='pi pi-fw pi-language'
                                        label='Traduções'
                                        onClick={onTranslations}
                                        raised
                                        severity='secondary'
                                        text
                                        type='button'
                                    />
                                ) : (
                                    <span />
                                )}
                                <div className={submitClassName}>
                                    <Button
                                        disabled={methods.formState.isSubmitting}
                                        icon='pi pi-fw pi-times'
                                        label='Cancelar'
                                        onClick={onCancel}
                                        raised
                                        severity='secondary'
                                        type='button'
                                        size='small'
                                    />
                                    <Button
                                        disabled={disabled}
                                        icon='pi pi-fw pi-check'
                                        label='Salvar'
                                        raised
                                        type='submit'
                                        size='small'
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </FormProvider>
                {modals &&
                    Object.keys(modals ?? {}).map((key) => {
                        const modal = modals[key];
                        return (
                            <FormModal
                                key={modal.name}
                                clearErrors={methods.clearErrors}
                                component={modal.component}
                                header={modal.header}
                                name={modal.name}
                                onHide={() =>
                                    setModals((modals) => ({
                                        ...modals,
                                        [modal.name]: { ...modal, visible: false },
                                    }))
                                }
                                optionValue={modal.optionValue}
                                params={modal.params}
                                path={modal.path}
                                setValue={methods.setValue}
                                visible={modal.visible}
                            />
                        );
                    })}
            </div>
        </div>
    );
};


Form.InputText = InputTextField;
Form.InputMask = InputMaskField;
Form.InputCalendar = CalendarField;
Form.InputDropdown = DropdownField;
Form.InputTextArea = InputTextareaField;
Form.InputFile = InputFileField;
Form.InputNumber = InputNumberField;
Form.RequestField = RequestField;
Form.MultiSelect = MultiSelectField;
Form.InputChips = InputChipsField;
Form.InputSwitch = InputSwitchField;
Form.InputSlug = InputSlugField;
Form.ButtonField = ButtonField;
Form.EditorField = EditorField;