import { useRegisterSW } from 'virtual:pwa-register/react';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="pwa-toast" role="alert">
      {(offlineReady || needRefresh) && (
        <div className="pwa-toast-message">
          {offlineReady ? (
            <span>App pronto para uso offline</span>
          ) : (
            <span>Nova versão disponível</span>
          )}
          <div className="pwa-toast-actions">
            {needRefresh && (
              <button type="button" onClick={() => updateServiceWorker(true)}>
                Atualizar
              </button>
            )}
            <button type="button" onClick={close}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
