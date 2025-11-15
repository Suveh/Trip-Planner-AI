import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router'
import CreateTrip from './create-trip'
import { Toaster } from "@/components/ui/sonner"
import { GoogleOAuthProvider } from '@react-oauth/google'
import Viewtrip from './view-trip/index.jsx'
import Layout from './Layout'
import { AuthProvider } from "./context/AuthContext";
import Login from './components/auth/Login'
import ResetPassword from './components/auth/ResetPassword'
import Signup from './components/auth/Signup'
import RequireAuth from './components/auth/RequireAuth'
import Profile from './components/auth/Profile'
import MyTrips from './my-trips/MyTrips'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <App />
      </Layout>
    )
  },
  {
    path: '/login',
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    path: '/signup',
    element: (
      <Layout>
        <Signup />
      </Layout>
    )
  },
  {
    path: '/reset-password',
    element: (
      <Layout>
        <ResetPassword />
      </Layout>
    )
  },
  // ✅ PROTECTED ROUTES - Require login
  {
    path: '/create-trip',
    element: (
      <RequireAuth>
        <Layout>
          <CreateTrip />
        </Layout>
      </RequireAuth>
    )
  },
  {
    path: '/view-trip/:tripId',
    element: (
      <RequireAuth>
        <Layout>
          <Viewtrip />
        </Layout>
      </RequireAuth>
    )
  },
  {
    path: '/profile',
    element: (
      <RequireAuth>
        <Layout>
          <Profile />
        </Layout>
      </RequireAuth>
    )
  },
  {
    path: '/my-trips',
    element: (
      <RequireAuth>
        <Layout>
          <MyTrips />
        </Layout>
      </RequireAuth>
    )
  },
  // ✅ 404 CATCH-ALL ROUTE
  {
    path: '*',
    element: (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <p className="text-gray-600 mt-4">Page not found</p>
          </div>
        </div>
      </Layout>
    )
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <AuthProvider>
        <Toaster />
        <RouterProvider router={router} />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)