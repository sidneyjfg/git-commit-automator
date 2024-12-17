require("dotenv").config(); // Carrega as variáveis do .env no início da aplicação

const NerusController = require("./controllers/nerusController");

// Início da aplicação
(async () => {
  console.log("Iniciando o programa...");
  await NerusController.iniciarLogin();
})();
