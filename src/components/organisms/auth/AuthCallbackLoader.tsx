"use client"

import { Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthCallbackLoaderProps {
    status?: "loading" | "error"
}

export const AuthCallbackLoader = ({
    status = "loading",
}: AuthCallbackLoaderProps) => {
    const isError = status === "error"

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="container-industrial">
                <div className="text-center">
                    <div className="mb-6 flex justify-center animate-fade-in">
                        {isError ? (
                            <AlertCircle
                                size={24}
                                className="text-destructive"
                            />
                        ) : (
                            <Loader2
                                size={24}
                                className="text-primary animate-spin"
                            />
                        )}
                    </div>
                    <h2
                        className={cn(
                            "mb-2 text-2xl font-semibold animate-fade-in",
                            isError ? "text-destructive" : "text-primary"
                        )}
                        style={{ animationDelay: "0.1s" }}
                    >
                        {isError
                            ? "Something went wrong"
                            : "Setting up your account..."}
                    </h2>
                    <p
                        className="text-steel animate-fade-in"
                        style={{ animationDelay: "0.3s" }}
                    >
                        {isError
                            ? "Redirecting you to the home page..."
                            : "Please wait while we prepare everything for you"}
                    </p>
                </div>
            </div>
        </div>
    )
}
