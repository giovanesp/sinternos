import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import api from '../../../core/client';
import { useAppToast } from '../../../core/useAppToast';

interface Props {
    visible: boolean;
    onHide: () => void;
    dataPadrao: Date;
    onSuccess: () => void;
}

export const NovoRegistro = ({ visible, onHide, dataPadrao, onSuccess }: Props) => {
    const toast = useAppToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        data_referencia: dataPadrao.toISOString().split('T')[0],
        grupo_nome: '',
        motorista_nome: '',
        veiculo_placa: '',
        status_cor: 'verde',
        situacao_logistica: 'Em Trânsito',
        info_viagem: '',
        observacoes: ''
    });

    const coresOptions = [
        { label: 'Operação (Verde)', value: 'verde' },
        { label: 'Parado (Vermelho)', value: 'vermelho' },
        { label: 'Manutenção (Laranja)', value: 'laranja' }
    ];

    const situacaoOptions = [
        { label: 'Em Trânsito', value: 'Em Trânsito' },
        { label: 'Entregue', value: 'Entregue' },
        { label: 'Devolvido', value: 'Devolvido' },
        { label: 'Cancelado', value: 'Cancelado' }
    ];

    const salvar = async () => {
        if (!formData.grupo_nome || !formData.motorista_nome) {
            toast.showError('Atenção', 'Grupo e Motorista são obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/operacao_diaria/batch', {
                data_referencia: formData.data_referencia,
                itens: [formData]
            });
            toast.showSuccess('Sucesso', 'Registro adicionado ao quadro!');
            onSuccess();
            onHide();
        } catch (error) {
            toast.showError('Erro', 'Não foi possível salvar o registro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            header="Adicionar ao Quadro Operacional"
            visible={visible}
            style={{ width: '450px' }}
            onHide={onHide}
            footer={
                <div>
                    <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
                    <Button label="Adicionar" icon="pi pi-check" onClick={salvar} loading={loading} />
                </div>
            }
        >
            <div className="flex flex-column gap-3 mt-2">
                <div className="field">
                    <label htmlFor="data_referencia" className="font-bold block mb-2">Data de Referência</label>
                    <InputText
                        id="data_referencia"
                        type="date"
                        value={formData.data_referencia}
                        onChange={(e) => setFormData({ ...formData, data_referencia: e.target.value })}
                        className="w-full"
                    />
                </div>

                <div className="field">
                    <label htmlFor="grupo" className="font-bold block mb-2">Grupo/Remessa (Amarelo)</label>
                    <InputText
                        id="grupo"
                        value={formData.grupo_nome}
                        onChange={(e) => setFormData({ ...formData, grupo_nome: e.target.value })}
                        placeholder="Ex: 2ª REMESSA ARM. CORTEZIA"
                        className="w-full"
                    />
                </div>

                <div className="grid">
                    <div className="col-8">
                        <label className="font-bold block mb-2">Motorista</label>
                        <InputText
                            value={formData.motorista_nome}
                            onChange={(e) => setFormData({ ...formData, motorista_nome: e.target.value })}
                            className="w-full"
                        />
                    </div>
                    <div className="col-4">
                        <label className="font-bold block mb-2">Placa</label>
                        <InputText
                            value={formData.veiculo_placa}
                            onChange={(e) => setFormData({ ...formData, veiculo_placa: e.target.value })}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="field">
                    <label className="font-bold block mb-2">Status Visual</label>
                    <Dropdown
                        value={formData.status_cor}
                        options={coresOptions}
                        onChange={(e) => setFormData({ ...formData, status_cor: e.value })}
                        className="w-full"
                    />
                </div>

                <div className="field">
                    <label className="font-bold block mb-2">Situação Logística</label>
                    <Dropdown
                        value={formData.situacao_logistica}
                        options={situacaoOptions}
                        onChange={(e) => setFormData({ ...formData, situacao_logistica: e.value })}
                        className="w-full"
                    />
                </div>

                <div className="field">
                    <label className="font-bold block mb-2">Info Viagem (Coluna B/E)</label>
                    <InputText
                        value={formData.info_viagem}
                        onChange={(e) => setFormData({ ...formData, info_viagem: e.target.value })}
                        placeholder="Ex: 3ª viagem – carregou 20.03"
                        className="w-full"
                    />
                </div>

                <div className="field">
                    <label className="font-bold block mb-2">Observações/Notas</label>
                    <InputTextarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        rows={3}
                        className="w-full"
                    />
                </div>
            </div>
        </Dialog>
    );
};