"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Users, UserCircle, Calendar, Wind, ListTodo, Car, ClipboardList, LogIn } from "lucide-react";
import { PrestacionesIcon } from "./icons/PrestacionesIcon";
import { IngresosIcon } from "./icons/IngresosIcon";

export default function SidebarNav({ userRole, isCollapsed }: { userRole?: string, isCollapsed?: boolean }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Turnos en Lista", path: "/", icon: <CalendarDays size={20} /> },
    { name: "Ingresos", path: "/ingresos", icon: <IngresosIcon size={20} /> },
    { name: "Pacientes", path: "/pacientes", icon: <Users size={20} /> },
    { name: "Calendario Interno", path: "/calendario", icon: <Calendar size={20} /> },
    { name: "Turnos Aire", path: "/calendario-aire", icon: <Wind size={20} /> },
    { name: "Domicilio", path: "/calendario-domicilio", icon: <Car size={20} /> },
    { name: "Listados", path: "/listados", icon: <ListTodo size={20} /> },
  ];

  if (userRole === 'admin') {
    navItems.push({ name: "Prestaciones", path: "/prestaciones", icon: <PrestacionesIcon size={20} /> });
    navItems.push({ name: "Resumen Médico", path: "/resumen-medico", icon: <ClipboardList size={20} /> });
    navItems.push({ name: "Usuarios", path: "/usuarios", icon: <Users size={20} /> });
  }

  navItems.push({ name: "Mi Perfil", path: "/perfil", icon: <UserCircle size={20} /> });

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {navItems.map((item) => {
        const isActive = item.path === "/"
          ? pathname === "/"
          : (pathname === item.path || pathname.startsWith(item.path + "/"));
        return (
          <Link
            key={item.path}
            href={item.path}
            title={isCollapsed ? item.name : ""}
            style={{
              display: 'flex', alignItems: 'center', gap: isCollapsed ? '0' : '0.75rem',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: '0.75rem', borderRadius: '8px',
              background: isActive ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.2s ease',
              width: isCollapsed ? '44px' : 'auto',
              margin: isCollapsed ? '0 auto' : '0'
            }}
          >
            {item.icon}
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        )
      })}
    </nav>
  );
}
