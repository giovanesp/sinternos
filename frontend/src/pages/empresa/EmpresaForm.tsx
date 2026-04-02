import { useEffect, useState } from 'react';
import { Form } from '../../core/components/Form';
import api from '../../core/client';
import { useAppToast } from '../../core/useAppToast';

interface EmpresaFormData {
    id?: number;
    razao_social: string;
    cnpj: string;
    telefone: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    ramo: string;
    detalhes: string;
    status?: boolean;
}

const statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false }
];

const ufOptions = [
    { label: 'AC', value: 'AC' },
    { label: 'AL', value: 'AL' },
    { label: 'AP', value: 'AP' },
    { label: 'AM', value: 'AM' },
    { label: 'BA', value: 'BA' },
    { label: 'CE', value: 'CE' },
    { label: 'DF', value: 'DF' },
    { label: 'ES', value: 'ES' },
    { label: 'GO', value: 'GO' },
    { label: 'MA', value: 'MA' },
    { label: 'MT', value: 'MT' },
    { label: 'MS', value: 'MS' },
    { label: 'MG', value: 'MG' },
    { label: 'PA', value: 'PA' },
    { label: 'PB', value: 'PB' },
    { label: 'PR', value: 'PR' },
    { label: 'PE', value: 'PE' },
    { label: 'PI', value: 'PI' },
    { label: 'RJ', value: 'RJ' },
    { label: 'RN', value: 'RN' },
    { label: 'RO', value: 'RO' },
    { label: 'RR', value: 'RR' },
    { label: 'RS', value: 'RS' },
    { label: 'SC', value: 'SC' },
    { label: 'SE', value: 'SE' },
    { label: 'SP', value: 'SP' },
    { label: 'TO', value: 'TO' }
];

const EmpresaForm = ({ empresaId, onCancel, onSuccess }: {
    empresaId?: number;
    onCancel: () => void;
    onSuccess: () => void;
}) => {
    const toast = useAppToast();
    const [initialData, setInitialData] = useState<EmpresaFormData | null>(null);

    useEffect(() => {
        if (empresaId) {
            api.get(`empresas/${empresaId}`).then((res) => {
                setInitialData(res?.data);
            }).catch(() => {
                toast.showError('Erro', 'Não foi possível carregar os dados do usuário.');
            });
        }
    }, [empresaId]);

    const handleSave = async (data: Record<string, unknown>) => {
        try {
            const payload: Record<string, unknown> = {
                razao_social: data.razao_social,
                cnpj: data.cnpj,
                telefone: data.telefone,
                endereco: data.endereco,
                numero: data.numero,
                complemento: data.complemento,
                bairro: data.bairro,
                cidade: data.cidade,
                uf: data.uf,
                cep: data.cep,
                ramo: data.ramo,
                detalhes: data.detalhes,
                is_active: data.is_active,
            };

            if (empresaId) {
                await api.put(`/empresas/${empresaId}`, payload);
            } else {
                await api.post('/empresas', payload);
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
                name="razao_social"
                label="Razão Social"
                className="col-12"
                rules={{ required: 'Razão Social é obrigatória', minLength: { value: 3, message: 'Mínimo de 3 caracteres' } }}
            />

            <Form.InputText
                name="fantasia"
                label="Nome Fantasia"
                className="col-12"
                rules={{ required: 'Nome Fantasia é obrigatório', minLength: { value: 3, message: 'Mínimo de 3 caracteres' } }}
            />

            <Form.InputText
                name="email"
                label="E-mail"
                className="col-12 md:col-6"
            />

            <Form.InputMask
                name="cnpj"
                label="CNPJ"
                mask="99.999.999/9999-99"
                className="col-12 md:col-4 xl:col-3"
                rules={{ required: true }}
            />


            <Form.InputMask
                name="telefone"
                label="Telefone"
                className="col-12 md:col-4 xl:col-3"
                mask="(99) 99999-9999"
            />

            <Form.InputText
                name="endereco"
                label="Endereço"
                className="col-12 md:col-6"
            />

            <Form.InputText
                name="numero"
                label="Nº"
                className="col-6 md:col-1"
            />

            <Form.InputText
                name="complemento"
                label="Complemento"
                className="col-6 md:col-2"
            />

            <Form.InputText
                name="bairro"
                label="Bairro"
                className="col-12 md:col-3"
            />

            <Form.InputMask
                name="cep"
                label="CEP"
                className="col-6 md:col-2"
                mask="99999-999"
            />

            <Form.InputText
                name="cidade"
                label="Cidade"
                className="col-12 md:col-6"
                rules={{ required: true }}
            />

            <Form.InputDropdown
                name="uf"
                label="UF"
                className="col-6 md:col-2"
                options={ufOptions}
                rules={{ required: true }}
            />

            <Form.InputText
                name="ramo"
                label="Ramo"
                className="col-12 md:col-12"
            />

            <Form.InputText
                name="detalhes"
                label="Detalhes"
                className="col-12 md:col-8"
            />

            <Form.InputDropdown
                name="is_active"
                label="Status"
                options={statusOptions}
                className="col-12 md:col-4"
                rules={{ required: true }}
            />

        </Form>
    );
};

export default EmpresaForm;