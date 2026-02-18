import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Clock, Calendar, User, TrendingUp, BookOpen, ArrowRight, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadMagnet from "@/components/blog/LeadMagnet";
import { blogPosts } from "@/data/blogPosts";
import ReactMarkdown from "react-markdown";

const proseClasses = `
  prose prose-sm prose-invert max-w-none
  prose-headings:font-orbitron prose-headings:font-bold prose-headings:text-foreground prose-headings:scroll-mt-24
  prose-h2:text-base prose-h2:md:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/10
  prose-h3:text-sm prose-h3:md:text-base prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-red-400
  prose-p:text-muted-foreground/80 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-[13px] prose-p:md:text-sm
  prose-strong:text-foreground/90 prose-strong:font-medium
  prose-ul:my-3 prose-ul:text-muted-foreground/80 prose-ul:space-y-0.5
  prose-li:my-0 prose-li:text-[13px] prose-li:md:text-sm prose-li:leading-relaxed
  prose-ol:my-3 prose-ol:text-muted-foreground/80 prose-ol:space-y-0.5
  prose-a:text-red-400 prose-a:underline prose-a:underline-offset-2 prose-a:decoration-red-400/30 hover:prose-a:decoration-red-400
  prose-img:rounded-lg prose-img:border prose-img:border-white/10 prose-img:shadow-lg prose-img:my-5
  prose-blockquote:border-l-2 prose-blockquote:border-red-500/50 prose-blockquote:bg-red-500/5 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-5 prose-blockquote:not-italic prose-blockquote:text-[13px]
  prose-table:border prose-table:border-white/10 prose-table:rounded-lg prose-table:overflow-hidden
  prose-th:bg-white/10 prose-th:p-2.5 prose-th:text-left prose-th:font-orbitron prose-th:text-[10px] prose-th:uppercase prose-th:tracking-wider
  prose-td:p-2.5 prose-td:border-t prose-td:border-white/10 prose-td:text-xs
  prose-hr:border-white/10 prose-hr:my-6
  prose-em:text-muted-foreground/70
`;

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  const contentParts = post.content.split("\n\n");
  const midPoint = Math.floor(contentParts.length / 2);
  const firstHalf = contentParts.slice(0, midPoint).join("\n\n");
  const secondHalf = contentParts.slice(midPoint).join("\n\n");

  const shareUrl = `https://rankmehigher.io/blog/${post.slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | Rank Me Higher Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="author" content={post.author} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        {post.image && <meta property="og:image" content={post.image} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        {post.image && <meta name="twitter:image" content={post.image} />}
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        <link rel="canonical" href={shareUrl} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "author": { "@type": "Person", "name": post.author },
          "datePublished": post.date,
          "publisher": { "@type": "Organization", "name": "Rank Me Higher" },
          "image": post.image || "",
          "mainEntityOfPage": { "@type": "WebPage", "@id": shareUrl }
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <Navbar />
        
        <article className="pt-24 md:pt-28 pb-12 relative z-10">
          <div className="container mx-auto px-4 max-w-2xl">

            <div className="flex items-center justify-between mb-5">
              <Link 
                to="/blog"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to Blog</span>
              </Link>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground text-[10px] hover:text-foreground hover:border-white/20 transition-all"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-[10px] font-bold font-orbitron">
                {post.category}
              </span>
              {post.trending && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold font-orbitron flex items-center gap-1">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Trending
                </span>
              )}
            </div>

            <h1 className="font-orbitron font-black text-xl sm:text-2xl md:text-3xl text-foreground mb-3 leading-tight">
              {post.title}
            </h1>

            <p className="text-sm text-muted-foreground/80 mb-4 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground/60 pb-5 border-b border-white/[0.06] mb-6">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-red-400/60" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-red-400/60" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-400/60" />
                {post.readTime}
              </span>
            </div>

            {post.image && (
              <div className="rounded-xl overflow-hidden border border-white/10 shadow-xl mb-8">
                <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
              </div>
            )}

            <div className={proseClasses}>
              <ReactMarkdown>{firstHalf}</ReactMarkdown>
            </div>

            <LeadMagnet />

            <div className={proseClasses}>
              <ReactMarkdown>{secondHalf}</ReactMarkdown>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-orbitron font-bold text-sm">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{post.author}</p>
                  <p className="text-xs text-muted-foreground">Rank Me Higher</p>
                </div>
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                More articles
              </Link>
            </div>

          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="py-10 border-t border-white/10 relative z-10">
            <div className="container mx-auto px-4 max-w-2xl">
              <h2 className="font-orbitron font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red-400" />
                Keep Reading
              </h2>
              
              <div className="space-y-4">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/20 hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground text-[10px] font-bold font-orbitron mb-2">
                        {relatedPost.category}
                      </span>
                      <h3 className="font-orbitron font-bold text-sm text-foreground mb-1 group-hover:text-red-400 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-red-400 shrink-0 mt-2 group-hover:translate-x-0.5 transition-all" />
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
