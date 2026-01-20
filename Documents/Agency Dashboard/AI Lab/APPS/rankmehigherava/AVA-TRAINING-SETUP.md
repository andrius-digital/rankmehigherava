# AVA Training System - Setup Guide

Welcome to the AVA Training System! This guide will help you set up and use AVA's knowledge management system.

## 🚀 Quick Start

### Step 1: Set Up Database

1. Go to your Supabase dashboard: https://vyviopkpwcsdrfpdwzpa.supabase.co
2. Navigate to **SQL Editor**
3. Open the file `supabase-ava-setup.sql` in this project
4. Copy and paste the entire SQL script into the SQL Editor
5. Click **Run** to execute the script

This will create:
- `ava_knowledge` - Main knowledge base table
- `ava_training_examples` - Training examples
- `ava_usage_analytics` - Usage tracking
- `ava_training_queue` - Items needing attention
- Vector similarity search functions
- Dashboard views
- Starter knowledge

### Step 2: Add OpenAI API Key (Optional but Recommended)

The system uses OpenAI's embeddings for semantic search. To enable this:

1. Get your OpenAI API key from: https://platform.openai.com/api-keys
2. Open `vite.config.ts`
3. Update line 17:
   ```typescript
   'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify('sk-your-key-here'),
   ```

**Note:** If you don't add an OpenAI key, the system will work with mock embeddings (development mode).

### Step 3: Access AVA Training Dashboard

1. Make sure your dev server is running (`npm run dev`)
2. Log in to your agency dashboard
3. Navigate to **AI Lab** section
4. Click on the **"Ava Training"** card
5. You'll see the AVA Training Dashboard!

## 📚 How to Use

### Adding Knowledge

1. Click **"Add Knowledge"** button in the top-right
2. Select a category:
   - **Company Knowledge**: Information about your company, mission, services
   - **VSL Library**: Video Sales Letter scripts and frameworks
   - **Reel Scripts**: Short-form video scripts (30-60 seconds)
   - **Brand Voice**: Your brand's tone, style, and communication guidelines
   - **FAQ**: Frequently asked questions and answers
3. Enter a title and content
4. Add relevant tags (comma-separated)
5. Set priority (high, medium, low)
6. Click **"Save & Train"**

### Viewing Knowledge by Category

- Click on any category card to view all knowledge items in that category
- Each card shows:
  - Number of items
  - Last updated time
  - Items needing review
  - Quick actions (Add, View)

### Managing Knowledge

- **Edit**: Click on any knowledge item to edit it
- **Delete**: Remove outdated or incorrect knowledge
- **Priority**: Set high priority for critical information

### Training Queue

The Training Queue shows knowledge items that need attention:
- Items that haven't been updated in 30+ days
- Low-performing knowledge based on usage analytics
- Items flagged for review

You can:
- **Complete**: Mark as reviewed and updated
- **Dismiss**: Remove from queue if no action needed

## 🎯 Knowledge Categories Explained

### Company Knowledge
Add information about:
- Company overview and mission
- Services and offerings
- Team and culture
- Pricing structures
- Processes and workflows

### VSL Library
Store video sales letter content:
- Proven script templates
- Hook examples
- Call-to-action patterns
- Success stories and testimonials
- Objection handling

### Reel Scripts
Short-form content templates:
- Opening hooks (first 3 seconds)
- Value propositions
- Social proof snippets
- CTA variations
- Trending formats

### Brand Voice
Define how AVA should communicate:
- Tone and personality
- Language guidelines
- Words to use/avoid
- Writing style examples
- Brand values

### FAQ
Common questions and answers:
- Client questions
- Technical explanations
- Service comparisons
- Onboarding questions
- Troubleshooting

## 🔍 How AVA Uses This Knowledge

When you interact with AVA (via voice or chat), the system:

1. **Analyzes your query** - Understands what you're asking
2. **Retrieves relevant knowledge** - Uses semantic search to find the most relevant information
3. **Generates response** - AVA responds using the retrieved knowledge
4. **Tracks usage** - Records which knowledge was helpful
5. **Suggests improvements** - Adds items to training queue if knowledge gaps are found

## 📊 Dashboard Metrics

### Total Items
Number of active knowledge items in the database.

### Coverage Score
Percentage of recommended knowledge base completion (target: 50 items = 100%).

### Performance Rating
Average relevance score from usage analytics (0-5 scale).

### Last Updated
When knowledge was last modified.

## 🛠️ Troubleshooting

### "Can't connect to database"
- Check that you've run the SQL setup script in Supabase
- Verify your Supabase URL and anon key in `vite.config.ts`

### "Embeddings not working"
- Add your OpenAI API key to `vite.config.ts`
- Or continue with mock embeddings (works but less accurate)

### "Can't add knowledge"
- Make sure you're logged in
- Check that RLS policies are enabled in Supabase
- Verify you have authentication set up

## 🎓 Best Practices

1. **Start with high-priority knowledge**
   - Company overview
   - Core services
   - Brand voice guidelines

2. **Keep content focused**
   - One topic per knowledge item
   - Clear, concise language
   - Include examples when possible

3. **Use descriptive titles**
   - Good: "AVA Platform Features and Benefits"
   - Bad: "Platform Info"

4. **Tag effectively**
   - Add 3-5 relevant tags per item
   - Use consistent tag naming
   - Include category-specific tags

5. **Update regularly**
   - Review quarterly
   - Update when services change
   - Remove outdated information

6. **Monitor performance**
   - Check usage analytics
   - Address training queue items
   - Refine based on feedback

## 🔗 Integration with VAPI

AVA's voice interface automatically uses this knowledge base:
- Real-time knowledge retrieval during calls
- Context-aware responses
- Continuous learning from interactions

## 📈 Next Steps

1. **Add your first 10 knowledge items**
   - 3 Company Knowledge items
   - 2 VSL examples
   - 2 Reel scripts
   - 2 Brand Voice guidelines
   - 1 FAQ entry

2. **Test AVA's responses**
   - Use the voice interface
   - Ask questions related to your knowledge
   - Verify accuracy

3. **Refine and expand**
   - Add more detailed content
   - Include edge cases
   - Build out FAQ section

4. **Set up regular reviews**
   - Weekly: Check training queue
   - Monthly: Review usage analytics
   - Quarterly: Update all knowledge

## 🎉 You're All Set!

Your AVA Training System is ready to use. Start adding knowledge and watch AVA become smarter and more helpful!

For questions or issues, check the usage analytics and training queue for insights.

Happy training! 🚀




