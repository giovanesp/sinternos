import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import api from '../../../core/client';

export const EdicaoIndividual = ({ item, onSuccess, onCancel }: any) => {
    const [formData, setFormData] = useState({ ...item });

    const coresOptions = [
        { label: 'Operação (Verde)', value: 'verde' },
        { label: 'Parado (Vermelho)', value: 'vermelho' },
        { label: 'Manutenção (Laranja)', value: 'laranja' }
    ];

    const handleSave = async () => {
        await api.put('/operacao_diaria/batch', {
            data_referencia: formData.data_referencia,
            itens: [formData]
        });
        onSuccess();
    };

    return (
        <div className="flex flex-column gap-3">
            <div className="field">
                <label className="font-bold">Grupo/Remessa</label>
                <InputText value={formData.grupo_nome} onChange={(e) => setFormData({ ...formData, grupo_nome: e.target.value })} className="w-full" />
            </div>
            <div className="field">
                <label className="font-bold">Motorista</label>
                <InputText value={formData.motorista_nome} onChange={(e) => setFormData({ ...formData, motorista_nome: e.target.value })} className="w-full" />
            </div>
            <div className="field">
                <label className="font-bold">Status/Cor</label>
                <Dropdown value={formData.status_cor} options={coresOptions} onChange={(e) => setFormData({ ...formData, status_cor: e.value })} className="w-full" />
            </div>
            <div className="field">
                <label className="font-bold">Info Viagem</label>
                <InputText value={formData.info_viagem || ''} onChange={(e) => setFormData({ ...formData, info_viagem: e.target.value })} className="w-full" />
            </div>
            <div className="flex justify-content-end gap-2 mt-3">
                <Button label="Cancelar" className="p-button-text" onClick={onCancel} />
                <Button label="Salvar Alteração" onClick={handleSave} />
            </div>
        </div>
    );
};