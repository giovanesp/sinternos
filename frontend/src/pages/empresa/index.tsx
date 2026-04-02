
import type { AppModule } from "../../core/types/module";
import EmpresaList from "./EmpresaList";

const sistemaModule: AppModule[] = [
    {
        path: "/empresa",
        label: "Empresas",
        icon: "pi pi-building",
        element: <EmpresaList />,
        showInMenu: true,
        order: 1,
        roles: ["admin", "gestor"],
    },
];

export default sistemaModule;