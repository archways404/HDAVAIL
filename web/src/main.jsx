import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import Index from './pages/index.jsx';
import Login from './pages/login.jsx';
import ForgotPass from './pages/forgotpass.jsx';
import ResetPass from './pages/resetpass.jsx';
import SetPass from './pages/setpass.jsx';
import Logout from './components/Logout.jsx';
import NotFound from './pages/notFound.jsx';
import Welcome from './pages/welcome.jsx';
import Invite from './pages/invite.jsx';
import AuthWrapper from './components/AuthWrapper';
import UnAuthWrapper from './components/UnAuthWrapper';

import './global.css';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<ThemeProvider>
				<AuthProvider>
					<Routes>
						<Route
							path="/"
							element={
								<UnAuthWrapper>
									<Index />
								</UnAuthWrapper>
							}
						/>
						<Route
							path="/login"
							element={
								<UnAuthWrapper>
									<Login />
								</UnAuthWrapper>
							}
						/>
						<Route
							path="/resetPassword"
							element={
								<UnAuthWrapper>
									<ResetPass />
								</UnAuthWrapper>
							}
						/>
						<Route
							path="/setpass"
							element={
								<UnAuthWrapper>
									<SetPass />
								</UnAuthWrapper>
							}
						/>
						<Route
							path="/forgotpass"
							element={
								<UnAuthWrapper>
									<ForgotPass />
								</UnAuthWrapper>
							}
						/>
						<Route
							path="/invite"
							element={
								<AuthWrapper allowedUserTypes={['admin', 'worker']}>
									<Invite />
								</AuthWrapper>
							}
						/>
						<Route
							path="/welcome"
							element={
								<AuthWrapper
									allowedUserTypes={['admin', 'worker', 'maintainer']}>
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
				</AuthProvider>
			</ThemeProvider>
		</BrowserRouter>
	</StrictMode>
);
