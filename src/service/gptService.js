const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require('../utils/envLoader'); // Carrega variáveis de ambiente
const chalk = require("chalk");

// Configure o Google Generative AI
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY); // Use sua chave de API do Gemini

const generateCommitMessage = async (changes) => {
  try {
    // Configuração do modelo
    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a concise, one-line commit message in Portuguese that uses professional commit prefixes like "Fix", "Refactor", "Style", or others, followed by a clear explanation of what was changed and why, ensuring the message is easily understandable for developers reviewing the commit:\n${changes}`;

    // Gera o conteúdo com base no prompt
    console.log(chalk.yellow("Aguarde... estamos criando a mensagem de commit."));
    
    const result = await model.generateContent(prompt);
    
    console.log(chalk.green("Mensagem gerada com sucesso: ",result.response?.text()));
    if (result?.response?.text()) {
      return result.response.text().trim(); // Retorna o texto gerado, removendo espaços extras
    } else {
      throw new Error('A resposta do Gemini não contém uma mensagem válida.');
    }
  } catch (error) {
    console.error('Erro ao gerar a mensagem de commit:', error.message);
    throw error;
  }
};

module.exports = { generateCommitMessage };
