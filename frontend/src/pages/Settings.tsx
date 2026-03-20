import { useEffect, useState } from 'react';
import { api, type Sector, type Shift, type User } from '../services/api';
import { Speakable } from '../components/Speakable';

export function Settings() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sectors' | 'shifts' | 'users'>('sectors');

  const [sectorForm, setSectorForm] = useState({ name: '' });
  const [shiftForm, setShiftForm] = useState({ name: '', start_time: '', end_time: '' });
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: 'employee' as string,
    sector_id: null as number | null, shift_id: null as number | null,
  });

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    Promise.all([
      api.sectors.list(true),
      api.shifts.list(true),
      api.users.list(true),
    ]).then(([s, sh, u]) => {
      setSectors(s.data);
      setShifts(sh.data);
      setUsers(u.data);
    }).finally(() => setLoading(false));
  };

  const handleCreateSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorForm.name) return;
    try {
      await api.sectors.create({ name: sectorForm.name });
      setSectorForm({ name: '' });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.name) return;
    try {
      await api.shifts.create({
        name: shiftForm.name,
        start_time: shiftForm.start_time || undefined,
        end_time: shiftForm.end_time || undefined,
      });
      setShiftForm({ name: '', start_time: '', end_time: '' });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleUpdateShift = async (shift: Shift) => {
    const start = prompt('Horário de entrada (HH:MM)', shift.start_time || '');
    const end = prompt('Horário de saída (HH:MM)', shift.end_time || '');
    if (start === null && end === null) return;
    try {
      await api.shifts.update(shift.id, {
        start_time: start !== null ? start : shift.start_time || undefined,
        end_time: end !== null ? end : shift.end_time || undefined,
      });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) return;
    try {
      await api.users.create({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        sector_id: userForm.sector_id,
        shift_id: userForm.shift_id,
      });
      setUserForm({ name: '', email: '', password: '', role: 'employee', sector_id: null, shift_id: null });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Remover este usuário?')) return;
    try {
      await api.users.delete(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleToggleSector = async (sector: Sector) => {
    const isActive = sector.active !== false;
    if (isActive) {
      if (!confirm('Desativar este setor?')) return;
      try {
        await api.sectors.delete(sector.id);
        load();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro');
      }
    } else {
      try {
        await api.sectors.update(sector.id, { active: true });
        load();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro');
      }
    }
  };

  const handleToggleShift = async (shift: Shift) => {
    const isActive = shift.active !== false;
    if (isActive) {
      if (!confirm('Desativar este turno?')) return;
      try {
        await api.shifts.delete(shift.id);
        load();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro');
      }
    } else {
      try {
        await api.shifts.update(shift.id, { active: true });
        load();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro');
      }
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="settings-page">
      <header>
        <h1><Speakable>Configurações</Speakable></h1>
      </header>

      <div className="settings-tabs">
        <button
          type="button"
          className={activeTab === 'sectors' ? 'active' : ''}
          onClick={() => setActiveTab('sectors')}
        >
          Setores
        </button>
        <button
          type="button"
          className={activeTab === 'shifts' ? 'active' : ''}
          onClick={() => setActiveTab('shifts')}
        >
          Turnos
        </button>
        <button
          type="button"
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Usuários
        </button>
      </div>

      {activeTab === 'sectors' && (
        <section className="settings-section">
          <form onSubmit={handleCreateSector} className="inline-form">
            <input
              value={sectorForm.name}
              onChange={(e) => setSectorForm({ name: e.target.value })}
              placeholder="Nome do setor"
              required
            />
            <button type="submit">Adicionar</button>
          </form>
          <ul className="settings-list">
            {sectors.map((s) => (
              <li key={s.id} className={s.active === false ? 'inactive' : ''}>
                <span>{s.name}</span>
                <button
                  type="button"
                  className={s.active === false ? 'btn-success btn-sm' : 'btn-danger btn-sm'}
                  onClick={() => handleToggleSector(s)}
                >
                  {s.active === false ? 'Ativar' : 'Desativar'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'shifts' && (
        <section className="settings-section">
          <form onSubmit={handleCreateShift} className="shift-form">
            <input
              value={shiftForm.name}
              onChange={(e) => setShiftForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nome (ex: Manhã)"
              required
            />
            <input
              type="time"
              value={shiftForm.start_time}
              onChange={(e) => setShiftForm((p) => ({ ...p, start_time: e.target.value }))}
              placeholder="Entrada"
            />
            <input
              type="time"
              value={shiftForm.end_time}
              onChange={(e) => setShiftForm((p) => ({ ...p, end_time: e.target.value }))}
              placeholder="Saída"
            />
            <button type="submit">Adicionar</button>
          </form>
          <ul className="settings-list">
            {shifts.map((s) => (
              <li key={s.id} className={s.active === false ? 'inactive' : ''}>
                <span>{s.name} {s.start_time && `(${s.start_time} - ${s.end_time || '?'})`}</span>
                <div>
                  <button type="button" className="btn-sm" onClick={() => handleUpdateShift(s)}>Editar horário</button>
                  <button
                    type="button"
                    className={s.active === false ? 'btn-success btn-sm' : 'btn-danger btn-sm'}
                    onClick={() => handleToggleShift(s)}
                  >
                    {s.active === false ? 'Ativar' : 'Desativar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'users' && (
        <section className="settings-section">
          <form onSubmit={handleCreateUser} className="user-form">
            <input value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nome" required />
            <input type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} placeholder="E-mail" required />
            <input type="password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} placeholder="Senha" required />
            <select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="employee">Funcionário</option>
              <option value="manager">Gerente</option>
            </select>
            <select value={userForm.sector_id ?? ''} onChange={(e) => setUserForm((p) => ({ ...p, sector_id: e.target.value ? Number(e.target.value) : null }))}>
              <option value="">Setor</option>
              {sectors.filter((x) => x.active !== false).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select value={userForm.shift_id ?? ''} onChange={(e) => setUserForm((p) => ({ ...p, shift_id: e.target.value ? Number(e.target.value) : null }))}>
              <option value="">Turno</option>
              {shifts.filter((x) => x.active !== false).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button type="submit">Adicionar</button>
          </form>
          <ul className="settings-list">
            {users.map((u) => (
              <li key={u.id}>
                <span>{u.name} ({u.email}) {u.role === 'manager' ? '👑' : ''} {u.sector && `• ${u.sector.name}`} {u.shift && `• ${u.shift.name}`}</span>
                {u.role !== 'manager' && (
                  <button type="button" className="btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>Remover</button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
