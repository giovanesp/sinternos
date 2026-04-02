import { useEffect, useState } from 'react';
import { Form } from '../../../core/components/Form';
import api from '../../../core/client';
import { UserPassword } from './UserPassword';
import { useAppToast } from '../../../core/useAppToast';

interface UsuarioFormData {
    id?: number;
    nome: string;
    email: string;
    role: 'admin' | 'gestor' | 'usuario';
    senha?: string;
    status?: boolean;
}

const roleOptions = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Gestor', value: 'gestor' },
    { label: 'Usuário', value: 'usuario' },
];

const statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false }
];


const UsuarioForm = ({ usuarioId, onCancel, onSuccess }: {
    usuarioId?: number;
    onCancel: () => void;
    onSuccess: () => void;
}) => {
    const toast = useAppToast();
    const [initialData, setInitialData] = useState<UsuarioFormData | null>(null);
    const [passwordDialog, setPasswordDialog] = useState(false);

    useEffect(() => {
        if (usuarioId) {
            api.get(`users/${usuarioId}`).then((res) => {
                setInitialData(res?.data);
            }).catch(() => {
                toast.showError('Erro', 'Não foi possível carregar os dados do usuário.');
            });
        }
    }, [usuarioId]);

    const handleSave = async (data: Record<string, unknown>) => {
        try {
            const payload: Record<string, unknown> = {
                nome: data.nome,
                email: data.email,
                username: data.email,
                role: data.role,
                is_active: data.is_active,
            };

            const passwordValue = data.senha || data.password;
            if (passwordValue) {
                payload.password = passwordValue;
            }

            if (usuarioId) {
                await api.put(`/users/${usuarioId}`, payload);
            } else {
                await api.post('/users', payload);
            }

            toast.showSuccess('Sucesso', 'Usuário salvo com sucesso!');
            onSuccess();
            return true;
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Erro ao processar solicitação';
            toast.showError('Erro', msg);
            console.error(err);
        }
    };

    return (
        <Form
            initialData={initialData || { role: 'ADMIN', senha: '' }}
            onSubmit={handleSave}
            onCancel={onCancel}
        >
            <Form.InputText
                name="nome"
                label="Nome Completo"
                className="col-12"
                rules={{ required: 'Nome é obrigatório', minLength: { value: 3, message: 'Mínimo de 3 caracteres' } }}
            />

            <Form.InputText
                name="email"
                label="E-mail"
                className="col-12 md:col-6"
                rules={{ required: 'E-mail é obrigatório', pattern: { value: /^\S+@\S+\.\S+$/, message: 'E-mail inválido' } }}
            />

            <Form.InputDropdown
                name="role"
                label="Nível de Acesso"
                className="col-12 md:col-6"
                options={roleOptions}
                rules={{ required: 'Selecione o nível de acesso' }}
            />

            <Form.InputDropdown
                name="is_active"
                label="Status"
                options={statusOptions}
                className="col-12 md:col-6"
                rules={{ required: true }}
            />

            {initialData?.id ? (
                <Form.ButtonField
                    buttonLabel='Alterar'
                    className='col-12 md:col-6'
                    label='Senha'
                    onClick={(e) => {
                        e.preventDefault();
                        setPasswordDialog(true);
                    }}
                />
            ) : (
                <Form.InputText
                    className='col-12 md:col-6'
                    label='Senha'
                    name='password'
                    type='password'
                    rules={{ required: true, minLength: { value: 6, message: 'Mínimo de 6 caracteres' } }}
                />
            )}

            {initialData?.id && (
                <UserPassword
                    id={initialData?.id || 0}
                    onHide={() => setPasswordDialog(false)}
                    visible={passwordDialog}
                />
            )}

        </Form>
    );
};

export default UsuarioForm;