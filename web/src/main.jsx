import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';

import Index from './pages/index.jsx';
import Login from './pages/login.jsx';
import ForgotPass from './pages/forgotpass.jsx';
import ResetPass from './pages/resetpass.jsx'; // Add ResetPass page
import SetPass from './pages/setpass.jsx'; // Add SetPass page
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
						path="/resetPassword"
						element={<ResetPass />}
					/>
					<Route
						path="/setpass"
						element={<SetPass />}
					/>
					<Route
						path="/forgotpass"
						element={<ForgotPass />}
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
