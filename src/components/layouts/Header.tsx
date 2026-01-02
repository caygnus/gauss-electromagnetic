"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

const navItems = [
    { label: "Products", href: ROUTES.PRODUCTS },
    { label: "About Us", href: ROUTES.ABOUT },
    { label: "Certifications", href: ROUTES.CERTIFICATIONS },
    { label: "Contact Us", href: ROUTES.CONTACT },
]

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-background shadow-header"
                    : "bg-background/95 backdrop-blur-sm"
            )}
        >
            <div className="container-industrial">
                <nav className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link
                        href={ROUTES.HOME}
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                            <Zap className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-primary tracking-tight">
                                GAUSS
                            </span>
                            <span className="text-[10px] text-steel uppercase tracking-widest -mt-1">
                                Electromagnetics
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors link-underline py-1",
                                    pathname === item.href
                                        ? "text-primary"
                                        : "text-steel hover:text-primary"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="industrial" size="default" asChild>
                            <Link href={ROUTES.CONTACT}>Enquire Now</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-primary"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border">
                        <div className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "text-sm font-medium py-2 transition-colors",
                                        pathname === item.href
                                            ? "text-primary"
                                            : "text-steel hover:text-primary"
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Button
                                variant="industrial"
                                size="default"
                                asChild
                                className="mt-2"
                            >
                                <Link href={ROUTES.CONTACT}>Enquire Now</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
