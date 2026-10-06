const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const proposalForm = document.getElementById("budget-form");
const formStatus = document.getElementById("form-status");
const chat = document.getElementById("chat");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const closeChat = document.getElementById("close-chat");
const quickActions = document.getElementById("quick-actions");
const openChatButtons = document.querySelectorAll("[data-open-chat]");
const tooltip = document.getElementById("ext-tooltip");
const companyEmail = "sac@storeexpressshop.com";
const whatsappNumber = "5593981137014";

let speechTimer;
let chatStarted = false;
let chatBusy = false;
const conversation = [];

setupNavigation();
setupReveal();
setupExtTips();
setupSubjectLinks();
setupProposalForm();
setupChat();
setupCanvas("hero-motion");
setupParallax();

function setupNavigation() {
    menuToggle?.addEventListener("click", () => {
        const isOpen = header.classList.toggle("nav-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
        document.body.classList.toggle("menu-open", isOpen);
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));

    window.addEventListener("pointermove", (event) => {
        document.body.style.setProperty("--mx", `${event.clientX}px`);
        document.body.style.setProperty("--my", `${event.clientY}px`);
    }, { passive: true });

    window.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        closeMenu();
        closeExtChat();
    });
}

function closeMenu() {
    header.classList.remove("nav-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-open");
}

function setupReveal() {
    if (!("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px" });

    revealItems.forEach((item) => observer.observe(item));
}

function setupExtTips() {
    if (window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll("[data-ext-tip]").forEach((element) => {
        const show = () => showExtSpeech(element.dataset.extTip);
        element.addEventListener("pointerenter", show);
        element.addEventListener("focus", show);
        element.addEventListener("pointerleave", queueExtSpeechHide);
        element.addEventListener("blur", queueExtSpeechHide);
    });
}

function showExtSpeech(text) {
    if (!tooltip || !text || chat.classList.contains("is-open")) return;
    window.clearTimeout(speechTimer);
    tooltip.textContent = text;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
}

function queueExtSpeechHide() {
    window.clearTimeout(speechTimer);
    speechTimer = window.setTimeout(hideExtSpeech, 1500);
}

function hideExtSpeech() {
    tooltip?.classList.remove("is-visible");
    tooltip?.setAttribute("aria-hidden", "true");
}

function setupSubjectLinks() {
    document.querySelectorAll("[data-select-subject]").forEach((link) => {
        link.addEventListener("click", () => {
            const select = document.getElementById("lead-subject");
            if (select) select.value = link.dataset.selectSubject;
        });
    });
}

function setupProposalForm() {
    proposalForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = proposalForm.querySelector("button[type='submit']");
        const payload = {
            name: document.getElementById("lead-name").value.trim(),
            phone: document.getElementById("lead-phone").value.trim(),
            subject: document.getElementById("lead-subject").value.trim(),
            message: document.getElementById("lead-message").value.trim(),
            source: "site-express-technology"
        };

        if (!payload.name || !payload.phone || !payload.subject || !payload.message) return;
        setFormState("Enviando sua solicitação com segurança...", false);
        submitButton.disabled = true;

        try {
            const response = await fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || "Não foi possível enviar");

            setFormState("Solicitação enviada. Nossa equipe entrará em contato.", false);
            proposalForm.reset();
            showExtSpeech("Recebido. A equipe comercial já tem o contexto inicial da sua solicitação.");
        } catch (error) {
            setFormState("O envio automático ainda não está configurado. Abrimos uma alternativa por e-mail.", true);
            window.location.href = buildMailto(payload);
        } finally {
            submitButton.disabled = false;
        }
    });
}

function setFormState(message, isError) {
    formStatus.textContent = message;
    formStatus.classList.toggle("is-error", isError);
}

function buildMailto(payload) {
    const subject = encodeURIComponent(`Solicitação comercial: ${payload.subject}`);
    const body = encodeURIComponent([
        "Olá, equipe da Express Technology.",
        "",
        `Nome: ${payload.name}`,
        `Telefone: ${payload.phone}`,
        `Tipo de demanda: ${payload.subject}`,
        "",
        payload.message
    ].join("\n"));
    return `mailto:${companyEmail}?subject=${subject}&body=${body}`;
}

function setupChat() {
    openChatButtons.forEach((button) => button.addEventListener("click", openExtChat));
    closeChat?.addEventListener("click", closeExtChat);
    chatForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const text = chatInput.value.trim();
        if (!text || chatBusy) return;
        chatInput.value = "";
        addMessage("user", text);
        conversation.push({ role: "user", content: text });
        await answerWithExt(text);
    });
}

function openExtChat() {
    hideExtSpeech();
    chat.classList.add("is-open");
    chat.setAttribute("aria-hidden", "false");
    document.body.classList.add("chat-open");
    chatInput.focus();

    if (!chatStarted) {
        chatStarted = true;
        const welcome = "Olá, eu sou o EXT. Posso explicar nossas soluções, ajudar com uma demanda de edital ou organizar um briefing para proposta. O que você precisa resolver?";
        addMessage("bot", welcome);
        conversation.push({ role: "assistant", content: welcome });
        renderQuickActions(["Solicitar proposta", "Edital ou licitação", "Criar um sistema", "Automação e IA"]);
    }
}

function closeExtChat() {
    chat.classList.remove("is-open");
    chat.setAttribute("aria-hidden", "true");
    document.body.classList.remove("chat-open");
}

async function answerWithExt(text) {
    setChatBusy(true);
    const thinking = addThinkingMessage();

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: conversation.slice(-10) })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.reply) throw new Error(data.error || "IA indisponível");
        thinking.remove();
        addMessage("bot", data.reply);
        conversation.push({ role: "assistant", content: data.reply });
        renderQuickActions(data.actions || ["Solicitar proposta", "Falar no WhatsApp", "Ver soluções"]);
    } catch {
        thinking.remove();
        const fallback = localExtAnswer(text);
        addMessage("bot", fallback.reply);
        conversation.push({ role: "assistant", content: fallback.reply });
        renderQuickActions(fallback.actions);
    } finally {
        setChatBusy(false);
    }
}

function localExtAnswer(text) {
    const normalized = normalize(text);
    if (has(normalized, ["equipe", "alex", "marlon", "marx", "quem sao voces", "quem são vocês", "diretor", "ceo", "cto"])) {
        return { reply: "Nossa liderança combina estratégia, tecnologia e experiência do usuário. Alex Almeida é CEO Executivo e fundador; Marx Vinicius atua como CTO e Diretor de Tecnologia; e Marlon Amorim é psicólogo e Diretor de Relacionamento, Requisitos e UX.", actions: ["Ver equipe", "Solicitar proposta", "Falar no WhatsApp"] };
    }
    if (has(normalized, ["portfolio", "portfólio", "projeto", "domus", "dormus", "macena", "eletric", "agroapp", "clickservices"])) {
        return { reply: "Nosso portfólio reúne sites publicados para DomusVet, Macena Engenharia e Eletric Serviços Engenharia, além dos projetos AgroAPP e ClickServices. Você pode abrir cada entrega diretamente na seção de projetos.", actions: ["Ver projetos", "Solicitar proposta", "Falar no WhatsApp"] };
    }
    if (has(normalized, ["edital", "licitacao", "licitação", "pregao", "pregão", "termo de referencia", "termo de referência"])) {
        return { reply: "Podemos avaliar o objeto, os requisitos técnicos, o prazo e a compatibilidade com nossa capacidade. Envie apenas um resumo inicial pelo formulário; documentos completos podem ser tratados depois pelo canal comercial.", actions: ["Abrir formulário", "Falar no WhatsApp", "Conhecer soluções"] };
    }
    if (has(normalized, ["proposta", "orcamento", "orçamento", "contratar", "preco", "preço", "valor"])) {
        return { reply: "Para preparar uma proposta coerente, precisamos do tipo de solução, objetivo, prazo desejado e principais funcionalidades. Posso levar você ao formulário ou abrir o WhatsApp comercial.", actions: ["Abrir formulário", "Falar no WhatsApp", "Ver projetos"] };
    }
    if (has(normalized, ["sistema", "software", "painel", "portal", "app", "aplicativo"])) {
        return { reply: "Ótimo ponto de partida. Mapeamos usuários, processos, dados, integrações e critérios de sucesso antes de definir a arquitetura. Assim a proposta nasce com escopo e fases mais claros.", actions: ["Solicitar proposta", "Ver soluções", "Falar no WhatsApp"] };
    }
    if (has(normalized, ["ia", "inteligencia", "inteligência", "bot", "automacao", "automação"])) {
        return { reply: "IA e automação funcionam melhor quando começam por um processo concreto. Podemos atuar em atendimento, triagem, busca, relatórios, cadastros ou integração entre ferramentas.", actions: ["Mapear automação", "Solicitar proposta", "Falar no WhatsApp"] };
    }
    if (has(normalized, ["seguranca", "segurança", "cyber", "vulnerabilidade", "proteger"])) {
        return { reply: "Em cibersegurança, a avaliação inicial considera acessos, autenticação, dados, backups, integrações e exposição pública. Depois disso, definimos prioridades e um plano compatível com a operação.", actions: ["Solicitar avaliação", "Ver serviços", "Falar no WhatsApp"] };
    }
    if (has(normalized, ["help desk", "suporte", "chamado", "computador", "acesso", "usuario", "usuário"])) {
        return { reply: "Nosso Help Desk apoia usuários em acessos, equipamentos, sistemas e incidentes do dia a dia. Conte quantas pessoas precisam de suporte e se o atendimento será remoto, presencial ou híbrido.", actions: ["Solicitar proposta", "Falar no WhatsApp", "Ver serviços"] };
    }
    if (has(normalized, ["tecnologia", "stack", "postgres", "postgresql", "node", "vue", "react", "tailwind", "bootstrap", "banco de dados"])) {
        return { reply: "Trabalhamos com front-end, back-end, APIs, bancos relacionais e serviços em nuvem. A stack é escolhida conforme segurança, integrações, volume e facilidade de manutenção, não apenas pela tendência do momento.", actions: ["Ver tecnologias", "Solicitar proposta", "Falar no WhatsApp"] };
    }
    if (has(normalized, ["whatsapp", "atendente", "humano", "falar com alguem", "falar com alguém"])) {
        window.open(buildWhatsappUrl(text), "_blank", "noreferrer");
        return { reply: "Abri o WhatsApp comercial com uma mensagem inicial. A equipe continua o atendimento por lá.", actions: ["Ver soluções", "Abrir formulário"] };
    }
    if (has(normalized, ["formulario", "formulário", "abrir formulario", "abrir formulário", "solicitar proposta", "mapear automacao", "mapear automação", "solicitar avaliacao", "solicitar avaliação"])) {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
        closeExtChat();
        return { reply: "Levei você ao formulário comercial. Preencha apenas contato e contexto da demanda; não envie dados sensíveis.", actions: [] };
    }
    return { reply: "Posso ajudar a transformar essa necessidade em um escopo inicial. Conte qual resultado sua organização precisa alcançar, quem usará a solução e se existe algum prazo importante.", actions: ["Solicitar proposta", "Edital ou licitação", "Ver soluções", "Falar no WhatsApp"] };
}

function renderQuickActions(actions) {
    quickActions.innerHTML = "";
    actions.forEach((label) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.addEventListener("click", async () => {
            if (label === "Ver soluções" || label === "Conhecer soluções" || label === "Ver serviços") {
                document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth" });
                closeExtChat();
                return;
            }
            if (label === "Ver tecnologias") {
                document.getElementById("technologies")?.scrollIntoView({ behavior: "smooth" });
                closeExtChat();
                return;
            }
            if (label === "Ver projetos") {
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                closeExtChat();
                return;
            }
            if (label === "Ver equipe") {
                document.getElementById("team")?.scrollIntoView({ behavior: "smooth" });
                closeExtChat();
                return;
            }
            if (label === "Falar no WhatsApp") {
                window.open(buildWhatsappUrl(conversation.at(-1)?.content || "Quero falar com a equipe"), "_blank", "noreferrer");
                return;
            }
            addMessage("user", label);
            conversation.push({ role: "user", content: label });
            await answerWithExt(label);
        });
        quickActions.appendChild(button);
    });
}

function addMessage(type, text) {
    const message = document.createElement("div");
    message.className = `message ${type}`;
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
}

function addThinkingMessage() {
    const message = document.createElement("div");
    message.className = "message bot thinking";
    message.setAttribute("aria-label", "EXT está preparando uma resposta");
    message.innerHTML = "<span></span><span></span><span></span>";
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
}

function setChatBusy(busy) {
    chatBusy = busy;
    chatInput.disabled = busy;
    chatForm.querySelector("button").disabled = busy;
}

function buildWhatsappUrl(context) {
    const message = encodeURIComponent(`Olá, vim pelo site da Express Technology. Gostaria de atendimento comercial.\n\nContexto: ${context}`);
    return `https://wa.me/${whatsappNumber}?text=${message}`;
}

function normalize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function has(text, terms) {
    return terms.some((term) => text.includes(normalize(term)));
}

function setupCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let particles = [];
    let frame;

    const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        particles = Array.from({ length: Math.min(48, Math.floor(width / 24)) }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.16,
            vy: (Math.random() - 0.5) * 0.16,
            r: Math.random() * 1.4 + 0.35
        }));
    };

    const draw = () => {
        context.clearRect(0, 0, width, height);
        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            if (particle.x < 0 || particle.x > width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > height) particle.vy *= -1;
            context.beginPath();
            context.fillStyle = "rgba(108,229,177,.42)";
            context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
            context.fill();
            for (let target = index + 1; target < particles.length; target += 1) {
                const other = particles[target];
                const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
                if (distance > 105) continue;
                context.beginPath();
                context.strokeStyle = `rgba(92,201,220,${(1 - distance / 105) * 0.11})`;
                context.moveTo(particle.x, particle.y);
                context.lineTo(other.x, other.y);
                context.stroke();
            }
        });
        frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) window.cancelAnimationFrame(frame);
        else draw();
    });
}

function setupParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const procurement = document.querySelector(".procurement");
    let ticking = false;

    const update = () => {
        const scroll = window.scrollY;
        const heroProgress = Math.min(scroll, 950);
        document.documentElement.style.setProperty("--hero-media-y", `${heroProgress * 0.065}px`);
        document.documentElement.style.setProperty("--hero-canvas-y", `${heroProgress * 0.03}px`);
        document.documentElement.style.setProperty("--hero-content-y", `${heroProgress * 0.035}px`);

        if (procurement) {
            const rect = procurement.getBoundingClientRect();
            const offset = Math.max(-70, Math.min(70, (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) * 0.09));
            document.documentElement.style.setProperty("--procurement-y", `${offset}px`);
        }
        ticking = false;
    };

    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
}
