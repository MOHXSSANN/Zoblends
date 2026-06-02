import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home    from './pages/Home'
import Gallery from './pages/Gallery'
import About   from './pages/About'
import Reviews from './pages/Reviews'
import Contact from './pages/Contact'
import Book    from './pages/Book'
import Shop    from './pages/Shop'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"        element={<Home />}    />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about"   element={<About />}   />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book"    element={<Book />}    />
        <Route path="/shop"    element={<Shop />}    />
      </Route>
    </Routes>
  )
}
