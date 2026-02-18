import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, Zap, Calendar, Phone, Search, BookOpen, Newspaper } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/blog/BlogCard";
import { Input } from "@/components/ui/input";
import { blogPosts, categories } from "@/data/blogPosts";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPosts = blogPosts.filter(post => post.featured).reverse();
  const trendingPosts = blogPosts.filter(post => post.trending);
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Helmet>
        <title>SEO Insights & Local Marketing Tips | Rank Me Higher Blog</title>
        <meta name="description" content="Get the latest SEO strategies, local marketing tips, and Google Maps ranking secrets. Free insights from Chicago's top local SEO experts." />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <Navbar />
        
        {/* Hero Section - Compact Design */}
        <section className="pt-24 pb-6 lg:pt-28 lg:pb-8">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-10 lg:items-center">
              
              {/* LEFT SIDE - Content & Search */}
              <div className="space-y-4 text-center lg:text-left">
                {/* Badge */}
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20">
                    <Newspaper className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary font-orbitron">Knowledge Hub</span>
                  </div>
                </div>
                
                {/* Headline */}
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-[1.1] font-orbitron tracking-tight">
                    <span className="text-foreground">SEO Insights That</span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary">
                      Actually Rank
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto lg:mx-0">
                    Proven strategies and insider tips from the team that's helped <strong>500+ businesses</strong> dominate their market.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm mx-auto lg:mx-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 h-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-orbitron text-xs"
                  />
                </div>

                {/* CTA Buttons */}
                <div className="hidden lg:flex flex-row gap-3">
                  <a
                    href="https://calendly.com/rankmehigher/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative px-4 py-2 rounded-lg bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-xs shadow-lg hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 font-orbitron overflow-hidden"
                  >
                    <div className="relative flex items-center gap-2">
                      <Phone className="w-3 h-3 text-red-400" />
                      <span>Talk to Expert</span>
                    </div>
                  </a>
                  <a
                    href="#articles"
                    className="group relative px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-xs hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-orbitron overflow-hidden"
                  >
                    <span className="relative flex items-center gap-2">
                      <BookOpen className="w-3 h-3" />
                      Browse Articles
                    </span>
                  </a>
                </div>

                {/* Category Pills - Desktop */}
                <div className="hidden lg:flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/40">
                  {categories.slice(0, 5).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-300 font-orbitron ${
                        selectedCategory === category
                          ? "bg-primary/20 border border-primary/40 text-primary"
                          : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE - Featured Article */}
              <div className="relative lg:order-last">
                {featuredPosts[0] && (
                  <Link 
                    to={`/blog/${featuredPosts[0].slug}`}
                    className="group relative block overflow-hidden rounded-xl bg-white/5 backdrop-blur-md border border-primary/30 hover:border-primary/50 transition-all duration-500 shadow-xl shadow-primary/10 hover:shadow-primary/20"
                  >
                    {/* Glow effects */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-red-600/20 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                    
                    <div className="relative">
                      {/* Featured Badge */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className="px-2 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold font-orbitron flex items-center gap-1 shadow-lg">
                          <Zap className="w-2.5 h-2.5" />
                          Featured
                        </span>
                      </div>
                      
                      {/* Image */}
                      <div className="aspect-[16/9] overflow-hidden">
                        <img 
                          src={featuredPosts[0].image} 
                          alt={featuredPosts[0].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-muted-foreground text-[10px] font-orbitron">
                            {featuredPosts[0].category}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-orbitron">
                            {featuredPosts[0].readTime}
                          </span>
                        </div>
                        
                        <h2 className="font-orbitron font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                          {featuredPosts[0].title}
                        </h2>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <span className="text-[10px] text-muted-foreground font-orbitron">{featuredPosts[0].author}</span>
                          <span className="flex items-center gap-1 text-primary font-bold text-[10px] font-orbitron group-hover:gap-2 transition-all">
                            Read
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              {/* Mobile Only: CTA Below */}
              <div className="lg:hidden">
                <a
                  href="#articles"
                  className="group w-full px-6 py-3 rounded-lg bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-sm shadow-lg hover:bg-red-500/20 active:scale-95 transition-all duration-300 font-orbitron flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-red-400" />
                  <span>Browse All Articles</span>
                </a>
              </div>
            </div>
          </div>
        </section>
        
        {/* Trending Bar */}
        <div className="py-3 border-y border-white/10">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1.5 text-cyan-400 shrink-0">
                <TrendingUp className="w-3 h-3" />
                <span className="font-bold text-[10px] uppercase font-orbitron">Trending</span>
              </div>
              {trendingPosts.slice(0, 4).map((post, index) => (
                <Link 
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="flex items-center gap-2 shrink-0 group"
                >
                  <span className="text-sm font-black text-primary/40 font-orbitron">0{index + 1}</span>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 max-w-[180px]">
                    {post.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="py-4 bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
            <div className="flex items-center justify-center gap-6 lg:gap-12 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-muted-foreground font-orbitron">
                  <span className="text-foreground font-bold">50+</span> Articles Published
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-xs text-muted-foreground font-orbitron">
                  <span className="text-foreground font-bold">Weekly</span> New Content
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground font-orbitron">
                  <span className="text-foreground font-bold">Real</span> Case Studies
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs text-muted-foreground font-orbitron">
                  <span className="text-foreground font-bold">Actionable</span> Tips
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <section id="articles" className="py-6 border-t border-white/10">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 font-orbitron ${
                    selectedCategory === category
                      ? "bg-primary/20 backdrop-blur-md border border-primary/40 text-primary shadow-lg shadow-primary/20"
                      : "bg-white/5 backdrop-blur-md border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* All Articles Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-orbitron font-bold text-xl text-foreground flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary" />
                {selectedCategory === "All" ? "All Articles" : selectedCategory}
                <span className="text-sm text-muted-foreground font-normal">({filteredPosts.length})</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-orbitron">No articles found. Try a different search or category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA - Futuristic Design */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500/10 via-primary/10 to-red-500/10 backdrop-blur-xl border border-red-500/20 p-10 md:p-14 text-center shadow-2xl">
              {/* Animated glow effects */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-red-500/20 to-primary/20 rounded-3xl blur-xl opacity-50" />
              
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(239,68,68,0.3) 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }} />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 mb-6">
                  <Sparkles className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 text-sm font-bold font-orbitron">Limited Spots Available</span>
                </div>
                
                <h2 className="font-orbitron font-black text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
                  Ready to <span className="text-primary">Rank #1</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Stop reading about SEO and start seeing results. Get a free audit and discover what's holding your business back.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => window.open('https://calendly.com/andrius-cdlagency/andrius-digital-asap-meeting', '_blank')}
                    className="group relative px-8 py-4 rounded-2xl bg-red-500/10 backdrop-blur-md border border-red-500/30 text-white font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 transition-all duration-500" />
                    <div className="relative flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-red-400" />
                      <span>Book a Call Today</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                  
                  <a 
                    href="https://calendly.com/rankmehigher/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-base hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] transition-all duration-300 font-orbitron overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                    <div className="relative flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      <span>Book a Call</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
