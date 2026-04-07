import { useEffect, useState } from 'react';
import { Form } from '../../core/components/Form';
import api from '../../core/client';
import { useAppToast } from '../../core/useAppToast';

interface EventoFormData {
    id?: number;
    titulo: string;
    descricao: string;
    data_inicio: Date | string;
    data_fim: Date | string;
    diretor_id: number;
    cor: string;
    status: string;
}

const statusOptions = [
    { label: 'Confirmado', value: 'confirmado' },
    { label: 'Pendente', value: 'pendente' },
    { label: 'Cancelado', value: 'cancelado' }
];

const corOptions = [
    { label: 'Azul (Padrão)', value: '#3174ad' },
    { label: 'Verde (Financeiro)', value: '#28a745' },
    { label: 'Amarelo (Atenção)', value: '#fbc02d' },
    { label: 'Vermelho (Urgente)', value: '#d32f2f' },
    { label: 'Roxo (Pessoal)', value: '#6f42c1' }
];

const EventoForm = ({ eventoId, onCancel, onSuccess, initialDates, diretorId }: {
    eventoId?: number;
    onCancel: () => void;
    onSuccess: () => void;
    initialDates?: { start: Date, end: Date };
    diretorId?: number;
}) => {
    const toast = useAppToast();
    const [initialData, setInitialData] = useState<Partial<EventoFormData> | null>(null);
    const [diretores, setDiretores] = useState<{ label: string, value: number }[]>([]);

    useEffect(() => {
        api.get('/users?is_director=true').then((res) => {
            const options = res.data.map((d: any) => ({ label: d.nome, value: d.id }));
            setDiretores(options);
        });

        if (eventoId) {
            api.get(`eventos/${eventoId}`).then((res) => {
                const data = res.data;
                setInitialData({
                    ...data,
                    data_inicio: new Date(data.data_inicio),
                    data_fim: new Date(data.data_fim)
                });
            }).catch(() => {
                toast.showError('Erro', 'Não foi possível carregar os dados do evento.');
            });
        } else {
            setInitialData({
                data_inicio: initialDates?.start,
                data_fim: initialDates?.end,
                diretor_id: diretorId,
                cor: '#3174ad',
                status: 'confirmado'
            });
        }
    }, [eventoId, initialDates]);

    const handleSave = async (data: Record<string, any>) => {
        try {
            const payload = {
                titulo: data.titulo,
                descricao: data.descricao,
                data_inicio: data.data_inicio,
                data_fim: data.data_fim,
                diretor_id: data.diretor_id,
                cor: data.cor,
                status: data.status
            };

            if (eventoId) {
                await api.put(`/eventos/${eventoId}`, payload);
            } else {
                await api.post('/eventos', payload);
            }

            toast.showSuccess('Sucesso', 'Agenda atualizada com sucesso!');
            onSuccess();
            return true;
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Erro ao salvar evento';
            toast.showError('Erro', msg);
        }
    };

    return (
        <Form
            initialData={initialData || {}}
            onSubmit={handleSave}
            onCancel={onCancel}

        >
            <Form.InputText
                name="titulo"
                label="Título do Evento"
                className="col-12"
                rules={{ required: 'O título é obrigatório' }}
            />

            <Form.InputDropdown
                name="diretor_id"
                label="Agenda do Diretor"
                className="col-12 md:col-6"
                options={diretores}
                rules={{ required: 'Selecione o dono da agenda' }}
            />

            <Form.InputDropdown
                name="cor"
                label="Categoria/Cor"
                className="col-12 md:col-6"
                options={corOptions}
            />

            <Form.InputCalendar
                name="data_inicio"
                label="Início"
                className="col-12 md:col-6"
                showTime
                hourFormat="24"
                dateFormat="dd/mm/yy"
                rules={{ required: 'Data de início é obrigatória' }}
            />

            <Form.InputCalendar
                name="data_fim"
                label="Término"
                className="col-12 md:col-6"
                showTime
                hourFormat="24"
                dateFormat="dd/mm/yy"
                rules={{ required: 'Data de término é obrigatória' }}
            />

            <Form.InputTextArea
                name="descricao"
                label="Descrição / Observações"
                className="col-12"
                rows={3}
            />

            <Form.InputDropdown
                name="status"
                label="Status do Compromisso"
                options={statusOptions}
                className="col-12 md:col-6"
            />
        </Form>
    );
};

export default EventoForm;