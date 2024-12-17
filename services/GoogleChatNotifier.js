const fetch = require("node-fetch");

class GoogleChatNotifier {
  constructor() {
    this.webhookURL = process.env.GOOGLE_CHAT_WEBHOOK_URL;
    if (!this.webhookURL) {
      throw new Error("A URL do webhook do Google Chat não está configurada no .env");
    }
  }

  async enviarMultiplosCardsComHeader(tituloPrincipal, subtituloPrincipal, cards) {
    try {
      // Cria um payload com header e múltiplos cards
      const payload = {
        cards: [
          {
            header: {
              title: tituloPrincipal,
              subtitle: subtituloPrincipal,
            },
          },
          ...cards, // Adiciona os cards individuais
        ],
      };

      const response = await fetch(this.webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Erro ao enviar: ${response.statusText}`);

      console.log("✅ Notificação com múltiplos cards enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar notificação:", error.message);
    }
  }
}

module.exports = new GoogleChatNotifier();
