import { lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

const Layout = lazy(() => import('./components/Layout'));
const Login = lazy(() => import('./pages/Login'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Participants = lazy(() => import('./pages/Participants'));
const StaffCheckin = lazy(() => import('./pages/StaffCheckin'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const ParticipantQR = lazy(() => import('./pages/ParticipantQR'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HotelRooms = lazy(() => import('./pages/HotelRooms'));
const HotelParticipants = lazy(() => import('./pages/HotelParticipants'));
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const AdminSessions = lazy(() => import('./pages/AdminSessions'));
const AdminLocations = lazy(() => import('./pages/AdminLocations'));
const AdminAnnouncements = lazy(() => import('./pages/AdminAnnouncements'));
const AdminSurvey = lazy(() => import('./pages/AdminSurvey'));
const AdminBranding = lazy(() => import('./pages/AdminBranding'));
const AdminServices = lazy(() => import('./pages/AdminServices'));
const AdminSchedulePlanner = lazy(() => import('./pages/AdminSchedulePlanner'));
const AdminEventConfig = lazy(() => import('./pages/AdminEventConfig'));
const AdminQandA = lazy(() => import('./pages/AdminQandA'));
const AdminProgram = lazy(() => import('./pages/AdminProgram'));
const NameTags = lazy(() => import('./pages/NameTags'));
const PortalDashboard = lazy(() => import('./pages/PortalDashboard'));
const PortalSchedule = lazy(() => import('./pages/PortalSchedule'));
const PortalLocations = lazy(() => import('./pages/PortalLocations'));
const PortalAnnouncements = lazy(() => import('./pages/PortalAnnouncements'));
const PortalSurvey = lazy(() => import('./pages/PortalSurvey'));
const PortalSessionDetail = lazy(() => import('./pages/PortalSessionDetail'));
const PortalDietary = lazy(() => import('./pages/PortalDietary'));

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/login', element: <Navigate to="/" replace /> },
  { path: '/staff/:code', element: <StaffCheckin /> },
  { path: '/staff/dashboard', element: <StaffDashboard /> },
  { path: '/qr/:token', element: <ParticipantQR /> },
  { path: '/portal/:token', children: [
    { index: true, element: <PortalDashboard /> },
    { path: 'schedule', element: <PortalSchedule /> },
    { path: 'locations', element: <PortalLocations /> },
    { path: 'announcements', element: <PortalAnnouncements /> },
    { path: 'survey', element: <PortalSurvey /> },
    { path: 'sessions/:sid', element: <PortalSessionDetail /> },
    { path: 'dietary', element: <PortalDietary /> },
  ]},
  { path: '/admin', element: <Layout />, children: [
    { index: true, element: <SuperAdmin /> },
    { path: 'events', element: <Events /> },
    { path: 'events/:id', element: <EventDetail /> },
    { path: 'events/:id/rooms', element: <Rooms /> },
    { path: 'events/:id/participants', element: <Participants /> },
    { path: 'events/:id/dashboard', element: <Dashboard /> },
    { path: 'events/:id/hotels/:hid/rooms', element: <HotelRooms /> },
    { path: 'events/:id/hotels/:hid/participants', element: <HotelParticipants /> },
    { path: 'events/:id/sessions', element: <AdminSessions /> },
    { path: 'events/:id/locations', element: <AdminLocations /> },
    { path: 'events/:id/announcements', element: <AdminAnnouncements /> },
    { path: 'events/:id/survey', element: <AdminSurvey /> },
    { path: 'events/:id/branding', element: <AdminBranding /> },
    { path: 'events/:id/services', element: <AdminServices /> },
    { path: 'events/:id/schedule', element: <AdminSchedulePlanner /> },
    { path: 'events/:id/program', element: <AdminProgram /> },
    { path: 'events/:id/nametags', element: <NameTags /> },
    { path: 'events/:id/configure', element: <AdminEventConfig /> },
    { path: 'events/:id/sessions/:sid/qanda', element: <AdminQandA /> },
  ]},
]);

export default function App() {
  return <RouterProvider router={router} />;
}
