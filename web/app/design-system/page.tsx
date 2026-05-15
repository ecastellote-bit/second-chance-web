"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  DoorCard,
  Input,
  PageHeader,
  PageShell,
  SectionTitle,
  ThemePoster,
} from "@/components/ui";
import { vuDoorTokens, vuTokens } from "@/lib/design/tokens";

export default function DesignSystemPage() {
  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="VocationUp by Second Chance"
        title="Sistema visual oficial"
        description="Paleta, tipografía y componentes según la guía de diseño ChatGPT. Implementación en Cursor para el MVP."
        align="center"
      />

      <section className="space-y-4">
        <SectionTitle>Paleta principal</SectionTitle>
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: "Azul Navy", hex: vuTokens.color.navy, className: "bg-vu-navy" },
              { name: "Teal", hex: vuTokens.color.teal, className: "bg-vu-teal" },
              { name: "Lima", hex: vuTokens.color.lime, className: "bg-vu-lime" },
              { name: "Blanco Niebla", hex: vuTokens.color.mist, className: "bg-vu-mist border border-vu-border" },
              { name: "Gris Grafito", hex: vuTokens.color.graphite, className: "bg-vu-graphite" },
              { name: "Gris Cielo", hex: vuTokens.color.sky, className: "bg-vu-sky" },
            ].map((swatch) => (
              <div key={swatch.name} className="space-y-2">
                <div className={`h-14 rounded-vu-sm ${swatch.className}`} />
                <p className="text-sm font-semibold text-vu-navy">{swatch.name}</p>
                <p className="text-xs font-mono text-vu-graphite-subtle">{swatch.hex}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Tipografía</SectionTitle>
        <Card variant="muted" className="space-y-4">
          <p className="vu-h1">Tu plaza inicial</p>
          <p className="vu-h2">Explorá, conectá y crecé con personas que comparten tu camino</p>
          <p className="vu-body">
            Cuerpo 16/24 — texto secundario legible, contraste AA. Sin estética clínica:
            cálido, humano y habitable.
          </p>
          <p className="vu-caption">Caption 12/16 — metadatos y ayudas</p>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Botones (mín. 44×44 px)</SectionTitle>
        <Card>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" showArrow>
              Primario Teal
            </Button>
            <Button variant="secondary" showArrow>
              Secundario
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="navy">Navy</Button>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Badges</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="lime">Muy activo</Badge>
          <Badge variant="lime">Nuevo</Badge>
          <Badge variant="teal">Temática</Badge>
          <Badge variant="navy">Círculo</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Campos</SectionTitle>
        <Card className="max-w-md">
          <Input label="¿Qué necesitás hoy?" placeholder="Buscar en VocationUp..." />
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Tarjeta temática</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <ThemePoster
            label="Aprender tecnología acompañado"
            description="Formación y recursos con otros en el mismo momento."
            badge="Muy activo"
          />
          <ThemePoster
            label="Bienestar y propósito"
            description="Espacios para ordenar tu energía y tu dirección."
            selected
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Puertas de entrada</SectionTitle>
        <p className="vu-body text-sm">
          Azul · Teal · Lima — según mockup &quot;Mundo visual VocationUp&quot;
        </p>
        <div className="space-y-4">
          {(Object.keys(vuDoorTokens) as Array<keyof typeof vuDoorTokens>).map(
            (doorId) => {
              const door = vuDoorTokens[doorId];
              return (
                <DoorCard
                  key={doorId}
                  title={door.mockupLine}
                  subtitle={door.subtitle}
                  description={door.label}
                  icon={door.icon}
                  suggested={doorId === "conectar_con_otros"}
                  style={{
                    accent: door.accent,
                    accentSoft: door.accentSoft,
                    border: door.border,
                  }}
                />
              );
            },
          )}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Reglas rápidas</SectionTitle>
        <Card variant="muted">
          <ul className="vu-body text-sm space-y-2 list-disc pl-5">
            <li>Radios: 16px (botones/tags), 24px (tarjetas), 32px (modales)</li>
            <li>Grid 8pt: 8, 16, 24, 32, 40, 48, 64 px</li>
            <li>Sombra: 0 4px 16px rgba(15, 42, 70, 0.08)</li>
            <li>Contraste AA y foco visible (teal)</li>
          </ul>
        </Card>
      </section>

      <footer className="pt-6 border-t border-vu-border flex flex-wrap gap-4 justify-center">
        <Link href="/" className="text-sm font-semibold text-vu-teal underline">
          Inicio
        </Link>
        <Link href="/community" className="text-sm text-vu-graphite-muted underline">
          Comunidad
        </Link>
        <Link href="/full/step-1" className="text-sm text-vu-graphite-muted underline">
          Diagnóstico
        </Link>
      </footer>
    </PageShell>
  );
}
