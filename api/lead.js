const DESTINATION_EMAIL = "sac@storeexpressshop.com";

export default {
    async fetch(request) {
        if (request.method !== "POST") return json({ error: "Método não permitido" }, 405);

        try {
            const lead = validateLead(await request.json());
            if (lead.error) return json({ error: lead.error }, 400);

            const emailResult = await sendEmail(lead);
            if (!emailResult.ok) return json({ error: emailResult.error }, 502);

            const stored = await storeLead(lead);
            return json({ ok: true, stored });
        } catch (error) {
            console.error("Lead function error", error);
            return json({ error: "Não foi possível enviar a solicitação" }, 500);
        }
    }
};

function validateLead(input) {
    const lead = {
        name: clean(input?.name, 100),
        phone: clean(input?.phone, 40),
        subject: clean(input?.subject, 120),
        message: clean(input?.message, 2500),
        source: clean(input?.source || "site", 80)
    };
    if (!lead.name || !lead.phone || !lead.subject || !lead.message) return { error: "Preencha todos os campos obrigatórios" };
    if (lead.name.length < 2) return { error: "Informe um nome válido" };
    if (!/^[+()\d\s-]{8,40}$/.test(lead.phone)) return { error: "Informe um telefone válido" };
    return lead;
}

function clean(value, maxLength) {
    return typeof value === "string" ? value.trim().replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, maxLength) : "";
}

async function sendEmail(lead) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) return { ok: false, error: "Envio de e-mail ainda não configurado" };

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
            from,
            to: [DESTINATION_EMAIL],
            subject: `Nova solicitação: ${lead.subject}`,
            text: [
                "Nova solicitação recebida pelo site da Express Technology.",
                "",
                `Nome: ${lead.name}`,
                `Telefone: ${lead.phone}`,
                `Tipo de demanda: ${lead.subject}`,
                `Origem: ${lead.source}`,
                "",
                "Contexto:",
                lead.message
            ].join("\n")
        })
    });

    if (response.ok) return { ok: true };
    const detail = await response.text();
    console.error("Resend error", response.status, detail.slice(0, 300));
    return { ok: false, error: "O serviço de e-mail não respondeu" };
}

async function storeLead(lead) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return false;

    try {
        const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/leads`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                name: lead.name,
                phone: lead.phone,
                subject: lead.subject,
                message: lead.message,
                source: lead.source,
                status: "novo"
            })
        });
        if (!response.ok) console.error("Supabase error", response.status, (await response.text()).slice(0, 300));
        return response.ok;
    } catch (error) {
        console.error("Supabase request error", error);
        return false;
    }
}

function json(body, status = 200) {
    return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
