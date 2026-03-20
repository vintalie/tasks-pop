import { useEffect, useState } from 'react';
import { api, type PendingTask, type RankingItem, type Sector, type Shift, type Task, type TaskLog, type User } from '../services/api';
import { getCached, setCached } from '../lib/offlineCache';
import { isOnline } from '../lib/offline';

export function Dashboard() {
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

  useEffect(() => {
    const params: Record<string, string> = { date };
    if (filterUser) params.user_id = filterUser;
    const cacheKey = `taskLogs-dashboard-${date}-${filterUser || 'all'}`;
    const load = async () => {
      try {
        const r = await api.taskLogs.list(params as { date?: string; user_id?: number });
        setLogs(r.data);
        if (isOnline()) setCached(cacheKey, r.data);
      } catch {
        if (!isOnline()) {
          const cached = getCached<TaskLog[]>(cacheKey);
          if (cached) setLogs(cached);
        } else setLogs([]);
      }
    };
    load();
  }, [date, filterUser]);

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
      const cacheKey = `taskLogs-dashboard-${date}-${filterUser || 'all'}`;
      Promise.all([
        api.taskLogs.list(params as { date?: string; user_id?: number }),
        api.users.list(),
        api.sectors.list(),
        api.shifts.list(),
        api.tasks.list({ all: true }),
        api.pendingTasks.list(),
        api.users.ranking('week'),
      ]).then(([logsRes, u, s, sh, t, pendingRes, rankRes]) => {
        setLogs(logsRes.data);
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
      }).catch(() => {});
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [date, filterUser]);

  const completed = logs.filter((l) => l.status === 'completed').length;
  const total = logs.length;
  const pending = total - completed;

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      await api.taskLogs.export({
        date,
        user_id: filterUser ? Number(filterUser) : undefined,
        task_id: filterTask ? Number(filterTask) : undefined,
        format,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao exportar');
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
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && !loading ? (
              <tr><td colSpan={6}>Nenhum registro para esta data.</td></tr>
            ) : (
              logs.map((log) => (
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
                  <td>{log.observation || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
