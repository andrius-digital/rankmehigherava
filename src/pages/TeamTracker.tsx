import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, UsersRound, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TeamTracker: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>Team Tracker | AVA Admin Panel</title>
            </Helmet>

            {/* Header */}
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/avaadminpanel">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                                <UsersRound className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-heading font-bold">Team Tracker</h1>
                                <p className="text-sm text-muted-foreground">Monitor team activity and time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Coming Soon */}
            <div className="container mx-auto px-4 py-16">
                <Card className="max-w-md mx-auto bg-card/50 border-border/50">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                        <p className="text-muted-foreground">
                            Team tracking functionality will be available here. Check back soon!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TeamTracker;
