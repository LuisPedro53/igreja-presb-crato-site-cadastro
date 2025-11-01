-- 06-pessoa-tipo-sociedade.sql
-- Cria tabela para tipos de cargo em sociedades e popula cargos iniciais

CREATE TABLE IF NOT EXISTS public.pessoatiposociedade (
  cdpessoatiposociedade serial PRIMARY KEY,
  nmcargo text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inserir cargos padrões se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pessoatiposociedade WHERE lower(nmcargo) = 'presidente') THEN
    INSERT INTO public.pessoatiposociedade (nmcargo) VALUES ('Presidente');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pessoatiposociedade WHERE lower(nmcargo) = 'vice-presidente') THEN
    INSERT INTO public.pessoatiposociedade (nmcargo) VALUES ('Vice-Presidente');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pessoatiposociedade WHERE lower(nmcargo) = '1 secretario') THEN
    INSERT INTO public.pessoatiposociedade (nmcargo) VALUES ('1º Secretario');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pessoatiposociedade WHERE lower(nmcargo) = '2 secretario') THEN
    INSERT INTO public.pessoatiposociedade (nmcargo) VALUES ('2º Secretario');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pessoatiposociedade WHERE lower(nmcargo) = 'tesoureiro') THEN
    INSERT INTO public.pessoatiposociedade (nmcargo) VALUES ('Tesoureiro');
  END IF;
END$$;
