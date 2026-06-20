const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const founderModal = document.getElementById("founder-modal");
const openFounder = document.getElementById("open-founder");
const closeFounder = document.getElementById("close-founder");
const chat = document.getElementById("chat");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const quickActions = document.getElementById("quick-actions");
const closeChat = document.getElementById("close-chat");
const openChatButtons = document.querySelectorAll("[data-open-chat]");
const budgetForm = document.getElementById("budget-form");
const caseModal = document.getElementById("case-modal");
const closeCase = document.getElementById("close-case");
const caseCards = document.querySelectorAll("[data-case]");
const tooltip = document.getElementById("ext-tooltip");
const interactiveTips = document.querySelectorAll("[data-ext-tip]");
const tiltCards = document.querySelectorAll(".tilt-card");
const magneticItems = document.querySelectorAll(".magnetic");
const typewriterTitle = document.querySelector("[data-typewrite]");

const whatsappNumber = "5593981137014";
const companyEmail = "expresstechnology.contato@gmail.com";
const lead = safeReadLead();
let lastScrollY = window.scrollY;
let chatStarted = false;
let lastTipText = "";
let lastTipAt = 0;
let speechTimer;
let briefingStep = 0;
const briefing = {};

const caseDescriptions = {
    "DormusVet": "Site criado para presença digital profissional na área veterinária. Em breve este case poderá receber imagens, link publicado, objetivo do projeto e principais resultados.",
    "Macena Engenharia": "Projeto institucional para engenharia, preparado para destacar autoridade, serviços e contato comercial. A galeria será conectada quando você enviar imagens e URL.",
    "Eletric Serviços Engenharia": "Site institucional de engenharia elétrica, pensado para apresentar serviços, trajetória e projetos com navegação clara.",
    "AgroAPP": "Aplicativo voltado ao universo agro, pronto para receber telas, fluxo de uso, tecnologias e história do produto.",
    "ClickServices": "Aplicativo de serviços, com espaço reservado para explicar problema, solução, usuários e funcionalidades principais.",
    "PayAll": "Programa sob medida com proposta de organizar operação e pagamentos. Em breve pode ganhar uma página própria com fluxo e prints."
};

startHeroTypewriter();

menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
});

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        header.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
    });
});

window.addEventListener("scroll", () => {
    const current = window.scrollY;
    header.classList.toggle("is-hidden", current > lastScrollY && current > 140);
    lastScrollY = current;
});

window.addEventListener("pointermove", (event) => {
    document.body.style.setProperty("--mx", `${event.clientX}px`);
    document.body.style.setProperty("--my", `${event.clientY}px`);
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

revealItems.forEach((item) => observer.observe(item));

function startHeroTypewriter() {
    if (!typewriterTitle) return;

    const text = typewriterTitle.dataset.typewrite || typewriterTitle.textContent.trim();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        typewriterTitle.textContent = text;
        typewriterTitle.classList.add("is-done");
        return;
    }

    typewriterTitle.textContent = "";
    typewriterTitle.classList.add("is-typing");

    const chars = [...text];
    let index = 0;

    const typeNextChar = () => {
        const char = chars[index];
        typewriterTitle.textContent += char;
        index += 1;

        if (index >= chars.length) {
            window.setTimeout(() => {
                typewriterTitle.classList.remove("is-typing");
                typewriterTitle.classList.add("is-done");
            }, 220);
            return;
        }

        const nextChar = chars[index];
        const pause = nextChar === " " ? 150 : /[.,!?]/.test(nextChar) ? 260 : 92;
        window.setTimeout(typeNextChar, pause);
    };

    window.setTimeout(typeNextChar, 360);
}

openFounder.addEventListener("click", () => toggleModal(true));
closeFounder.addEventListener("click", () => toggleModal(false));
founderModal.addEventListener("click", (event) => {
    if (event.target === founderModal) toggleModal(false);
});

closeCase.addEventListener("click", () => toggleCaseModal(false));
caseModal.addEventListener("click", (event) => {
    if (event.target === caseModal) toggleCaseModal(false);
});

caseCards.forEach((card) => {
    card.addEventListener("click", () => openCase(card.dataset.case));
});

budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("lead-name").value.trim();
    const phone = document.getElementById("lead-phone").value.trim();
    const subject = document.getElementById("lead-subject").value.trim();
    const message = document.getElementById("lead-message").value.trim();
    const status = document.getElementById("form-status");

    if (!name || !phone || !subject || !message) return;

    submitLeadByEmail(name, phone, subject, message, status);
});

function toggleModal(open) {
    founderModal.classList.toggle("is-open", open);
    founderModal.setAttribute("aria-hidden", String(!open));
}

function toggleCaseModal(open) {
    caseModal.classList.toggle("is-open", open);
    caseModal.setAttribute("aria-hidden", String(!open));
}

function openCase(name) {
    document.getElementById("case-title").textContent = name;
    document.getElementById("case-description").textContent = caseDescriptions[name] || "Este case está pronto para receber imagens, link e detalhes do projeto.";
    toggleCaseModal(true);
    showExtSpeech(`${name} ainda está em modo prévia. Quando você enviar imagem e link, eu deixo esse case pronto para vender melhor.`);
}

async function submitLeadByEmail(name, phone, subject, message, status) {
    const submitButton = budgetForm.querySelector("button[type='submit']");
    const payload = {
        name,
        phone,
        assunto: subject,
        origem: "Site Express Technology - pedido de contratação",
        message: [
            "Novo pedido pelo site da Express Technology.",
            "",
            `Nome: ${name}`,
            `Telefone: ${phone}`,
            `Assunto: ${subject}`,
            "",
            "Mensagem do cliente:",
            message
        ].join("\n"),
        _subject: `Novo pedido: ${subject}`,
        _template: "table",
        _captcha: "false"
    };

    status.classList.remove("is-error");
    status.textContent = "Preparando envio para a equipe...";
    submitButton.disabled = true;

    try {
        const response = await fetch(`https://formsubmit.co/ajax/${companyEmail}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("FormSubmit request failed");

        status.textContent = "E-mail enviado. A equipe recebeu seu pedido e vai retornar.";
        budgetForm.reset();
        showExtSpeech("Pronto! Enviei seu pedido para a equipe. Agora eles já chegam sabendo o que você quer construir.");
    } catch {
        status.classList.add("is-error");
        status.textContent = "Não consegui enviar automático. Vou abrir seu e-mail já preenchido.";
        showExtSpeech("O envio automático não respondeu agora. Vou deixar um e-mail prontinho como alternativa.");
        window.location.href = buildLeadMailto(name, phone, subject, message);
    } finally {
        submitButton.disabled = false;
    }
}

function buildLeadMailto(name, phone, requestSubject, message) {
    const subject = encodeURIComponent(`Pedido de contratação - ${requestSubject}`);
    const body = encodeURIComponent([
        "Olá, quero contratar ou pedir uma proposta da Express Technology.",
        "",
        `Nome: ${name}`,
        `Telefone para retorno: ${phone}`,
        `Assunto: ${requestSubject}`,
        "",
        "Mensagem:",
        message,
        "",
        "Observação: não estou enviando documentos, senhas ou dados sensíveis."
    ].join("\n"));

    return `mailto:${companyEmail}?subject=${subject}&body=${body}`;
}

openChatButtons.forEach((button) => {
    button.addEventListener("click", () => openExtChat());
});

closeChat.addEventListener("click", () => {
    chat.classList.remove("is-open");
    chat.setAttribute("aria-hidden", "true");
    document.body.classList.remove("chat-open");
});

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage("user", text);
    chatInput.value = "";
    setTimeout(() => answerUser(text), 420);
});

interactiveTips.forEach((element) => {
    const enterTip = () => {
        const text = getExtSpeech(element);
        showExtSpeech(text);
        speakContext(text);
    };

    element.addEventListener("pointerenter", enterTip);
    element.addEventListener("mouseover", enterTip);
    element.addEventListener("focus", enterTip);
    element.addEventListener("pointerleave", queueExtSpeechHide);
    element.addEventListener("mouseleave", queueExtSpeechHide);
    element.addEventListener("blur", queueExtSpeechHide);
});

tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
        const box = card.getBoundingClientRect();
        const x = event.clientX - box.left;
        const y = event.clientY - box.top;
        const rotateY = ((x / box.width) - 0.5) * 7;
        const rotateX = ((0.5 - y / box.height)) * 7;
        card.style.setProperty("--card-x", `${x}px`);
        card.style.setProperty("--card-y", `${y}px`);
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
        card.style.transform = "";
    });
});

magneticItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
        const box = item.getBoundingClientRect();
        const x = (event.clientX - box.left - box.width / 2) * 0.12;
        const y = (event.clientY - box.top - box.height / 2) * 0.12;
        item.style.transform = `translate(${x}px, ${y}px)`;
    });

    item.addEventListener("pointerleave", () => {
        item.style.transform = "";
    });
});

function getExtSpeech(element) {
    const label = element.textContent.replace(/\s+/g, " ").trim();
    const title = element.querySelector("h3")?.textContent.trim();

    const serviceMessages = {
        "Cyber segurança": "Esse aqui é o escudo da casa. Se o cliente tem site, sistema ou dados importantes, segurança não é luxo: é paz para dormir.",
        "Programação Full Stack": "Full stack é quando a ideia sai da conversa e vira sistema completo: tela bonita, lógica funcionando e dados no lugar certo.",
        "Automações": "Automação é meu tipo favorito de economia: menos tarefa repetida, mais tempo para vender, atender e pensar no negócio.",
        "IA e bots inteligentes": "Aqui eu entro em cena com estilo. Um bot bem treinado atende, qualifica e já entrega o cliente mais pronto para fechar.",
        "Programas sob medida": "Quando ferramenta pronta começa a atrapalhar, programa sob medida resolve. A rotina da empresa vira software do jeito certo.",
        "Aplicativos": "App bom não é só ícone na tela. Ele precisa facilitar a vida do usuário e colocar serviço, dados e atendimento na mão dele."
    };

    const techMessages = {
        "HTML5": "HTML é a estrutura. Sem ele, o site fica sem esqueleto. Com ele bem feito, SEO e acessibilidade já começam melhor.",
        "CSS3": "CSS é onde o visual ganha presença. É aqui que o site deixa de ser comum e começa a parecer premium.",
        "JavaScript": "JavaScript dá movimento, resposta e inteligência para a página. É o motor das interações que você está vendo agora.",
        "React": "React é ótimo para interfaces modernas, painéis e sistemas que precisam crescer sem virar bagunça.",
        "Node.js": "Node.js segura o backend com velocidade: APIs, integrações, automações e comunicação entre sistemas.",
        "Python": "Python é o canivete técnico: automações, IA, dados, scripts e soluções rápidas para problemas chatos.",
        "MySQL": "MySQL é banco relacional raiz: bom para dados organizados, relatórios e regras bem definidas.",
        "MongoDB": "MongoDB combina com dados flexíveis e projetos que precisam evoluir rápido sem travar a estrutura.",
        "IA generativa": "IA generativa ajuda a atender, escrever, resumir, classificar e acelerar processos. Usada direito, vira vantagem.",
        "APIs": "APIs são as pontes do projeto. Elas conectam pagamento, WhatsApp, banco de dados, apps e serviços externos.",
        "Firebase": "Firebase acelera login, banco, notificações e apps. Bom para tirar ideia do papel com estrutura cloud.",
        "Cloud": "Cloud mantém tudo online, escalável e pronto para crescer. Projeto sério precisa pensar onde vai rodar."
    };

    const projectMessages = {
        "DormusVet": "DormusVet já fica reservado para virar case bonito. Quando entrar imagem e link, esse card vai trabalhar muito.",
        "Macena Engenharia": "Macena Engenharia tem cara de case institucional forte. Depois a gente pluga o link e deixa pronto para visita.",
        "Eletric Serviços Engenharia": "Esse projeto já tem história. Em breve dá para abrir o site ou mostrar uma galeria do trabalho.",
        "AgroAPP": "AgroAPP pede uma apresentação de produto: telas, problema resolvido e aquele antes/depois que convence.",
        "ClickServices": "ClickServices soa como app de serviço direto ao ponto. Quando vierem as imagens, dá para montar uma vitrine boa.",
        "PayAll": "PayAll tem nome de sistema que resolve operação. Depois podemos criar uma página explicando fluxo e funcionalidades."
    };

    if (title && serviceMessages[title]) return serviceMessages[title];
    if (title && projectMessages[title]) return projectMessages[title];

    const tech = Object.keys(techMessages).find((key) => label.includes(key));
    if (tech) return techMessages[tech];

    if (element.matches(".header-cta")) return "Quer conversar sem rodeio? Esse botão leva direto para o WhatsApp com intenção de contratação.";
    if (element.matches("[data-open-chat]")) return "Se quiser, eu te ajudo a descobrir o melhor caminho: site, sistema, app, IA, automação ou segurança.";
    if (element.matches(".brand")) return "Essa é a assinatura da Express Technology. A ideia aqui é passar confiança logo no primeiro olhar.";
    if (element.matches(".site-nav a")) return `Atalho para ${label}. Navegação simples ajuda o visitante a chegar rápido no que interessa.`;
    if (element.matches(".hero-content")) return "Essa primeira dobra precisa vender a promessa em segundos: tecnologia bonita, funcional e pronta para negócio.";
    if (element.matches(".intro")) return "Esse bloco traduz o posicionamento: não é só código, é tecnologia pensada para gerar ação.";
    if (element.matches(".section-heading")) return "Título bom guia o visitante. Ele precisa bater o olho e entender por que continuar lendo.";
    if (element.matches(".stat-card")) return "Esses índices servem como prova rápida: experiência, clientes atendidos, garantia e profissionalismo antes do visitante pedir proposta.";
    if (element.matches(".trust-card")) return "Essa prova de confiança ajuda o cliente a pensar: ok, aqui não é só aparência, tem entrega de verdade.";
    if (element.matches(".budget-form")) return "Esse é o caminho direto: você escolhe o serviço, resume a ideia e a equipe recebe tudo por e-mail para retornar com proposta.";
    if (element.matches(".project-card")) return "Esse card já funciona como prévia de case. Depois é só plugar imagens e link para virar vitrine completa.";
    if (element.matches(".founder-card")) return "Aqui entra autoridade humana. Cliente gosta de saber quem está por trás da entrega.";
    if (element.matches(".contact-copy, .contact-panel")) return "Chegou na conversão. Agora o visitante precisa de um próximo passo claro e fácil.";
    if (element.matches(".site-footer")) return "Rodapé também vende. Ele reforça marca, contato e confiança até o último scroll.";
    if (element.matches(".ext-launcher")) return "Estou aqui no canto para acompanhar o visitante sem atrapalhar. Clicou, eu viro atendimento.";

    return element.dataset.extTip || "Esse ponto ajuda o visitante a entender melhor a proposta do site.";
}

function showExtSpeech(text) {
    if (!text) return;
    clearTimeout(speechTimer);
    tooltip.textContent = text;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    document.querySelector(".ext-launcher")?.classList.add("is-speaking");
}

function queueExtSpeechHide() {
    clearTimeout(speechTimer);
    speechTimer = setTimeout(hideExtSpeech, 1700);
}

function hideExtSpeech() {
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
    document.querySelector(".ext-launcher")?.classList.remove("is-speaking");
}

function speakContext(text) {
    const now = Date.now();
    if (!chat.classList.contains("is-open")) return;
    if (text === lastTipText && now - lastTipAt < 8000) return;
    if (now - lastTipAt < 3600) return;
    lastTipText = text;
    lastTipAt = now;
    addMessage("bot", `Dica rápida: ${text}`);
}

function openExtChat() {
    chat.classList.add("is-open");
    chat.setAttribute("aria-hidden", "false");
    document.body.classList.add("chat-open");
    chatInput.focus();

    if (!chatStarted) {
        chatStarted = true;
        addMessage("bot", "Olá! Eu sou o EXT. Posso explicar o site enquanto você navega, indicar o serviço ideal e preparar seu atendimento para contratação.");
        renderQuickActions(["Quero cyber segurança", "Preciso de sistema", "Quero automação", "Quero app", "Falar no WhatsApp"]);
    }
}

function addMessage(type, text) {
    const message = document.createElement("div");
    message.className = `message ${type}`;
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderQuickActions(actions) {
    quickActions.innerHTML = "";
    actions.forEach((label) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.addEventListener("click", () => {
            addMessage("user", label);
            setTimeout(() => answerUser(label), 260);
        });
        quickActions.appendChild(button);
    });
}

function answerUser(text) {
    const normalized = normalize(text);
    const math = text.match(/(-?\d+(?:[.,]\d+)?)\s*([+\-*/x])\s*(-?\d+(?:[.,]\d+)?)/i);

    collectLead(normalized, text);

    if (briefingStep > 0) {
        handleBriefingAnswer(text);
        return;
    }

    if (has(normalized, ["montar briefing", "briefing", "começar briefing", "comecar briefing", "orçamento guiado", "orcamento guiado", "refazer briefing"])) {
        startBriefing();
        return;
    }

    if (has(normalized, ["ver formulario", "ver formulário", "formulario", "formulário", "email", "e-mail"])) {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
        addMessage("bot", "Levei você para o formulário. Ele pede contato, assunto e uma mensagem rápida, envia para o e-mail da empresa e evita qualquer dado sensível.");
        renderQuickActions(["Montar briefing", "Falar no WhatsApp", "Ver serviços"]);
        return;
    }

    if (math) {
        addMessage("bot", calculate(math));
        renderQuickActions(["Quero orçamento", "Ver serviços", "Falar no WhatsApp"]);
        return;
    }

    if (has(normalized, ["whatsapp", "contato", "orcamento", "orçamento", "falar", "contratar", "atendente"])) {
        const url = buildWhatsappUrl();
        addMessage("bot", "Perfeito. Preparei uma mensagem comercial com o que conversamos. Vou abrir o WhatsApp para continuar o atendimento.");
        renderQuickActions(["Continuar briefing", "Ver serviços", "Projetos em breve"]);
        window.open(url, "_blank", "noreferrer");
        return;
    }

    if (has(normalized, ["cyber", "seguranca", "segurança", "hacker", "vulnerabilidade", "proteger"])) {
        lead.interesse = "cyber segurança";
        persistLead();
        addMessage("bot", "Para cyber segurança, o melhor início é revisar riscos: senhas, acessos, backups, formulários, banco de dados e hospedagem. Posso montar um diagnóstico inicial para sua empresa.");
        renderQuickActions(["Quero diagnóstico", "Tenho site", "Tenho sistema", "Falar no WhatsApp"]);
        return;
    }

    if (has(normalized, ["full stack", "sistema", "programa", "software", "painel", "dashboard", "backend", "frontend"])) {
        lead.interesse = "programação full stack ou programa sob medida";
        persistLead();
        addMessage("bot", "Um sistema sob medida pode organizar vendas, clientes, financeiro, estoque, relatórios ou operação interna. Me diga quais telas ou processos você imagina.");
        renderQuickActions(["Sistema de vendas", "Painel admin", "Controle financeiro", "Falar no WhatsApp"]);
        return;
    }

    if (has(normalized, ["app", "aplicativo", "mobile", "android", "ios", "agroapp", "clickservices"])) {
        lead.interesse = "aplicativo";
        persistLead();
        addMessage("bot", "Para aplicativo, precisamos definir usuários, login, dados, notificações, painel admin e integração com APIs. Posso ajudar a transformar a ideia em escopo.");
        renderQuickActions(["App para clientes", "App interno", "Tenho telas", "Falar no WhatsApp"]);
        return;
    }

    if (has(normalized, ["automacao", "automação", "processo", "planilha", "rotina", "mensagem", "relatorio", "relatório"])) {
        lead.interesse = "automação";
        persistLead();
        addMessage("bot", "Automação é perfeita para cortar tarefas repetitivas. Podemos automatizar mensagens, relatórios, cadastros, planilhas, atendimento e integração entre ferramentas.");
        renderQuickActions(["Automatizar atendimento", "Automatizar relatórios", "Automatizar vendas", "Falar no WhatsApp"]);
        return;
    }

    if (has(normalized, ["bot", "ia", "inteligencia", "inteligência", "chat", "assistente", "ext"])) {
        lead.interesse = "IA e bot inteligente";
        persistLead();
        addMessage("bot", "Um bot com IA pode atender visitantes, explicar serviços, filtrar clientes, coletar briefing e encaminhar leads quentes. O EXT deste site já demonstra esse fluxo.");
        renderQuickActions(["Bot para site", "Bot para WhatsApp", "Treinar com FAQ", "Falar no WhatsApp"]);
        return;
    }

    if (has(normalized, ["site", "landing", "pagina", "página", "portfolio", "loja", "dormusvet", "macena", "eletric"])) {
        lead.interesse = "site ou landing page";
        persistLead();
        addMessage("bot", "Para site que converte, recomendo: proposta forte, prova visual, serviços claros, CTA direto, WhatsApp, SEO básico e visual premium. Você já tem logo, fotos e textos?");
        renderQuickActions(["Tenho materiais", "Preciso de tudo", "Quero site premium", "Falar no WhatsApp"]);
        return;
    }

    if (has(normalized, ["projeto", "portfolio", "portfólio", "case", "dormusvet", "macena", "eletric", "payall"])) {
        addMessage("bot", "A área de projetos está preparada para receber imagens, links e galerias. Por enquanto os cards ficam como Em breve, para não prometer detalhes antes dos materiais finais.");
        renderQuickActions(["Enviar links depois", "Ver serviços", "Falar no WhatsApp"]);
        return;
    }

    if (has(normalized, ["tecnologia", "stack", "linguagem", "react", "python", "node", "banco", "cloud", "firebase"])) {
        addMessage("bot", "A stack inclui HTML, CSS, JavaScript, React, Node.js, Python, MySQL, MongoDB, Firebase, APIs, cloud e IA. A escolha ideal depende de prazo, orçamento, integrações e escala.");
        renderQuickActions(["Quero recomendação", "Ver serviços", "Falar no WhatsApp"]);
        return;
    }

    if (has(normalized, ["preco", "preço", "valor", "quanto", "custa", "prazo"])) {
        addMessage("bot", "O orçamento depende do escopo. Para estimar bem, preciso saber: tipo de projeto, funcionalidades, integrações, prazo, referências e materiais disponíveis.");
        renderQuickActions(["Montar briefing", "Tenho escopo", "Falar no WhatsApp"]);
        return;
    }

    if (has(normalized, ["ola", "olá", "oi", "bom dia", "boa tarde", "boa noite", "hello"])) {
        addMessage("bot", "Oi! Me diga o que você quer contratar: cyber segurança, full stack, automação, IA, programa sob medida, aplicativo ou site premium.");
        renderQuickActions(["Cyber segurança", "Full stack", "Automação", "IA", "Aplicativo"]);
        return;
    }

    addMessage("bot", "Entendi. Para te orientar com precisão, me diga o objetivo do projeto, quem vai usar e qual resultado você quer alcançar: vender mais, atender melhor, automatizar ou organizar dados.");
    renderQuickActions(["Quero contratar", "Montar briefing", "Ver serviços", "Falar no WhatsApp"]);
}

function startBriefing() {
    briefingStep = 1;
    briefing.servico = "";
    briefing.objetivo = "";
    briefing.prazo = "";
    briefing.materiais = "";
    addMessage("bot", "Vamos montar um briefing rápido, sem pedir dado sensível. Primeiro: qual serviço você quer contratar?");
    renderQuickActions(["Site premium", "Sistema full stack", "Automação", "IA/Bot", "Aplicativo", "Cyber segurança"]);
}

function handleBriefingAnswer(text) {
    if (briefingStep === 1) {
        briefing.servico = text;
        briefingStep = 2;
        addMessage("bot", "Fechado. Qual resultado você quer alcançar com isso? Pode ser vender mais, automatizar atendimento, organizar dados, lançar um app, proteger um sistema...");
        renderQuickActions(["Vender mais", "Automatizar atendimento", "Organizar dados", "Lançar produto", "Proteger empresa"]);
        return;
    }

    if (briefingStep === 2) {
        briefing.objetivo = text;
        briefingStep = 3;
        addMessage("bot", "Boa. E o prazo ideal? Sem pressão: pode ser urgente, este mês, próximo mês ou sem data definida.");
        renderQuickActions(["Urgente", "Este mês", "Próximo mês", "Sem data definida"]);
        return;
    }

    if (briefingStep === 3) {
        briefing.prazo = text;
        briefingStep = 4;
        addMessage("bot", "Última: você já tem materiais como logo, textos, imagens, prints ou referências?");
        renderQuickActions(["Tenho materiais", "Tenho só a ideia", "Preciso de tudo", "Tenho referências"]);
        return;
    }

    briefing.materiais = text;
    briefingStep = 0;
    lead.interesse = briefing.servico;
    lead.ultimaMensagem = formatBriefing();
    persistLead();
    addMessage("bot", `Perfeito. Seu briefing inicial ficou assim: ${formatBriefing()} Posso abrir o WhatsApp com isso pronto ou você pode usar o formulário de e-mail para enviar o pedido com contexto.`);
    renderQuickActions(["Falar no WhatsApp", "Ver formulário", "Refazer briefing"]);
}

function formatBriefing() {
    return `Serviço: ${briefing.servico}. Objetivo: ${briefing.objetivo}. Prazo: ${briefing.prazo}. Materiais: ${briefing.materiais}.`;
}

function collectLead(normalized, original) {
    lead.ultimaMensagem = original;
    if (has(normalized, ["urgente", "rapido", "rápido", "essa semana"])) lead.prioridade = "urgente";
    if (has(normalized, ["empresa", "negocio", "negócio", "cliente"])) lead.perfil = "empresa";
    persistLead();
}

function safeReadLead() {
    try {
        return JSON.parse(localStorage.getItem("extLead") || "{}");
    } catch {
        return {};
    }
}

function persistLead() {
    try {
        localStorage.setItem("extLead", JSON.stringify(lead));
    } catch {
        return false;
    }
    return true;
}

function normalize(value) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function has(text, terms) {
    return terms.some((term) => text.includes(normalize(term)));
}

function calculate(match) {
    const left = Number(match[1].replace(",", "."));
    const operator = match[2].toLowerCase();
    const right = Number(match[3].replace(",", "."));
    let result;

    if (operator === "+") result = left + right;
    if (operator === "-") result = left - right;
    if (operator === "*" || operator === "x") result = left * right;
    if (operator === "/") result = right === 0 ? "divisão por zero não é permitida" : left / right;

    return `Resultado: ${result}. Também posso ajudar com o briefing do seu projeto.`;
}

function buildWhatsappUrl() {
    const briefing = [
        "Olá, vim pelo site da Express Technology.",
        lead.interesse ? `Interesse: ${lead.interesse}.` : "Quero contratar um serviço digital.",
        lead.prioridade ? `Prioridade: ${lead.prioridade}.` : "",
        lead.ultimaMensagem ? `Última mensagem: ${lead.ultimaMensagem}` : ""
    ].filter(Boolean).join(" ");

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(briefing)}`;
}

function startMotionCanvas(canvasId, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d");
    const particles = Array.from({ length: options.count || 72 }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        vx: (Math.random() - 0.5) * 0.0008,
        vy: (Math.random() - 0.5) * 0.0008,
        size: 1 + Math.random() * 2.4
    }));

    function resize() {
        const ratio = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function frame(time) {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        context.clearRect(0, 0, width, height);
        context.globalCompositeOperation = "lighter";

        const wave = Math.sin(time / 1800) * 18;
        context.strokeStyle = options.beam || "rgba(66, 232, 255, 0.16)";
        context.lineWidth = 1;
        for (let i = 0; i < 9; i += 1) {
            const y = height * (0.18 + i * 0.085) + Math.sin(time / 900 + i) * 16;
            context.beginPath();
            context.moveTo(0, y);
            context.bezierCurveTo(width * 0.28, y + wave, width * 0.64, y - wave, width, y + Math.sin(i + time / 700) * 24);
            context.stroke();
        }

        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            if (particle.x < 0 || particle.x > 1) particle.vx *= -1;
            if (particle.y < 0 || particle.y > 1) particle.vy *= -1;

            const perspective = 0.65 + particle.z * 0.65;
            const x = particle.x * width;
            const y = particle.y * height;
            const radius = particle.size * 7 * perspective;
            const gradient = context.createRadialGradient(x, y, 0, x, y, radius * 4);
            gradient.addColorStop(0, options.color || "rgba(66, 232, 255, 0.72)");
            gradient.addColorStop(1, "rgba(66, 232, 255, 0)");
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();

            for (let next = index + 1; next < particles.length; next += 1) {
                const other = particles[next];
                const ox = other.x * width;
                const oy = other.y * height;
                const distance = Math.hypot(x - ox, y - oy);

                if (distance < 150) {
                    context.strokeStyle = `rgba(100, 240, 191, ${0.2 - distance / 780})`;
                    context.lineWidth = 1;
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(ox, oy);
                    context.stroke();
                }
            }
        });

        requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
}

startMotionCanvas("hero-motion", {
    count: 92,
    color: "rgba(66, 232, 255, 0.72)",
    beam: "rgba(100, 240, 191, 0.13)"
});

startMotionCanvas("ai-motion", {
    count: 72,
    color: "rgba(244, 184, 90, 0.6)",
    beam: "rgba(66, 232, 255, 0.12)"
});
