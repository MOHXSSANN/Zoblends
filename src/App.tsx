import { Routes, Route } from 'react-router-dom'
import Layout     from './components/layout/Layout'
import Home       from './pages/Home'
import Gallery    from './pages/Gallery'
import About      from './pages/About'
import Reviews    from './pages/Reviews'
import Contact    from './pages/Contact'
import Book       from './pages/Book'
import Shop       from './pages/Shop'
import MyBookings from './pages/MyBookings'
import Admin        from './pages/Admin'
import AdminFinance  from './pages/AdminFinance'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"              element={<Home />}         />
        <Route path="/gallery"       element={<Gallery />}      />
        <Route path="/about"         element={<About />}        />
        <Route path="/reviews"       element={<Reviews />}      />
        <Route path="/contact"       element={<Contact />}      />
        <Route path="/book"          element={<Book />}         />
        <Route path="/shop"          element={<Shop />}         />
        <Route path="/my-bookings"   element={<MyBookings />}   />
        <Route path="/admin"         element={<Admin />}        />
        <Route path="/admin/finance" element={<AdminFinance />} />
      </Route>
    </Routes>
  )
}
