const { spawn, exec } = require('child_process');
const readline = require('readline');
const net = require('net');

const PORT = 4000; // Define the port for TCP server
let chalk;
let serverProcess = null;
let lastPromptCleared = false;

(async () => {
	chalk = (await import('chalk')).default;
	startCLI(); // Start CLI only after chalk is ready
	startTCPServer(); // Start the TCP server for remote commands
})();

// Function to display logs with color and ensure prompt is shown correctly
function logWithPrompt(prefix, message, color = 'white') {
	clearPrompt(); // Remove previous command list before logging new output

	let coloredPrefix = prefix;
	if (chalk) {
		if (prefix === '[Server Manager]') {
			coloredPrefix = chalk.magenta.bold(prefix);
		} else if (prefix === '[Server]') {
			coloredPrefix = chalk.green.bold(prefix);
		}
	}
	console.log(coloredPrefix + ' ' + message);
	redisplayPrompt(); // Ensure prompt remains at the bottom
}

// Function to clear the previous command list before outputting new logs
function clearPrompt() {
	if (!lastPromptCleared) {
		readline.moveCursor(process.stdout, 0, -1);
		readline.clearLine(process.stdout, 0);
		lastPromptCleared = true;
	}
}

// Ensure the prompt remains at the bottom and only prints once
function redisplayPrompt() {
	lastPromptCleared = false;
	console.log(
		chalk.magenta.bold('[Server Manager] ') +
			chalk.green('START') +
			' | ' +
			chalk.yellow('STOP') +
			' | ' +
			chalk.magenta('RESTART') +
			' | ' +
			chalk.blue('UPDATE') +
			' | ' +
			chalk.red('EXIT')
	);
	process.stdout.write('> ');
}

// Function to start the server
function startServer() {
	if (serverProcess) {
		logWithPrompt('[Server Manager]', 'Server is already running.', 'yellow');
		return;
	}

	logWithPrompt('[Server Manager]', 'Starting server...', 'green');

	serverProcess = spawn('npm', ['run', 'controller'], {
		shell: true,
		detached: false,
		stdio: ['pipe', 'pipe', 'pipe'],
	});

	serverProcess.stdout.on('data', (data) => {
		logWithPrompt('[Server]', data.toString().trim());
	});
	serverProcess.stderr.on('data', (data) => {
		logWithPrompt('[Server Error]', data.toString().trim(), 'red');
	});

	serverProcess.on('close', (code) => {
		logWithPrompt(
			'[Server Manager]',
			`Server process exited with code ${code}`,
			'yellow'
		);
		serverProcess = null;
	});

	logWithPrompt('[Server Manager]', 'Server started.', 'green');
}

// Function to stop the server
async function stopServer() {
	if (!serverProcess) {
		logWithPrompt('[Server Manager]', 'No server running.', 'yellow');
		return;
	}

	logWithPrompt('[Server Manager]', 'Stopping server...', 'yellow');

	const pid = serverProcess.pid;
	serverProcess = null;

	if (process.platform === 'win32') {
		exec(`taskkill /pid ${pid} /T /F`, (err) => {
			if (err) {
				logWithPrompt('[Server Manager]', 'Error stopping server.', 'red');
			} else {
				logWithPrompt('[Server Manager]', 'Server stopped.', 'green');
			}
		});
	} else {
		try {
			process.kill(-pid, 'SIGTERM');
			logWithPrompt(
				'[Server Manager]',
				'SIGTERM sent to process group.',
				'cyan'
			);

			setTimeout(() => {
				try {
					process.kill(-pid, 0);
					logWithPrompt(
						'[Server Manager]',
						'Process still running. Force killing...',
						'red'
					);
					process.kill(-pid, 'SIGKILL');
				} catch (error) {
					logWithPrompt(
						'[Server Manager]',
						'Server process successfully stopped.',
						'green'
					);
				}
			}, 3000);
		} catch (err) {
			logWithPrompt('[Server Manager]', 'Error stopping server.', 'red');
		}
	}
}

// Function to restart the server
async function restartServer() {
	logWithPrompt('[Server Manager]', 'Restarting server...', 'cyan');
	await stopServer();
	setTimeout(() => {
		startServer();
	}, 2000);
}

// Function to update code and restart
async function updateAndRestart() {
	logWithPrompt('[Server Manager]', 'Updating code...', 'cyan');

	await stopServer();

	const gitFetch = spawn('git', ['fetch'], { shell: true });

	gitFetch.stdout.on('data', (data) =>
		logWithPrompt('[Git]', data.toString().trim(), 'cyan')
	);
	gitFetch.stderr.on('data', (data) =>
		logWithPrompt('[Git Error]', data.toString().trim(), 'red')
	);

	gitFetch.on('close', (fetchCode) => {
		if (fetchCode !== 0) {
			logWithPrompt(
				'[Server Manager]',
				'Git fetch failed. Aborting update.',
				'red'
			);
			return;
		}

		const gitPull = spawn('git', ['pull'], { shell: true });

		gitPull.stdout.on('data', (data) =>
			logWithPrompt('[Git]', data.toString().trim(), 'cyan')
		);
		gitPull.stderr.on('data', (data) =>
			logWithPrompt('[Git Error]', data.toString().trim(), 'red')
		);

		gitPull.on('close', (pullCode) => {
			if (pullCode === 0) {
				logWithPrompt(
					'[Server Manager]',
					'Git pull successful. Restarting server...',
					'green'
				);
				startServer();
			} else {
				logWithPrompt(
					'[Server Manager]',
					'Git pull failed. Server will not restart.',
					'red'
				);
			}
		});
	});
}

// Start TCP server for remote commands
function startTCPServer() {
	const server = net.createServer((socket) => {
		logWithPrompt('[TCP]', 'Remote connection established.', 'cyan');

		socket.on('data', (data) => {
			const command = data.toString().trim();
			logWithPrompt('[TCP]', `Received command: ${command}`, 'yellow');
			handleCommand(command);
		});

		socket.on('close', () => {
			logWithPrompt('[TCP]', 'Remote connection closed.', 'cyan');
		});
	});

	server.listen(PORT, '0.0.0.0', () => {
		logWithPrompt(
			'[Server Manager]',
			`Listening for remote commands on port ${PORT}...`,
			'cyan'
		);
	});
}

// Function to handle commands
function handleCommand(command) {
	switch (command) {
		case 'start':
			startServer();
			break;
		case 'stop':
			stopServer();
			break;
		case 'restart':
			restartServer();
			break;
		case 'update':
			updateAndRestart();
			break;
		case 'exit':
			logWithPrompt('[Server Manager]', 'Exiting...', 'red');
			stopServer();
			process.exit(0);
			break;
		default:
			logWithPrompt('[Server Manager]', chalk.red('Unknown command'), 'yellow');
	}
}

// Function to start the CLI
function startCLI() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.on('line', (input) => {
		handleCommand(input.trim());
	});
	startServer();
}
