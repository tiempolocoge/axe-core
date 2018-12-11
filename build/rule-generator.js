/* global Promise */

const fs = require('fs');
const chalk = require('chalk');
const execa = require('execa');

const { CI } = process.env;

const { getAnswers } = require('./rule-generator/get-answers');
const { getFilesMetaData } = require('./rule-generator/get-files-metadata');
const { createFile, directories } = require('./rule-generator/utils');

// prevent malicious execution from CI
if (CI) {
	throw new Error('Cannot run Rule Generation CLI in CI.');
}

// execute
run();

async function run() {
	// ensure axe exists, if not build axe, then start the generator
	const axeExists = fs.existsSync(directories.axePath);
	if (!axeExists) {
		console.log(
			chalk.red.bold(
				`Axe does not exist. Triggering build using - 'npm run build'. Rule generation will continue after build.`
			)
		);
		await execa.shell('npm run build');
	}

	// rule-generator banner
	console.log(chalk.hex('#0077c8')('Axe Rule Generator'));

	// get answers (ask questions)
	const answers = await getAnswers();

	// get metadata of files to be created
	const files = getFilesMetaData(answers);

	// create the files
	if (!files || !files.length) {
		console.log(chalk.red.bold(`No files to generate.`));
	}

	try {
		const result = await Promise.all(files.map(createFile));

		console.log(
			chalk.green.bold(
				'\n' + 'Successfully generated RULE and respective files: '
			)
		);
		console.log(chalk.green.bold(''));
		console.log(chalk.green.bold(result.join('\r\n')));
	} catch (err) {
		console.log(
			chalk.green.bold(`Error generating RULE. Please try again.`, err)
		);
	}
}
