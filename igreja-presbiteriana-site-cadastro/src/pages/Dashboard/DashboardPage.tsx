import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Users, Calendar, UserCheck, Users2, Plus, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './DashboardPage.module.css';

import { getAllPessoas } from '../../services/pessoaService';
import { getAllEventos } from '../../services/eventoService';
import { getAllConselhos } from '../../services/conselhoService';
import { getAllSociedades } from '../../services/sociedadeService';
import type { ConselhoCompleto, Sociedades } from '../../types';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [totalMembros, setTotalMembros] = useState<number | null>(null);
  const [totalEventosMes, setTotalEventosMes] = useState<number | null>(null);
  const [conselhoAtivoCount, setConselhoAtivoCount] = useState<number | null>(
    null
  );
  const [conselhoAtivoPreview, setConselhoAtivoPreview] = useState<
    string | null
  >(null);
  const [sociedades, setSociedades] = useState<Sociedades[] | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Membros ativos
        const pessoas = await getAllPessoas({ ativo: true });
        setTotalMembros(pessoas.length);

        // Eventos do mês (filtrar pelo mês atual)
        const now = new Date();
        const primeiro = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        const ultimo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];

        const eventos = await getAllEventos({
          datainicio: primeiro,
          datafim: ultimo,
          ativo: true,
        });
        setTotalEventosMes(eventos.length);

        // Conselho ativo
        const conselhos = (await getAllConselhos()) || [];
        // contar entries ativos
        const ativos = conselhos.filter((c: ConselhoCompleto) => c.ativo);
        setConselhoAtivoCount(ativos.length);
        setConselhoAtivoPreview(ativos.length > 0 ? ativos[0].nmPessoa : null);

        // Sociedades
        const socs = await getAllSociedades();
        setSociedades(socs);
      } catch (err) {
        // falha silenciosa - manter placeholders
        console.error('Erro ao carregar estatísticas do dashboard', err);
      }
    };

    loadStats();
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>
          Bem-vindo, {user?.nomePessoa || user?.nmLogin}!
        </h1>
        <p className={styles.welcomeText}>
          Sistema de Gerenciamento - Igreja Presbiteriana do Crato
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Total de Membros</h3>
            <div className={styles.cardIcon}>
              <Users size={24} />
            </div>
          </div>
          <p className={styles.cardValue}>{totalMembros ?? '-'}</p>
          <p className={styles.cardDescription}>Membros cadastrados</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Eventos do Mês</h3>
            <div className={styles.cardIcon}>
              <Calendar size={24} />
            </div>
          </div>
          <p className={styles.cardValue}>{totalEventosMes ?? '-'}</p>
          <p className={styles.cardDescription}>Eventos programados</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Conselho Ativo</h3>
            <div className={styles.cardIcon}>
              <UserCheck size={24} />
            </div>
          </div>
          <p className={styles.cardValue}>{conselhoAtivoCount ?? '-'}</p>
          <p className={styles.cardDescription}>
            {conselhoAtivoPreview
              ? ` ${conselhoAtivoPreview}`
              : 'Membros do conselho'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Sociedades</h3>
            <div className={styles.cardIcon}>
              <Users2 size={24} />
            </div>
          </div>
          <p className={styles.cardValue}>
            {sociedades ? sociedades.length : '-'}
          </p>
          <p className={styles.cardDescription}>
            {sociedades && sociedades.length > 0
              ? sociedades
                  .map((s) =>
                    s.sigla && s.sigla.trim() ? s.sigla.trim() : s.nmSociedade
                  )
                  .join(', ')
              : 'Nenhuma sociedade cadastrada'}
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.contentTitle}>Ações Rápidas</h2>

        <div className={styles.subCard}>
          <div className={styles.actionsGroup}>
            <div className={styles.groupTitle}>Cadastro</div>
            <div className={styles.quickActions}>
              <Link to='/pessoas/novo' className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <Plus size={20} />
                </div>
                <span className={styles.actionText}>Nova Pessoa</span>
              </Link>

              <Link to='/eventos/novo' className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <Plus size={20} />
                </div>
                <span className={styles.actionText}>Novo Evento</span>
              </Link>

              <Link to='/conselho/novo' className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <Plus size={20} />
                </div>
                <span className={styles.actionText}>Novo Membro Conselho</span>
              </Link>

              <Link to='/sociedades/novo' className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <Plus size={20} />
                </div>
                <span className={styles.actionText}>Nova Sociedade</span>
              </Link>

              <Link to='/usuarios/novo' className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <Plus size={20} />
                </div>
                <span className={styles.actionText}>Novo Usuário</span>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.subCard}>
          <div className={styles.actionsGroup}>
            <div className={styles.groupTitle}>Visualização</div>
            <div className={styles.quickActions}>
              <Link to='/pessoas' className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <Users size={20} />
                </div>
                <span className={styles.actionText}>Ver Pessoas</span>
              </Link>

              <Link to='/eventos' className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <Calendar size={20} />
                </div>
                <span className={styles.actionText}>Ver Eventos</span>
              </Link>

              <Link to='/conselho' className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <UserCheck size={20} />
                </div>
                <span className={styles.actionText}>Ver Conselho</span>
              </Link>

              <Link to='/sociedades' className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <Users2 size={20} />
                </div>
                <span className={styles.actionText}>Ver Sociedades</span>
              </Link>

              <Link to='/usuarios' className={styles.actionButton}>
                <div className={styles.actionIcon}>
                  <Users size={20} />
                </div>
                <span className={styles.actionText}>Ver Usuários</span>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.logoutWrap}>
          <button onClick={logout} className={styles.logoutButton}>
            <div className={styles.actionIcon}>
              <LogOut size={20} />
            </div>
            <span className={styles.actionText}>Sair do Sistema</span>
          </button>
        </div>
      </div>
    </div>
  );
};
