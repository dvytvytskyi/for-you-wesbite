export default function NotFound() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ fontSize: '72px', color: '#003077', marginBottom: '16px' }}>404</h1>
            <p style={{ fontSize: '18px', color: '#666' }}>Page not found / Страница не найдена</p>
            <a href="/" style={{ marginTop: '24px', padding: '12px 24px', backgroundColor: '#003077', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
                Back Home / На главную
            </a>
        </div>
    );
}
