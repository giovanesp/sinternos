import type { MouseEvent } from 'react';
import { formatBytes } from '../helpers/formatBytes';


export const FieldLabel = (props: {
    icon?: string;
    isRequired?: boolean;
    label?: string;
    limit?: number;
    name?: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) => {
    const { icon, isRequired, label, limit, name, onClick } = props;
    if (!icon && !label) {
        return null;
    }
    return (
        <label htmlFor={name}>
            {icon && onClick && (
                <a className='no-underline' href='#' onClick={onClick}>
                    <i className={icon} />
                </a>
            )}
            {icon && !onClick && <i className={icon} />}
            {icon && label && ' '}
            <b>{label}</b>
            {isRequired && <span style={{ color: 'red' }}> *</span>}
            {limit && (
                <span style={{ color: 'red' }}>
                    {' '}
                    (limite: {formatBytes(limit)})
                </span>
            )}
        </label>
    );
};