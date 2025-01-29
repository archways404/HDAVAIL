import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import Index from './views/home_page/index.jsx';
import Login from './views/login_page/login.jsx';
import ForgotPass from './views/forgot-password_page/forgotpass.jsx';
import ResetPass from './views/reset-password_page/resetpass';
import SetPass from './views/set-password_page/setpass.jsx';
import Logout from './components/Logout.jsx';
import NotFound from './views/not-found_page/notFound';
import Welcome from './views/welcome/welcome_page.jsx';
import Invite from './views/invite_page/invite';
import Schedule from './views/display-schedule_page/schedule';
import AuthWrapper from './components/AuthWrapper';
import UnAuthWrapper from './components/UnAuthWrapper';

import CalendarLink from './views/calendar-link_page/calendarlink';
import ManageUsers from './views/manage-users_page/manageusers';
import UserDetail from './views/display-user-details_page/userdetail';
import ServerPanel from './views/server-panel_page/serverpanel';
import EmailStatus from './views/email-status_page/emailstatus';
import TestHandleShifts from './views/create-shifttypes_page/testHandleShifts';
import CreateTemplate from './views/create-template_page/createTemplate';
import StatusMsg from './views/status-messages_page/statusmsg';

import ServerInfo from './old/serverinfo';
import CreateSchedule from './old/createschedule';


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
								<AuthWrapper allowedUserRoles={['admin', 'worker']}>
									<ServerInfo />
								</AuthWrapper>
							}
						/>
						<Route
							path="/invite"
							element={
								<AuthWrapper allowedUserRoles={['admin', 'worker']}>
									<Invite />
								</AuthWrapper>
							}
						/>
						<Route
							path="/manage-users"
							element={
								<AuthWrapper allowedUserRoles={['admin']}>
									<ManageUsers />
								</AuthWrapper>
							}
						/>
						<Route
							path="/user/:uuid"
							element={
								<AuthWrapper allowedUserRoles={['admin']}>
									<UserDetail />
								</AuthWrapper>
							}
						/>
						<Route
							path="/schedule"
							element={
								<AuthWrapper allowedUserRoles={['admin', 'worker']}>
									<Schedule />
								</AuthWrapper>
							}
						/>
						<Route
							path="/create-schedule"
							element={
								<AuthWrapper allowedUserRoles={['admin']}>
									<CreateSchedule />
								</AuthWrapper>
							}
						/>
						<Route
							path="/handle-shifts"
							element={
								<AuthWrapper allowedUserRoles={['admin']}>
									<TestHandleShifts />
								</AuthWrapper>
							}
						/>
						<Route
							path="/create-template"
							element={
								<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
									<CreateTemplate />
								</AuthWrapper>
							}
						/>
						<Route
							path="/server-panel"
							element={
								<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
									<ServerPanel />
								</AuthWrapper>
							}
						/>
						<Route
							path="/email-status"
							element={
								<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
									<EmailStatus />
								</AuthWrapper>
							}
						/>
						<Route
							path="/welcome"
							element={
								<AuthWrapper
									allowedUserRoles={['admin', 'worker', 'maintainer']}>
									<Welcome />
								</AuthWrapper>
							}
						/>
						<Route
							path="/handle-status"
							element={
								<AuthWrapper
									allowedUserRoles={['admin', 'worker', 'maintainer']}>
									<StatusMsg />
								</AuthWrapper>
							}
						/>
						<Route
							path="/calendarlink"
							element={
								<AuthWrapper
									allowedUserRoles={['admin', 'worker', 'maintainer']}>
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
