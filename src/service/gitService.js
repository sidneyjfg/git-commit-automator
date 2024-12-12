const simpleGit = require('simple-git');
const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const git = simpleGit();

// Função para perguntar ao usuário
const askQuestion = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

// Verifica se a pasta é um repositório Git
const isGitRepo = async () => {
    try {
        await git.status();
        return true;
    } catch (error) {
        console.log(chalk.yellow('Este diretório não é um repositório Git.'));

        const response = await askQuestion('Deseja inicializar um repositório Git neste diretório? (sim/não): ');
        if (['sim', 's', 'yes', 'y'].includes(response.toLowerCase())) {
            try {
                await git.init();
                console.log(chalk.green('Repositório Git inicializado com sucesso!'));
                return true;
            } catch (initError) {
                console.error(chalk.red('Erro ao inicializar o repositório Git:', initError.message));
                return false;
            }
        } else {
            console.log(chalk.red('Operação abortada. Por favor, inicialize um repositório Git para continuar.'));
            return false;
        }
    }
};

// Verifica se há um repositório remoto configurado
const checkRemote = async () => {
    try {
        const remotes = await git.getRemotes(true);
        if (remotes.length === 0) {
            console.log(chalk.yellow('Nenhum repositório remoto foi encontrado.'));
            return false;
        }
        console.log(chalk.green(`Repositório remoto encontrado: ${remotes[0].refs.fetch}`));
        return true;
    } catch (error) {
        console.error(chalk.red('Erro ao verificar o repositório remoto:', error.message));
        throw error;
    }
};

// Configura um repositório remoto
const configureRemote = async () => {
    try {
        const url = await askQuestion('Insira a URL do repositório remoto: ');
        await git.addRemote('origin', url);
        console.log(chalk.green(`Repositório remoto configurado para: ${url}`));
    } catch (error) {
        console.error(chalk.red('Erro ao configurar o repositório remoto:', error.message));
        throw error;
    }
};

// Obtém as alterações no repositório
const getChanges = async () => {
    try {
        const status = await git.status();
        if (status.files.length === 0) {
            console.log(chalk.green('Nenhuma alteração encontrada para commit.'));
            return null;
        }

        const changes = status.files.map((file) => `${file.path} (${file.working_dir})`).join('\n');
        return changes;
    } catch (error) {
        console.error(chalk.red('Erro ao obter alterações do repositório:', error.message));
        throw error;
    }
};

// Commit e push das alterações
const commitAndPush = async (message) => {
    try {
        await createGitignore(); // Verifica ou cria o .gitignore antes do git add
        await git.add('.');
        await git.commit(message);
        await git.push();
        console.log(chalk.green('Alterações commitadas e enviadas com sucesso!'));
    } catch (error) {
        if (error.message.includes('Permission denied')) {
            console.error(chalk.red('Erro ao enviar: Permissão negada. Verifique sua chave SSH ou método de autenticação.'));
        } else {
            console.error(chalk.red('Erro ao realizar commit ou enviar alterações:', error.message));
        }
        throw error;
    }
};

// Cria um .gitignore caso não exista e permite adicionar arquivos
const createGitignore = async () => {
    try {
        const gitignorePath = path.join(process.cwd(), '.gitignore');

        // Verifica se o arquivo .gitignore já existe
        if (!fs.existsSync(gitignorePath)) {
            fs.writeFileSync(gitignorePath, '');
            console.log(chalk.green('.gitignore criado com sucesso!'));
        }

        // Lista os arquivos e pastas no diretório atual
        const files = fs.readdirSync(process.cwd());

        console.log(chalk.yellow('Arquivos e pastas no diretório atual:'));
        files.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });

        const response = await askQuestion(
            'Digite os números dos arquivos/pastas que deseja adicionar ao .gitignore, separados por vírgula (ou digite ("pular" ou "0") para ignorar):'
        );

        if (response.toLowerCase() === 'pular' || response.toLowerCase() === 'skip' || response.toLowerCase() === '0') {
            console.log(chalk.blue('Configuração do .gitignore pulada.'));
            return;
        }

        const indices = response.split(',').map((num) => parseInt(num.trim(), 10) - 1);

        const entriesToIgnore = indices.map((index) => files[index]).filter((entry) => entry !== undefined);

        // Adiciona as entradas ao .gitignore
        if (entriesToIgnore.length > 0) {
            fs.appendFileSync(gitignorePath, `\n${entriesToIgnore.join('\n')}`);
            console.log(chalk.green('Entradas adicionadas ao .gitignore com sucesso!'));
        } else {
            console.log(chalk.yellow('Nenhuma entrada válida selecionada para o .gitignore.'));
        }
    } catch (error) {
        console.error(chalk.red('Erro ao criar ou modificar o .gitignore:', error.message));
        throw error;
    }
};


// Exporta as funções do serviço
module.exports = { isGitRepo, checkRemote, configureRemote, getChanges, commitAndPush, createGitignore };
