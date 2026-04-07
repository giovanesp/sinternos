
import type { AppModule } from "../../core/types/module";
import AgendaCalendario from "./AgendaCalendario";
import AgendaList from "./AgendaList";

const sistemaModule: AppModule[] = [
    {
        path: "/agenda",
        label: "Agenda",
        icon: "pi pi-calendar",
        element: <AgendaList />,
        showInMenu: true,
        order: 1,
        roles: ["admin", "gestor"],
        group: "Agenda",
        groupIcon: "pi pi-calendar"
    },
    {
        path: "/calendario",
        label: "Calendário",
        icon: "pi pi-calendar",
        element: <AgendaCalendario />,
        showInMenu: true,
        order: 2,
        roles: ["admin", "gestor"],
        group: "Agenda",
        groupIcon: "pi pi-calendar"
    },
];

export default sistemaModule;