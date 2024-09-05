import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';

import Index from './pages/index.jsx';
import Login from './pages/login.jsx';
import Logout from './components/Logout.jsx';
import NotFound from './pages/notFound.jsx';
import Welcome from './pages/welcome.jsx';
import AuthWrapper from './components/AuthWrapper';

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
						path="/welcome"
						element={
							<AuthWrapper>
								<Welcome />
							</AuthWrapper>
						}
					/>
					<Route
						path="/logout"
						element={
							<AuthWrapper>
								<Logout />
							</AuthWrapper>
						}
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
