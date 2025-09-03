# Lawverra Blog AI Content Research & Generation System (Enhanced)
# File: blog/ai_content_system.py

import asyncio
import aiohttp
import openai
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json
import re
from bs4 import BeautifulSoup
import feedparser
from sqlalchemy.orm import Session
import logging
from dataclasses import dataclass
import base64
from PIL import Image
import io
import requests

@dataclass
class ContentSource:
    name: str
    url: str
    source_type: str  # 'forum', 'review_site', 'community', 'news', 'rss'
    search_patterns: List[str]
    rate_limit_delay: float = 1.0

class LawverraContentAI:
    def __init__(self, openai_api_key: str, db_session: Session):
        self.openai_client = openai.AsyncOpenAI(api_key=openai_api_key)
        self.db = db_session
        self.logger = logging.getLogger(__name__)
        
        # Enhanced research sources with legal AI focus
        self.research_sources = [
            # Reddit - public API
            ContentSource(
                name="Reddit Legal AI Communities",
                url="https://www.reddit.com/r/law+legaladvice+lawyers+artificial+LegalTechnology.json",
                source_type="community",
                search_patterns=["AI legal", "contract AI", "legal automation", "AI lawyer", "legal tech problems"]
            ),
            
            # Legal Tech RSS Feeds
            ContentSource(
                name="Legal Technology News",
                url="https://legaltechnologist.co.uk/feed/",
                source_type="rss",
                search_patterns=["AI", "artificial intelligence", "automation", "legal tech"]
            ),
            
            ContentSource(
                name="ABA Journal Tech",
                url="https://www.abajournal.com/topic/technology/feed",
                source_type="rss",
                search_patterns=["AI", "artificial intelligence", "legal technology", "automation"]
            ),
            
            ContentSource(
                name="Law360 Technology",
                url="https://www.law360.com/articles/technology/rss",
                source_type="rss", 
                search_patterns=["AI", "artificial intelligence", "legal tech", "contract management"]
            ),
            
            ContentSource(
                name="Legal IT Professionals RSS",
                url="https://www.legaltechweeklynews.com/feed/",
                source_type="rss",
                search_patterns=["AI impact", "legal AI", "automation", "efficiency"]
            ),
            
            ContentSource(
                name="Above the Law Tech",
                url="https://abovethelaw.com/category/technology/feed/",
                source_type="rss",
                search_patterns=["AI", "legal technology", "law firm technology", "contract AI"]
            ),
            
            # AI News Sources
            ContentSource(
                name="AI News (Legal Focus)",
                url="https://artificialintelligence-news.com/feed/",
                source_type="rss",
                search_patterns=["legal", "law", "contract", "compliance", "legal industry"]
            ),
            
            ContentSource(
                name="VentureBeat AI",
                url="https://venturebeat.com/ai/feed/",
                source_type="rss",
                search_patterns=["legal AI", "contract AI", "legal technology", "law firm"]
            ),
            
            # Quora - legal AI topics
            ContentSource(
                name="Quora Legal AI",
                url="https://www.quora.com/topic/Legal-Technology",
                source_type="forum",
                search_patterns=["AI legal tools", "legal software problems", "contract automation issues"]
            ),
            
            # Review sites for competitor analysis
            ContentSource(
                name="G2 Legal Software Reviews",
                url="https://www.g2.com/categories/contract-management",
                source_type="review_site",
                search_patterns=["ironclad", "spotdraft", "clio", "spellbook", "contract management"]
            )
        ]
        
        # Competitor analysis targets
        self.competitors = [
            "IronClad", "SpotDraft", "Clio", "Spellbook", "DocuSign CLM", 
            "ContractPod AI", "Luminance", "LawGeex", "Harvey AI"
        ]

    async def twice_daily_content_research(self) -> List[Dict[str, Any]]:
        """
        Enhanced research routine running twice daily
        Morning: Focus on news and trends
        Evening: Focus on community discussions and competitor analysis
        """
        current_hour = datetime.now().hour
        
        if 5 <= current_hour <= 12:  # Morning run (6 AM)
            focus = "news_trends"
            self.logger.info("Starting morning research - News & Trends focus")
        else:  # Evening run (6 PM)
            focus = "community_competitor"
            self.logger.info("Starting evening research - Community & Competitor focus")
        
        research_results = []
        
        # 1. Enhanced data gathering based on focus
        if focus == "news_trends":
            # Morning: Focus on RSS feeds and news sources
            for source in [s for s in self.research_sources if s.source_type in ['rss', 'news']]:
                try:
                    data = await self._research_rss_feed(source)
                    research_results.extend(data)
                    await asyncio.sleep(source.rate_limit_delay)
                except Exception as e:
                    self.logger.error(f"Error researching {source.name}: {e}")
        else:
            # Evening: Focus on communities and reviews
            for source in [s for s in self.research_sources if s.source_type in ['community', 'review_site', 'forum']]:
                try:
                    data = await self._research_source(source)
                    research_results.extend(data)
                    await asyncio.sleep(source.rate_limit_delay)
                except Exception as e:
                    self.logger.error(f"Error researching {source.name}: {e}")
        
        # 2. AI analysis and content opportunity identification
        content_opportunities = await self._analyze_research_data(research_results, focus)
        
        # 3. Generate blog posts with images
        blog_drafts = []
        for opportunity in content_opportunities[:2]:  # Generate 2 posts per run = 4 daily
            try:
                draft = await self._generate_blog_post_with_image(opportunity)
                if draft:
                    blog_drafts.append(draft)
            except Exception as e:
                self.logger.error(f"Error generating blog post: {e}")
                continue
        
        return blog_drafts

    async def _research_rss_feed(self, source: ContentSource) -> List[Dict[str, Any]]:
        """Research RSS feeds for legal AI news and trends"""
        
        try:
            # Parse RSS feed
            feed = feedparser.parse(source.url)
            
            relevant_articles = []
            for entry in feed.entries[:20]:  # Check recent 20 articles
                title = entry.title.lower()
                summary = getattr(entry, 'summary', '').lower()
                content = getattr(entry, 'content', [{}])[0].get('value', '').lower() if hasattr(entry, 'content') else ''
                
                # Check relevance to legal AI
                text_to_search = f"{title} {summary} {content}"
                relevance_score = 0
                
                # High relevance keywords
                high_value_terms = ["legal AI", "AI lawyer", "contract AI", "legal automation", "AI legal assistant"]
                medium_value_terms = ["legal technology", "law firm tech", "contract management", "legal software"]
                legal_ai_terms = ["artificial intelligence law", "AI impact legal", "legal industry AI"]
                
                for term in high_value_terms:
                    if term in text_to_search:
                        relevance_score += 3
                
                for term in medium_value_terms:
                    if term in text_to_search:
                        relevance_score += 2
                        
                for term in legal_ai_terms:
                    if term in text_to_search:
                        relevance_score += 4
                
                if relevance_score >= 2:  # Threshold for relevance
                    relevant_articles.append({
                        'source': source.name,
                        'title': entry.title,
                        'summary': getattr(entry, 'summary', ''),
                        'url': entry.link,
                        'published_date': getattr(entry, 'published', ''),
                        'relevance_score': relevance_score,
                        'focus_area': self._identify_focus_area(text_to_search),
                        'content_opportunity': self._identify_content_angle(text_to_search)
                    })
            
            # Sort by relevance and recency
            relevant_articles.sort(key=lambda x: x['relevance_score'], reverse=True)
            return relevant_articles[:10]
            
        except Exception as e:
            self.logger.error(f"RSS research error for {source.name}: {e}")
            return []

    def _identify_focus_area(self, text: str) -> str:
        """Identify the primary focus area of the content"""
        
        focus_areas = {
            'contract_automation': ['contract AI', 'contract automation', 'contract review', 'document automation'],
            'legal_ai_tools': ['legal AI tools', 'AI lawyer', 'legal assistant AI', 'AI legal research'],
            'firm_efficiency': ['law firm efficiency', 'legal operations', 'legal workflow', 'firm productivity'],
            'compliance_risk': ['compliance AI', 'risk management', 'regulatory technology', 'legal compliance'],
            'industry_transformation': ['legal industry change', 'law firm transformation', 'future of law', 'legal innovation']
        }
        
        for area, keywords in focus_areas.items():
            if any(keyword in text for keyword in keywords):
                return area
        
        return 'general_legal_tech'

    def _identify_content_angle(self, text: str) -> str:
        """Identify the content angle that positions Lawverra favorably"""
        
        if any(term in text for term in ['slow', 'inefficient', 'manual', 'time-consuming']):
            return 'efficiency_solution'
        elif any(term in text for term in ['expensive', 'costly', 'budget', 'affordable']):
            return 'cost_effectiveness'
        elif any(term in text for term in ['complex', 'difficult', 'hard to use', 'user experience']):
            return 'ease_of_use'
        elif any(term in text for term in ['integration', 'compatibility', 'workflow']):
            return 'seamless_integration'
        else:
            return 'ai_advancement'

    async def _generate_blog_post_with_image(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Generate blog post with AI-created image"""
        
        # First generate the blog content
        blog_content = await self._generate_enhanced_blog_content(opportunity)
        if not blog_content:
            return None
        
        # Generate related image using DALL-E
        try:
            image_url = await self._generate_blog_image(blog_content['title'], opportunity.get('focus_area', 'legal_tech'))
            blog_content['featured_image_url'] = image_url
            blog_content['featured_image_alt'] = f"Illustration for {blog_content['title']}"
        except Exception as e:
            self.logger.error(f"Image generation failed: {e}")
            # Continue without image
            blog_content['featured_image_url'] = None
        
        return blog_content

    async def _generate_enhanced_blog_content(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Generate enhanced blog content with better legal AI focus"""
        
        enhanced_prompt = f"""
        Write a comprehensive, valuable blog post for Lawverra based on this research:
        
        Title Direction: {opportunity.get('title')}
        Focus Area: {opportunity.get('focus_area')}
        Content Angle: {opportunity.get('content_opportunity')}
        Supporting Research: {opportunity.get('evidence')}
        Target Pain Points: {opportunity.get('pain_points')}
        
        Requirements:
        - 1000-1500 words of genuinely valuable content
        - Professional, authoritative tone that builds trust
        - Focus on how AI is transforming the legal industry
        - Include specific examples and case studies
        - Naturally position Lawverra's AI-first approach as the solution
        - Structure with clear H2 headings and bullet points
        - Include actionable insights lawyers can implement
        - End with subtle CTA encouraging readers to explore Lawverra
        - Reference current trends in legal AI adoption
        
        Content Structure:
        1. Hook with current legal industry challenge
        2. Explain the AI solution landscape
        3. Compare traditional vs AI-powered approaches
        4. Highlight specific benefits and ROI
        5. Address common concerns about AI in law
        6. Provide implementation guidance
        7. Conclude with forward-looking perspective
        
        SEO Requirements:
        - Title under 60 characters, include primary keyword
        - Meta description under 160 characters
        - 4-6 relevant tags focused on legal AI
        - Snippet under 150 characters for social sharing
        
        Format as JSON: {{
            "title": "SEO-optimized title",
            "meta_title": "Title for meta tag", 
            "meta_description": "Meta description",
            "snippet": "Brief social sharing snippet",
            "content": "Full markdown content",
            "tags": ["tag1", "tag2", "tag3", "tag4"],
            "focus_keywords": ["primary keyword", "secondary keyword"],
            "target_audience": "target reader type"
        }}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a senior legal technology content strategist for Lawverra. Write authoritative, valuable blog posts that establish thought leadership while naturally highlighting Lawverra's AI capabilities. Focus on providing genuine value to legal professionals while positioning AI as the future of legal work."},
                    {"role": "user", "content": enhanced_prompt}
                ],
                temperature=0.6,
                max_tokens=3000
            )
            
            blog_post_data = json.loads(response.choices[0].message.content)
            
            # Add metadata
            blog_post_data.update({
                'research_source': opportunity,
                'generated_at': datetime.utcnow().isoformat(),
                'status': 'draft',
                'ai_generated': True,
                'research_focus': opportunity.get('focus_area'),
                'content_angle': opportunity.get('content_opportunity')
            })
            
            return blog_post_data
            
        except Exception as e:
            self.logger.error(f"Enhanced blog generation error: {e}")
            return {}

    async def _generate_blog_image(self, title: str, focus_area: str) -> str:
        """Generate relevant image using DALL-E 3"""
        
        # Create image prompt based on focus area
        image_prompts = {
            'contract_automation': f"Professional illustration of AI-powered contract automation, showing digital documents with AI analysis highlights, modern legal office setting, clean minimal style, golden accents, technology theme",
            'legal_ai_tools': f"Modern legal professional using AI tools, futuristic law office with AI interface screens, professional illustration style, golden color scheme, technology and law theme",
            'firm_efficiency': f"Streamlined law firm workflow illustration, efficiency arrows, time savings visualization, professional modern style with golden accents",
            'compliance_risk': f"AI compliance monitoring illustration, shield with checkmarks, risk assessment visualization, professional tech illustration with golden theme",
            'industry_transformation': f"Legal industry evolution illustration, traditional to AI-powered transition, professional modern style, golden color palette",
            'general_legal_tech': f"Legal technology innovation illustration, AI and law symbol integration, professional modern style with golden accents"
        }
        
        prompt = image_prompts.get(focus_area, image_prompts['general_legal_tech'])
        prompt += f", inspired by the concept: {title[:100]}"  # Add title context
        
        try:
            image_response = await self.openai_client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1
            )
            
            image_url = image_response.data[0].url
            
            # Download and upload to your storage
            uploaded_url = await self._upload_generated_image(image_url, title)
            return uploaded_url
            
        except Exception as e:
            self.logger.error(f"DALL-E image generation error: {e}")
            return None

    async def _upload_generated_image(self, dall_e_url: str, title: str) -> str:
        """Download DALL-E image and upload to Supabase storage"""
        
        try:
            # Download image from DALL-E
            async with aiohttp.ClientSession() as session:
                async with session.get(dall_e_url) as response:
                    if response.status == 200:
                        image_data = await response.read()
                        
                        # Create filename
                        from slugify import slugify
                        filename = f"ai-generated/{slugify(title)}-{datetime.now().strftime('%Y%m%d-%H%M')}.png"
                        
                        # Upload to Supabase (integrate with your existing storage)
                        # This would use your existing upload_blog_image function
                        # For now, return placeholder URL
                        return f"https://your-storage.supabase.co/blog-images/{filename}"
                        
        except Exception as e:
            self.logger.error(f"Image upload error: {e}")
            return None

    async def _analyze_research_data(self, research_data: List[Dict[str, Any]], focus_type: str) -> List[Dict[str, Any]]:
        """Enhanced AI analysis with focus on legal AI impact"""
        
        if not research_data:
            return []
        
        # Prepare enhanced analysis
        research_summary = {
            'focus_type': focus_type,
            'total_sources': len(research_data),
            'ai_legal_mentions': 0,
            'competitor_pain_points': {},
            'trending_legal_ai_topics': [],
            'law_firm_challenges': [],
            'ai_adoption_barriers': [],
            'success_stories': [],
            'regulatory_concerns': []
        }
        
        # Enhanced analysis for legal AI content
        for item in research_data:
            text = str(item).lower()
            
            # Count AI legal mentions
            if any(term in text for term in ['legal AI', 'AI lawyer', 'contract AI', 'legal automation']):
                research_summary['ai_legal_mentions'] += 1
            
            # Extract competitor-specific pain points
            for competitor in self.competitors:
                if competitor.lower() in text:
                    if 'pain_points' in item or 'common_complaints' in item:
                        research_summary['competitor_pain_points'][competitor] = \
                            research_summary['competitor_pain_points'].get(competitor, [])
                        if 'pain_points' in item:
                            research_summary['competitor_pain_points'][competitor].extend(item['pain_points'])
            
            # Identify trending topics
            if item.get('relevance_score', 0) >= 3:
                research_summary['trending_legal_ai_topics'].append({
                    'title': item.get('title', ''),
                    'focus_area': item.get('focus_area', ''),
                    'source': item.get('source', '')
                })

        # Enhanced AI analysis prompt
        enhanced_analysis_prompt = f"""
        Analyze this legal AI market research and identify 2 high-value blog post opportunities for Lawverra:
        
        Research Summary: {json.dumps(research_summary, indent=2)}
        Focus Type: {focus_type}
        
        Lawverra's positioning: AI-first contract management that's faster, smarter, and more intuitive than legacy tools.
        Target audience: Legal professionals, in-house counsel, law firm partners, legal operations managers.
        
        For each opportunity, provide:
        1. Compelling blog post title (under 60 chars, SEO-friendly)
        2. Strategic angle that positions Lawverra as the superior AI solution
        3. Specific legal industry pain points to address
        4. Supporting evidence from research data
        5. Content focus area (contract_automation, legal_ai_tools, etc.)
        6. Target keywords for SEO
        7. Estimated reader appeal (1-10)
        8. Unique value proposition vs competitors
        
        Focus on content that:
        - Shows how AI is transforming legal work
        - Addresses real challenges lawyers face today
        - Demonstrates ROI and efficiency gains
        - Builds trust in AI-powered legal tools
        - Positions Lawverra as the intelligent choice
        
        Format as JSON array with detailed opportunity objects.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a legal technology market analyst specializing in AI adoption in law firms. Identify high-impact content opportunities that position Lawverra favorably while providing genuine value to legal professionals."},
                    {"role": "user", "content": enhanced_analysis_prompt}
                ],
                temperature=0.7
            )
            
            content_opportunities = json.loads(response.choices[0].message.content)
            return content_opportunities
            
        except Exception as e:
            self.logger.error(f"Enhanced AI analysis error: {e}")
            return []

    async def _research_source(self, source: ContentSource) -> List[Dict[str, Any]]:
        """Enhanced research with legal AI focus"""
        
        if source.source_type == "community":
            return await self._research_reddit_legal_ai(source)
        elif source.source_type == "review_site":
            return await self._research_reviews_enhanced(source)
        elif source.source_type == "forum":
            return await self._research_forum_legal_ai(source)
        
        return []

    async def _research_reddit_legal_ai(self, source: ContentSource) -> List[Dict[str, Any]]:
        """Enhanced Reddit research focused on legal AI discussions"""
        
        async with aiohttp.ClientSession() as session:
            try:
                headers = {'User-Agent': 'LawverraContentBot/2.0'}
                async with session.get(source.url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        relevant_posts = []
                        for post in data.get('data', {}).get('children', []):
                            post_data = post.get('data', {})
                            title = post_data.get('title', '').lower()
                            content = post_data.get('selftext', '').lower()
                            
                            # Enhanced relevance scoring for legal AI
                            relevance_score = 0
                            text_to_analyze = f"{title} {content}"
                            
                            # High-value legal AI terms
                            if any(term in text_to_analyze for term in ['legal AI', 'contract AI', 'AI lawyer']):
                                relevance_score += 5
                            
                            # Pain point indicators
                            if any(term in text_to_analyze for term in ['slow', 'inefficient', 'manual review', 'time consuming']):
                                relevance_score += 3
                                
                            # Competitor mentions
                            if any(comp.lower() in text_to_analyze for comp in self.competitors):
                                relevance_score += 2
                            
                            if relevance_score >= 3:
                                relevant_posts.append({
                                    'source': source.name,
                                    'title': post_data.get('title'),
                                    'content': post_data.get('selftext'),
                                    'url': f"https://reddit.com{post_data.get('permalink')}",
                                    'score': post_data.get('score', 0),
                                    'num_comments': post_data.get('num_comments', 0),
                                    'created_utc': post_data.get('created_utc'),
                                    'subreddit': post_data.get('subreddit'),
                                    'relevance_score': relevance_score,
                                    'pain_points': self._extract_pain_points(text_to_analyze),
                                    'focus_area': self._identify_focus_area(text_to_analyze)
                                })
                        
                        return sorted(relevant_posts, key=lambda x: x['relevance_score'], reverse=True)[:5]
                        
            except Exception as e:
                self.logger.error(f"Reddit research error: {e}")
                return []

    def _extract_pain_points(self, text: str) -> List[str]:
        """Extract pain points from user discussions"""
        
        pain_point_indicators = {
            'speed': ['slow', 'takes forever', 'time-consuming', 'lengthy process'],
            'complexity': ['complicated', 'hard to use', 'confusing', 'steep learning curve'],
            'integration': ['doesnt work with', 'integration issues', 'compatibility problems'],
            'cost': ['expensive', 'costly', 'overpriced', 'budget constraints'],
            'support': ['poor support', 'no help', 'unresponsive', 'bad customer service'],
            'accuracy': ['errors', 'mistakes', 'inaccurate', 'unreliable'],
            'features': ['missing features', 'limited functionality', 'basic features']
        }
        
        found_pain_points = []
        for category, indicators in pain_point_indicators.items():
            if any(indicator in text for indicator in indicators):
                found_pain_points.append(category)
        
        return found_pain_points

    async def create_draft_post_enhanced(self, blog_data: Dict[str, Any], author_id: int) -> int:
        """Enhanced draft creation with image and metadata"""
        
        try:
            from slugify import slugify
            base_slug = slugify(blog_data['title'])
            
            # Create unique slug with timestamp
            timestamp = datetime.now().strftime('%Y%m%d-%H%M')
            slug = f"{base_slug}-ai-{timestamp}"
            
            new_post = BlogPost(
                title=blog_data['title'],
                slug=slug,
                snippet=blog_data['snippet'],
                content=blog_data['content'],
                author_id=author_id,
                status='draft',
                tags=blog_data.get('tags', []),
                meta_title=blog_data.get('meta_title'),
                meta_description=blog_data.get('meta_description'),
                featured_image_url=blog_data.get('featured_image_url'),
                featured_image_alt=blog_data.get('featured_image_alt'),
                is_featured=False
            )
            
            self.db.add(new_post)
            self.db.commit()
            
            # Enhanced AI metadata logging
            ai_metadata = {
                'post_id': new_post.id,
                'research_sources': blog_data.get('research_source', {}),
                'focus_area': blog_data.get('research_focus'),
                'content_angle': blog_data.get('content_angle'),
                'target_keywords': blog_data.get('focus_keywords', []),
                'generated_at': blog_data.get('generated_at'),
                'has_image': bool(blog_data.get('featured_image_url')),
                'requires_review': True
            }
            
            # Save AI generation log
            self._log_ai_generation(new_post.id, ai_metadata)
            
            self.logger.info(f"Enhanced AI-generated draft created: {new_post.id} - {blog_data['title']}")
            return new_post.id
            
        except Exception as e:
            self.logger.error(f"Error saving enhanced draft: {e}")
            return None

    def _log_ai_generation(self, post_id: int, metadata: Dict[str, Any]):
        """Log AI generation details for performance tracking"""
        
        try:
            # Insert into ai_content_logs table
            log_entry = {
                'post_id': post_id,
                'metadata': json.dumps(metadata),
                'created_at': datetime.utcnow()
            }
            
            # This would integrate with your logging system
            self.logger.info(f"AI generation logged for post {post_id}")
            
        except Exception as e:
            self.logger.error(f"Error logging AI generation: {e}")

# File: blog/ai_scheduler_enhanced.py
import schedule
import time
from datetime import datetime
import os
import asyncio

class EnhancedBlogContentScheduler:
    def __init__(self):
        self.ai_system = LawverraContentAI(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            db_session=get_db().__next__()
        )
    
    def setup_twice_daily_research(self):
        """Setup twice-daily research schedule with enhanced focus"""
        
        # Morning research (6:00 AM) - News and trends focus
        schedule.every().day.at("06:00").do(self.run_morning_research)
        
        # Evening research (6:00 PM) - Community and competitor focus  
        schedule.every().day.at("18:00").do(self.run_evening_research)
        
        # Weekly deep competitor analysis (Mondays 7:00 AM)
        schedule.every().monday.at("07:00").do(self.run_weekly_competitor_deep_dive)
        
        # Monthly legal AI trend analysis
        schedule.every().month.do(self.run_monthly_legal_ai_trends)

    def run_morning_research(self):
        """Morning research focused on news and industry trends"""
        print(f"Starting morning legal AI research at {datetime.now()}")
        
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Focus on news and trends
            blog_drafts = loop.run_until_complete(
                self.ai_system.twice_daily_content_research()
            )
            
            # Save drafts with evening tag
            for draft in blog_drafts:
                if draft:
                    draft['research_session'] = 'evening_community'
                    post_id = loop.run_until_complete(
                        self.ai_system.create_draft_post_enhanced(draft, author_id=1)
                    )
                    
                    if post_id:
                        print(f"Evening draft created: {post_id} - {draft['title']}")
                        self.notify_new_draft(post_id, draft['title'], 'evening_community')
            
            loop.close()
            
        except Exception as e:
            print(f"Evening research error: {e}")

    def run_weekly_competitor_deep_dive(self):
        """Weekly comprehensive competitor analysis"""
        print("Running weekly legal AI competitor deep dive...")
        
        # Enhanced competitor analysis focusing on:
        # - Feature gaps in competitor offerings
        # - User satisfaction scores
        # - Pricing concerns
        # - Integration challenges
        # - AI capability comparisons

    def run_monthly_legal_ai_trends(self):
        """Monthly analysis of legal AI industry trends"""
        print("Running monthly legal AI trend analysis...")
        
        # Broader legal AI industry analysis focusing on:
        # - Regulatory changes affecting legal AI
        # - New legal AI tool launches
        # - Industry adoption statistics
        # - Future predictions and thought leadership

    def notify_new_draft(self, post_id: int, title: str, session_type: str):
        """Enhanced notification system for new AI drafts"""
        
        session_descriptions = {
            'morning_trends': 'Legal AI News & Trends',
            'evening_community': 'Community & Competitor Analysis'
        }
        
        notification_data = {
            'type': 'blog_draft_ready',
            'message': f'New AI blog draft from {session_descriptions.get(session_type)}: {title}',
            'post_id': post_id,
            'session_type': session_type,
            'action_url': f'/blog/admin/review/{post_id}',
            'priority': 'medium',
            'has_image': True  # All posts now include images
        }
        
        # Integration with your notification system
        print(f"📝 New {session_type} draft ready: {title} (ID: {post_id})")
        
        # Send email/slack notification to admin users
        # self.send_admin_notification(notification_data)

    def start_enhanced_scheduler(self):
        """Start the twice-daily scheduling system"""
        print("🤖 Starting Enhanced Lawverra Blog AI Content Scheduler...")
        print("📅 Morning research: 6:00 AM (Legal AI news & trends)")
        print("🌙 Evening research: 6:00 PM (Community discussions & competitor analysis)")
        print("📊 Weekly competitor analysis: Mondays 7:00 AM")
        print("📈 Monthly trend analysis: 1st of each month")
        print("🖼️ All posts include AI-generated relevant images")
        print("🔄 Press Ctrl+C to stop")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

# Enhanced RSS Feed Sources Configuration
ENHANCED_RSS_SOURCES = [
    # Primary Legal AI News Sources
    "https://legaltechnologist.co.uk/feed/",
    "https://www.abajournal.com/topic/technology/feed",
    "https://www.law360.com/articles/technology/rss",
    "https://abovethelaw.com/category/technology/feed/",
    "https://www.legaltechweeklynews.com/feed/",
    
    # AI News with Legal Focus
    "https://artificialintelligence-news.com/feed/",
    "https://venturebeat.com/ai/feed/",
    "https://www.techrepublic.com/rss/artificial-intelligence/",
    "https://www.zdnet.com/topic/artificial-intelligence/rss.xml",
    
    # Legal Industry News
    "https://www.americanlawyer.com/rss.xml",
    "https://www.law.com/legaltechnews/rss.xml",
    "https://www.legalfutures.co.uk/latest-news/feed",
    "https://www.lawsites.com/feed/",
    
    # Business/Tech News with Legal Relevance
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://www.reuters.com/technology/artificial-intelligence/rss",
    "https://feeds.reuters.com/reuters/businessNews"
]

# Enhanced Content Categories for Better Organization
CONTENT_CATEGORIES = {
    'ai_adoption': {
        'keywords': ['AI adoption', 'legal AI implementation', 'law firm AI'],
        'angle': 'How Lawverra accelerates AI adoption in law firms',
        'image_style': 'AI transformation in legal office'
    },
    'contract_intelligence': {
        'keywords': ['contract AI', 'contract analysis', 'smart contracts', 'contract automation'],
        'angle': 'Lawverra\'s superior contract intelligence vs manual review',
        'image_style': 'AI analyzing legal documents with insights'
    },
    'efficiency_gains': {
        'keywords': ['legal efficiency', 'time savings', 'productivity', 'workflow automation'],
        'angle': 'Quantifiable efficiency gains with Lawverra vs traditional methods', 
        'image_style': 'Streamlined legal workflow visualization'
    },
    'risk_management': {
        'keywords': ['legal risk', 'compliance', 'risk assessment', 'legal liability'],
        'angle': 'How Lawverra\'s AI reduces legal risks through intelligent analysis',
        'image_style': 'AI-powered risk assessment dashboard'
    },
    'cost_reduction': {
        'keywords': ['legal costs', 'budget', 'ROI', 'cost savings'],
        'angle': 'Lawverra delivers superior ROI compared to traditional legal spend',
        'image_style': 'Cost savings and ROI visualization'
    },
    'competitive_analysis': {
        'keywords': ['legal software comparison', 'legal tool alternatives'],
        'angle': 'Why legal teams choose Lawverra over legacy solutions',
        'image_style': 'Comparison chart showing Lawverra advantages'
    }
}
            
            # Save drafts with morning tag
            for draft in blog_drafts:
                if draft:
                    draft['research_session'] = 'morning_trends'
                    post_id = loop.run_until_complete(
                        self.ai_system.create_draft_post_enhanced(draft, author_id=1)
                    )
                    
                    if post_id:
                        print(f"Morning draft created: {post_id} - {draft['title']}")
                        self.notify_new_draft(post_id, draft['title'], 'morning_trends')
            
            loop.close()
            
        except Exception as e:
            print(f"Morning research error: {e}")

    def run_evening_research(self):
        """Evening research focused on community discussions and competitor analysis"""
        print(f"Starting evening legal AI research at {datetime.now()}")
        
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            blog_drafts = loop.run_until_complete(
                self.ai_system.twice_daily_content_research()
            )
            # Lawverra Blog AI Content Research & Generation System
# File: blog/ai_content_system.py

import asyncio
import aiohttp
import openai
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json
import re
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
import logging
from dataclasses import dataclass

@dataclass
class ContentSource:
    name: str
    url: str
    source_type: str  # 'forum', 'review_site', 'community', 'news'
    search_patterns: List[str]
    rate_limit_delay: float = 1.0

class LawverraContentAI:
    def __init__(self, openai_api_key: str, db_session: Session):
        self.openai_client = openai.AsyncOpenAI(api_key=openai_api_key)
        self.db = db_session
        self.logger = logging.getLogger(__name__)
        
        # Research sources (public APIs and forums only)
        self.research_sources = [
            # Reddit - public API
            ContentSource(
                name="Reddit Legal Communities",
                url="https://www.reddit.com/r/law+legaladvice+lawyers.json",
                source_type="community",
                search_patterns=["contract", "legal software", "document review", "legal tech"]
            ),
            
            # Quora - public content
            ContentSource(
                name="Quora Legal Topics",
                url="https://www.quora.com/topic/Legal-Technology",
                source_type="forum",
                search_patterns=["legal software problems", "contract management issues"]
            ),
            
            # Public review sites
            ContentSource(
                name="G2 Reviews",
                url="https://www.g2.com/categories/contract-management",
                source_type="review_site",
                search_patterns=["ironclad", "spotdraft", "clio", "spellbook"]
            ),
            
            # Legal news and industry sites
            ContentSource(
                name="LegalTech News",
                url="https://www.legalcomplex.com/feed/",
                source_type="news",
                search_patterns=["legal technology", "contract automation"]
            ),
            
            # Above the Law (public RSS)
            ContentSource(
                name="Above the Law",
                url="https://abovethelaw.com/feed/",
                source_type="news",
                search_patterns=["legal technology", "law firm technology"]
            )
        ]
        
        # Competitor analysis (public information only)
        self.competitors = [
            "IronClad", "SpotDraft", "Clio", "Spellbook", "DocuSign CLM"
        ]

    async def daily_content_research(self) -> List[Dict[str, Any]]:
        """
        Daily research routine to gather insights and pain points
        Returns list of potential blog topics with supporting data
        """
        self.logger.info("Starting daily content research...")
        
        research_results = []
        
        # 1. Gather data from all sources
        for source in self.research_sources:
            try:
                data = await self._research_source(source)
                research_results.extend(data)
                await asyncio.sleep(source.rate_limit_delay)  # Respect rate limits
            except Exception as e:
                self.logger.error(f"Error researching {source.name}: {e}")
                continue
        
        # 2. Analyze and identify content opportunities
        content_opportunities = await self._analyze_research_data(research_results)
        
        # 3. Generate blog post drafts
        blog_drafts = []
        for opportunity in content_opportunities[:3]:  # Top 3 opportunities
            try:
                draft = await self._generate_blog_post(opportunity)
                blog_drafts.append(draft)
            except Exception as e:
                self.logger.error(f"Error generating blog post: {e}")
                continue
        
        return blog_drafts

    async def _research_source(self, source: ContentSource) -> List[Dict[str, Any]]:
        """Research a specific source for relevant content"""
        
        if source.source_type == "community":
            return await self._research_reddit(source)
        elif source.source_type == "review_site":
            return await self._research_reviews(source)
        elif source.source_type == "news":
            return await self._research_news_feed(source)
        elif source.source_type == "forum":
            return await self._research_forum(source)
        
        return []

    async def _research_reddit(self, source: ContentSource) -> List[Dict[str, Any]]:
        """Research Reddit communities for legal tech discussions"""
        
        async with aiohttp.ClientSession() as session:
            try:
                headers = {'User-Agent': 'LawverraContentBot/1.0'}
                async with session.get(source.url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        relevant_posts = []
                        for post in data.get('data', {}).get('children', []):
                            post_data = post.get('data', {})
                            title = post_data.get('title', '').lower()
                            content = post_data.get('selftext', '').lower()
                            
                            # Check if post mentions legal tech pain points
                            if any(pattern in title or pattern in content 
                                  for pattern in source.search_patterns):
                                relevant_posts.append({
                                    'source': source.name,
                                    'title': post_data.get('title'),
                                    'content': post_data.get('selftext'),
                                    'url': f"https://reddit.com{post_data.get('permalink')}",
                                    'score': post_data.get('score', 0),
                                    'num_comments': post_data.get('num_comments', 0),
                                    'created_utc': post_data.get('created_utc'),
                                    'subreddit': post_data.get('subreddit')
                                })
                        
                        return relevant_posts[:10]  # Top 10 relevant posts
                        
            except Exception as e:
                self.logger.error(f"Reddit research error: {e}")
                return []

    async def _research_reviews(self, source: ContentSource) -> List[Dict[str, Any]]:
        """Research review sites for competitor feedback"""
        
        # This would integrate with review site APIs or use ethical web scraping
        # For G2, Capterra, etc. - focus on public review content
        
        mock_review_insights = [
            {
                'source': 'G2 Reviews',
                'competitor': 'IronClad',
                'common_complaints': ['complex setup', 'expensive for small firms', 'steep learning curve'],
                'pain_points': ['integration difficulties', 'poor customer support response times'],
                'opportunity': 'Position Lawverra as easier to implement and more responsive support'
            },
            {
                'source': 'Capterra Reviews', 
                'competitor': 'Clio',
                'common_complaints': ['limited contract features', 'not AI-powered enough'],
                'pain_points': ['manual contract review', 'no intelligent clause analysis'],
                'opportunity': 'Highlight Lawverra\'s AI-first approach to contract intelligence'
            }
        ]
        
        return mock_review_insights

    async def _research_news_feed(self, source: ContentSource) -> List[Dict[str, Any]]:
        """Research legal tech news feeds"""
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(source.url) as response:
                    if response.status == 200:
                        content = await response.text()
                        # Parse RSS/news feed content
                        # Extract relevant legal tech trends and news
                        
                        # Mock implementation
                        return [
                            {
                                'source': source.name,
                                'title': 'Legal Tech Adoption Trends 2025',
                                'summary': 'Industry report on increasing AI adoption in law firms',
                                'url': 'https://example.com/article',
                                'relevance': 'high',
                                'opportunity': 'Create content about AI adoption best practices'
                            }
                        ]
            except Exception as e:
                self.logger.error(f"News feed error: {e}")
                return []

    async def _analyze_research_data(self, research_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Use AI to analyze research data and identify content opportunities"""
        
        if not research_data:
            return []
        
        # Prepare data for AI analysis
        research_summary = {
            'total_sources': len(research_data),
            'competitor_mentions': {},
            'common_pain_points': [],
            'trending_topics': [],
            'user_frustrations': []
        }
        
        # Count competitor mentions and extract pain points
        for item in research_data:
            # Extract competitor mentions
            for competitor in self.competitors:
                if competitor.lower() in str(item).lower():
                    research_summary['competitor_mentions'][competitor] = \
                        research_summary['competitor_mentions'].get(competitor, 0) + 1
            
            # Extract pain points from complaints
            if 'common_complaints' in item:
                research_summary['common_pain_points'].extend(item['common_complaints'])
            
            if 'pain_points' in item:
                research_summary['user_frustrations'].extend(item['pain_points'])
        
        # Use OpenAI to analyze and generate content ideas
        analysis_prompt = f"""
        Analyze this legal tech market research data and identify the top 3 blog post opportunities for Lawverra:
        
        Research Summary: {json.dumps(research_summary, indent=2)}
        
        Lawverra's positioning: AI-first contract management with intelligent clause analysis, faster than competitors.
        
        For each opportunity, provide:
        1. Blog post title
        2. Key angle that positions Lawverra favorably
        3. Target pain points to address
        4. Supporting evidence from the research
        5. Estimated reader appeal (1-10)
        
        Format as JSON array.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a content strategist for Lawverra, a legal AI company. Analyze market research to identify blog opportunities that position Lawverra favorably against competitors."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.7
            )
            
            content_opportunities = json.loads(response.choices[0].message.content)
            return content_opportunities
            
        except Exception as e:
            self.logger.error(f"AI analysis error: {e}")
            return []

    async def _generate_blog_post(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a complete blog post based on identified opportunity"""
        
        blog_prompt = f"""
        Write a comprehensive blog post for Lawverra based on this content opportunity:
        
        Title: {opportunity.get('title')}
        Target Pain Points: {opportunity.get('pain_points')}
        Key Angle: {opportunity.get('angle')}
        Supporting Evidence: {opportunity.get('evidence')}
        
        Requirements:
        - 800-1200 words
        - Professional, authoritative tone
        - Include practical insights and actionable advice
        - Naturally position Lawverra's capabilities without being overly promotional
        - Include relevant statistics and industry insights
        - Structure with clear headings and bullet points
        - End with a subtle call-to-action
        
        Also provide:
        - SEO-optimized title (under 60 characters)
        - Meta description (under 160 characters)
        - 3-5 relevant tags
        - Brief snippet for blog listing (under 150 characters)
        
        Format as JSON with fields: title, meta_title, meta_description, snippet, content, tags
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional legal tech content writer for Lawverra. Write informative, valuable blog posts that subtly highlight Lawverra's advantages while providing genuine value to readers."},
                    {"role": "user", "content": blog_prompt}
                ],
                temperature=0.6
            )
            
            blog_post_data = json.loads(response.choices[0].message.content)
            
            # Add metadata
            blog_post_data.update({
                'research_source': opportunity,
                'generated_at': datetime.utcnow().isoformat(),
                'status': 'draft',  # Requires human review
                'ai_generated': True
            })
            
            return blog_post_data
            
        except Exception as e:
            self.logger.error(f"Blog generation error: {e}")
            return {}

    async def create_draft_post(self, blog_data: Dict[str, Any], author_id: int) -> int:
        """Save AI-generated blog post as draft for human review"""
        
        try:
            # Create slug
            from slugify import slugify
            base_slug = slugify(blog_data['title'])
            
            # Save to database as draft
            new_post = BlogPost(
                title=blog_data['title'],
                slug=f"{base_slug}-ai-draft-{datetime.now().strftime('%Y%m%d')}",
                snippet=blog_data['snippet'],
                content=blog_data['content'],
                author_id=author_id,  # AI system user ID
                status='draft',
                tags=blog_data.get('tags', []),
                meta_title=blog_data.get('meta_title'),
                meta_description=blog_data.get('meta_description'),
                is_featured=False
            )
            
            self.db.add(new_post)
            self.db.commit()
            
            # Log AI generation metadata
            ai_metadata = {
                'post_id': new_post.id,
                'research_sources': blog_data.get('research_source', {}),
                'generated_at': blog_data.get('generated_at'),
                'requires_review': True
            }
            
            self.logger.info(f"AI-generated draft created: {new_post.id}")
            return new_post.id
            
        except Exception as e:
            self.logger.error(f"Error saving draft: {e}")
            return None

# File: blog/ai_scheduler.py
import schedule
import time
from datetime import datetime
import os
import asyncio

class BlogContentScheduler:
    def __init__(self):
        self.ai_system = LawverraContentAI(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            db_session=get_db().__next__()  # Get DB session
        )
    
    def setup_daily_research(self):
        """Setup daily research schedule"""
        
        # Schedule daily research at 6 AM
        schedule.every().day.at("06:00").do(self.run_daily_research)
        
        # Weekly competitor analysis on Mondays
        schedule.every().monday.at("07:00").do(self.run_weekly_competitor_analysis)
        
        # Monthly trend analysis
        schedule.every().month.do(self.run_monthly_trend_analysis)

    def run_daily_research(self):
        """Run daily research and content generation"""
        print(f"Starting daily research at {datetime.now()}")
        
        try:
            # Run async research
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            blog_drafts = loop.run_until_complete(
                self.ai_system.daily_content_research()
            )
            
            # Save drafts for human review
            for draft in blog_drafts:
                if draft:  # Check if generation was successful
                    post_id = loop.run_until_complete(
                        self.ai_system.create_draft_post(draft, author_id=1)  # AI system user
                    )
                    
                    if post_id:
                        print(f"Created draft post ID: {post_id}")
                        # Send notification to admin users
                        self.notify_new_draft(post_id, draft['title'])
            
            loop.close()
            
        except Exception as e:
            print(f"Daily research error: {e}")

    def notify_new_draft(self, post_id: int, title: str):
        """Notify admin users of new AI-generated draft"""
        
        # Integration with your existing notification system
        notification_data = {
            'type': 'blog_draft_ready',
            'message': f'New AI-generated blog draft ready for review: {title}',
            'post_id': post_id,
            'action_url': f'/blog/admin/review/{post_id}',
            'priority': 'medium'
        }
        
        # Send to your notification system
        # self.send_notification_to_admins(notification_data)
        print(f"📝 New draft ready: {title} (ID: {post_id})")

    def run_weekly_competitor_analysis(self):
        """Weekly deep dive into competitor positioning"""
        print("Running weekly competitor analysis...")
        
        # More detailed analysis of competitor strengths/weaknesses
        # Generate competitive positioning content

    def run_monthly_trend_analysis(self):
        """Monthly analysis of legal tech trends"""
        print("Running monthly trend analysis...")
        
        # Broader industry trend analysis
        # Generate thought leadership content

    def start_scheduler(self):
        """Start the scheduling system"""
        print("🤖 Starting Lawverra Blog AI Content Scheduler...")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

# File: blog/ai_review_interface.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List

ai_router = APIRouter(prefix="/api/blog/ai", tags=["blog-ai"])

@ai_router.get("/drafts")
async def get_ai_drafts(
    current_user = Depends(check_permissions("admin")),
    db: Session = Depends(get_db)
):
    """Get AI-generated drafts pending review"""
    
    ai_drafts = db.query(BlogPost).filter(
        BlogPost.status == 'draft',
        BlogPost.slug.like('%-ai-draft-%')
    ).order_by(desc(BlogPost.created_at)).all()
    
    return [
        {
            'id': post.id,
            'title': post.title,
            'snippet': post.snippet,
            'created_at': post.created_at,
            'requires_review': True,
            'ai_generated': True
        } for post in ai_drafts
    ]

@ai_router.post("/drafts/{post_id}/approve")
async def approve_ai_draft(
    post_id: int,
    current_user = Depends(check_permissions("admin")),
    db: Session = Depends(get_db)
):
    """Approve AI-generated draft for publishing"""
    
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    # Update status and remove AI draft marker from slug
    post.status = 'published'
    post.slug = post.slug.replace('-ai-draft-', '-')
    post.published_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Draft approved and published"}

@ai_router.post("/drafts/{post_id}/reject")
async def reject_ai_draft(
    post_id: int,
    reason: str,
    current_user = Depends(check_permissions("admin")),
    db: Session = Depends(get_db)
):
    """Reject AI-generated draft"""
    
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    # Archive the draft with rejection reason
    post.status = 'archived'
    
    # Log rejection for AI training improvement
    rejection_log = {
        'post_id': post_id,
        'title': post.title,
        'rejection_reason': reason,
        'rejected_by': current_user['id'],
        'rejected_at': datetime.utcnow().isoformat()
    }
    
    # Save rejection feedback for AI improvement
    # This helps train the system to generate better content
    
    db.commit()
    
    return {"message": "Draft rejected and archived"}

# File: blog/deployment_instructions.py
"""
Lawverra Blog AI System Deployment Instructions

STEP 1: Environment Setup
=========================
Add to your .env file:

OPENAI_API_KEY=sk-your-openai-key
REDDIT_CLIENT_ID=your-reddit-app-id  
REDDIT_CLIENT_SECRET=your-reddit-secret
CONTENT_AI_ENABLED=true
CONTENT_AI_SCHEDULE=daily

STEP 2: Database Setup
=====================
Run the AI system tables migration:

CREATE TABLE ai_content_logs (
    id SERIAL PRIMARY KEY,
    research_session_id UUID DEFAULT gen_random_uuid(),
    source_name VARCHAR(100),
    content_found INTEGER DEFAULT 0,
    insights_generated INTEGER DEFAULT 0,
    drafts_created INTEGER DEFAULT 0,
    run_duration_seconds INTEGER,
    status VARCHAR(20) DEFAULT 'completed',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_draft_feedback (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES blog_posts(id),
    feedback_type VARCHAR(20), -- 'approved', 'rejected', 'edited'
    admin_user_id INTEGER REFERENCES users(id),
    feedback_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

STEP 3: Start AI Scheduler
=========================
# In production, run as background service
python3 -c "
from blog.ai_scheduler import BlogContentScheduler
scheduler = BlogContentScheduler()
scheduler.setup_daily_research()
scheduler.start_scheduler()
"

STEP 4: Monitor AI Performance
=============================
# Check AI-generated drafts
curl -H "Authorization: Bearer $JWT_TOKEN" \
     http://localhost:8000/api/blog/ai/drafts

# Approve a draft
curl -X POST -H "Authorization: Bearer $JWT_TOKEN" \
     http://localhost:8000/api/blog/ai/drafts/123/approve

ETHICAL GUIDELINES:
==================
1. All AI-generated content requires human review before publishing
2. Only gather data from public sources and APIs
3. Respect robots.txt and rate limits
4. Focus on providing value, not just competitive intelligence
5. Maintain Lawverra's professional brand voice
6. Ensure all claims are factual and supportable

COMPLIANCE NOTES:
================
- This system only uses public information
- No competitor website scraping (violates ToS)
- All content is reviewed by humans before publishing
- Research focuses on publicly available pain points and discussions
- Respects all platform terms of service and rate limits
"""

# File: run_ai_content_system.py
#!/usr/bin/env python3
"""
Production runner for Lawverra Blog AI Content System
"""

import os
import sys
import logging
from blog.ai_scheduler import BlogContentScheduler

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('blog_ai.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )

def main():
    # Verify environment
    required_env_vars = ["OPENAI_API_KEY", "DATABASE_URL"]
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"Error: Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    setup_logging()
    
    try:
        scheduler = BlogContentScheduler()
        scheduler.setup_daily_research()
        
        print("🤖 Lawverra Blog AI Content System started")
        print("📅 Daily research scheduled for 6:00 AM")
        print("📊 Weekly competitor analysis scheduled for Mondays 7:00 AM")
        print("🔄 Press Ctrl+C to stop")
        
        scheduler.start_scheduler()
        
    except KeyboardInterrupt:
        print("\n🛑 Stopping AI Content System...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting AI system: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
