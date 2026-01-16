import { useCallback } from "react";
import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function ParticlesOverlay() {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        // console.log("Particles loaded", container);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-40">
            <Particles
                id="tsparticles-overlay"
                init={particlesInit}
                loaded={particlesLoaded}
                className="w-full h-full"
                options={{
                    fullScreen: { enable: false },
                    fpsLimit: 120,
                    background: {
                        color: {
                            value: "transparent",
                        },
                    },
                    interactivity: {
                        events: {
                            onHover: {
                                enable: true,
                                mode: "grab",
                            },
                            resize: true,
                        },

                        modes: {
                            grab: {
                                distance: 140,
                                links: {
                                    opacity: 0.3, // Slightly reduced
                                },
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: "#ffffff",
                        },
                        links: {
                            color: "#ff3333",
                            distance: 150,
                            enable: true,
                            opacity: 0.15, // Much more subtle links
                            width: 1,
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: {
                                default: "bounce",
                            },
                            random: false,
                            speed: 0.8, // Slower movement
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 1000, // Reduced density (higher area)
                            },
                            value: 60,
                        },
                        opacity: {
                            value: 0.3, // More transparent particles
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: { min: 1, max: 2 },
                        },
                    },
                    detectRetina: true,
                }}
            />
        </div>
    );
}
