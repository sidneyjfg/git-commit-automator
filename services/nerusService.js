const puppeteer = require("puppeteer");
let listaTicketsAnterior = [];
const notifier = require("./GoogleChatNotifier");


class NerusService {

  async acessarSiteELogar({ url, login, senha }) {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      console.log("Acessando URL...");
      await page.goto(url, { waitUntil: "networkidle2" });

      await this.esperarTempo(3000); // Tempo inicial para carregar tudo

      console.log("Verificando frames disponíveis...");
      let frame = this.listarFrames(page);

      // Localiza o frame 'principal'
      frame = this.localizarFrame(page, "principal", "login");
      console.log("Frame 'principal' encontrado, preenchendo o formulário...");
      await this.preencherFormularioLogin(frame, login, senha);

      // Aguarda carregamento pós-login
      await this.esperarTempo(2000);

      // Acessa o WebCRM
      console.log("Acessando WebCRM...");
      await this.acessarWebCRM(frame);

      await this.esperarTempo(2000);

      // Acessa Central de Atendimento e reavalia os frames
      console.log("Acessando Central de Atendimento...");
      await this.acessarCentralDeAtendimento(frame, page);

      console.log("Reavaliando frames após acessar a Central de Atendimento...");
      frame = this.localizarFrame(page, "principal", "atendimento");

      await this.retiraEmpno(frame);
      console.log("Empno retirado.");
      await this.esperarTempo(2000);

      console.log("Frame de tickets localizado, iniciando verificação...");
      await this.verificarTickets(frame);

      await browser.close();
      console.log("Processo concluído.");
    } catch (error) {
      console.error("Erro ao acessar o site e logar:", error);
    }
  }

  // Função para listar os frames
  listarFrames(page) {
    const frames = page.frames();
    frames.forEach(f => console.log(`Frame: ${f.name()} | URL: ${f.url()}`));
    return frames;
  }

  // Localiza o frame pelo nome ou por parte da URL
  localizarFrame(page, name, urlFragment) {
    const frame = page.frames().find(f => f.name() === name || f.url().includes(urlFragment));
    if (!frame) throw new Error(`Frame '${name}' não encontrado!`);
    return frame;
  }

  // Preenche os campos de login e senha
  async preencherFormularioLogin(frame, login, senha) {
    await frame.waitForSelector("input[name='nome']", { timeout: 10000 });
    await frame.type("input[name='nome']", login);

    await frame.waitForSelector("input[name='password']", { timeout: 10000 });
    await frame.type("input[name='password']", senha);

    await frame.waitForSelector("input[type='submit']", { timeout: 10000 });
    await frame.click("input[type='submit']");
    console.log("Login realizado com sucesso!");
  }

  // Acessa o WebCRM
  async acessarWebCRM(frame) {
    const webCRMSelector = "a[href='desktopDirect.php?modulo=2']";
    await frame.waitForSelector(webCRMSelector, { visible: true, timeout: 10000 });
    await frame.click(webCRMSelector);
    console.log("WebCRM acessado com sucesso!");
  }

  // Acessa a Central de Atendimento e reavalia o frame
  async acessarCentralDeAtendimento(frame, page) {
    const centralAtendimentoSelector = "a.buttonPrincipal";

    await frame.waitForSelector(centralAtendimentoSelector, { visible: true, timeout: 15000 });
    await frame.click(centralAtendimentoSelector);
    console.log("Central de Atendimento acessada!");

    await this.esperarTempo(3000); // Espera carregamento do conteúdo no frame
  }

  // Verifica tickets periodicamente
  async verificarTickets(frame) {
    let totalTicketsAnterior = await this.contarTickets(frame);

    while (true) {
      console.log("Atualizando lista de tickets...");
      await this.clicarBuscar(frame);
      await this.esperarTempo(3000);

      const totalTicketsAtual = await this.contarTickets(frame);

      if (totalTicketsAtual > totalTicketsAnterior) {
        console.log(`🚨 Novo ticket detectado! Total de tickets: ${totalTicketsAtual}`);
        totalTicketsAnterior = totalTicketsAtual;
      } else {
        console.log("Nenhum novo ticket encontrado.");
      }

      await this.esperarTempo(10000);
    }
  }

  async retiraEmpno(frame) {
    // Limpar o campo empno
    await frame.waitForSelector("input[name='search[empno]']", { timeout: 10000 });
    await frame.$eval("input[name='search[empno]']", input => input.value = "");
    console.log("Empno retirado. Campo 'empno' limpo.");

    // Forçar a atualização da lista de tickets
    await this.clicarBuscar(frame);
    console.log("Botão 'Buscar' clicado para recarregar a lista de tickets.");

    // Aguarda o carregamento da nova lista
    await this.esperarTempo(3000);
    console.log("Lista de tickets atualizada.");
  }



  // Clica no botão "Buscar"
  async clicarBuscar(frame) {
    const buscarSelector = "button[onclick*='formSearch']";
    await frame.waitForSelector(buscarSelector, { visible: true });
    await frame.click(buscarSelector);
    console.log("Botão 'Buscar' clicado.");
  }

  // Conta os tickets válidos na tabela e exibe os detalhes
  async contarTickets(frame) {
    try {
      console.log("🔍 Verificando tickets na tabela...");

      const tickets = await frame.$$eval("table.list-table tbody tr", rows => {
        const nomesPermitidos = ["EVERSON", "SIDNEY", "LUIS"];

        return rows
          .filter(row => row.querySelector("td"))
          .map(row => {
            const cells = row.querySelectorAll("td");
            return {
              numeroTicket: cells[0]?.innerText.trim() || "Sem número",
              cliente: cells[1]?.innerText.trim() || "Sem cliente",
              solicitacao: cells[6]?.innerText.trim() || "Sem solicitação",
              bv: cells[10]?.innerText.trim() || "Sem BV",
              dataCriacao: cells[14]?.innerText.trim() || "Sem data",
              responsavel: cells[7]?.innerText.trim() || "Desconhecido"
            };
          })
          .filter(ticket =>
            ticket.numeroTicket !== "Sem número" &&
            ticket.responsavel &&
            nomesPermitidos.includes(ticket.responsavel.toUpperCase())
          );
      });

      // Ordena os tickets pelo número para garantir consistência
      const ticketsOrdenados = tickets.sort((a, b) => a.numeroTicket - b.numeroTicket);
      console.log(`🔹 Tickets encontrados com responsáveis EVERSON, SIDNEY ou LUIS: ${ticketsOrdenados.length}`);

      // Filtra apenas tickets novos (não presentes na lista anterior)
      const novosTickets = ticketsOrdenados.filter(
        ticket => !listaTicketsAnterior.some(t => t.numeroTicket === ticket.numeroTicket)
      );

      if (novosTickets.length > 0) {
        console.log("🚨 Novos tickets detectados:");

        const cards = novosTickets.map(t => ({
          header: {
            title: `🚨 Ticket #${t.numeroTicket}`,
            subtitle: `Responsável: ${t.responsavel || "Não informado"}`, // Valor padrão
          },
          sections: [
            {
              widgets: [
                {
                  textParagraph: {
                    text: t.solicitacao?.trim() || "Solicitação não informada",
                  },
                },
                {
                  keyValue: {
                    topLabel: "Cliente",
                    content: t.cliente?.trim() || "Cliente não informado",
                  },
                },
                {
                  keyValue: {
                    topLabel: "BV",
                    content: t.bv?.trim() || "0", // Define padrão numérico
                  },
                },
                {
                  keyValue: {
                    topLabel: "Data de Criação",
                    content: t.dataCriacao?.trim() || "Data não informada",
                  },
                },
              ],
            },
          ],
        }));
        
        const tituloPrincipal = "🚨 Alerta: Novos Tickets Detectados!";
        const subtituloPrincipal = `Foram encontrados ${novosTickets.length} novos tickets.`;

        try {
          await notifier.enviarMultiplosCardsComHeader(tituloPrincipal, subtituloPrincipal, cards);
          console.log("✅ Notificação enviada com sucesso!");
        } catch (error) {
          console.error("❌ Erro ao enviar notificação para o webhook:", error.message);
        }

        novosTickets.forEach(t =>
          console.log(
            `Ticket: ${t.numeroTicket}, Cliente: ${t.cliente}, Solicitação: ${t.solicitacao}, BV: ${t.bv}, Responsável: ${t.responsavel}, Data Criação: ${t.dataCriacao}`
          )
        );
      } else {
        console.log("✅ Nenhum novo ticket detectado.");
      }

      // Atualiza a lista anterior com a lista atual ordenada
      listaTicketsAnterior = ticketsOrdenados;

    } catch (error) {
      console.error("❌ Erro ao contar os tickets:", error.message);
      throw new Error("Erro ao contar os tickets: " + error.message);
    }
  }



  // Função auxiliar para pausar a execução
  async esperarTempo(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new NerusService();
