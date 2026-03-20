import { useA11y } from '../contexts/A11yContext';

export function A11yToggle() {
  const {
    ttsEnabled,
    sttEnabled,
    simplifiedMode,
    setTtsEnabled,
    setSttEnabled,
    setSimplifiedMode,
    ttsSupported,
    sttSupported,
  } = useA11y();

  return (
    <div className="a11y-toggle" role="group" aria-label="Opções de acessibilidade">
      {ttsSupported && (
        <button
          type="button"
          className={`a11y-btn ${ttsEnabled ? 'active' : ''}`}
          onClick={() => setTtsEnabled(!ttsEnabled)}
          title={ttsEnabled ? 'Desativar leitura em voz alta' : 'Ativar leitura em voz alta'}
          aria-pressed={ttsEnabled}
        >
          <span aria-hidden>🔊</span>
          <span className="a11y-btn-label">Ouvir</span>
        </button>
      )}
      {sttSupported && (
        <button
          type="button"
          className={`a11y-btn ${sttEnabled ? 'active' : ''}`}
          onClick={() => setSttEnabled(!sttEnabled)}
          title={sttEnabled ? 'Desativar ditado por voz' : 'Ativar ditado por voz'}
          aria-pressed={sttEnabled}
        >
          <span aria-hidden>🎤</span>
          <span className="a11y-btn-label">Falar</span>
        </button>
      )}
      <button
        type="button"
        className={`a11y-btn ${simplifiedMode ? 'active' : ''}`}
        onClick={() => setSimplifiedMode(!simplifiedMode)}
        title={simplifiedMode ? 'Desativar modo simplificado' : 'Ativar modo simplificado'}
        aria-pressed={simplifiedMode}
      >
        <span aria-hidden>📖</span>
        <span className="a11y-btn-label">Simplificado</span>
      </button>
    </div>
  );
}
