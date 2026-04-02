import { useEffect, useState } from 'react';
import { Form } from '../../../core/components/Form';
import api from '../../../core/client';
import { useAppToast } from '../../../core/useAppToast';

interface Roteiro {
    id?: number;
    nome_motorista: string;
    placa_veiculo: string;
    status: string;
    remessa?: string;
    viagem_texto?: string;
    data_carregamento?: Date;
    data_entrega?: Date;
    observacao?: string;
    detalhes?: string;
}

const statusOptions = [
    { label: 'Pendente', value: 'PENDENTE' },
    { label: 'Em Andamento', value: 'EM_ANDAMENTO' },
    { label: 'Cancelado', value: 'CANCELADO' },
    { label: 'Entregue', value: 'ENTREGUE' },
    { label: 'Em Trânsito', value: 'EM_TRANSITO' },
    { label: 'Concluído', value: 'CONCLUIDO' }
];

const categoriaOptions = [
    { label: 'Viagem', value: 'VIAGEM' },
    { label: 'Coleta', value: 'COLETA' },
    { label: 'Entrega', value: 'ENTREGA' },
    { label: 'Transferência', value: 'TRANSFERENCIA' },
    { label: 'Devolução', value: 'DEVOLUCAO' },
    { label: 'Outro', value: 'OUTRO' }
];

const RoteiroForm = ({ roteiroId, onCancel, onSuccess }: {
    roteiroId?: number;
    onCancel: () => void;
    onSuccess: () => void;
}) => {
    const toast = useAppToast();
    const [initialData, setInitialData] = useState<Roteiro | null>(null);

    useEffect(() => {
        if (roteiroId) {
            api.get(`roteiros/${roteiroId}`).then((res) => {
                setInitialData(res?.data);
            }).catch(() => {
                toast.showError('Erro', 'Não foi possível carregar os dados do usuário.');
            });
        }
    }, [roteiroId]);

    const handleSave = async (data: Record<string, unknown>) => {
        try {
            const payload = {
                ...data,
                data_carregamento: data.data_carregamento || null,
                data_entrega: data.data_entrega || null,
                remessa: String(data.remessa || ''),
                viagem_texto: String(data.viagem_texto || ''),
                status: data.status || 'Pendente'
            };

            if (roteiroId) {
                await api.put(`/roteiros/${roteiroId}`, payload);
            } else {
                await api.post('/roteiros', payload);
            }

            toast.showSuccess('Sucesso', 'Empresa salva com sucesso!');
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
            initialData={initialData || {}}
            onSubmit={handleSave}
            onCancel={onCancel}
        >
            <Form.InputText
                name="nome_motorista"
                label="Motorista"
                className="col-12 md:col-6"
                rules={{ required: true }}
            />

            <Form.InputMask
                name="placa_veiculo"
                label="Placa"
                className="col-12 md:col-3"
                mask="***-9*99"
                rules={{ required: true }}
            />

            <Form.InputDropdown
                name="categoria"
                label="Categoria"
                options={categoriaOptions}
                className="col-12 md:col-3"
                rules={{ required: true }}
            />

            <Form.InputDropdown
                name="status"
                label="Status"
                options={statusOptions}
                className="col-12 md:col-3"
                rules={{ required: true }}
            />

            <Form.InputText
                name="remessa"
                label="Remessa"
                className="col-12 md:col-9"
            />

            <Form.InputText
                name="viagem_texto"
                label="Viagem"
                className="col-12 md:col-6"
            />

            <Form.InputText
                name="data_carregamento"
                label="Data Carregamento"
                className="col-12 md:col-3"
                type="date"
            />

            <Form.InputText
                name="data_entrega"
                label="Data Entrega"
                className="col-12 md:col-3"
                type="date"
            />

            <Form.InputText
                name="observacao"
                label="Observação"
                className="col-12"
            />

            <Form.InputText
                name="detalhes"
                label="Detalhes Internos"
                className="col-12"
            />
        </Form>
    );
};

export default RoteiroForm;