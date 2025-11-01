import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/Common/Button';
import {
  getPessoaById,
  getPessoaSociedades,
} from '../../services/pessoaService';
import { formatDate } from '../../utils/formatters';
import type { PessoaCompleta } from '../../types';
import styles from './PessoaDetailPage.module.css';

export const PessoaDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pessoa, setPessoa] = useState<PessoaCompleta | null>(null);
  const [sociedades, setSociedades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (pessoaId: number) => {
    try {
      setLoading(true);
      const [pessoaData, socsPessoa] = await Promise.all([
        getPessoaById(pessoaId),
        getPessoaSociedades(pessoaId),
      ]);

      if (!pessoaData) {
        toast.error('Pessoa não encontrada');
        navigate('/pessoas');
        return;
      }

      setPessoa(pessoaData);
      setSociedades(socsPessoa);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!pessoa) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant='outline'
          icon={<ArrowLeft size={20} />}
          onClick={() => navigate('/pessoas')}
        >
          Voltar
        </Button>
        <Button
          icon={<Edit size={20} />}
          onClick={() => navigate(`/pessoas/editar/${pessoa.cdpessoa}`)}
        >
          Editar
        </Button>
      </div>

      <div className={styles.content}>
        {/* Card Principal */}
        <div className={styles.mainCard}>
          <div className={styles.photoSection}>
            {pessoa.fotoPessoa ? (
              <img
                src={pessoa.fotoPessoa}
                alt={pessoa.nmPessoa}
                className={styles.photo}
              />
            ) : (
              <div className={styles.photoPlaceholder}>
                <UserIcon size={80} />
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.name}>{pessoa.nmPessoa}</h1>
            <span className={styles.badge}>{pessoa.nmTipoPessoa}</span>
            {sociedades && sociedades.length > 0 && (
              <div className={styles.cargoLabel}>
                {/** Mostrar todos os cargos ativos + sigla da sociedade ao lado, separados por • */}
                {sociedades
                  .filter((s) => s.cargoLabel || s.cargo)
                  .map((s) => {
                    const label = s.cargoLabel || s.cargo;
                    const sigla = s.sigla ? ` · ${s.sigla}` : '';
                    return `${label}${sigla}`;
                  })
                  .join(' • ')}
              </div>
            )}

            <div className={styles.status}>
              {/* mostrar caixa com cor baseada no status: true=verde, false=vermelho, outro=amarelo */}
              <span
                className={`${styles.statusBadge} ${
                  pessoa.ativo === true
                    ? styles.active
                    : pessoa.ativo === false
                    ? styles.inactive
                    : styles.unknown
                }`}
              >
                {pessoa.ativo === true
                  ? 'Ativo'
                  : pessoa.ativo === false
                  ? 'Inativo'
                  : 'Desconhecido'}
              </span>
            </div>

            <div className={styles.details}>
              {pessoa.dtNascimento && (
                <div className={styles.detailItem}>
                  <Calendar size={18} />
                  <div>
                    <span className={styles.detailLabel}>
                      Data de Nascimento
                    </span>
                    <span className={styles.detailValue}>
                      {formatDate(pessoa.dtNascimento)}
                      {pessoa.idade && ` (${pessoa.idade} anos)`}
                    </span>
                  </div>
                </div>
              )}

              {pessoa.telefone && (
                <div className={styles.detailItem}>
                  <Phone size={18} />
                  <div>
                    <span className={styles.detailLabel}>Telefone</span>
                    <span className={styles.detailValue}>
                      {pessoa.telefone}
                    </span>
                  </div>
                </div>
              )}

              {pessoa.email && (
                <div className={styles.detailItem}>
                  <Mail size={18} />
                  <div>
                    <span className={styles.detailLabel}>E-mail</span>
                    <span className={styles.detailValue}>{pessoa.email}</span>
                  </div>
                </div>
              )}

              {pessoa.endereco && (
                <div className={styles.detailItem}>
                  <MapPin size={18} />
                  <div>
                    <span className={styles.detailLabel}>Endereço</span>
                    <span className={styles.detailValue}>
                      {pessoa.endereco}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sociedades */}
        <div className={styles.sociedadesCard}>
          <h2 className={styles.sectionTitle}>Sociedades</h2>
          {sociedades.length === 0 ? (
            <p className={styles.empty}>Não participa de nenhuma sociedade</p>
          ) : (
            <div className={styles.sociedadesList}>
              {sociedades.map((soc) => (
                <div
                  key={soc.cdpessoaSociedade}
                  className={styles.sociedadeItem}
                >
                  <div className={styles.sociedadeInfo}>
                    <span className={styles.sociedadeNome}>
                      {soc.nmSociedade}
                      {soc.sigla && ` (${soc.sigla})`}
                    </span>
                    {soc.cargo && (
                      <span className={styles.sociedadeCargo}>{soc.cargo}</span>
                    )}
                  </div>
                  {soc.dataEntrada && (
                    <span className={styles.sociedadeData}>
                      Desde {formatDate(soc.dataEntrada)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Eventos Futuros (placeholder) */}
        <div className={styles.eventsCard}>
          <h2 className={styles.sectionTitle}>Eventos Recentes</h2>
          <p className={styles.empty}>
            Funcionalidade será implementada em breve
          </p>
        </div>
      </div>
    </div>
  );
};
