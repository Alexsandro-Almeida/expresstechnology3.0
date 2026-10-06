# Express Technology

Site institucional e comercial da Express Technology, reposicionado para aquisição de clientes privados, oportunidades de editais e licitações e apresentação da capacidade técnica da equipe.

## Estrutura

- `index.html`: experiência institucional, serviços, licitações, equipe, projetos e proposta.
- `styles.css`: design responsivo, animações e componentes visuais.
- `script.js`: interações, formulário, EXT, fallback local e fundo em canvas.
- `api/chat.js`: função serverless que conecta o EXT a uma API de IA compatível com Chat Completions.
- `api/lead.js`: função serverless que envia o contato via Resend e registra o lead no Supabase.
- `supabase/schema.sql`: tabela protegida para leads.
- `.env.example`: variáveis necessárias, sem chaves reais.

## Executar localmente

Para visualizar somente a interface:

```powershell
python -m http.server 8123 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8123`. Nesse modo, o EXT usa respostas locais e o formulário abre o cliente de e-mail como contingência. As funções `/api` são executadas após o deploy na Vercel ou com a CLI da Vercel.

## Configurar Supabase

1. Crie um projeto no Supabase.
2. Execute `supabase/schema.sql` no SQL Editor.
3. No painel da Vercel, configure `SUPABASE_URL` e `SUPABASE_SECRET_KEY`.
4. A secret key deve existir apenas no servidor. Nunca coloque essa chave em `script.js`.

## Configurar Resend

1. Verifique o domínio `storeexpressshop.com` no Resend.
2. Crie uma API key.
3. Configure `RESEND_API_KEY` e `RESEND_FROM_EMAIL` na Vercel.
4. As solicitações são enviadas para `sac@storeexpressshop.com`.

## Configurar IA do EXT

Defina no ambiente da Vercel:

- `AI_API_URL`: endpoint compatível com Chat Completions.
- `AI_API_KEY`: chave privada do provedor.
- `AI_MODEL`: identificador do modelo.

Sem essas variáveis, o EXT continua funcional com respostas locais por intenção.

## Publicar na Vercel

Importe este repositório na Vercel, mantenha o diretório raiz do projeto e adicione as variáveis de ambiente. A pasta `api` é detectada como Vercel Functions e os arquivos estáticos são servidos normalmente.

## Dados pendentes da equipe

Os dois novos integrantes estão representados por perfis temporários. Para finalizar, substitua nome, função, mini-biografia e foto diretamente na seção `#team` de `index.html`.
