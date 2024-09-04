import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';

import Index from './pages/index.jsx';
import Login from './pages/login.jsx';
import NotFound from './pages/notFound.jsx';

import './global.css';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<ThemeProvider>
				<Routes>
					<Route
						path="/"
						element={<Index />}
					/>
					<Route
						path="/login"
						element={<Login />}
					/>
					<Route
						path="*"
						element={<NotFound />}
					/>
				</Routes>
			</ThemeProvider>
		</BrowserRouter>
	</StrictMode>
);
