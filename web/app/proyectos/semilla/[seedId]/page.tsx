import SeedPageContent from "./SeedPageContent";

export default function FounderSeedPage({
  params,
  searchParams,
}: {
  params: { seedId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const seedId = params.seedId;
  const userIdFromUrl =
    typeof searchParams.userId === "string"
      ? searchParams.userId.trim()
      : undefined;

  return (
    <>
      <noscript>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#F8FAFC',
          color: '#0B2E59',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          zIndex: 99999,
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Proyecto no disponible sin JavaScript
          </h1>
          <p style={{ fontSize: '1rem', marginBottom: '2rem', maxWidth: '20rem' }}>
            Necesitás activar JavaScript para ver este proyecto.
          </p>
          <a href="/proyectos" style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#C6D92D',
            color: '#0B2E59',
            textDecoration: 'none',
            borderRadius: '1rem',
            fontWeight: 'bold',
          }}>
            Volver a proyectos
          </a>
        </div>
      </noscript>
      <SeedPageContent seedId={seedId} userIdFromUrl={userIdFromUrl} />
    </>
  );
}
