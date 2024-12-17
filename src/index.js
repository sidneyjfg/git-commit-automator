#!/usr/bin/env node

const { getChanges, commitAndPush, checkRemote, configureRemote, isGitRepo, createGitignore } = require("./service/gitService");
const { generateCommitMessage } = require("./service/gptService");
const chalk = require("chalk");
const simpleGit = require("simple-git");

const git = simpleGit();

const main = async () => {
  console.log(chalk.blue("🌟 Starting Git Commit Automator..."));

  try {
    const args = process.argv.slice(2);
    const branchArg = args.find(arg => arg.startsWith('--branch=')) || '--branch=master';
    const branchName = branchArg.split('=')[1];

    // Verifica se o diretório atual é um repositório Git
    const isRepo = await isGitRepo();
    if (!isRepo) {
      console.log(chalk.red("Operação abortada. Certifique-se de que o repositório foi configurado corretamente."));
      return;
    }

    // Verifica a branch atual
    const localBranches = await git.branchLocal();
    if (!localBranches.all.includes(branchName)) {
      console.log(chalk.yellow(`A branch "${branchName}" não existe.`));
      const response = await askQuestion(`Deseja criar a branch "${branchName}"? (sim/não): `);
      if (['sim', 's', 'yes', 'y'].includes(response.toLowerCase())) {
        await git.checkoutLocalBranch(branchName);
        console.log(chalk.green(`Branch "${branchName}" criada e configurada com sucesso.`));
      } else {
        console.log(chalk.red("Operação abortada. Por favor, crie a branch para continuar."));
        return;
      }
    } else {
      await git.checkout(branchName);
      console.log(chalk.green(`Branch "${branchName}" selecionada.`));
    }

    // Verifica se há um repositório remoto configurado
    const hasRemote = await checkRemote();
    if (!hasRemote) {
      const response = await askQuestion("Nenhum repositório remoto encontrado. Deseja configurar um agora? (sim/não): ");
      if (response === "sim" || response === "s" || response === "y" || response === "yes") {
        await configureRemote();
      } else {
        console.log(chalk.red("Operação abortada. Configure um repositório remoto para continuar."));
        return;
      }
    }

    const changes = await getChanges();
    if (!changes) {
      console.log(chalk.green("Nenhuma alteração encontrada. Saindo do programa."));
      return;
    }

    console.log(chalk.yellow("✏️ Alterações detectadas:\n"), changes);

    await createGitignore();

    console.log(chalk.yellow("Aguarde, estamos criando a mensagem de commit..."));
    const commitMessage = await generateCommitMessage(changes);
    console.log(chalk.blue("✅ Mensagem de commit gerada:\n"), commitMessage);

    await commitAndPush(commitMessage);
  } catch (error) {
    console.error(chalk.red("Falha na automação:", error.message));
  }
};

// Função para perguntar ao usuário (usada para decisões interativas)
const askQuestion = (query) => {
  return new Promise((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

main();
