
import type { AppModule } from "../../core/types/module";
import { QuadroOperacional } from "./roteiro/QuadroOperacional";
import RoteiroList from "./roteiro/RoteiroList";

const transporteModule: AppModule[] = [
    {
        path: "/transporte/roteiros",
        label: "Roteiros",
        icon: "pi pi-map",
        element: <RoteiroList />,
        showInMenu: true,
        order: 0,
        group: "Transporte",
        groupIcon: "pi pi-truck",
        roles: ["admin"],
    },
    {
        path: "/transporte/quadro-operacional",
        label: "Quadro Operacional",
        icon: "pi pi-calendar",
        element: <QuadroOperacional />,
        showInMenu: true,
        order: 1,
        group: "Transporte",
        groupIcon: "pi pi-truck",
        roles: ["admin", "gestor", "usuario"],
    },
];

export default transporteModule;