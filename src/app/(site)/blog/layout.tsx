import Navbar from '../navbar'
import Footer from '../footer'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className='min-h-screen pt-14'>{children}</main>
      <Footer />
    </>
  )
}
