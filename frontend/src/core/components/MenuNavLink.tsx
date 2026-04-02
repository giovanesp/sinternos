import { Link } from 'react-router-dom';
import type { MenuItem } from 'primereact/menuitem';

export const menuNavLink = (item: MenuItem) => {
    if (item.url) {
        return (
            <Link to={item.url} className="p-menuitem-link">
                {item.icon && <span className={`p-menuitem-icon ${item.icon}`}></span>}
                <span className="p-menuitem-text">{item.label}</span>
            </Link>
        );
    }
    return <span className="p-menuitem-text">{item.label}</span>;
};