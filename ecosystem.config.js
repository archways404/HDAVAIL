module.exports = {
	apps: [
		{
			name: 'api', // PM2 process name
			script: 'pnpm',
			args: 'run prod', // Run your prod script
			watch: true, // Enable watch mode
			ignore_watch: ['node_modules', 'logs'], // Directories to ignore
			env: {
				NODE_ENV: 'production',
			},
			interpreter: 'none', // Prevent PM2 from using Node.js interpreter directly
		},
	],
};
