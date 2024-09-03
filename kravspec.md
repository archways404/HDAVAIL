# HDAVAIL - Requirement Specification

## 1. Project Overview

**Objective**:  
HDAVAIL is a booking system designed to streamline the process of notifying the Administrator (Martin) about which available work slots the worker is available for each month. The current process involves manually checking available dates on a webpage and emailing the Administrator, which is cumbersome for both workers and the Administrator. HDAVAIL aims to simplify this by allowing workers to select available slots directly, with the Administrator managing assignments easily through the system.

**Scope**:  
HDAVAIL will be developed as a web-based application, with potential future integration into existing workflows (e.g., generating reports for email distribution). It may also include a feature to sync with Google Calendar.

## 2. Target Audience

**Users**:  
- **Workers**: Can view available dates, mark their availability, and track their assigned slots. Potential integration with Google Calendar to sync assignments.
- **Administrator**: Can manage dates, view workers' availability, assign workers to slots, manage user accounts, and send notifications.
- **Maintainer**: Can update and set status notifications, see overview of the website (including visits, failed login attempts), manually send reset-password, send update emails etc.


## 3. Core Features

### 3.1 Worker Features
- **View Available Dates**: Workers can view all available dates and slots.
- **Mark Availability**: Workers can mark which dates/times they are available.
- **View Assignments**: Workers can see the slots they have been assigned to.
- **Google Calendar Integration (Optional)**: Workers can sync their assignments with Google Calendar.
- **Account Management**: Workers can reset their passwords and manage their profiles.

### 3.2 Admin Features
- **Date Management**: Admins can create, update, or delete available dates.
- **Assign Workers**: Admins can assign workers to specific dates/times.
- **User Management**: Admins can create, delete, and manage user accounts.
- **Notifications**: Admins can send notices or status updates to all users.
- **System Status Updates**: Admins can post updates about any disruptions or issues.
- **Data Export**: Option to export assignments as a document for distribution (e.g., via email).

### 3.3 Maintainer Features
- **System Status Updates**: Post status messages or notifications to inform users about system maintenance, downtimes, or other critical issues.
- **Alert Management**: Set up automated alerts for specific events (e.g., system errors, performance issues) and manually trigger alerts if needed.
- **Dashboard Overview**: View a dashboard with key metrics, such as website traffic, user activity, failed login attempts, system health, and performance metrics.
- **Error Logging**: Access logs of system errors, exceptions, and other critical issues to monitor the health of the application.
- **Analytics [OPTIONAL]**: Analyze trends in user behavior, system usage, and performance data to identify potential issues or opportunities for improvement.
- **Manual Password Reset**: Manually trigger password resets for users who are unable to do so themselves.
- **User Account Audits**: Perform audits of user accounts, including reviewing activity logs, login attempts, and access levels.
- **User Communication**: Send emails to users for updates, notifications, or other communications.
- **Database Management**: Perform database maintenance tasks, such as backups, optimizations, and updates.
- **Configuration Management [OPTIONAL]**: Update and manage system configurations, including API keys, third-party integrations, and environment variables.
- **Deployment Management [OPTIONAL]**: Oversee deployments, including rolling back changes if necessary and monitoring the deployment process for issues.
- **Security Audits [OPTIONAL]**: Review security logs and settings to ensure compliance with best practices and regulations (e.g., GDPR).
- **Access Control [OPTIONAL]**: Manage and review access control settings, ensuring that roles and permissions are correctly assigned and up to date.

### 3.4 System Features
- **Calendar Sync**: The system fetches dates from the calendar every 10 minutes and updates the database with new entries.
- **Notifications**: System alerts users about any disruptions or updates.
- **Security**: Basic security measures, including password resets via email and secure user authentication (Cookies, JWT?).

## 4. Technology Stack

- **Frontend**:
  - **Framework**: React (using Vite for bundling)
  - **Styling**: TailwindCSS, potentially with shadcn for styled components
  - **Hosting**: Vercel (or other frontend hosting service)

- **Backend**:
  - **Language/Framework**: FastifyJS or Rust with Actix Web (final decision pending)
  - **Database**: PostgreSQL, hosted on a private server
  - **Script**: Python, fetches and parses the available slots
  - **Other Tools**: GitHub for version control, Notion and Discord for project management and communication

## 5. Performance and Security

- **Performance**: The application should be responsive and handle multiple users simultaneously without significant delays.
- **Security**: While not a primary focus, basic security practices will be implemented, including encrypted passwords, secure authentication, and GDPR compliance.
- **Reliability**: The system should reliably sync with the calendar and ensure accurate data management.

## 6. Timeline and Milestones

**No fixed timeline**: Development will proceed as time allows. Key milestones include:
- **Initial Setup**: Database, backend, and frontend scaffolding.
- **Core Feature Implementation**: User management, calendar sync, and assignment features.
- **Testing and QA**: Thorough testing of all features.
- **Deployment**: Launch of the initial version.
- **Future Enhancements**: Potential integrations (e.g., Google Calendar) and additional features.

## 7. Collaboration and Tools

- **Team Members**: Currently, the team includes two developers (you and Daniel). More members may join later.
- **Tools**:
  - **Version Control**: GitHub
  - **Project Management**: Github/Notion?
  - **Communication**: Discord/Teams?

## 8. Compliance and Standards

- **GDPR Compliance**: Ensure that all user data is handled in accordance with GDPR regulations.
- **Coding Standards**: Follow "clean code" principles to maintain readability, maintainability, and quality of the codebase.
- **Testing**: Before any merge, a test must be created and previous tests must pass (exceptions may be applicable)

