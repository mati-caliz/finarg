"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useStore";
import {
  Banknote,
  Calculator,
  ChevronDown,
  ChevronRight,
  Home,
  Landmark,
  LineChart,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavLeaf {
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavLeaf[];
}

interface NavTop {
  label: string;
  href: string;
  icon: React.ElementType;
}

const TOP_LINKS: NavTop[] = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Congreso", href: "/congreso", icon: Landmark },
];

const GROUPS: NavGroup[] = [
  {
    label: "Indicadores",
    icon: LineChart,
    items: [
      { label: "Dólar", href: "/indicador/dolar_blue" },
      { label: "Inflación", href: "/indicador/ipc_mensual" },
      { label: "Riesgo país", href: "/indicador/riesgo_pais" },
      { label: "Reservas", href: "/indicador/reservas_internacionales" },
      { label: "Pobreza", href: "/indicador/pobreza_personas" },
      { label: "Desempleo", href: "/indicador/desempleo" },
    ],
  },
  {
    label: "Calculadoras",
    icon: Calculator,
    items: [
      { label: "Sueldo neto", href: "/calculadora-sueldo-neto" },
      { label: "Impacto fiscal", href: "/calculadora-impacto-fiscal" },
      { label: "Interés compuesto", href: "/calculadora-interes-compuesto" },
      { label: "Ajuste por inflación", href: "/calculadora-ajuste-inflacion" },
    ],
  },
];

function BrandMark() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-sans)",
        fontWeight: 800,
        fontSize: "1.25rem",
        color: "var(--text-body)",
        letterSpacing: "-0.02em",
      }}
    >
      La
      <span style={{ width: 3, height: 20, background: "var(--brecha)", borderRadius: 2 }} />
      Brecha
    </span>
  );
}

function leafActive(pathname: string, href: string): boolean {
  return pathname === href;
}

interface LeafLinkProps {
  item: NavLeaf;
  pathname: string;
  onNavigate: () => void;
}

function LeafLink({ item, pathname, onNavigate }: LeafLinkProps) {
  const active = leafActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      style={{
        display: "block",
        padding: "6px 10px",
        borderRadius: "var(--radius-md)",
        fontSize: "0.8125rem",
        fontWeight: active ? 600 : 500,
        color: active ? "var(--accent-strong)" : "var(--text-secondary)",
        background: active ? "var(--accent-soft)" : "transparent",
        textDecoration: "none",
        transition: "background 120ms ease-out,color 120ms ease-out",
      }}
    >
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();
  const activeGroup = GROUPS.find((group) => group.items.some((item) => item.href === pathname));
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup?.label ?? "Indicadores");

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        setSidebarOpen(window.innerWidth >= 1024);
      }, 150);
    };
    setSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [setSidebarOpen]);

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (sidebarOpen && isMobile) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
    return undefined;
  }, [sidebarOpen]);

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      <button
        type="button"
        className="fixed top-3 left-3 z-50 lg:hidden"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-1)",
          background: "var(--surface-card)",
          color: "var(--text-secondary)",
        }}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(20,25,31,0.4)" }}
          onClick={toggleSidebar}
          onKeyDown={(event) => event.key === "Enter" && toggleSidebar()}
          role="button"
          tabIndex={0}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background: "var(--surface-card)",
          borderRight: "1px solid var(--border-1)",
        }}
      >
        <div className="flex h-full flex-col">
          <div
            className="flex h-16 items-center px-5"
            style={{ borderBottom: "1px solid var(--border-1)" }}
          >
            <Link href="/" aria-label="Ir al inicio" onClick={closeOnMobile}>
              <BrandMark />
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-3 overflow-y-auto overscroll-none min-h-0">
            {TOP_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeOnMobile}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.875rem",
                    fontWeight: active ? 600 : 500,
                    color: active ? "var(--accent-strong)" : "var(--text-body)",
                    background: active ? "var(--accent-soft)" : "transparent",
                    textDecoration: "none",
                  }}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}

            {GROUPS.map((group) => {
              const open = openGroup === group.label;
              return (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() => setOpenGroup(open ? null : group.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "var(--radius-md)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <group.icon className="h-4 w-4 shrink-0" />
                    <span style={{ flex: 1, textAlign: "left" }}>{group.label}</span>
                    {open ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {open && (
                    <div
                      className="space-y-0.5"
                      style={{
                        marginLeft: 17,
                        paddingLeft: 10,
                        borderLeft: "1px solid var(--border-1)",
                      }}
                    >
                      {group.items.map((item) => (
                        <LeafLink
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          onNavigate={closeOnMobile}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4" style={{ borderTop: "1px solid var(--border-1)" }}>
            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
              }}
            >
              <Banknote className="h-3.5 w-3.5" />
              Observatorio económico · Argentina
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
