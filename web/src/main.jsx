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
import Schedule from './pages/schedule';
import AuthWrapper from './components/AuthWrapper';
import UnAuthWrapper from './components/UnAuthWrapper';
import CalendarLink from './pages/calendarlink';
import ManageUsers from './pages/manageusers';
import UserDetail from './pages/userdetail';
import ServerInfo from './pages/serverinfo';

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
							path="/serverinfo"
							element={
								<AuthWrapper allowedUserTypes={['admin', 'worker']}>
									<ServerInfo />
								</AuthWrapper>
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
							path="/manage-users"
							element={
								<AuthWrapper allowedUserTypes={['admin']}>
									<ManageUsers />
								</AuthWrapper>
							}
						/>
						<Route
							path="/user/:uuid"
							element={
								<AuthWrapper allowedUserTypes={['admin']}>
									<UserDetail />
								</AuthWrapper>
							}
						/>
						<Route
							path="/schedule"
							element={
								<AuthWrapper allowedUserTypes={['admin', 'worker']}>
									<Schedule />
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
							path="/calendarlink"
							element={
								<AuthWrapper
									allowedUserTypes={['admin', 'worker', 'maintainer']}>
									<CalendarLink />
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
