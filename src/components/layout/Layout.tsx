import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import './Layout.css'

const FOOTER_ROUTES = new Set(['/', '/contact'])

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="layout">
      <ScrollToTop />
      <Navbar />
      <main className="layout__main">
        <Outlet />
      </main>
      {FOOTER_ROUTES.has(pathname) && <Footer />}
    </div>
  )
}
