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

    const changes = await getChanges();
    if (!changes) {
      console.log(chalk.green("Nenhuma alteração encontrada. Saindo do programa."));
      return;
    }

    console.log(chalk.yellow("Alterações detectadas:\n"), changes);

    await createGitignore();

    const commitMessage = await generateCommitMessage(changes);
    console.log(chalk.blue("Mensagem de commit gerada:\n"), commitMessage);

    await commitAndPush(commitMessage);
  } catch (error) {
    console.error(chalk.red("Falha na automação:", error.message));
  }
};

main();
