-- 07-pessoassociedade-add-fk.sql
-- Adiciona a coluna cdpessoatiposociedade em pessoassociedade e cria a FK para pessoatiposociedade.
-- Também tenta mapear valores existentes de cargo para os tipos recém-criados (caso aplicável).

BEGIN;

-- 1) Adicionar a coluna (permite NULL para compatibilidade)
ALTER TABLE pessoassociedade
  ADD COLUMN IF NOT EXISTS cdpessoatiposociedade integer NULL;

-- 2) Tentar povoar a coluna a partir do texto cargo quando houver correspondência de nome (case-insensitive)
-- Observação: isto depende de registros existirem em pessoatiposociedade com nmcargo correspondentes aos textos atuais em cargo.
UPDATE pessoassociedade ps
SET cdpessoatiposociedade = pt.cdpessoatiposociedade
FROM pessoatiposociedade pt
WHERE ps.cdpessoatiposociedade IS NULL
  AND lower(coalesce(ps.cargo, '')) = lower(coalesce(pt.nmcargo, ''));

-- 3) Criar índice e constraint de FK (ON DELETE SET NULL para evitar bloqueios ao excluir tipos)
CREATE INDEX IF NOT EXISTS idx_pessoassociedade_cdpessoatiposociedade ON pessoassociedade (cdpessoatiposociedade);

ALTER TABLE pessoassociedade
  ADD CONSTRAINT fk_pessoassociedade_pessoatiposociedade
  FOREIGN KEY (cdpessoatiposociedade)
  REFERENCES pessoatiposociedade(cdpessoatiposociedade)
  ON DELETE SET NULL;

COMMIT;

-- Recomendações:
-- 1) Revise os registros cujo cdpessoatiposociedade permaneceu NULL e atribua manualmente quando necessário.
-- 2) Se quiser remover posteriormente a coluna cargo textual, faça uma migration que primeiro copie/normalize os dados e então remova a coluna.
