import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";

import MyInquiriesPage from "./pages/MyInquiriesPage";

import ProfilePage from "./pages/ProfilePage";

import ListingDetailsPage from "./pages/ListingDetailsPage";

import FavoritesPage from "./pages/FavoritesPage";
import CreateListingPage from "./pages/CreateListingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import MyListingsPage from "./pages/MyListingsPage";
import EditListingPage from "./pages/EditListingPage";

import AdminPage from "./pages/AdminPage";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/inquiries" element={<MyInquiriesPage />} />

        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/create" element={<CreateListingPage />} />

        <Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminPage />
    </AdminRoute>
  }
/>

        <Route path="/my-listings" element={<MyListingsPage />} />
        <Route path="/my-listings/:id/edit" element={<EditListingPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}