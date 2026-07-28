import Link from "next/link";

export default function PublicProfileNotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center font-[family-name:var(--font-inter)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A9BB0]">
        VocationUp Connect
      </p>
      <h1 className="mt-3 text-[1.5rem] font-extrabold text-[#0B2E59]">
        Este perfil no está disponible
      </h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[#6B7A8C]">
        Puede que la persona aún no haya activado su tarjeta pública, o que el enlace haya
        cambiado.
      </p>
      <Link
        href="/community/conectar_con_otros"
        className="mt-8 inline-flex min-h-[48px] items-center rounded-2xl bg-[#C6D92D] px-6 text-[14px] font-bold text-[#0B2E59] shadow-[0_4px_16px_rgba(198,217,45,0.35)] transition hover:brightness-105"
      >
        Explorar el directorio
      </Link>
    </main>
  );
}
