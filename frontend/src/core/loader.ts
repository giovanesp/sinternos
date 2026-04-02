import type { AppModule } from "./types/module";

const modulesFiles = import.meta.glob("../pages/**/index.tsx", { eager: true });

export const appModules: AppModule[] = Object.values(modulesFiles).flatMap(
    (m: any) => {
        const mod = m.default;
        return Array.isArray(mod) ? mod : [mod];
    },
);

export const getMenuItems = (
    navigate: (path: string) => void,
    userRoles: string | string[] = [],
) => {
    const userRolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
    const visibleModules = appModules
        .filter((m) => m.showInMenu)
        .filter((m) => {
            if (!m.roles || m.roles.length === 0) {
                return true;
            }
            return m.roles.some((role) => userRolesArray.includes(role));
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const menuGroups: Record<string, any> = {};
    const finalMenu: any[] = [];

    visibleModules.forEach((mod) => {
        const menuItem = {
            label: mod.label,
            icon: mod.icon,
            command: () => navigate(mod.path),
        };

        if (mod.group) {
            if (!menuGroups[mod.group]) {
                menuGroups[mod.group] = {
                    label: mod.group,
                    icon: mod.groupIcon || "pi pi-folder",
                    items: [],
                };
                finalMenu.push(menuGroups[mod.group]);
            }
            menuGroups[mod.group].items.push(menuItem);
        } else {
            finalMenu.push(menuItem);
        }
    });

    return finalMenu;
};