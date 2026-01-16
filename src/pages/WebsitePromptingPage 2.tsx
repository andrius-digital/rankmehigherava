import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WebsitePrompting from "@/components/WebsitePrompting";
import GridOverlay from "@/components/agency/GridOverlay";

const WebsitePromptingPage = () => {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Helmet>
                <title>Website Prompting | AVA Admin Panel</title>
                <meta
                    name="description"
                    content="AI-powered prompt templates and style guide for generating high-converting websites in our agency's signature style."
                />
            </Helmet>

            {/* Background effects */}
            <GridOverlay />

            {/* Main content */}
            <div className="relative z-10 min-h-screen">
                {/* Header */}
                <header className="border-b border-border/30 bg-card/20 backdrop-blur-xl sticky top-0 z-20">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to="/avaadminpanel">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to AVA Admin Panel
                                    </Button>
                                </Link>
                                <div className="h-6 w-px bg-border/50" />
                                <div>
                                    <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
                                        Website Prompting
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        AI Templates & Style Guide
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="container mx-auto px-4 py-8 sm:py-12">
                    <div className="max-w-6xl mx-auto">
                        <WebsitePrompting />
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-border/30 bg-card/10 backdrop-blur-sm py-6 mt-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                            <p>© {new Date().getFullYear()} AVA Admin Panel. Internal Tool.</p>
                            <Link to="/avaadminpanel" className="hover:text-primary transition-colors">
                                Return to AVA Admin Panel
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default WebsitePromptingPage;
