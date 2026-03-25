import { useCallback, useEffect, useState } from 'react';
import { api, type PendingTask, type RankingItem, type Sector, type Shift, type Task, type TaskLog, type User } from '../services/api';
import { getCached, setCached } from '../lib/offlineCache';
import { isOnline } from '../lib/offline';
import { useToast } from '../contexts/ToastContext';
import { getMediaFromLog } from '../lib/mediaUrl';
import { useRealtimeTasks } from '../hooks/useRealtimeTasks';

export function Dashboard() {
  const toast = useToast();
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [pendingDate, setPendingDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterSector, setFilterSector] = useState<string>('');
  const [filterShift, setFilterShift] = useState<string>('');
  const [filterTask, setFilterTask] = useState<string>('');
  const [tasks, setTasks] = useState<{ id: number; name: string }[]>([]);
  const [ranking, setRanking] = useState<{ period: string; data: import('../services/api').RankingItem[] } | null>(null);
  const [mediaModalLog, setMediaModalLog] = useState<TaskLog | null>(null);
  const [observationModal, setObservationModal] = useState<{ taskName: string; text: string } | null>(null);
  const [correctModalLog, setCorrectModalLog] = useState<TaskLog | null>(null);
  const [correctStatus, setCorrectStatus] = useState<'completed' | 'pending'>('pending');
  const [correctReason, setCorrectReason] = useState('');
  const [correcting, setCorrecting] = useState(false);
  useEffect(() => {
    const params: Record<string, string> = { date };
    if (filterUser) params.user_id = filterUser;
    if (filterTask) params.task_id = filterTask;
    const cacheKey = `taskLogs-dashboard-${date}-${filterUser || 'all'}-${filterTask || 'all'}`;
    const load = async () => {
      try {
        const r = await api.taskLogs.list(params as { date?: string; user_id?: number; task_id?: number });
        let data = r.data;
        if (filterSector) data = data.filter((log) => log.user.sector?.id === Number(filterSector));
        if (filterShift) data = data.filter((log) => log.user.shift?.id === Number(filterShift));
        setLogs(data);
        if (isOnline()) setCached(cacheKey, r.data);
      } catch {
        if (!isOnline()) {
          const cached = getCached<TaskLog[]>(cacheKey);
          if (cached) {
            let data = cached;
            if (filterSector) data = data.filter((log) => log.user.sector?.id === Number(filterSector));
            if (filterShift) data = data.filter((log) => log.user.shift?.id === Number(filterShift));
            setLogs(data);
          }
        } else setLogs([]);
      }
    };
    load();
  }, [date, filterUser, filterTask, filterSector, filterShift]);

  const refreshDashboardLogs = useCallback(async () => {
    if (!isOnline()) return;
    try {
      const params: Record<string, string> = { date };
      if (filterUser) params.user_id = filterUser;
      if (filterTask) params.task_id = filterTask;
      const r = await api.taskLogs.list(params as { date?: string; user_id?: number; task_id?: number });
      let data = r.data;
      if (filterSector) data = data.filter((log) => log.user.sector?.id === Number(filterSector));
      if (filterShift) data = data.filter((log) => log.user.shift?.id === Number(filterShift));
      setLogs(data);
    } catch {
      /* ignore */
    }
  }, [date, filterUser, filterTask, filterSector, filterShift]);

  useRealtimeTasks(refreshDashboardLogs);

  useEffect(() => {
    const load = async () => {
      try {
        const [u, s, sh, t] = await Promise.all([api.users.list(), api.sectors.list(), api.shifts.list(), api.tasks.list({ all: true })]);
        setUsers(u.data);
        setSectors(s.data);
        setShifts(sh.data);
        setTasks(t.data.map((x) => ({ id: x.id, name: x.name })));
        if (isOnline()) {
          setCached('users', u.data);
          setCached('sectors', s.data);
          setCached('shifts', sh.data);
          setCached('tasks-all', t.data);
        }
      } catch {
        if (!isOnline()) {
          const [cachedUsers, cachedSectors, cachedShifts, cachedTasks] = [
            getCached<User[]>('users'),
            getCached<Sector[]>('sectors'),
            getCached<Shift[]>('shifts'),
            getCached<Task[]>('tasks-all'),
          ];
          if (cachedUsers) setUsers(cachedUsers);
          if (cachedSectors) setSectors(cachedSectors);
          if (cachedShifts) setShifts(cachedShifts);
          if (cachedTasks) setTasks(cachedTasks.map((x) => ({ id: x.id, name: x.name })));
        }
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.pendingTasks.list();
        setPendingTasks(r.data);
        setPendingDate(r.date);
        if (isOnline()) setCached('pendingTasks', { data: r.data, date: r.date });
      } catch {
        if (!isOnline()) {
          const cached = getCached<{ data: PendingTask[]; date: string }>('pendingTasks');
          if (cached) {
            setPendingTasks(cached.data);
            setPendingDate(cached.date);
          }
        }
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.users.ranking('week');
        setRanking(r);
        if (isOnline()) setCached('ranking-week', r);
      } catch {
        if (!isOnline()) {
          const cached = getCached<{ period: string; data: RankingItem[] }>('ranking-week');
          if (cached) setRanking(cached);
        }
      }
    };
    load();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (filterSector && u.sector?.id !== Number(filterSector)) return false;
    if (filterShift && u.shift?.id !== Number(filterShift)) return false;
    return true;
  });

  useEffect(() => {
    setLoading(false);
  }, [logs]);

  useEffect(() => {
    const onOnline = () => {
      const params: Record<string, string> = { date };
      if (filterUser) params.user_id = filterUser;
      if (filterTask) params.task_id = filterTask;
      const cacheKey = `taskLogs-dashboard-${date}-${filterUser || 'all'}-${filterTask || 'all'}`;
      Promise.all([
        api.taskLogs.list(params as { date?: string; user_id?: number; task_id?: number }),
        api.users.list(),
        api.sectors.list(),
        api.shifts.list(),
        api.tasks.list({ all: true }),
        api.pendingTasks.list(),
        api.users.ranking('week'),
      ]).then(([logsRes, u, s, sh, t, pendingRes, rankRes]) => {
        let logsData = logsRes.data;
        if (filterSector) logsData = logsData.filter((log) => log.user.sector?.id === Number(filterSector));
        if (filterShift) logsData = logsData.filter((log) => log.user.shift?.id === Number(filterShift));
        setLogs(logsData);
        setUsers(u.data);
        setSectors(s.data);
        setShifts(sh.data);
        setTasks(t.data.map((x) => ({ id: x.id, name: x.name })));
        setPendingTasks(pendingRes.data);
        setPendingDate(pendingRes.date);
        setRanking(rankRes);
        setCached(cacheKey, logsRes.data);
        setCached('users', u.data);
        setCached('sectors', s.data);
        setCached('shifts', sh.data);
        setCached('tasks-all', t.data);
        setCached('pendingTasks', { data: pendingRes.data, date: pendingRes.date });
        setCached('ranking-week', rankRes);
      }).catch((err) => {
        toast.toast(err instanceof Error ? err.message : 'Erro ao recarregar dados', 'error');
      });
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [date, filterUser, filterTask, filterSector, filterShift]);

  const completed = logs.filter((l) => l.status === 'completed').length;
  const total = logs.length;
  const pending = total - completed;

  const handleCorrect = async () => {
    if (!correctModalLog || !correctReason.trim()) return;
    setCorrecting(true);
    try {
      await api.taskLogs.correct(correctModalLog.id, {
        status: correctStatus,
        correction_reason: correctReason.trim(),
      });
      setLogs((prev) =>
        prev.map((l) =>
          l.id === correctModalLog.id ? { ...l, status: correctStatus } : l
        )
      );
      setCorrectModalLog(null);
      setCorrectReason('');
      toast.toast('Log corrigido com sucesso.', 'success');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao corrigir');
    } finally {
      setCorrecting(false);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      await api.taskLogs.export({
        date,
        user_id: filterUser ? Number(filterUser) : undefined,
        task_id: filterTask ? Number(filterTask) : undefined,
        format,
      });
    } catch (err) {
      toast.toast(err instanceof Error ? err.message : 'Erro ao exportar', 'error');
    }
  };

  return (
    <div className="dashboard-page">
      <header>
        <h1>Painel do Gerente</h1>
      </header>

      {pendingTasks.length > 0 && (
        <section className="pending-section">
          <h2>⚠️ Tarefas pendentes (dia anterior)</h2>
          <p className="pending-date">{pendingDate && new Date(pendingDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <ul className="pending-list">
            {pendingTasks.map((t) => (
              <li key={t.id}>
                <strong>{t.name}</strong>
                <span>{[t.sector?.name, t.shift?.name, t.user?.name].filter(Boolean).join(' • ') || 'Geral'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="filters">
        <label>
          Data
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Setor
          <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
            <option value="">Todos</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label>
          Turno
          <select value={filterShift} onChange={(e) => setFilterShift(e.target.value)}>
            <option value="">Todos</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label>
          Tarefa
          <select value={filterTask} onChange={(e) => setFilterTask(e.target.value)}>
            <option value="">Todas</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
        <label>
          Funcionário
          <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
            <option value="">Todos</option>
            {filteredUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.sector && `• ${u.sector.name}`} {u.shift && `• ${u.shift.name}`}
              </option>
            ))}
          </select>
        </label>
      </div>
      {ranking && ranking.data.length > 0 && (
        <section className="ranking-section">
          <h2>Ranking da semana</h2>
          <ol className="ranking-list">
            {ranking.data.slice(0, 5).map((r) => (
              <li key={r.user.id}>
                <span className="rank">#{r.rank}</span>
                <span className="name">{r.user.name}</span>
                <span className="pct">{r.completion_percentage}%</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="stats-row">
        <div className="stats">
          <div className="stat-card">
            <span className="stat-value">{completed}</span>
            <span className="stat-label">Concluídas</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-value">{pending}</span>
            <span className="stat-label">Pendentes</span>
          </div>
        </div>
        <div className="export-buttons">
          <button type="button" onClick={() => handleExport('csv')}>Exportar CSV</button>
          <button type="button" onClick={() => handleExport('xlsx')}>Exportar Excel</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tarefa</th>
              <th>Funcionário</th>
              <th>Setor / Turno</th>
              <th>Horário</th>
              <th>Status</th>
              <th>Mídia</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && !loading ? (
              <tr><td colSpan={8}>Nenhum registro para esta data.</td></tr>
            ) : (
              logs.map((log) => {
                const mediaFiles = getMediaFromLog(log);
                const hasMedia = mediaFiles.length > 0;
                const hasObservation = !!log.observation?.trim();
                return (
                  <tr key={log.id}>
                    <td>{log.task.name}</td>
                    <td>{log.user.name}</td>
                    <td>{[log.user.sector?.name, log.user.shift?.name].filter(Boolean).join(' • ') || '-'}</td>
                    <td>{log.completed_at ? new Date(log.completed_at).toLocaleTimeString('pt-BR') : '-'}</td>
                    <td>
                      <span className={`status status-${log.status}`}>
                        {log.status === 'completed' ? '✓ Feito' : '○ Pendente'}
                      </span>
                    </td>
                    <td>
                      {hasMedia ? (
                        <button
                          type="button"
                          className="btn-view-media"
                          onClick={() => setMediaModalLog(log)}
                        >
                          Ver foto
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {hasObservation ? (
                        <button
                          type="button"
                          className="btn-view-observation"
                          onClick={() => setObservationModal({ taskName: log.task.name, text: log.observation! })}
                        >
                          Ver observação
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-view-media"
                        onClick={() => {
                          setCorrectModalLog(log);
                          setCorrectStatus(log.status === 'completed' ? 'pending' : 'completed');
                          setCorrectReason('');
                        }}
                      >
                        Corrigir
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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

      {observationModal && (
        <div className="modal-overlay" onClick={() => setObservationModal(null)}>
          <div className="modal-content modal-observation" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Observação - {observationModal.taskName}</h3>
              <button type="button" className="modal-close" onClick={() => setObservationModal(null)} aria-label="Fechar">×</button>
            </div>
            <div className="modal-body">
              <p className="observation-text">{observationModal.text}</p>
            </div>
          </div>
        </div>
      )}

      {correctModalLog && (
        <div className="modal-overlay" onClick={() => setCorrectModalLog(null)}>
          <div className="modal-content modal-correction" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Corrigir registro - {correctModalLog.task.name}</h3>
              <button type="button" className="modal-close" onClick={() => setCorrectModalLog(null)} aria-label="Fechar">×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>
                  Novo status
                  <select value={correctStatus} onChange={(e) => setCorrectStatus(e.target.value as 'completed' | 'pending')}>
                    <option value="pending">Pendente</option>
                    <option value="completed">Concluído</option>
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Motivo da correção *
                  <textarea
                    value={correctReason}
                    onChange={(e) => setCorrectReason(e.target.value)}
                    placeholder="Informe o motivo da correção..."
                    rows={3}
                    required
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setCorrectModalLog(null)}>Cancelar</button>
                <button type="button" className="btn-primary" onClick={handleCorrect} disabled={correcting || !correctReason.trim()}>
                  {correcting ? 'Salvando...' : 'Corrigir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
