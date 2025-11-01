import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getAllPessoas,
  addPessoaToSociedade,
} from '../../services/pessoaService';
import { getMembrosBySociedade } from '../../services/sociedadeService';
import { getAllPessoaTipoSociedade } from '../../services/pessoaTipoSociedadeService';
import { Button } from '../../components/Common/Button';
import styles from './SociedadeMembersPage.module.css';

const SociedadeMembersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const societyId = id ? parseInt(id) : null;

  const [allPessoas, setAllPessoas] = useState<any[]>([]);
  const [membros, setMembros] = useState<any[]>([]);
  const [tiposCargo, setTiposCargo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!societyId) return;
    const load = async () => {
      try {
        setLoading(true);
        const [pessoas, tipos] = await Promise.all([
          getAllPessoas({ ativo: true }),
          getAllPessoaTipoSociedade(),
        ]);
        setAllPessoas(pessoas);
        setTiposCargo(tipos);
        const membrosExist = await getMembrosBySociedade(societyId);
        setMembros(membrosExist);
      } catch (err: any) {
        toast.error(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [societyId]);

  const isMember = (cdPessoa: number) => {
    return membros.some((m) => m.cdpessoa === cdPessoa && m.ativo);
  };

  const getMemberRecord = (cdPessoa: number) => {
    return membros.find((m) => m.cdpessoa === cdPessoa);
  };

  const handleToggle = async (pessoa: any, checked: boolean) => {
    try {
      if (!societyId) return;
      if (checked) {
        // adicionar (não forçar label, enviar FK se houver seleção posterior)
        await addPessoaToSociedade({
          cdpessoa: pessoa.cdPessoa,
          cdSociedade: societyId,
          cdpessoatiposociedade: null,
        });
        toast.success(`${pessoa.nmPessoa} adicionado à sociedade`);
      } else {
        // desativar - chamar endpoint existente para desativar
        const rec = getMemberRecord(pessoa.cdPessoa);
        if (rec) {
          await fetch(`/api/pessoassociedade/${rec.cdpessoaSociedade}`, {
            method: 'PATCH',
          });
          toast.success(`${pessoa.nmPessoa} removido da sociedade`);
        }
      }
      // recarregar
      const membrosExist = await getMembrosBySociedade(societyId);
      setMembros(membrosExist);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar associação');
    }
  };

  const handleCargoChange = async (pessoa: any, cargoIdOrValue: string) => {
    try {
      if (!societyId) return;
      const rec = getMemberRecord(pessoa.cdPessoa);
      if (rec) {
        // atualizar FK do tipo de cargo via PATCH
        const parsed = Number(cargoIdOrValue);
        const payload: any = {};
        if (!Number.isNaN(parsed)) payload.cdpessoatiposociedade = parsed;

        await fetch(`/api/pessoassociedade/${rec.cdpessoaSociedade}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success('Cargo atualizado');
        const membrosExist = await getMembrosBySociedade(societyId);
        setMembros(membrosExist);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar cargo');
    }
  };

  if (!societyId) return <div>Sociedade inválida</div>;

  return (
    <div className={styles.container}>
      <h1>Gerenciar Membros da Sociedade</h1>
      <Button variant='secondary' onClick={() => navigate('/sociedades')}>
        Voltar
      </Button>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Adicionar</th>
                <th>Nome</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {allPessoas.map((p) => (
                <tr key={p.cdPessoa}>
                  <td>
                    <input
                      type='checkbox'
                      checked={isMember(p.cdPessoa)}
                      onChange={(e) => handleToggle(p, e.target.checked)}
                    />
                  </td>
                  <td>{p.nmPessoa}</td>
                  <td>
                    <select
                      value={
                        (getMemberRecord(p.cdPessoa) || {})
                          .cdpessoatiposociedade || ''
                      }
                      onChange={(e) => handleCargoChange(p, e.target.value)}
                      disabled={!isMember(p.cdPessoa)}
                    >
                      <option value=''>Selecione</option>
                      {tiposCargo.map((t) => (
                        <option
                          key={t.cdpessoatiposociedade}
                          value={t.cdpessoatiposociedade}
                        >
                          {t.nmcargo}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SociedadeMembersPage;
