import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Rooms from './pages/Rooms';
import Participants from './pages/Participants';
import StaffCheckin from './pages/StaffCheckin';
import StaffDashboard from './pages/StaffDashboard';
import ParticipantQR from './pages/ParticipantQR';
import Dashboard from './pages/Dashboard';
import HotelRooms from './pages/HotelRooms';
import HotelParticipants from './pages/HotelParticipants';
import SuperAdmin from './pages/SuperAdmin';

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/login', element: <Navigate to="/" replace /> },
  { path: '/staff/:code', element: <StaffCheckin /> },
  { path: '/staff/dashboard', element: <StaffDashboard /> },
  { path: '/qr/:token', element: <ParticipantQR /> },
  {
    path: '/admin',
    element: <Layout />,
    children: [
      { index: true, element: <SuperAdmin /> },
      { path: 'events', element: <Events /> },
      { path: 'events/:id', element: <EventDetail /> },
      { path: 'events/:id/rooms', element: <Rooms /> },
      { path: 'events/:id/participants', element: <Participants /> },
      { path: 'events/:id/dashboard', element: <Dashboard /> },
      { path: 'events/:id/hotels/:hid/rooms', element: <HotelRooms /> },
      { path: 'events/:id/hotels/:hid/participants', element: <HotelParticipants /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
