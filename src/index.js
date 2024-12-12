const { getChanges, commitAndPush, checkRemote, configureRemote, isGitRepo, createGitignore } = require("./service/gitService");
const { generateCommitMessage } = require("./service/gptService");
const chalk = require("chalk");

const main = async () => {
  console.log(chalk.blue("Starting Git Commit Automator..."));

  try {
    const isRepo = await isGitRepo();
    if (!isRepo) {
      console.log(chalk.red("Operação abortada. Certifique-se de que o repositório foi configurado corretamente."));
      return;
    }

    const hasRemote = await checkRemote();
    if (!hasRemote) {
      const response = await new Promise((resolve) => {
        const readline = require("readline").createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        readline.question("Nenhum repositório remoto encontrado. Deseja configurar um agora? (sim/não): ", (answer) => {
          readline.close();
          resolve(answer.toLowerCase());
        });
      });

      if (response === "sim" || response === "s" || response === "y" || response === "yes") {
        await configureRemote();
      } else {
        console.log(chalk.red("Operação abortada. Configure um repositório remoto para continuar."));
        return;
      }
    }

    // Verifica se há alterações pendentes para adicionar
    const changes = await getChanges();
    if (!changes) {
      console.log(chalk.green("Nenhuma alteração encontrada. Saindo do programa."));
      return;
    }

    console.log(chalk.yellow("Alterações detectadas:"), changes);

    // Verifica se o .gitignore precisa ser configurado
    await createGitignore();

    // Gera mensagem de commit usando IA
    const commitMessage = await generateCommitMessage(changes);
    console.log(chalk.blue("Mensagem de commit gerada:"), commitMessage);

    // Realiza o commit e o push
    await commitAndPush(commitMessage);
  } catch (error) {
    // Verifica o tipo de erro e sugere solução
    if (error.message.includes("upstream branch")) {
      console.error(chalk.red("Erro: A branch atual não possui um upstream configurado."));
      console.log(chalk.yellow("Sugestão: Execute o comando abaixo para configurar o upstream e tente novamente:"));
      console.log(chalk.cyan("git push --set-upstream origin <branch-atual>"));
    } else {
      console.error(chalk.red("Falha na automação:", error.message));
    }
  }
};

main();
