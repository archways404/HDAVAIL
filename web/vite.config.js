import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		port: 5173,
		host: 'localhost',
		https: {
			key: fs.readFileSync('../certificates/server-key.pem'),
			cert: fs.readFileSync('../certificates/server-cert.pem'),
		},
	},
});
