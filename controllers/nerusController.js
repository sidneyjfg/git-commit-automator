const nerusService = require("../services/nerusService");

class NerusController {
  async iniciarLogin() {
    console.log("Acessando o webdesktop");
    // Dados do login (você pode usar variáveis de ambiente para segurança)
    const url = "https://webdesktop.nerus.com.br/php/desktop/index.php";
    const login = "sjunio"; // Substitua pelo usuário
    const senha = "n3ru$@25"; // Substitua pela senha

    // Chama o serviço para acessar o site e logar
    await nerusService.acessarSiteELogar({ url, login, senha });
  }
}

module.exports = new NerusController();
