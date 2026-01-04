import { ClerkProvider } from "@clerk/nextjs"
import { ROUTES } from "@/lib/constants"
import React from "react"

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ClerkProvider
            signInForceRedirectUrl={ROUTES.AUTH.CALLBACK}
            signUpForceRedirectUrl={ROUTES.AUTH.CALLBACK}
        >
            {children}
        </ClerkProvider>
    )
}

export default AuthProvider
