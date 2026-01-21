import { useEffect, useState, useRef } from "react";

interface WistiaVideoProps {
  videoId?: string;
  isMobile?: boolean;
  aspectRatio?: "16:9" | "9:16";
}

// Validate Wistia video ID format (alphanumeric, typically 10 chars)
const isValidWistiaId = (id: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(id) && id.length >= 6 && id.length <= 20;
};

const WistiaVideo = ({ videoId = "k4xdzi49er", isMobile = false, aspectRatio = "16:9" }: WistiaVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);
  const wistiaContainerRef = useRef<HTMLDivElement>(null);

  const aspectValue = aspectRatio === "16:9" ? "1.7777777777777777" : "0.5625";
  const paddingTop = aspectRatio === "16:9" ? "56.25%" : "177.78%";

  // Sanitize videoId to prevent XSS
  const sanitizedVideoId = isValidWistiaId(videoId) ? videoId : "k4xdzi49er";

  // Create Wistia player element safely using DOM API
  useEffect(() => {
    if (!wistiaContainerRef.current) return;

    // Clear any existing content
    wistiaContainerRef.current.innerHTML = "";

    // Create wistia-player element safely
    const player = document.createElement("wistia-player");
    player.setAttribute("media-id", sanitizedVideoId);
    player.setAttribute("aspect", aspectValue);

    wistiaContainerRef.current.appendChild(player);
  }, [sanitizedVideoId, aspectValue]);

  useEffect(() => {
    // Load Wistia scripts
    const playerScript = document.createElement("script");
    playerScript.src = "https://fast.wistia.com/player.js";
    playerScript.async = true;
    document.head.appendChild(playerScript);

    const embedScript = document.createElement("script");
    embedScript.src = `https://fast.wistia.com/embed/${sanitizedVideoId}.js`;
    embedScript.async = true;
    embedScript.type = "module";
    document.head.appendChild(embedScript);

    // Listen for Wistia player events
    const handleWistiaReady = () => {
      const checkPlayer = setInterval(() => {
        const player = (window as any).Wistia?.api(sanitizedVideoId);
        if (player) {
          clearInterval(checkPlayer);
          playerRef.current = player;

          player.bind("play", () => {
            setIsPlaying(true);
          });

          player.bind("pause", () => {
            setIsPlaying(false);
          });

          player.bind("end", () => {
            setIsPlaying(false);
          });
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkPlayer), 10000);
    };

    playerScript.onload = handleWistiaReady;

    return () => {
      if (playerRef.current) {
        playerRef.current.unbind("play");
        playerRef.current.unbind("pause");
        playerRef.current.unbind("end");
      }
    };
  }, [sanitizedVideoId]);

  // Mobile layout - simplified, full width
  if (isMobile) {
    return (
      <div className="relative w-full">
        {/* Ambient glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-primary/15 to-primary/30 blur-2xl opacity-50" />

        {/* Main Video Frame */}
        <div className="relative z-10 rounded-xl overflow-hidden border border-primary/30 shadow-xl shadow-primary/20">
          <style>{`
            wistia-player[media-id='${sanitizedVideoId}']:not(:defined) {
              background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${sanitizedVideoId}/swatch');
              display: block;
              filter: blur(5px);
              padding-top: ${paddingTop};
            }
            wistia-player[media-id='${sanitizedVideoId}'] {
              display: block;
            }
          `}</style>
          <div ref={wistiaContainerRef} />
        </div>
      </div>
    );
  }

  // Vertical video layout (9:16) - clean, no decorative elements
  if (aspectRatio === "9:16") {
    return (
      <div className="relative w-full">
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <style>{`
            wistia-player[media-id='${sanitizedVideoId}']:not(:defined) {
              background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${sanitizedVideoId}/swatch');
              display: block;
              filter: blur(5px);
              padding-top: ${paddingTop};
            }
            wistia-player[media-id='${sanitizedVideoId}'] {
              display: block;
            }
          `}</style>
          <div ref={wistiaContainerRef} />
        </div>
      </div>
    );
  }

  // Desktop layout - simple and focused (16:9)
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Ambient glow behind video */}
      <div className="absolute -inset-8 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 blur-3xl opacity-60 animate-pulse" />
      <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-transparent blur-2xl" />

      {/* Main Video Frame */}
      <div className="relative z-10 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20">
        {/* Gradient overlay on edges */}
        <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl border border-white/10" />
        <div className="absolute -inset-px bg-gradient-to-br from-primary/20 via-transparent to-primary/10 pointer-events-none z-10 rounded-2xl" />

        <style>{`
          wistia-player[media-id='${sanitizedVideoId}']:not(:defined) {
            background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${sanitizedVideoId}/swatch');
            display: block;
            filter: blur(5px);
            padding-top: ${paddingTop};
          }
          wistia-player[media-id='${sanitizedVideoId}'] {
            display: block;
          }
        `}</style>
        <div ref={wistiaContainerRef} />
      </div>
    </div>
  );
};

export default WistiaVideo;
