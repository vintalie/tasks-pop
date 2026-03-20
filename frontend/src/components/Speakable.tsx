import { useA11y } from '../contexts/A11yContext';

interface SpeakableProps {
  children: React.ReactNode;
  text?: string;
}

export function Speakable({ children, text }: SpeakableProps) {
  const { ttsEnabled, speak, ttsSupported } = useA11y();
  const content = typeof text === 'string' ? text : (typeof children === 'string' ? children : String(children ?? ''));

  if (!ttsSupported || !ttsEnabled || !content) {
    return <>{children}</>;
  }

  return (
    <span className="speakable">
      {children}
      <button
        type="button"
        className="speakable-btn"
        onClick={(e) => {
          e.stopPropagation();
          speak(content);
        }}
        title="Ouvir"
        aria-label={`Ouvir: ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`}
      >
        🔊
      </button>
    </span>
  );
}
