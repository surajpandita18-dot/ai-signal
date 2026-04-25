# AI Signal — Source Pipeline
Last updated: 2026-04-25

## Active Sources (24)

### Tier 1 — Official Labs (authority: 1.0)
| Name | RSS URL | Category |
|------|---------|----------|
| OpenAI | https://openai.com/blog/rss.xml | LLM |
| Anthropic | https://www.anthropic.com/rss.xml | LLM |
| Google DeepMind | https://deepmind.google/blog/rss/ | Research |
| Meta AI | https://ai.meta.com/blog/rss/ | LLM |
| Mistral AI | https://mistral.ai/news/rss | LLM |
| Microsoft AI | https://blogs.microsoft.com/ai/feed/ | Product |

### Tier 2 — Research (authority: 0.9)
| Name | RSS URL | Category |
|------|---------|----------|
| HuggingFace | https://huggingface.co/blog/feed.xml | Research |
| Papers With Code | https://paperswithcode.com/latest/rss | Research |
| ArXiv CS.AI | https://export.arxiv.org/rss/cs.AI | Research |
| ArXiv CS.LG | https://export.arxiv.org/rss/cs.LG | Research |
| Google Research | https://research.google/blog/rss/ | Research |

### Tier 3 — Builder/Product (authority: 0.85)
| Name | RSS URL | Category |
|------|---------|----------|
| GitHub Blog | https://github.blog/feed/ | Infra |
| Vercel | https://vercel.com/blog/rss.xml | Infra |
| AWS ML Blog | https://aws.amazon.com/blogs/machine-learning/feed/ | Infra |
| Google Cloud AI | https://cloud.google.com/blog/products/ai-machine-learning/rss | Infra |

### Tier 4 — Newsletters/Media (authority: 0.75)
| Name | RSS URL | Category |
|------|---------|----------|
| The Batch | https://www.deeplearning.ai/the-batch/rss/ | Research |
| Latent Space | https://latent.space/feed | Research |
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ | Funding |
| The Verge AI | https://www.theverge.com/ai-artificial-intelligence/rss/index.xml | Product |
| VentureBeat AI | https://venturebeat.com/category/ai/feed/ | Funding |
| Wired AI | https://www.wired.com/feed/category/artificial-intelligence/latest/rss | Product |
| MIT Tech Review | https://www.technologyreview.com/feed/ | Research |
| Reuters Tech | https://feeds.reuters.com/reuters/technologyNews | Funding |

## Sources Backlog (add next)
| Name | URL | Why | Priority |
|------|-----|-----|----------|
| Ben's Bites | https://www.bensbites.com/feed | Builder-friendly | HIGH |
| Superhuman AI | newsletter only | Fast news | HIGH |
| The Neuron | newsletter only | Fast news | HIGH |
| AlphaSignal | https://alphasignal.ai/rss | Research depth | MED |
| TheSequence | newsletter only | MLOps depth | MED |
| DataNorth AI | TBD | Business/ROI | MED |
| KDnuggets | https://www.kdnuggets.com/feed | Tutorials | LOW |

## Social Signal Layer (manual monitoring)
These don't have RSS — check manually or via Twitter API:
@AndrewYNg — research + business implications
@karpathy — technical depth + education
@bentossell — builder tools + workflows
@sama — OpenAI + macro AI moves
@goodside — prompt engineering + LLM quirks
@EMostaque — open source + policy

## Editorial Filter (from SOP)
Score each signal before LLM processing:
Reader relevance:  Will PM/founder/engineer care? (1-5)
Practical value:   Can it produce an action? (1-5)
Novelty:           Genuinely new or repeated hype? (1-5)
Credibility:       Primary or high-trust source? (1-5)
Long-tail value:   Worth saving or forwarding? (1-5)

Minimum total score to process: 12/25
Top 15% by combined score → LLM processing

## What to Ignore (from positioning doc)
- Hype-only pieces (no practical implication)
- Repetitive coverage of same event (novelty < 2)
- Speculative content without evidence
- Generic "AI will change everything" takes
- Job postings, event announcements

## How to Add Source
1. Add to correct tier table above
2. Add URL to scripts/fetch-news.mjs SOURCES array
3. Test: node scripts/fetch-news.mjs
4. Update authority score in lib/sources.ts
