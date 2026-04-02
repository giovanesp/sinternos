import { Dialog } from 'primereact/dialog';
import type { FieldValues } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../../core/client';
import { Form } from '../../../core/components/Form';


export const UserPassword = (props: {
    id: number;
    visible: boolean;
    onHide: () => void;
}) => {
    const BREAKPOINT = 608;

    const onSubmit = async (data: Record<string, unknown>) => {
        const save = await api.post(`/usuarios/${props.id}/password`, data);
        if (!save) {
            return;
        }
        toast.success('Senha alterada com sucesso!');
        props.onHide();
    };

    const onValidate = (value: string, values: FieldValues) => {
        if (value !== values.new) {
            return 'Senhas não correspondem';
        }
        return true;
    };

    return (
        <Dialog
            header='Alterar senha'
            onHide={props.onHide}
            style={{ width: window.innerWidth >= BREAKPOINT ? '30vw' : '90vw' }}
            visible={props.visible}
        >
            <Form
                initialData={{ new: '', confirm: '' }}
                onCancel={props.onHide}
                onSubmit={onSubmit}
            >
                <Form.InputText
                    className='col-12'
                    label='Senha Nova'
                    name='new'
                    type='password'
                    rules={{
                        minLength: { message: 'Mínimo de 6 caracteres', value: 6, },
                        required: true,
                    }}
                />
                <Form.InputText
                    className='col-12'
                    label='Confirmação'
                    name='confirm'
                    type='password'
                    rules={{
                        minLength: { message: 'Mínimo de 6 caracteres', value: 6, },
                        required: true,
                        validate: onValidate,
                    }}
                />
            </Form>
        </Dialog>
    );
};