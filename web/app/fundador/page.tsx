import FundadorPageContent from "./FundadorPageContent";

export default function FundadorPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const previewToken =
    typeof searchParams["preview-comunidad"] === "string"
      ? searchParams["preview-comunidad"].trim()
      : undefined;
  const debugFounderExit = searchParams["debugFounderExit"] === "1";

  return (
    <>
      <noscript>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#071018',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          zIndex: 99999,
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Hay algo en vos que todavía no explotaste
          </h1>
          <p style={{ fontSize: '1rem', marginBottom: '2rem', maxWidth: '20rem' }}>
            VocationUp te ayuda a redescubrirlo. Necesitás activar JavaScript para continuar.
          </p>
          <a href="/full" style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#C6D92D',
            color: '#0B2E59',
            textDecoration: 'none',
            borderRadius: '1rem',
            fontWeight: 'bold',
          }}>
            Empezar mi lectura
          </a>
        </div>
      </noscript>
      <FundadorPageContent
        previewToken={previewToken}
        debugFounderExit={debugFounderExit}
      />
    </>
  );
}
