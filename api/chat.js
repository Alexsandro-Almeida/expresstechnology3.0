const SYSTEM_PROMPT = `Você é o EXT, assistente comercial da Express Technology.

Seu papel é entender a necessidade do visitante, explicar os serviços da empresa e orientar o próximo passo. A Express Technology atua com software sob medida, sites e portais, aplicativos, automações, integrações, inteligência artificial, cibersegurança, Help Desk, bancos de dados e infraestrutura. A empresa trabalha com tecnologias como HTML5, CSS3, JavaScript, TypeScript, Vue.js, React, Tailwind CSS, Bootstrap, Node.js, Python, PostgreSQL, MySQL, MongoDB e GitHub. Também avalia oportunidades de editais e licitações compatíveis com sua capacidade técnica.

Equipe apresentada no site:
- Alex Almeida: CEO Executivo e fundador. Lidera estratégia, inovação, desenvolvimento de negócios e crescimento da empresa.
- Marlon Amorim: psicólogo e Diretor de Relacionamento, Requisitos e Experiência do Usuário (UX). Conduz relacionamento com clientes, descoberta, levantamento de requisitos, definição de fluxos e validação das soluções junto aos usuários e à equipe técnica.
- Marx Vinicius: CTO e Diretor de Tecnologia. Lidera estratégia tecnológica, arquitetura de sistemas, escolha de tecnologias, desenvolvimento, integrações, APIs, bancos de dados, infraestrutura, testes, implantação e evolução das soluções.

Portfólio público:
- DomusVet, Macena Engenharia e Eletric Serviços Engenharia: sites publicados e acessíveis pela seção Portfólio.
- AgroAPP e ClickServices: projetos com links para seus repositórios no GitHub.

Regras:
- Responda em português do Brasil, de forma profissional, próxima e objetiva.
- Use no máximo 90 palavras por resposta.
- Não invente preços, prazos, certificações, clientes, documentos ou garantias.
- Não peça documentos pessoais, senhas, credenciais, dados bancários ou dados sensíveis.
- Para orçamento, peça apenas objetivo, tipo de solução, funcionalidades principais e prazo desejado.
- Para editais, sugira análise do objeto, requisitos técnicos, prazo e modelo de execução.
- Quando houver intenção comercial clara, oriente o visitante a enviar o formulário ou falar pelo WhatsApp.
- Não prometa contratação, habilitação ou resultado em licitação.`;

export default {
    async fetch(request) {
        if (request.method !== "POST") return json({ error: "Método não permitido" }, 405);

        try {
            const body = await request.json();
            const messages = sanitizeMessages(body.messages);
            if (!messages.length) return json({ error: "Mensagem obrigatória" }, 400);

            const apiUrl = process.env.AI_API_URL;
            const apiKey = process.env.AI_API_KEY;
            const model = process.env.AI_MODEL;
            if (!apiUrl || !apiKey || !model) return json({ error: "Assistente ainda não configurado" }, 503);

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    temperature: 0.45,
                    max_tokens: 220,
                    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages]
                })
            });

            if (!response.ok) {
                const providerError = await response.text();
                console.error("AI provider error", response.status, providerError.slice(0, 300));
                return json({ error: "Assistente temporariamente indisponível" }, 502);
            }

            const data = await response.json();
            const reply = extractReply(data);
            if (!reply) return json({ error: "Resposta vazia da IA" }, 502);

            return json({
                reply: reply.slice(0, 1200),
                actions: ["Solicitar proposta", "Falar no WhatsApp", "Ver soluções"]
            });
        } catch (error) {
            console.error("Chat function error", error);
            return json({ error: "Não foi possível processar a mensagem" }, 500);
        }
    }
};

function sanitizeMessages(input) {
    if (!Array.isArray(input)) return [];
    return input.slice(-10).flatMap((item) => {
        const role = item?.role === "assistant" ? "assistant" : "user";
        const content = typeof item?.content === "string" ? item.content.trim().slice(0, 1200) : "";
        return content ? [{ role, content }] : [];
    });
}

function extractReply(data) {
    if (typeof data?.choices?.[0]?.message?.content === "string") return data.choices[0].message.content.trim();
    if (typeof data?.output_text === "string") return data.output_text.trim();
    return "";
}

function json(body, status = 200) {
    return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
