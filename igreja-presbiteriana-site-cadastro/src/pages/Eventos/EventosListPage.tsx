import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { getAllEventos, deleteEvento } from '../../services/eventoService';
import { getAllTiposEvento } from '../../services/tipoEventoService';
import { getAllSociedades } from '../../services/sociedadeService';
import type { EventoCompleto, TipoEvento, Sociedades } from '../../types';

import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Select } from '../../components/Common/Select';

import styles from './EventosListPage.module.css';

const EventosListPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados
  const [eventos, setEventos] = useState<EventoCompleto[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [sociedades, setSociedades] = useState<Sociedades[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipoEvento: '',
    sociedade: '',
    ativo: 'true',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [eventosData, tiposData, sociedadesData] = await Promise.all([
        getAllEventos({
          tipoEvento: filters.tipoEvento
            ? parseInt(filters.tipoEvento)
            : undefined,
          sociedade: filters.sociedade
            ? parseInt(filters.sociedade)
            : undefined,
          ativo:
            filters.ativo === 'true'
              ? true
              : filters.ativo === 'false'
              ? false
              : undefined,
        }),
        getAllTiposEvento(),
        getAllSociedades(),
      ]);

      setEventos(eventosData);
      setTiposEvento(tiposData);
      setSociedades(sociedadesData);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar eventos baseado na busca
  const filteredEventos = eventos.filter(
    (evento) =>
      searchTerm === '' ||
      evento.nmEvento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.nmTipoEvento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.nmSociedade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aplicar filtros quando mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters]);

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Formatar hora
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  // Excluir evento
  const handleDelete = async (evento: EventoCompleto) => {
    if (
      !window.confirm(`Deseja realmente excluir o evento "${evento.nmEvento}"?`)
    ) {
      return;
    }

    try {
      await deleteEvento(evento.cdEvento);
      toast.success('Evento excluído com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir evento');
    }
  };

  // Renderizar status
  const renderStatus = (ativo: boolean) => {
    return (
      <span
        className={`${styles.status} ${ativo ? styles.ativo : styles.inativo}`}
      >
        {ativo ? 'Ativo' : 'Inativo'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Button
          variant='outline'
          onClick={() => navigate('/dashboard')}
          className={styles.backButton}
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </Button>
        <div className={styles.titleSection}>
          <div className={styles.titleContent}>
            <h1 className={styles.title}>
              <Calendar size={24} />
              Eventos
            </h1>
            <p className={styles.subtitle}>
              Gerencie todos os eventos da igreja
            </p>
          </div>

          <Button
            onClick={() => navigate('/eventos/novo')}
            className={styles.newButton}
          >
            <Plus size={16} />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtersSection}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <Input
              type='text'
              placeholder='Buscar eventos...'
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className={styles.searchInput}
            />
          </div>

          <Button
            variant='secondary'
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterToggle}
          >
            <Filter size={16} />
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className={styles.filtersRow}>
            <Select
              label='Tipo de Evento'
              value={filters.tipoEvento}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilters((prev) => ({ ...prev, tipoEvento: e.target.value }))
              }
              options={[
                { value: '', label: 'Todos os tipos' },
                ...tiposEvento.map((te) => ({
                  value: te.cdTipoEvento.toString(),
                  label: te.nmTipoEvento,
                })),
              ]}
            />

            <Select
              label='Sociedade'
              value={filters.sociedade}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilters((prev) => ({ ...prev, sociedade: e.target.value }))
              }
              options={[
                { value: '', label: 'Todas as sociedades' },
                ...sociedades.map((s) => ({
                  value: s.cdSociedade.toString(),
                  label: s.nmSociedade,
                })),
              ]}
            />

            <Select
              label='Status'
              value={filters.ativo}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilters((prev) => ({ ...prev, ativo: e.target.value }))
              }
              options={[
                { value: '', label: 'Todos' },
                { value: 'true', label: 'Ativos' },
                { value: 'false', label: 'Inativos' },
              ]}
            />
          </div>
        )}
      </div>

      {/* Lista de Eventos */}
      <div className={styles.eventsGrid}>
        {filteredEventos.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} />
            <h3>Nenhum evento encontrado</h3>
            <p>
              {searchTerm ||
              filters.tipoEvento ||
              filters.sociedade ||
              filters.ativo !== 'true'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando o primeiro evento.'}
            </p>
            <Button onClick={() => navigate('/eventos/novo')}>
              <Plus size={16} />
              Criar Primeiro Evento
            </Button>
          </div>
        ) : (
          filteredEventos.map((evento) => (
            <div key={evento.cdEvento} className={styles.eventCard}>
              {/* Imagem do evento */}
              <div className={styles.eventImage}>
                {evento.imagemEvento ? (
                  <img
                    src={evento.imagemEvento}
                    alt={evento.nmEvento}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-event.jpg';
                    }}
                  />
                ) : (
                  <div className={styles.placeholderImage}>
                    <Calendar size={32} />
                  </div>
                )}
              </div>

              {/* Conteúdo do evento */}
              <div className={styles.eventContent}>
                <div className={styles.eventHeader}>
                  <h3 className={styles.eventTitle}>{evento.nmEvento}</h3>
                  {renderStatus(evento.ativo)}
                </div>

                <div className={styles.eventMeta}>
                  <div className={styles.metaItem}>
                    <Calendar size={14} />
                    <span>{formatDate(evento.dtEvento)}</span>
                  </div>

                  {evento.horaEvento && (
                    <div className={styles.metaItem}>
                      <Clock size={14} />
                      <span>{formatTime(evento.horaEvento)}</span>
                    </div>
                  )}

                  {evento.enderecoEvento && (
                    <div className={styles.metaItem}>
                      <MapPin size={14} />
                      <span>{evento.enderecoEvento}</span>
                    </div>
                  )}
                </div>

                <div className={styles.eventDetails}>
                  <span className={styles.eventType}>
                    {evento.nmTipoEvento}
                  </span>

                  {evento.nmSociedade && (
                    <span className={styles.eventSociety}>
                      {evento.nmSociedade}
                    </span>
                  )}
                </div>

                {evento.descricao && (
                  <p className={styles.eventDescription}>
                    {evento.descricao.length > 100
                      ? `${evento.descricao.substring(0, 100)}...`
                      : evento.descricao}
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className={styles.eventActions}>
                <Button
                  variant='secondary'
                  size='small'
                  onClick={() => navigate(`/eventos/editar/${evento.cdEvento}`)}
                  title='Editar evento'
                >
                  <Edit size={14} />
                </Button>

                <Button
                  variant='error'
                  size='small'
                  onClick={() => handleDelete(evento)}
                  title='Excluir evento'
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{eventos.length}</span>
          <span className={styles.statLabel}>Total de Eventos</span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statNumber}>
            {eventos.filter((e) => e.ativo).length}
          </span>
          <span className={styles.statLabel}>Eventos Ativos</span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statNumber}>
            {
              eventos.filter((e) => {
                const hoje = new Date();
                const dataEvento = new Date(e.dtEvento);
                return dataEvento >= hoje && e.ativo;
              }).length
            }
          </span>
          <span className={styles.statLabel}>Eventos Futuros</span>
        </div>
      </div>
    </div>
  );
};

export default EventosListPage;
