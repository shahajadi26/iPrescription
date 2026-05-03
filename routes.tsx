import { Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuestionBankPage from './pages/QuestionBankPage';
import PracticePage from './pages/PracticePage';
import GeographicQuizPage from './pages/GeographicQuizPage';
import ExamsPage from './pages/ExamsPage';
import NotificationsPage from './pages/NotificationsPage';
import RoutinePage from './pages/RoutinePage';
import ResultsPage from './pages/ResultsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ContentManagementPage from './pages/admin/ContentManagementPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    visible: false,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false,
  },
  {
    name: 'Register',
    path: '/register',
    element: <RegisterPage />,
    visible: false,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    name: 'Question Bank',
    path: '/question-bank',
    element: <QuestionBankPage />,
  },
  {
    name: 'Practice',
    path: '/practice',
    element: <PracticePage />,
  },
  {
    name: 'Geographic Quiz',
    path: '/geographic-quiz',
    element: <GeographicQuizPage />,
  },
  {
    name: 'Exams',
    path: '/exams',
    element: <ExamsPage />,
  },
  {
    name: 'Notifications',
    path: '/notifications',
    element: <NotificationsPage />,
  },
  {
    name: 'Routine',
    path: '/routine',
    element: <RoutinePage />,
  },
  {
    name: 'Results',
    path: '/results',
    element: <ResultsPage />,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminDashboardPage />,
    visible: false,
  },
  {
    name: 'User Management',
    path: '/admin/users',
    element: <UserManagementPage />,
    visible: false,
  },
  {
    name: 'Content Management',
    path: '/admin/content',
    element: <ContentManagementPage />,
    visible: false,
  },
];

export default routes;
