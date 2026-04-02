import React from 'react';
import { Avatar } from 'primereact/avatar';

const API_BASE_URL = import.meta.env.APP_URL || 'http://localhost:3000';

interface UserAvatarProps {
    nome?: string;
    fotoUrl?: string | null;
    size?: 'normal' | 'large' | 'xlarge';
    shape?: 'square' | 'circle';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
    nome,
    fotoUrl,
    size = 'large',
    shape = 'circle'
}) => {
    let finalUrl = fotoUrl;
    if (finalUrl && finalUrl.trim() !== '') {
        if (!finalUrl.startsWith('http')) {
            finalUrl = `${API_BASE_URL}${finalUrl}`;
        }

        return (
            <Avatar
                image={finalUrl}
                size={size}
                shape={shape}
                imageAlt={`Avatar de ${nome || 'Usuário'}`}
                style={{ objectFit: 'cover' }}
            />
        );
    }

    const inicial = nome ? nome.charAt(0).toUpperCase() : '?';

    return (
        <Avatar
            label={inicial}
            size={size}
            shape={shape}
            style={{ backgroundColor: '#2196F3', color: '#ffffff' }}
        />
    );
};