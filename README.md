# Git Commit Automator

O **Git Commit Automator** é uma ferramenta desenvolvida para automatizar o processo de gerenciamento de commits em projetos Git. Ele simplifica tarefas como detecção de mudanças, geração de mensagens de commit com IA e configuração do repositório, permitindo que você economize tempo e evite erros.

## 🌟 **Principais Funcionalidades**
- Detecta automaticamente alterações no projeto.
- Gera mensagens de commit claras e concisas usando IA.
- Configura e gerencia repositórios Git locais e remotos.
- Adiciona e gerencia arquivos ignorados no `.gitignore`.
- Troca e cria branches automaticamente.
- Automatiza o processo de `git add`, `commit` e `push`.

---

## 🖥️ **Requisitos do Sistema**
- **Node.js**: Versão 16 ou superior.
- **Git**: Instale e configure o Git no seu sistema.
- Chave de API de IA (por exemplo, Google Gemini AI).

---

## 🔧 **Instalação**

### **Windows**
1. Clone o repositório:
   ```bash
   git clone https://github.com/sidneyjfg/git-commit-automator.git
   cd git-commit-automator
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Torne o script executável globalmente:
   - Edite o `package.json`:
     ```json
     {
       "bin": {
         "sid": "./src/index.js"
       }
     }
     ```
   - Adicione o projeto ao PATH (no Windows, crie um atalho ou modifique variáveis de ambiente):
     - Acesse **Configurações do Sistema** > **Variáveis de Ambiente**.
     - Adicione o caminho completo do diretório ao `PATH`.

4. **Teste o comando global**:
   ```bash
   sid --help
   ```

### **Linux/MacOS**
1. Clone o repositório:
   ```bash
   git clone https://github.com/sidneyjfg/git-commit-automator.git
   cd git-commit-automator
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Torne o script executável globalmente:
   ```bash
   npm link
   ```
4. **Teste o comando global**:
   ```bash
   sid --help
   ```

---

## 🛠️ **Como Utilizar**

### **Passo 1: Configuração Inicial**
Antes de usar o Git Commit Automator, certifique-se de:
- Estar em um diretório Git válido.
- Configurar um repositório remoto, caso ainda não tenha:
  ```bash
  git remote add origin <URL_DO_REPOSITORIO>
  ```

### **Comandos Disponíveis**

#### **1. Inicializar e automatizar commits**
Digite o comando para iniciar a automação:
```bash
sid
```
O programa irá:
1. Verificar se o diretório atual é um repositório Git.
2. Detectar alterações no código.
3. Perguntar sobre arquivos para incluir no `.gitignore` (opcional).
4. Gerar uma mensagem de commit com base nas mudanças detectadas.
5. Realizar o `commit` e `push` para o repositório remoto.

#### **2. Especificar uma branch**
Troque ou crie uma branch automaticamente com:
```bash
sid --branch=<NOME_DA_BRANCH>
```
Exemplo:
```bash
sid --branch=main
```
Se a branch não existir, o programa irá perguntar se deseja criá-la.

#### **3. Outras opções (futuro)**
- Suporte para integração contínua.
- Geração de logs detalhados.

---

## 📋 **Exemplo de Execução**

### **Entrada do Usuário:**
```bash
sid --branch=feature-login
```

### **Saída no Terminal:**
```plaintext
🌟 Starting Git Commit Automator...
🔍 Repositório remoto encontrado: https://github.com/usuario/meu-projeto.git
✏️  Alterações detectadas:
- src/index.js
- src/components/Login.js
- package.json

📄 Arquivos e pastas no diretório atual:
1. .env
2. node_modules
3. src
4. README.md

📦 Digite os números dos arquivos/pastas para adicionar ao .gitignore (ou 0 para pular): 1,2
✔️ Entradas adicionadas ao .gitignore com sucesso!
⏳ Aguarde... Gerando mensagem de commit...
✅ Mensagem de commit gerada: "feat: Add login component and update dependencies"
📤 Realizando push para a branch "feature-login"...
✔️ Alterações commitadas e enviadas com sucesso!
```

---

## ❓ **Dúvidas Frequentes**

### **1. E se o diretório não for um repositório Git?**
O programa irá perguntar se deseja inicializar um repositório Git no local.

### **2. Como configuro o `.env`?**
Crie um arquivo `.env` na raiz do projeto e insira sua chave de API:
```plaintext
GEMINI_API_KEY=<SUA_CHAVE_AQUI>
```

### **3. Posso usar este projeto em múltiplos diretórios?**
Sim! Depois de configurar o comando `sid` globalmente, você pode usá-lo em qualquer diretório Git do sistema.

---

## 💡 **Contribuição**
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests no repositório GitHub.

---