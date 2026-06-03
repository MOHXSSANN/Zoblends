import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import NewsletterBanner from './NewsletterBanner'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__main">
        <Outlet />
      </main>
      <NewsletterBanner />
      <Footer />
    </div>
  )
}
