
import type { AppModule } from "../../core/types/module";
import UsuariosList from "./usuarios/UsuariosList";

const sistemaModule: AppModule[] = [
    {
        path: "/sistema/usuarios",
        label: "Usuários",
        icon: "pi pi-users",
        element: <UsuariosList />,
        showInMenu: true,
        order: 0,
        group: "Sistema",
        groupIcon: "pi pi-cog",
        roles: ["admin"],
    },
];

export default sistemaModule;