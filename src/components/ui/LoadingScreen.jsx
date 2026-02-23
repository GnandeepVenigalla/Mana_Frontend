export default function LoadingScreen() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--color-bg)',
        }}>
            <div style={{
                width: 64,
                height: 64,
                background: 'white',
                borderRadius: '16px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1.5s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(255,255,255,0.2)',
            }}>
                <img src="https://raw.githubusercontent.com/GnandeepVenigalla/Mana_Karma/main/public/manakarma.png" alt="Mana Karma" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="spinner" />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading Mana Karma...</span>
            </div>
            <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79,142,247,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(79,142,247,0); }
        }
      `}</style>
        </div>
    );
}
