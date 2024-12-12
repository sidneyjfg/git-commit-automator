const dotenv = require('dotenv');
const chalk = require('chalk');

dotenv.config();

const requiredVars = ['GEMINI_API_KEY', 'GIT_BRANCH'];

requiredVars.forEach((variable) => {
  if (!process.env[variable]) {
    console.error(chalk.red(`Environment variable ${variable} is missing`));
    process.exit(1);
  }
});

module.exports = process.env;
