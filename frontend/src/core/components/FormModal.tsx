import { useQueryClient } from '@tanstack/react-query';
import { Dialog } from 'primereact/dialog';
import type {
    FieldValues,
    UseFormClearErrors,
    UseFormSetValue,
} from 'react-hook-form';

import type { FormModalProps } from '../types/types';

export const FormModal = (
    props: FormModalProps & {
        clearErrors: UseFormClearErrors<FieldValues>;
        onHide: () => void;
        setValue: UseFormSetValue<FieldValues>;
    },
) => {
    const { component: Component } = props;
    const queryClient = useQueryClient();

    const onSuccess = (save: Record<string, unknown>) => {
        const params = props.params ?? { orderBy: { name: 'asc' }, status: 1 };
        const value = save[props.optionValue ?? 'id'];
        queryClient.invalidateQueries({ queryKey: ['RequestField', props.path, params] });
        if (save.status === 0) {
            return;
        }
        props.setValue(props.name, value);
        props.clearErrors(props.name);
    };

    return (
        <Dialog
            header={props.header}
            modal
            onHide={props.onHide}
            visible={props.visible}
        >
            <div className='container'>
                <Component
                    headless
                    onCancel={props.onHide}
                    onSuccess={onSuccess}
                />
            </div>
        </Dialog>
    );
};