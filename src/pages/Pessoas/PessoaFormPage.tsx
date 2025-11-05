import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { Select } from '../../components/Common/Select';
import { Textarea } from '../../components/Common/Textarea';
import { ImageUpload } from '../../components/Common/ImageUpload';
import {
  getPessoaById,
  createPessoa,
  updatePessoa,
  uploadFotoPessoa,
  getPessoaSociedades,
  addPessoaToSociedade,
  removePessoaFromSociedade,
} from '../../services/pessoaService';
import { getAllTiposPessoa } from '../../services/tipoPessoaService';
import { getAllSociedades } from '../../services/sociedadeService';
import { getAllPessoaTipoSociedade } from '../../services/pessoaTipoSociedadeService';
import { pessoaSchema } from '../../utils/validators';
import type { PessoaInput, TipoPessoa, Sociedades } from '../../types';
import styles from './PessoaFormPage.module.css';

export const PessoaFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [tiposPessoa, setTiposPessoa] = useState<TipoPessoa[]>([]);
  const [sociedades, setSociedades] = useState<Sociedades[]>([]);
  const [tiposCargo, setTiposCargo] = useState<any[]>([]);
  const [selectedCargoBySociedade, setSelectedCargoBySociedade] = useState<
    Record<number, number | null>
  >({});
  const [selectedSociedades, setSelectedSociedades] = useState<number[]>([]);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PessoaInput>({
    resolver: zodResolver(pessoaSchema),
    defaultValues: {
      ativo: true,
    },
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Carregar tipos de pessoa
      const tipos = await getAllTiposPessoa();
      setTiposPessoa(tipos);

      // Carregar sociedades
      const socs = await getAllSociedades();
      setSociedades(socs);

      // Carregar tipos de cargo (pessoatiposociedade)
      const tiposC = await getAllPessoaTipoSociedade();
      setTiposCargo(tiposC || []);

      // Se for edição, carregar dados da pessoa
      if (isEdit && id) {
        const pessoa = await getPessoaById(parseInt(id));
        if (pessoa) {
          reset({
            nmPessoa: pessoa.nmPessoa,
            cdTipoPessoa: pessoa.cdTipoPessoa,
            dtNascimento: pessoa.dtNascimento || undefined,
            telefone: pessoa.telefone || undefined,
            email: pessoa.email || undefined,
            endereco: pessoa.endereco || undefined,
            ativo: pessoa.ativo,
          });

          if (pessoa.fotoPessoa) {
            setFotoUrl(pessoa.fotoPessoa);
          }

          // Carregar sociedades da pessoa
          const socsPessoa = await getPessoaSociedades(parseInt(id));
          setSelectedSociedades(socsPessoa.map((s: any) => s.cdSociedade));
          // preencher cargos por sociedade a partir dos vínculos retornados
          const cargoMap: Record<number, number | null> = {};
          socsPessoa.forEach((s: any) => {
            cargoMap[s.cdSociedade] = s.cdpessoatiposociedade ?? null;
          });
          setSelectedCargoBySociedade(cargoMap);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PessoaInput) => {
    try {
      setLoading(true);

      let pessoaId: number;

      if (isEdit && id) {
        // Atualizar pessoa existente
        pessoaId = parseInt(id);

        // Se houver foto nova, fazer upload primeiro e enviar apenas UM update
        if (fotoFile) {
          const fotoUrl = await uploadFotoPessoa(fotoFile, pessoaId);
          await updatePessoa(pessoaId, { ...data, fotoPessoa: fotoUrl });
        } else {
          await updatePessoa(pessoaId, data);
        }

        toast.success('Pessoa atualizada com sucesso!');
      } else {
        // Criar nova pessoa
        const novaPessoa = await createPessoa(data);
        pessoaId = novaPessoa.cdpessoa;
        toast.success('Pessoa cadastrada com sucesso!');

        // Upload da foto se houver (após criar, porque precisamos do id)
        if (fotoFile) {
          const fotoUrl = await uploadFotoPessoa(fotoFile, pessoaId);
          await updatePessoa(pessoaId, { fotoPessoa: fotoUrl });
        }
      }

      // Gerenciar sociedades
      if (isEdit && id) {
        const socsAtuais = await getPessoaSociedades(parseInt(id));
        const socsAtuaisIds = socsAtuais.map((s: any) => s.cdSociedade);

        // Remover sociedades desmarcadas
        for (const soc of socsAtuais) {
          if (!selectedSociedades.includes(soc.cdSociedade)) {
            await removePessoaFromSociedade(soc.cdpessoaSociedade);
          }
        }

        // Adicionar novas sociedades
        for (const socId of selectedSociedades) {
          if (!socsAtuaisIds.includes(socId)) {
            await addPessoaToSociedade({
              cdpessoa: pessoaId,
              cdSociedade: socId,
              cdpessoatiposociedade: selectedCargoBySociedade[socId] ?? null,
            });
          }
        }

        // Atualizar cargo (cdpessoatiposociedade) em associações existentes para refletir seleção
        for (const soc of await getPessoaSociedades(parseInt(id))) {
          const desiredCargo =
            selectedCargoBySociedade[soc.cdSociedade] ?? null;
          // atualizar apenas se for diferente (inclusive null)
          if (soc.cdpessoatiposociedade !== desiredCargo) {
            await fetch(`/api/pessoassociedade/${soc.cdpessoaSociedade}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cdpessoatiposociedade: desiredCargo }),
            });
          }
        }
      } else {
        // Adicionar todas as sociedades selecionadas
        for (const socId of selectedSociedades) {
          await addPessoaToSociedade({
            cdpessoa: pessoaId,
            cdSociedade: socId,
            cdpessoatiposociedade: selectedCargoBySociedade[socId] ?? null,
          });
        }
      }

      navigate('/pessoas');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar pessoa');
    } finally {
      setLoading(false);
    }
  };

  const handleSociedadeToggle = (socId: number) => {
    setSelectedSociedades((prev) => {
      if (prev.includes(socId)) {
        // remover sociedade e limpar cargo associado
        setSelectedCargoBySociedade((prevMap) => {
          const next = { ...prevMap };
          delete next[socId];
          return next;
        });
        return prev.filter((id) => id !== socId);
      }
      return [...prev, socId];
    });
  };

  const handleCargoChangeForSociedade = (
    socId: number,
    cargoId: number | null
  ) => {
    setSelectedCargoBySociedade((prev) => ({ ...prev, [socId]: cargoId }));
  };

  if (loading && isEdit) {
    return (
      <div className={styles.loading}>
        <p>Carregando dados...</p>
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
          <h1 className={styles.title}>
            {isEdit ? 'Editar Pessoa' : 'Nova Pessoa'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit
              ? 'Atualize as informações da pessoa'
              : 'Preencha os dados da nova pessoa'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Coluna Esquerda */}
          <div className={styles.formColumn}>
            <div className={styles.formGroup}>
              <Input
                label='Nome Completo'
                placeholder='Digite o nome completo'
                error={errors.nmPessoa?.message}
                {...register('nmPessoa')}
              />
            </div>

            <div className={styles.formGroup}>
              <Select
                label='Tipo de Pessoa'
                placeholder='Selecione o tipo'
                options={tiposPessoa.map((t) => ({
                  value: t.cdTipoPessoa,
                  label: t.nmTipoPessoa,
                }))}
                error={errors.cdTipoPessoa?.message}
                {...register('cdTipoPessoa', { valueAsNumber: true })}
              />
            </div>

            {/* Nota: cargos agora são selecionados por sociedade na coluna direita */}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  label='Data de Nascimento'
                  type='date'
                  error={errors.dtNascimento?.message}
                  {...register('dtNascimento')}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label='Telefone'
                  type='tel'
                  placeholder='(88) 99999-9999'
                  error={errors.telefone?.message}
                  {...register('telefone')}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <Input
                label='E-mail'
                type='email'
                placeholder='email@exemplo.com'
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className={styles.formGroup}>
              <Textarea
                label='Endereço'
                placeholder='Rua, número, bairro, cidade'
                rows={3}
                error={errors.endereco?.message}
                {...register('endereco')}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type='checkbox'
                  className={styles.checkbox}
                  {...register('ativo')}
                />
                <span className={styles.checkboxText}>Pessoa ativa</span>
              </label>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className={styles.formColumn}>
            <div className={styles.formGroup}>
              <ImageUpload
                label='Foto da Pessoa'
                currentImage={fotoUrl}
                onImageSelect={(file) => setFotoFile(file)}
                onImageRemove={() => {
                  setFotoFile(null);
                  setFotoUrl(null);
                }}
                hint='Tamanho recomendado: 400x400px. Formatos: JPG, PNG, GIF.'
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Sociedades <span className={styles.optional}>(opcional)</span>
              </label>
              <div className={styles.sociedadesList}>
                {sociedades.length === 0 ? (
                  <p className={styles.emptySociedades}>
                    Nenhuma sociedade cadastrada
                  </p>
                ) : (
                  sociedades.map((soc) => (
                    <label
                      key={soc.cdSociedade}
                      className={styles.sociedadeItem}
                    >
                      <input
                        type='checkbox'
                        checked={selectedSociedades.includes(soc.cdSociedade)}
                        onChange={() => handleSociedadeToggle(soc.cdSociedade)}
                      />
                      <span title={soc.nmSociedade}>
                        {soc.sigla ? soc.sigla : soc.nmSociedade}
                      </span>
                      {selectedSociedades.includes(soc.cdSociedade) && (
                        <div className={styles.sociedadeCargo}>
                          <label className={styles.smallLabel}>Cargo</label>
                          <select
                            value={
                              selectedCargoBySociedade[soc.cdSociedade] ?? ''
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              handleCargoChangeForSociedade(
                                soc.cdSociedade,
                                val ? Number(val) : null
                              );
                            }}
                          >
                            <option value=''>Nenhum</option>
                            {tiposCargo.map((t: any) => (
                              <option
                                key={t.cdpessoatiposociedade}
                                value={t.cdpessoatiposociedade}
                              >
                                {t.nmcargo}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className={styles.formActions}>
          <Button
            type='button'
            variant='secondary'
            onClick={() => navigate('/dashboard')}
          >
            Cancelar
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? (
              <>
                <div className={styles.spinnerSmall}></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEdit ? 'Atualizar' : 'Criar'} Pessoa
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
