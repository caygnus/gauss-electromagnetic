import Link from "next/link"
import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"

const NotFoundPage = () => {
 return (
  <div className="min-h-screen">
   <Header />
   <main className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-background pt-20">
    <div className="text-center">
     <h1 className="mb-4 text-4xl font-bold text-primary">404</h1>
     <p className="mb-4 text-xl text-steel">Oops! Page not found</p>
     <Link
      href="/"
      className="text-primary underline hover:text-primary/90 transition-colors"
     >
      Return to Home
     </Link>
    </div>
   </main>
   <Footer />
  </div>
 )
}

export default NotFoundPage
