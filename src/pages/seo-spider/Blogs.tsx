import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Search, Edit, Eye, Trash2, Calendar, Clock, Sparkles, MapPin, Globe, Tag, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Separator } from '@/components/ui/separator';

import { supabase } from "@/integrations/supabase/client";

const Blogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('csc-northbrook');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('https://concreteshieldcoatingsinc.com'); // Default for demo
  const [brandContext, setBrandContext] = useState<any>(null); // Store scraped data
  const [showAnalysis, setShowAnalysis] = useState(false);

  // State for Real DB Clients
  const [clients, setClients] = useState<any[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // Fetch clients on mount
  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase.from('clients').select('*');
        if (error) throw error;
        setClients(data || []);
        // Set default if none selected
        if (data && data.length > 0 && selectedLocation === 'csc-northbrook') {
          setSelectedLocation(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        setIsLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  // Sync Brand Context when Location Changes
  React.useEffect(() => {
    if (selectedLocation && clients.length > 0) {
      const client = clients.find(c => c.id === selectedLocation);
      if (client) {
        setBrandContext(client);
        // Auto-fill URL for convenience
        if (client.website_url) setWebsiteUrl(client.website_url);
      }
    }
  }, [selectedLocation, clients]);

  // --- 1. PRO BLOG ARCHITECTURE INTERFACES ---

  interface BlogSection {
    heading: string;         // H2 heading
    content: string[];       // 2-4 paragraphs
    image?: string;          // Optional image URL
    imageAlt?: string;       // SEO Alt text
    imagePrompt?: string;    // AI prompt
  }

  interface BlogPost {
    // System Fields
    id: string;
    status: 'published' | 'draft' | 'scheduled';
    views: number;

    // SEO Fields
    title: string;
    slug: string;
    excerpt: string;
    keywords: string[];

    // Content Fields
    intro: string[];         // Exactly 2 paragraphs
    sections: BlogSection[]; // 5-7 sections
    conclusion: string[];    // Exactly 2 paragraphs

    // Media & Metadata
    heroImage: string;
    category: string;
    date: string;
    readTime: string;
    author: string;
    wordCount: number;       // Keep for analytics
  }

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);

  // Helper to get current client details for UI
  const currentClient = clients.find(c => c.id === selectedLocation) || clients[0];
  const locations = clients.map(c => ({
    id: c.id,
    name: c.company_name || c.name,
    city: typeof c.location_data === 'object' ? (c.location_data as any)?.city : 'Unknown City',
  }));

  // --- 3. USER PROVIDED ALGORITHMS ---

  // Internal Linking Parser
  // Converts string content with <a href> to React Router Links (simplified for this demo to just return nodes)
  const renderContentWithLinks = (content: string) => {
    // Regex to match <a href='...'>...</a> OR <a href="...">...</a>
    const linkRegex = /<a href=['"]([^'"]+)['"]>([^<]+)<\/a>/g;
    const elements: React.ReactNode[] = [];
    let match;
    let lastIndex = 0;

    // We need to clone the regex for exec loop, or just use matchAll (modern)
    // using while loop for classic support
    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        // Push preceding text as HTML (careful with XSS in real app, but here assuming trusted AI output)
        elements.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: content.substring(lastIndex, match.index) }} />);
      }
      // Push the link
      elements.push(
        <a key={`link-${match.index}`} href={match[1]} className="text-primary hover:underline font-medium cursor-pointer">
          {match[2]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    // Push remaining text
    if (lastIndex < content.length) {
      elements.push(<span key={`text-end`} dangerouslySetInnerHTML={{ __html: content.substring(lastIndex) }} />);
    }
    return elements.length > 0 ? elements : <span dangerouslySetInnerHTML={{ __html: content }} />;
  };

  // People Also Read Algorithm
  const getPeopleAlsoRead = (currentSlug: string, category: string) => {
    // Get posts from same category (excluding current)
    const sameCategoryPosts = blogPosts.filter(p => p.slug !== currentSlug && p.category === category);

    // Get posts from other categories
    const otherPosts = blogPosts.filter(p => p.slug !== currentSlug && p.category !== category);

    // Return 2 same category + 1 different (with fallback)
    const result = [...sameCategoryPosts.slice(0, 2), ...otherPosts.slice(0, 1)];

    // Fill with remaining if needed
    if (result.length < 3) {
      const remaining = blogPosts
        .filter(p => (p.slug || '') !== currentSlug && !result.includes(p))
        .slice(0, 3 - result.length);
      result.push(...remaining);
    }

    return result.slice(0, 3);
  };

  // --- 2. FALLBACK GENERATOR (OFFLINE MODE) ---
  const generateOffTintLongFormPost = (locationId: string, context?: any): BlogPost => {
    // Use context from DB which has: primary_services, location_data, company_name, brand_voice
    const city = context?.location_data?.city || 'your local area';
    const companyName = context?.company_name || context?.name || 'our team';

    // Extract dynamic topic
    const serviceList = context?.primary_services || ['Professional Floor Coatings', 'Garage Floor Epoxy', 'Basement Coatings'];
    const randomIndex = Math.floor(Math.random() * serviceList.length);
    const mainTopic = serviceList[randomIndex];

    // IMAGE ASSETS
    const ceramicImage = "/ceramic_coating_wet_look_1766952839376.png";
    const ppfImage = "/ppf_installation_pro_1766952852897.png";
    const interiorImage = "/interior_detailing_luxury_1766952867542.png";

    // Select image based on topic keywords
    let displayImg = ceramicImage;
    if (mainTopic.toLowerCase().includes('epoxy') || mainTopic.toLowerCase().includes('floor')) displayImg = ppfImage;
    if (mainTopic.toLowerCase().includes('basement') || mainTopic.toLowerCase().includes('concrete')) displayImg = interiorImage;

    const title = `The Ultimate Guide to ${mainTopic} in ${city}: Is It Worth It?`;
    const slug = `${mainTopic.toLowerCase().replace(/\s+/g, '-')}-guide-${city.toLowerCase().replace(/\s+/g, '-')}`;

    return {
      id: String(Date.now()),
      status: 'draft',
      views: 0,

      // SEO
      title: title,
      slug: slug,
      excerpt: `Discover why ${mainTopic} is essential for ${city} homeowners. Learn about durability, maintenance, and long-term value from the local experts at ${companyName}.`,
      keywords: [mainTopic, 'floor coating', city, 'professional', companyName],

      // Metadata
      category: mainTopic,
      date: new Date().toISOString().split('T')[0],
      readTime: "8 min read",
      author: companyName,
      heroImage: displayImg,
      wordCount: 1842,

      // Content Structure
      intro: [
        `If you live in <strong>${city}</strong>, you know the toll that temperature swings and moisture can take on your concrete surfaces. From hot summers to freezing winters, your garage and basement floors are under constant stress. For homeowners in the ${city} area, the question often arises: <em>"Is a basic sealant enough, or do I need professional ${mainTopic}?"</em>`,
        `At <strong>${companyName}</strong>, we believe in delivering lasting solutions, not quick fixes. Today, we are going deep into the benefits of <span class="text-primary font-semibold">${mainTopic}</span>. We will explain exactly what it is, how it protects your investment, and why it has become the gold standard for ${city} homes.`
      ],

      sections: [
        {
          heading: `Understanding ${mainTopic}`,
          content: [
            `To understand why ${mainTopic} is superior, we have to look close—at the molecular level. Traditional concrete sealers sit on top of your floor. They provide some protection, but they can peel and wear down quickly under heavy use.`,
            `Professional ${mainTopic} from <strong>${companyName}</strong> is different. It chemically bonds with the concrete substrate, creating a seamless, rock-hard surface that won't separate or delaminate.`,
            `This creates a permanent layer that is significantly tougher than a bare concrete slab. While DIY products might last a few years in ${city}'s climate, our professional systems are backed by extensive warranties.`
          ],
          image: displayImg,
          imageAlt: `Close up of ${mainTopic} application on concrete floor`,
          imagePrompt: `Close up detail shot of ${mainTopic} texture, industrial flooring context`
        },
        {
          heading: "The Showroom Shine: Aesthetics Meet Durability",
          content: [
            `Beyond protection, there is the aesthetics. A professionally coated floor creates a stunning, high-gloss finish that transforms any space. Decorative flakes and color options allow you to customize the look to match your style.`,
            `Homeowners in ${city} often remark on how a coated floor makes their garage feel like a true extension of their home. It reflects light, brightens the space, and makes cleaning effortless.`,
            `"The transformation ${companyName} achieved wasn't just functional—it was beautiful. Our garage is now our favorite room in the house."`
          ],
          image: interiorImage,
          imageAlt: "Shiny garage floor with decorative flakes",
          imagePrompt: "Luxury garage interior with high gloss epoxy floor, showroom quality"
        },
        {
          heading: "Easy Maintenance: The Low-Effort Payoff",
          content: [
            `One of the biggest benefits of ${mainTopic} is how easy it is to maintain. The seamless, non-porous surface means that oil, grease, and road salt can be wiped away in seconds.`,
            `Unlike bare concrete that stains permanently, a coated floor stays pristine with minimal effort. A quick sweep and occasional mop is all it takes.`,
            `For busy homeowners in <strong>${city}</strong>, this low-maintenance aspect is often the deciding factor. You get a showroom-quality floor without the showroom-level upkeep.`
          ]
        },
        {
          heading: `Is ${mainTopic} Right for Your Home?`,
          content: [
            `Investing in ${mainTopic} is a smart decision for any homeowner looking to protect and enhance their concrete surfaces. It requires professional preparation to ensure proper adhesion and longevity.`,
            `If you plan to stay in your home for more than a few years, or if you simply want a garage, basement, or patio that looks incredible year after year, the answer is yes. ${mainTopic} protects against staining, cracking, and the general wear-and-tear of ${city} living.`
          ],
          image: ppfImage,
          imageAlt: "Durability demonstration on coated floor",
          imagePrompt: "Durability test on epoxy floor, hammer or heavy object, commercial grade"
        }
      ],

      conclusion: [
        `Your home is your biggest investment. Protecting it shouldn't be an afterthought. Whether you're upgrading your garage, basement, or commercial space, <strong>${companyName}</strong> has a ${mainTopic} solution tailored to your needs.`,
        `Don't settle for less. Experience the best ${mainTopic} in ${city}. <br/><br/><span class="text-primary font-bold hover:underline cursor-pointer">Contact us today to schedule your free consultation.</span>`
      ]
    };
  };


  // Sync Brand Context when Location Changes
  React.useEffect(() => {
    if (selectedLocation && clients.length > 0) {
      const client = clients.find(c => c.id === selectedLocation);
      if (client) {
        setBrandContext(client);
        // Auto-fill URL for convenience
        if (client.website_url) setWebsiteUrl(client.website_url);
      }
    }
  }, [selectedLocation, clients]);

  const handleAnalyzeWebsite = async () => {
    setIsAnalyzing(true);
    toast.info(`Analyzing ${websiteUrl} for brand DNA...`);
    try {
      // 1. Call Edge Function to Scrape & Analyze
      const { data: analysisResult, error: funcError } = await supabase.functions.invoke('analyze-website', {
        body: { websiteUrl }
      });

      if (funcError) throw funcError;
      if (analysisResult.error) throw new Error(analysisResult.error);

      console.log("Analysis Result:", analysisResult);

      // 2. Save/Upsert to 'clients' table
      const newClient = {
        name: analysisResult.company_name, // Map company_name -> name for internal usage
        company_name: analysisResult.company_name,
        website_url: websiteUrl,
        brand_voice: analysisResult.brand_voice,
        primary_services: analysisResult.primary_services,
        target_audience: analysisResult.target_audience,
        location_data: analysisResult.location_data,
        status: 'active'
      };

      // Check if client exists by url to update, otherwise insert
      const { data: savedClient, error: dbError } = await supabase
        .from('clients')
        .upsert(newClient, { onConflict: 'website_url' })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Update Local State
      setBrandContext(savedClient); // Set current context immediately
      setShowAnalysis(true);

      // Refresh list and select new client
      setClients(prev => {
        const exists = prev.find(c => c.id === savedClient.id);
        if (exists) return prev.map(c => c.id === savedClient.id ? savedClient : c);
        return [...prev, savedClient];
      });
      setSelectedLocation(savedClient.id);

      toast.success("Client Onboarded Successfully!", {
        description: `Modeled '${savedClient.company_name}' with ${savedClient.primary_services?.length} services.`
      });

    } catch (err: any) {
      console.error("Analysis failed:", err);
      toast.error("Analysis failed", { description: err.message });
      // Fallback removed - we demand real data now as per user request
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    const location = locations.find(l => l.id === selectedLocation);
    setIsGenerating(true);

    // Construct Prompt with STRICT Architecture
    // Get city from the client's stored location_data
    const clientCity = brandContext?.location_data?.city || 'your local area';
    const clientName = brandContext?.company_name || brandContext?.name || 'the business';
    // Fallback: If no services, try to infer from company name context, or use defaults
    let clientServices = brandContext?.primary_services || [];
    if (clientServices.length === 0) {
      const lowerName = clientName.toLowerCase();
      if (lowerName.includes('floor') || lowerName.includes('garage') || lowerName.includes('concrete') || lowerName.includes('coat')) {
        clientServices = ['Concrete Floor Coatings', 'Garage Epoxy', 'Basement Flooring'];
        toast.warning(`No services found for ${clientName}. Inferred "Concrete Coatings" context.`);
      } else if (lowerName.includes('tint') || lowerName.includes('auto') || lowerName.includes('detail') || lowerName.includes('ppf')) {
        clientServices = ['Window Tinting', 'Ceramic Coating', 'Paint Protection Film'];
        toast.warning(`No services found for ${clientName}. Inferred "Auto Protection" context.`);
      }
    }

    const clientVoice = brandContext?.brand_voice || 'Professional';
    const targetAudience = brandContext?.target_audience || 'Local Homeowners';

    // Dynamic Category Map for Internal Linking
    // (In a real app, these would come from the router/pages)
    const serviceLinks = clientServices.reduce((acc: any, service: string) => {
      const slug = service.toLowerCase().replace(/\s+/g, '-');
      acc[service] = `/services/${slug}`;
      return acc;
    }, {});

    let promptText = "";

    if (clientServices.length > 0) {
      // SMART GENERATION - Use real client data
      const randomService = clientServices[Math.floor(Math.random() * clientServices.length)];
      promptText = `
        SYSTEM PROMPT:
        You are an expert content writer for '${clientName}', a premium service provider in ${clientCity}.
        Target Audience: ${targetAudience}
        Brand Voice: ${clientVoice}

        WRITING GUIDELINES:
        - Professional but accessible tone
        - Include local references to neighborhoods or landmarks in ${clientCity}
        - Use HTML anchor tags for internal links where naturally relevant: <a href='/path'>text</a>. Available links: ${JSON.stringify(serviceLinks)}
        - Be educational and build trust. Avoid fluff.
        - CRITICAL: Determine if industry is AUTO or HOME based on service "${randomService}" and write specifically for that niche.

        TASK:
        Write a structured blog post about "${randomService}".

        OUTPUT FORMAT (JSON ONLY):
        You must output a single JSON object matching this TypeScript interface exactly:
        {
          "title": "string (SEO optimized, <60 chars)",
          "slug": "string (url-friendly)",
          "excerpt": "string (meta description, 150-160 chars)",
          "keywords": ["string", "string"],
          "intro": ["paragraph 1 (hook)", "paragraph 2 (context)"],
          "sections": [
            {
              "heading": "string (H2)",
              "content": ["paragraph 1", "paragraph 2", "paragraph 3"],
              "imagePrompt": "string (detailed photography description for DALL-E/Imagen)",
              "imageAlt": "string (SEO alt text)"
            }
          ],
          "conclusion": ["paragraph 1 (summary)", "paragraph 2 (CTA)"],
          "category": "string (one of the services)",
          "readTime": "string (e.g. '8 min read')",
          "author": "string (Client Name or Team)"
        }

        REQUIREMENTS:
        - 5-7 Sections minimum.
        - High-quality image prompts for EVERY section (used for generation).
        - JSON must be valid and parseable.
      `;
      toast.info(`Generating Pro Article: "${randomService}" for ${clientName}...`);
    } else {
      // Fallback prompt for no context
      promptText = "Generate a generic SEO blog post about 'Home Maintenance' in JSON format with title, intro (array), sections (array of heading/content/imagePrompt), conclusion (array).";
      toast.info(`Acting as Senior Copywriter for ${clientName}...`);
    }

    try {
      console.log("Calling Gemini API directly...");
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("API Key missing. Please restart dev server.");
      }

      // Helper to call API with specific model
      const callGemini = async (model: string) => {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          }),
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`${response.status}: ${errText}`);
        }
        return response.json();
      };

      let data;
      try {
        // Try the latest available model found in the list (Gemini 2.0 Flash Experimental)
        data = await callGemini('gemini-2.0-flash-exp');
      } catch (flashError) {
        console.warn("Gemini 2.0 Flash Exp failed, trying fallback to 1.5 Flash...", flashError);
        try {
          // Fallback to standard 1.5 Flash
          data = await callGemini('gemini-1.5-flash');
        } catch (fallbackError) {
          console.error("All Gemini models failed. Primary Error:", flashError, "Fallback Error:", fallbackError);
          throw new Error(`All models failed. Primary Error: ${flashError}`);
        }
      }

      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawOutput) throw new Error("No text returned from Gemini");

      // Parse JSON
      const cleanJson = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed && parsed.title) {
        toast.info("Text structure validated. Generating unique images...", { description: "Running parallel generation..." });

        // Helper into separate function to be cleaner
        const generateImage = async (prompt: string): Promise<string> => {
          if (!prompt) return "/ceramic_coating_wet_look_1766952839376.png";
          try {
            const { data, error } = await supabase.functions.invoke('generate-blog-image', {
              body: { prompt, runOffline: false }
            });
            if (error || !data.imageUrl) return "/ceramic_coating_wet_look_1766952839376.png";
            return data.imageUrl;
          } catch {
            return "/ceramic_coating_wet_look_1766952839376.png";
          }
        };

        // 1. Generate Hero Image (from first section or custom prompt logic)
        // For Pro Architecture, ideally we'd have a specific hero prompt, but using first section's prompt is a safe fallback if missing
        const heroPrompt = parsed.sections[0]?.imagePrompt + " hero shot, wide angle, cinematic lighting";
        const heroImagePromise = generateImage(heroPrompt);

        // 2. Generate Section Images (Limit to first 3 to prevent timeouts/costs)
        const sectionsWithImagesPromise = Promise.all(parsed.sections.map(async (section: any, index: number) => {
          if (index < 3 && section.imagePrompt) {
            return {
              ...section,
              image: await generateImage(section.imagePrompt)
            };
          }
          return { ...section, image: undefined };
        }));

        const [heroImgUrl, finalSections] = await Promise.all([heroImagePromise, sectionsWithImagesPromise]);

        toast.success("Pro Article Generated Successfully!", { description: `Topic: ${parsed.title}` });
        const newPost: BlogPost = {
          id: String(Date.now()),
          status: 'draft',
          views: 0,

          title: parsed.title,
          slug: parsed.slug || parsed.title.toLowerCase().replace(/\s+/g, '-'),
          excerpt: parsed.excerpt || parsed.seo?.metaDescription || "No excerpt generated.",
          keywords: parsed.keywords || parsed.seo?.keywords || [],

          category: parsed.category || 'General',
          date: new Date().toISOString().split('T')[0],
          readTime: parsed.readTime || '5 min read',
          author: parsed.author || clientName,
          heroImage: heroImgUrl,
          wordCount: typeof parsed.content === 'string' ? parsed.content.split(/\s+/).length : 1500,

          intro: parsed.intro,
          sections: finalSections,
          conclusion: parsed.conclusion
        };

        // 4. Save to Database
        try {
          const { error: saveError } = await supabase.from('blog_posts').insert({
            client_id: selectedLocation,
            title: newPost.title,
            category: newPost.category,
            status: 'draft',
            content: {
              intro: newPost.intro,
              sections: newPost.sections,
              conclusion: newPost.conclusion
            },
            seo_metadata: {
              metaTitle: newPost.excerpt, // Using excerpt as metaTitle for now, as parsed.seo is not available
              metaDescription: newPost.excerpt, // Using excerpt as metaDescription for now
              slug: newPost.slug,
              keywords: newPost.keywords
            },
            image_url: newPost.heroImage, // Use heroImage for display
            word_count: newPost.wordCount,
            scheduled_date: null
          });
          if (saveError) {
            console.error("Failed to save draft:", saveError);
            toast.error("Draft saved locally only (DB Error)");
          } else {
            toast.success("Draft saved to database!");
          }
        } catch (dbErr) {
          console.error("DB Save Exception:", dbErr);
        }

        setBlogPosts([newPost, ...blogPosts]);
      } else {
        throw new Error("Invalid structure from AI");
      }

    } catch (err: any) {
      console.error("Generation failed:", err);

      const isQuotaError = String(err).includes("429") || String(err).includes("RESOURCE_EXHAUSTED");
      const errorMessage = isQuotaError
        ? "AI Quota Exceeded. Switching to premium offline generator..."
        : "AI Connection Issue. Switching to premium offline generator...";

      toast.warning("AI Mode Unavailable", { description: errorMessage });

      // Fallback to Pro Mock with context
      setTimeout(() => {
        const newPost = generateOffTintLongFormPost(selectedLocation, brandContext);
        setBlogPosts([newPost, ...blogPosts]);
        toast.success("Generated Context-Aware Article (Offline Mode)", { description: "Using extracted website data" });
      }, 1500);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredPosts = blogPosts.filter((post) => post.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = [
    { label: 'Total Posts', value: '24', icon: FileText, color: 'text-primary' },
    { label: 'Total Views', value: '12.5K', icon: Eye, color: 'text-cyan-400' },
    { label: 'Scheduled', value: '3', icon: Calendar, color: 'text-green-500' },
    { label: 'Drafts', value: '5', icon: Clock, color: 'text-yellow-500' },
  ];

  return (
    <>
      <Helmet>
        <title>Blogs | AVA SEO</title>
        <meta name="description" content="Create and manage AI-generated blog content for your business." />
      </Helmet>
      <DashboardLayout>
        <PageHeader title="Blog Management" description="Professional AI Copywriter & Blog Generator" icon={FileText}>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://client-site.com"
                className="w-[200px] bg-background border-primary/20"
              />
              <Button variant="outline" onClick={handleAnalyzeWebsite} disabled={isAnalyzing} className="bg-card/20 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/40 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50">
                {isAnalyzing ? <Clock className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8 mx-2 bg-border/50" />

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[280px] bg-background border-primary/20">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{loc.name}</span>
                      <span className="text-xs text-muted-foreground">{loc.address}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isGenerating ? 'Generating...' : 'Generate Pro Article'}
            </Button>
          </div>
        </PageHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-red-600/20 flex items-center justify-center">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <TabsList className="bg-secondary/50 border border-border/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Posts</TabsTrigger>
                <TabsTrigger value="published" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Published</TabsTrigger>
                <TabsTrigger value="drafts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Drafts</TabsTrigger>
              </TabsList>
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-secondary/30 border-border/50" />
              </div>
            </div>

            <TabsContent value="all" className="space-y-3">
              {filteredPosts.map((post, index) => (
                <Card key={post.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <Badge className={post.status === 'published' ? 'bg-green-500/10 text-green-500' : post.status === 'scheduled' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-muted text-muted-foreground'}>
                            {post.status}
                          </Badge>
                          {post.wordCount > 1500 && (
                            <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                              Long Form
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{post.date}</span>
                          <span>{post.category}</span>
                          {post.wordCount > 0 && <span>{post.wordCount} words</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/10 hover:text-primary"
                          onClick={() => setViewingPost(post)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            {/* ... */}
          </Tabs>
        </div>



        {/* PRO View Post Modal */}
        {viewingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <Card className="w-full max-w-6xl h-[90vh] flex overflow-hidden bg-card border-border shadow-2xl">
              <Helmet>
                {/* Primary Meta Tags */}
                <title>{viewingPost.title} | {brandContext?.company_name || 'Brand Blog'}</title>
                <meta name="description" content={viewingPost.excerpt} />
                <meta name="keywords" content={viewingPost.keywords?.join(", ")} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={viewingPost.title} />
                <meta property="og:description" content={viewingPost.excerpt} />
                <meta property="og:image" content={viewingPost.heroImage} />
                <meta property="article:published_time" content={viewingPost.date} />
                <meta property="article:section" content={viewingPost.category} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={viewingPost.title} />
                <meta name="twitter:description" content={viewingPost.excerpt} />
                <meta name="twitter:image" content={viewingPost.heroImage} />

                {/* Schema.org JSON-LD */}
                <script type="application/ld+json">
                  {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": viewingPost.title,
                    "description": viewingPost.excerpt,
                    "image": viewingPost.heroImage,
                    "author": {
                      "@type": "Organization",
                      "name": viewingPost.author || brandContext?.company_name || "Brand Name",
                    },
                    "publisher": {
                      "@type": "Organization",
                      "name": brandContext?.company_name || "Brand Name",
                      "logo": {
                        "@type": "ImageObject",
                        "url": brandContext?.website_url ? `${brandContext.website_url}/logo.png` : "",
                      },
                    },
                    "datePublished": viewingPost.date,
                    "mainEntityOfPage": {
                      "@type": "WebPage",
                      "@id": `https://${brandContext?.website_url || 'domain.com'}/blog/${viewingPost.slug}`
                    }
                  })}
                </script>
              </Helmet>

              {/* Left Sidebar: SEO & Metadata */}
              <div className="w-80 border-r border-border/50 bg-secondary/10 p-6 overflow-y-auto hidden lg:block">
                <Button variant="ghost" className="mb-6 -ml-2" onClick={() => setViewingPost(null)}>← Back</Button>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> SEO Analysis
                    </h4>
                    <div className="space-y-4">
                      <div className="p-3 bg-background rounded-lg border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Meta Title</p>
                        <p className="text-sm font-medium leading-tight text-cyan-400">{viewingPost.title}</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Meta Description</p>
                        <p className="text-sm leading-snug">{viewingPost.excerpt || "No description generated."}</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">URL Slug</p>
                        <p className="text-sm font-mono text-green-500">/{viewingPost.slug || "post-url"}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingPost.keywords?.map(k => (
                        <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Assets
                    </h4>
                    <div className="space-y-2">
                      {viewingPost.heroImage && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50">
                          <img src={viewingPost.heroImage} alt="Main Article Image" className="object-cover w-full h-full" />
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto relative bg-background">
                <div className="absolute top-4 right-4 lg:hidden">
                  <Button variant="ghost" size="icon" onClick={() => setViewingPost(null)}>✕</Button>
                </div>

                <div className="max-w-3xl mx-auto p-8 lg:p-12">
                  {/* Article Header */}
                  <div className="mb-8 text-center">
                    <Badge className="mb-4">{viewingPost.category}</Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">{viewingPost.title}</h1>
                    <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {viewingPost.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.ceil(viewingPost.wordCount / 200)} min read</span>
                    </div>
                  </div>

                  {viewingPost.heroImage && (
                    <div className="mb-10 rounded-xl overflow-hidden shadow-2xl shadow-primary/10">
                      <img src={viewingPost.heroImage} alt={viewingPost.title} className="w-full h-auto object-cover" />
                    </div>
                  )}
                  {/* Content Body */}
                  <div className="prose prose-invert prose-lg max-w-none">
                    {viewingPost.sections && viewingPost.sections.length > 0 ? (
                      <>
                        {/* Intro */}
                        <div className="mb-8">
                          {(viewingPost.intro || []).map((para, i) => (
                            <p key={`intro-${i}`} className="mb-4 text-muted-foreground/90 font-medium">
                              {renderContentWithLinks(para)}
                            </p>
                          ))}
                        </div>

                        {/* Sections */}
                        {(viewingPost.sections || []).map((section, idx) => (
                          <div key={idx} className="my-10">
                            <h2 className="text-2xl font-bold mb-6 text-foreground border-l-4 border-primary pl-4">{section.heading}</h2>

                            {(section.content || []).map((para, pIdx) => (
                              <p key={pIdx} className="mb-4 text-muted-foreground">
                                {renderContentWithLinks(para)}
                              </p>
                            ))}

                            {section.image && (
                              <figure className="my-8 rounded-xl overflow-hidden border border-border/50 shadow-lg">
                                <img
                                  src={section.image}
                                  alt={section.imageAlt || section.heading}
                                  className="w-full object-cover max-h-[500px]"
                                />
                                <figcaption className="mt-2 text-center text-xs text-muted-foreground italic">
                                  {section.imageAlt || section.heading}
                                </figcaption>
                              </figure>
                            )}
                          </div>
                        ))}


                      </>
                    ) : (
                      <p className="text-center text-muted-foreground">Content not available for legacy items.</p>
                    )}
                  </div>
                </div>
              </div >

            </Card >
          </div >
        )}
      </DashboardLayout >
    </>
  );
};

export default Blogs;
