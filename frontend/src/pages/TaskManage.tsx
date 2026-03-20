import { useEffect, useState } from 'react';
import { api, type Sector, type Shift, type Task, type TaskCreate, type User } from '../services/api';
import { useA11y } from '../contexts/A11yContext';
import { Speakable } from '../components/Speakable';

const RECURRENCE_OPTIONS = [
  { value: 'single', label: 'Única' },
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];

export function TaskManage() {
  const { sttEnabled, startListening } = useA11y();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<TaskCreate>>({
    name: '',
    type: 'daily',
    recurrence: 'daily',
    description: '',
    requires_photo: false,
    requires_observation: false,
    min_interval_minutes: null as number | null,
    order: 0,
    sector_id: null,
    shift_id: null,
    user_id: null,
  });

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    Promise.all([
      api.tasks.list({ all: true }),
      api.sectors.list(true),
      api.shifts.list(true),
      api.users.list(true),
    ]).then(([t, s, sh, u]) => {
      setTasks(t.data);
      setSectors(s.data);
      setShifts(sh.data);
      setUsers(u.data.filter((x) => x.role === 'employee'));
    }).finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      const data: TaskCreate = {
        name: form.name,
        type: (form.recurrence === 'weekly' || form.recurrence === 'monthly') ? 'weekly' : 'daily',
        recurrence: form.recurrence || 'daily',
        due_date: form.recurrence === 'single' ? form.due_date || undefined : undefined,
        description: form.description || undefined,
        requires_photo: form.requires_photo ?? false,
        requires_observation: form.requires_observation ?? false,
        order: form.order ?? 0,
        sector_id: form.sector_id || null,
        shift_id: form.shift_id || null,
        user_id: form.user_id || null,
      };
      if (editing) {
        await api.tasks.update(editing.id, data);
      } else {
        await api.tasks.create(data);
      }
      setEditing(null);
      setForm({ name: '', type: 'daily', recurrence: 'daily', sector_id: null, shift_id: null, user_id: null });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleEdit = (task: Task) => {
    setEditing(task);
    setForm({
      name: task.name,
      type: task.type,
      recurrence: task.recurrence || 'daily',
      due_date: task.due_date || undefined,
      description: task.description || undefined,
      requires_photo: task.requires_photo,
      requires_observation: task.requires_observation ?? false,
      min_interval_minutes: task.min_interval_minutes ?? null,
      order: task.order,
      sector_id: task.sector?.id ?? null,
      shift_id: task.shift?.id ?? null,
      user_id: task.user?.id ?? null,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover esta tarefa?')) return;
    try {
      await api.tasks.delete(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="task-manage-page">
      <header>
        <h1><Speakable>Gerenciar Tarefas</Speakable></h1>
      </header>

      <form onSubmit={handleSubmit} className="task-form">
        <h2>{editing ? 'Editar' : 'Nova'} Tarefa</h2>
        <div className="form-row">
          <label>
            Nome *
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              placeholder="Ex: Limpar máquina de suco"
            />
          </label>
        </div>
        <div className="form-row form-row-2">
          <label>
            Tipo
            <select
              value={form.recurrence}
              onChange={(e) => setForm((p) => ({ ...p, recurrence: e.target.value }))}
            >
              {RECURRENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          {form.recurrence === 'single' && (
            <label>
              Data
              <input
                type="date"
                value={form.due_date || ''}
                onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value || undefined }))}
              />
            </label>
          )}
        </div>
        <div className="form-row form-row-2">
          <label>
            Setor
            <select
              value={form.sector_id ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, sector_id: e.target.value ? Number(e.target.value) : null }))}
            >
              <option value="">Todos</option>
              {sectors.filter((s) => s.active !== false).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label>
            Turno
            <select
              value={form.shift_id ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, shift_id: e.target.value ? Number(e.target.value) : null }))}
            >
              <option value="">Todos</option>
              {shifts.filter((s) => s.active !== false).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Usuário específico
            <select
              value={form.user_id ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value ? Number(e.target.value) : null }))}
            >
              <option value="">Qualquer do setor/turno</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} {u.sector && `(${u.sector.name})`}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Descrição
            <div className="observation-row">
              <textarea
                className="observation-input"
                value={form.description || ''}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Instruções da tarefa..."
                rows={2}
              />
              {sttEnabled && (
                <button
                  type="button"
                  className="stt-dictate-btn"
                  onClick={() => startListening((t: string) => setForm((p) => ({ ...p, description: (p.description || '') + (p.description ? ' ' : '') + t })))}
                  title="Ditado por voz"
                >
                  🎤
                </button>
              )}
            </div>
          </label>
        </div>
        <div className="form-row form-row-check">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.requires_photo ?? false}
              onChange={(e) => setForm((p) => ({ ...p, requires_photo: e.target.checked }))}
            />
            Foto obrigatória
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.requires_observation ?? false}
              onChange={(e) => setForm((p) => ({ ...p, requires_observation: e.target.checked }))}
            />
            Observação obrigatória
          </label>
          <label>
            Intervalo mínimo (min)
            <input
              type="number"
              min={0}
              placeholder="0"
              value={form.min_interval_minutes ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, min_interval_minutes: e.target.value ? Number(e.target.value) : null }))}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">{editing ? 'Salvar' : 'Criar'}</button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({ name: '', recurrence: 'daily' }); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="task-list-manage">
        <h2>Tarefas cadastradas</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={task.active === false ? 'inactive' : ''}>
              <div className="task-info">
                <strong><Speakable text={task.name}>{task.name}</Speakable></strong>
                <span className="task-meta">
                  {task.recurrence || task.type} • {task.sector?.name || 'Todos'} • {task.shift?.name || 'Todos'}
                  {task.user && ` → ${task.user.name}`}
                  {task.requires_photo && ' 📷'}
                  {task.requires_observation && ' 📝'}
                  {task.min_interval_minutes && ` ⏱ ${task.min_interval_minutes}min`}
                </span>
              </div>
              <div className="task-actions">
                <button type="button" onClick={() => handleEdit(task)}>Editar</button>
                <button type="button" className="btn-danger" onClick={() => handleDelete(task.id)}>Remover</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
