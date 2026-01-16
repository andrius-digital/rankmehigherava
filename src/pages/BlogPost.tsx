import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Clock, Calendar, User, Twitter, Facebook, Linkedin, TrendingUp, BookOpen, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadMagnet from "@/components/blog/LeadMagnet";
import { blogPosts } from "@/data/blogPosts";
import ReactMarkdown from "react-markdown";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  // Split content for lead magnet insertion
  const contentParts = post.content.split("\n\n");
  const midPoint = Math.floor(contentParts.length / 2);
  const firstHalf = contentParts.slice(0, midPoint).join("\n\n");
  const secondHalf = contentParts.slice(midPoint).join("\n\n");

  return (
    <>
      <Helmet>
        <title>{post.title} | Rank Me Higher Blog</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <Navbar />
        
        {/* Article Header */}
        <article className="pt-28 pb-16 relative z-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            {/* Back Link */}
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all mb-8 font-orbitron text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all articles
            </Link>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-sm font-bold font-orbitron">
                {post.category}
              </span>
              {post.trending && (
                <span className="px-3 py-1.5 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 text-cyan-400 text-sm font-bold font-orbitron flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-orbitron font-black text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-white/10">
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-orbitron">
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <User className="w-4 h-4 text-primary" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <Calendar className="w-4 h-4 text-primary" />
                  {post.date}
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <Clock className="w-4 h-4 text-primary" />
                  {post.readTime}
                </span>
              </div>

              {/* Share */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-orbitron">Share:</span>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-white/10 transition-all">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-white/10 transition-all">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-white/10 transition-all">
                    <Linkedin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="py-12">
              {/* First half of content */}
              <div className="prose prose-lg prose-invert max-w-none
                prose-headings:font-orbitron prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:my-6 prose-ul:text-muted-foreground
                prose-li:my-2
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              ">
                <ReactMarkdown>{firstHalf}</ReactMarkdown>
              </div>

              {/* Lead Magnet */}
              <LeadMagnet />

              {/* Second half of content */}
              <div className="prose prose-lg prose-invert max-w-none
                prose-headings:font-orbitron prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:my-6 prose-ul:text-muted-foreground
                prose-li:my-2
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              ">
                <ReactMarkdown>{secondHalf}</ReactMarkdown>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="py-16 border-t border-white/10 relative z-10">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
              <h2 className="font-orbitron font-bold text-2xl text-foreground mb-8 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                Related Articles
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group block p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02]"
                  >
                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-muted-foreground text-xs font-bold font-orbitron mb-3">
                      {relatedPost.category}
                    </span>
                    <h3 className="font-orbitron font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {relatedPost.excerpt}
                    </p>
                    <span className="text-primary font-bold text-xs font-orbitron flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Article
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
