import { useEffect, useRef } from 'react';

export type UploadProgressPanelState = {
  phase: 'uploading' | 'done';
  percent: number;
  taskName: string;
  fileLabel: string;
};

type Props = {
  state: UploadProgressPanelState | null;
  exiting: boolean;
  onExitAnimationEnd: () => void;
};

export function UploadProgressPanel({ state, exiting, onExitAnimationEnd }: Props) {
  const dismissedAfterExit = useRef(false);

  useEffect(() => {
    dismissedAfterExit.current = false;
  }, [state]);

  if (!state) {
    return null;
  }

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (exiting && !dismissedAfterExit.current) {
      dismissedAfterExit.current = true;
      onExitAnimationEnd();
    }
  };

  return (
    <div
      className={`upload-progress-panel${exiting ? ' upload-progress-panel--exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={!exiting && state.phase === 'uploading'}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="upload-progress-panel__inner">
        <div className="upload-progress-panel__accent" aria-hidden />
        <p className="upload-progress-panel__eyebrow">
          {state.phase === 'uploading' ? 'Enviando' : 'Concluído'}
        </p>
        <h3 className="upload-progress-panel__title">{state.taskName || 'Tarefa'}</h3>
        <p className="upload-progress-panel__file" title={state.fileLabel}>
          {state.fileLabel}
        </p>
        <div className="upload-progress-track" aria-hidden={state.phase === 'done'}>
          <div
            className="upload-progress-fill"
            style={{ width: `${Math.max(2, state.percent)}%` }}
          />
        </div>
        <p className="upload-progress-panel__percent">
          {state.phase === 'uploading' ? `${state.percent}%` : '✓ Enviado'}
        </p>
      </div>
    </div>
  );
}
