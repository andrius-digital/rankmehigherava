import { Link } from "react-router-dom";
import { ArrowRight, Clock, TrendingUp, Zap } from "lucide-react";
import { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogCard = ({ post, featured = false }: BlogCardProps) => {
  if (featured) {
    return (
      <Link 
        to={`/blog/${post.slug}`}
        className="group relative block overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative p-8 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-xs font-bold font-orbitron">
              {post.category}
            </span>
            {post.trending && (
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 text-cyan-400 text-xs font-bold font-orbitron flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Trending
              </span>
            )}
          </div>
          
          <h2 className="font-orbitron font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
            {post.title}
          </h2>
          
          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-orbitron">
              <span>{post.author}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>{post.date}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
            
            <span className="text-primary font-bold font-orbitron flex items-center gap-2 group-hover:gap-3 transition-all">
              Read Article
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02]"
    >
      {/* Animated gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -inset-px bg-gradient-to-br from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
      
      <div className="relative p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-muted-foreground text-xs font-bold font-orbitron">
            {post.category}
          </span>
          {post.trending && (
            <span className="px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
            </span>
          )}
          {post.featured && (
            <span className="px-2 py-1 rounded-full bg-primary/20 border border-primary/30">
              <Zap className="w-3 h-3 text-primary" />
            </span>
          )}
        </div>
        
        <h3 className="font-orbitron font-bold text-lg text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {post.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground font-orbitron">
          <span>{post.date}</span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
        
        {/* Read more indicator */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-orbitron">{post.author}</span>
          <span className="text-primary font-bold text-xs font-orbitron flex items-center gap-1 group-hover:gap-2 transition-all">
            Read
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
