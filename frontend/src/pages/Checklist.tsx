import { useCallback, useEffect, useState, useRef } from 'react';
import { api, type Task, type TaskLog } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeTasks } from '../hooks/useRealtimeTasks';
import { useA11y } from '../contexts/A11yContext';
import { useToast } from '../contexts/ToastContext';
import { Speakable } from '../components/Speakable';
import { addToOfflineQueue, base64ToBlob, fileToBase64, getOfflineQueue, isOnline, removeFromOfflineQueue } from '../lib/offline';
import { getCached, setCached } from '../lib/offlineCache';
import { getMediaFromLog } from '../lib/mediaUrl';

export function Checklist() {
  const { user } = useAuth();
  const { sttEnabled, startListening } = useA11y();
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Record<number, TaskLog>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [observation, setObservation] = useState<Record<number, string>>({});
  const [observationExpanded, setObservationExpanded] = useState<Record<number, boolean>>({});
  const [media, setMedia] = useState<Record<number, File[]>>({});
  const [mediaModalLog, setMediaModalLog] = useState<TaskLog | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const pendingTaskIdRef = useRef<number | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [tasksRes, logsRes] = await Promise.all([
          api.tasks.list({ type: 'daily' }),
          api.taskLogs.list({ date: today }),
        ]);
        setTasks(tasksRes.data);
        const map: Record<number, TaskLog> = {};
        logsRes.data.forEach((l) => (map[l.task.id] = l));
        setLogs(map);
        if (isOnline()) {
          setCached('tasks-daily', tasksRes.data);
          setCached(`taskLogs-${today}`, logsRes.data);
        }
      } catch {
        if (!isOnline()) {
          const cachedTasks = getCached<Task[]>('tasks-daily');
          const cachedLogs = getCached<TaskLog[]>(`taskLogs-${today}`);
          if (cachedTasks) setTasks(cachedTasks);
          if (cachedLogs) {
            const map: Record<number, TaskLog> = {};
            cachedLogs.forEach((l) => (map[l.task.id] = l));
            setLogs(map);
          }
        } else {
          setTasks([]);
          setLogs({});
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, today]);

  const refreshLogs = useCallback(async () => {
    if (!user || !isOnline()) return;
    try {
      const logsRes = await api.taskLogs.list({ date: today });
      const map: Record<number, TaskLog> = {};
      logsRes.data.forEach((l) => (map[l.task.id] = l));
      setLogs(map);
      setCached(`taskLogs-${today}`, logsRes.data);
    } catch {
      /* ignore */
    }
  }, [user?.id, today]);

  useRealtimeTasks(refreshLogs);

  const syncOfflineQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    for (let i = queue.length - 1; i >= 0; i--) {
      const item = queue[i];
      try {
        const mediaFiles: File[] = [];
        if (item.media_base64?.length) {
          for (const m of item.media_base64) {
            mediaFiles.push(new File([base64ToBlob(m.base64, m.mime ?? 'image/jpeg')], 'photo.jpg', { type: m.mime ?? 'image/jpeg' }));
          }
        } else if (item.photo_base64) {
          mediaFiles.push(new File([base64ToBlob(item.photo_base64, item.photo_mime ?? 'image/jpeg')], 'photo.jpg', { type: item.photo_mime ?? 'image/jpeg' }));
        }
        const res = await api.taskLogs.create({
          task_id: item.task_id,
          status: item.status,
          observation: item.observation,
          media: mediaFiles.length ? mediaFiles : undefined,
        });
        setLogs((prev) => {
          const next = { ...prev };
          if (item.status === 'pending') {
            delete next[item.task_id];
          } else {
            next[item.task_id] = res.data;
          }
          return next;
        });
        removeFromOfflineQueue(i);
      } catch {
        break;
      }
    }
  }, [today]);

  useEffect(() => {
    if (!isOnline()) return;
    syncOfflineQueue();
  }, [syncOfflineQueue]);

  useEffect(() => {
    const onOnline = async () => {
      await syncOfflineQueue();
      if (!user) return;
      try {
        const [tasksRes, logsRes] = await Promise.all([
          api.tasks.list({ type: 'daily' }),
          api.taskLogs.list({ date: today }),
        ]);
        setTasks(tasksRes.data);
        const map: Record<number, TaskLog> = {};
        logsRes.data.forEach((l) => (map[l.task.id] = l));
        setLogs(map);
        setCached('tasks-daily', tasksRes.data);
        setCached(`taskLogs-${today}`, logsRes.data);
      } catch {
        // ignore - stay with current state
      }
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [syncOfflineQueue, user?.id, today]);

  const addMedia = (taskId: number, files: File[]) => {
    setMedia((p) => {
      const current = p[taskId] ?? [];
      return { ...p, [taskId]: [...current, ...files] };
    });
  };

  const removeMedia = (taskId: number, index: number) => {
    setMedia((p) => {
      const arr = [...(p[taskId] ?? [])];
      arr.splice(index, 1);
      return { ...p, [taskId]: arr };
    });
  };

  const clearMedia = (taskId: number) => {
    setMedia((p) => ({ ...p, [taskId]: [] }));
  };

  const handleComplete = async (task: Task) => {
    const files = media[task.id] ?? [];
    if (task.requires_photo && files.length === 0) {
      toast.toast('Esta tarefa exige mídia (foto ou vídeo) como comprovante.', 'error');
      return;
    }
    if (task.requires_observation && !observation[task.id]?.trim()) {
      toast.toast('Esta tarefa exige uma observação.', 'error');
      return;
    }
    setSaving(task.id);
    try {
      if (!isOnline()) {
        const mediaData: { base64: string; mime: string }[] = [];
        for (const f of files) {
          if (f.type.startsWith('video/')) {
            toast.toast('Vídeos não podem ser enviados offline. Conecte à internet.', 'error');
            setSaving(null);
            return;
          }
          const d = await fileToBase64(f);
          if (!d) {
            toast.toast('Arquivo muito grande para armazenar offline. Reduza o tamanho ou conecte à internet.', 'error');
            setSaving(null);
            return;
          }
          mediaData.push(d);
        }
        addToOfflineQueue({
          task_id: task.id,
          status: 'completed',
          observation: observation[task.id] || undefined,
          media_base64: mediaData.length ? mediaData : undefined,
        });
        setLogs((prev) => ({ ...prev, [task.id]: { id: 0, task: { id: task.id, name: task.name }, user: { id: 0, name: '' }, log_date: today, completed_at: new Date().toISOString(), observation: observation[task.id] || null, photo_url: null, status: 'completed' } }));
        setSaving(null);
        return;
      }
      const res = await api.taskLogs.create({
        task_id: task.id,
        status: 'completed',
        observation: observation[task.id] || undefined,
        media: files.length ? files : undefined,
      });
      setLogs((prev) => ({ ...prev, [task.id]: res.data }));
      setMedia((p) => ({ ...p, [task.id]: [] }));
    } catch (err) {
      if (!isOnline()) {
        const mediaData: { base64: string; mime: string }[] = [];
        for (const f of files) {
          if (!f.type.startsWith('video/')) {
            const d = await fileToBase64(f);
            if (d) mediaData.push(d);
          }
        }
        addToOfflineQueue({
          task_id: task.id,
          status: 'completed',
          observation: observation[task.id] || undefined,
          media_base64: mediaData.length ? mediaData : undefined,
        });
        setLogs((prev) => ({ ...prev, [task.id]: { id: 0, task: { id: task.id, name: task.name }, user: { id: 0, name: '' }, log_date: today, completed_at: new Date().toISOString(), observation: observation[task.id] || null, photo_url: null, status: 'completed' } }));
      } else {
        toast.toast(err instanceof Error ? err.message : 'Erro ao registrar', 'error');
      }
    } finally {
      setSaving(null);
    }
  };

  const handleUndo = async (task: Task) => {
    setSaving(task.id);
    const removeFromLogs = () =>
      setLogs((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    try {
      if (!isOnline()) {
        addToOfflineQueue({ task_id: task.id, status: 'pending' });
        removeFromLogs();
        setSaving(null);
        return;
      }
      await api.taskLogs.create({
        task_id: task.id,
        status: 'pending',
      });
      removeFromLogs();
    } catch (err) {
      if (!isOnline()) {
        addToOfflineQueue({ task_id: task.id, status: 'pending' });
        removeFromLogs();
      } else {
        toast.toast(err instanceof Error ? err.message : 'Erro', 'error');
      }
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="loading">Carregando tarefas...</div>;

  return (
    <div className="checklist-page">
      <header>
        <h1>Checklist do dia</h1>
        <p>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        {(user?.sector || user?.shift) && (
          <p className="user-context">
            {user.sector?.name}{user.sector && user.shift ? ' • ' : ''}{user.shift?.name}
          </p>
        )}
        {!isOnline() && <p className="offline-badge">Offline - dados serão sincronizados quando conectar</p>}
      </header>
      <ul className="task-list">
        {tasks.map((task) => {
          const log = logs[task.id];
          const done = log?.status === 'completed';
          const taskMedia = media[task.id] ?? [];
          return (
            <li key={task.id} className={done ? 'done' : ''}>
              <div className="task-header">
                <div className="task-header-text">
                  <span className="task-name">
                    <Speakable text={task.name}>{task.name}</Speakable>
                  </span>
                  <span className="task-meta">
                    {(task.sector || task.shift) && (
                      <span className="badge-meta">
                        {[task.sector?.name, task.shift?.name].filter(Boolean).join(' • ')}
                      </span>
                    )}
                    {task.requires_photo && <span className="badge">📷 Mídia obrigatória</span>}
                  </span>
                </div>
                {!done && (
                  <div className="btn-complete-inline">
                    <button
                      className="btn-complete"
                      onClick={() => handleComplete(task)}
                      disabled={saving === task.id}
                    >
                      <Speakable text={saving === task.id ? 'Salvando...' : 'Concluir'}>
                        {saving === task.id ? 'Salvando...' : '✓ Concluir'}
                      </Speakable>
                    </button>
                  </div>
                )}
              </div>
              {!done && (
                <div className="task-actions">
                  {(task.requires_observation || observationExpanded[task.id] || observation[task.id]) ? (
                    <div className="observation-row">
                      <input
                        type="text"
                        placeholder={task.requires_observation ? 'Observação (obrigatória)' : 'Observação (opcional)'}
                        value={observation[task.id] || ''}
                        onChange={(e) => setObservation((p) => ({ ...p, [task.id]: e.target.value }))}
                      />
                      {sttEnabled && (
                        <button
                          type="button"
                          className="stt-dictate-btn"
                          onClick={() => startListening((t) => setObservation((p) => ({ ...p, [task.id]: (p[task.id] || '') + (p[task.id] ? ' ' : '') + t })))}
                          title="Ditado por voz"
                        >
                          🎤
                        </button>
                      )}
                      {!task.requires_observation && (
                        <button
                          type="button"
                          className="btn-observation-collapse"
                          onClick={() => {
                            setObservationExpanded((p) => ({ ...p, [task.id]: false }));
                            setObservation((p) => ({ ...p, [task.id]: '' }));
                          }}
                          title="Ocultar campo"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : null}
                  <div className="task-buttons-row">
                    <div className="photo-upload">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const taskId = pendingTaskIdRef.current;
                          const files = Array.from(e.target.files ?? []);
                          if (taskId != null && files.length) addMedia(taskId, files);
                          pendingTaskIdRef.current = null;
                          e.target.value = '';
                        }}
                      />
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const taskId = pendingTaskIdRef.current;
                          const files = Array.from(e.target.files ?? []);
                          if (taskId != null && files.length) addMedia(taskId, files);
                          pendingTaskIdRef.current = null;
                          e.target.value = '';
                        }}
                      />
                      <div className="photo-buttons">
                        {task.requires_photo && (
                          <>
                            <button
                              type="button"
                              onClick={() => { pendingTaskIdRef.current = task.id; fileInputRef.current?.click?.(); }}
                              title="Abrir câmera"
                            >
                              {taskMedia.length ? `📷 ${taskMedia.length} selecionada(s)` : '📷 Tirar foto'}
                            </button>
                            <button
                              type="button"
                              className="photo-gallery-btn"
                              onClick={() => { pendingTaskIdRef.current = task.id; galleryInputRef.current?.click?.(); }}
                              title="Enviar pelo dispositivo"
                            >
                              🖼️ Enviar pelo dispositivo
                            </button>
                            {taskMedia.length > 0 && (
                              <button type="button" className="photo-clear-btn" onClick={() => clearMedia(task.id)} title="Limpar">
                                Limpar
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      {!task.requires_observation && !observationExpanded[task.id] && !observation[task.id] && (
                        <div className="observation-btn-row">
                          <button
                            type="button"
                            className="btn-add-observation-inline"
                            onClick={() => setObservationExpanded((p) => ({ ...p, [task.id]: true }))}
                          >
                            📝 Adicionar observação
                          </button>
                        </div>
                      )}
                      {taskMedia.length > 0 && (
                        <div className="media-preview">
                          {taskMedia.map((f, i) => (
                            <span key={i} className="media-preview-item">
                              {f.type.startsWith('video/') ? '🎬' : '🖼️'} {f.name}
                              <button type="button" className="media-remove" onClick={() => removeMedia(task.id, i)} aria-label="Remover">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {done && (
                <div className="task-done">
                  <span>Concluído {log.completed_at && new Date(log.completed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  {getMediaFromLog(log).length > 0 && (
                    <button
                      type="button"
                      className="btn-view-media"
                      onClick={() => setMediaModalLog(log)}
                    >
                      🖼️ Conferir imagem
                    </button>
                  )}
                  <button className="btn-undo" onClick={() => handleUndo(task)} disabled={saving === task.id}>
                    <Speakable text="Desfazer">Desfazer</Speakable>
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {mediaModalLog && (
        <div className="modal-overlay" onClick={() => setMediaModalLog(null)}>
          <div className="modal-content modal-media" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Comprovante - {mediaModalLog.task.name}</h3>
              <button type="button" className="modal-close" onClick={() => setMediaModalLog(null)} aria-label="Fechar">×</button>
            </div>
            <div className="modal-body media-gallery">
              {getMediaFromLog(mediaModalLog).map((m, i) =>
                m.type === 'video' ? (
                  <video key={i} src={m.url} controls className="modal-media-item" />
                ) : (
                  <img key={i} src={m.url} alt={`Comprovante ${i + 1}`} className="modal-media-item" />
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
