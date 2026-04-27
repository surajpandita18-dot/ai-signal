-- AI Signal v2 — seed data for local development
-- One published issue (#1) with 3 stories + one test subscriber

-- Issue #1
insert into issues (issue_number, slug, published_at, editor_note, long_read, status)
values (
  1,
  '2026-04-27',
  '2026-04-27 03:30:00+00',
  'This week the AI labs made three moves that, taken together, suggest the game is changing faster than most product roadmaps can absorb. GPT-5 mini repriced the API market overnight. Cursor crossed 1M paying users while everyone was distracted by the model race. And the quiet capital flowing into inference infrastructure tells you where the real bets are being placed. Read on.',
  '{"title": "The Model Is Not The Product", "url": "https://stratechery.com", "source": "Stratechery", "why_pick": "Ben Thompson''s clearest articulation yet of why foundation model commoditisation accelerates application layer value — required reading if you are deciding where to build."}',
  'published'
);

-- Stories for issue #1
with issue as (select id from issues where slug = '2026-04-27')

insert into stories (
  issue_id, position, category,
  headline, summary, why_it_matters,
  deeper_read, lens_pm, lens_founder, lens_builder,
  sources, read_minutes
)
select
  issue.id,
  s.position,
  s.category,
  s.headline,
  s.summary,
  s.why_it_matters,
  s.deeper_read,
  s.lens_pm,
  s.lens_founder,
  s.lens_builder,
  s.sources::jsonb,
  s.read_minutes
from issue, (values
  (
    1,
    'models',
    'GPT-5 Mini cuts API costs by 10x — and reprices every AI product budget overnight',
    'OpenAI shipped GPT-5 Mini this week at $0.04 per million input tokens, a 10x reduction from GPT-4o Mini. Early benchmarks show it outperforms GPT-4 Turbo on most reasoning tasks while costing a fraction of the price. The Rundown, TLDR AI, and Ben''s Bites all led with this — the coverage was near-identical across sources, which is exactly the problem AI Signal exists to solve.',
    'Every AI product budget you set in Q1 is now wrong. The cost reduction is large enough to unlock use cases that were previously uneconomical — high-volume summarisation, always-on assistants, per-user personalisation at scale. The question is not whether to reprice; it is which of your deferred features just became viable.',
    'The timing matters: GPT-5 Mini arrives two weeks after Anthropic cut Haiku pricing. This is not coincidence — it is the opening of a price war at the commodity tier. The labs are competing on cost while differentiating on capability at the top. For builders, that means the infrastructure layer is getting cheaper faster than anyone modelled. The winners in 12 months will be the teams that moved their cost assumptions down in April.',
    'Reprice your API cost assumptions in your roadmap this week. If you had features gated behind cost constraints, open them for re-evaluation. The 10x reduction is not a one-time event — model a scenario where costs drop another 5x by Q4.',
    'If you are a founder, your burn rate on AI API calls just got a tailwind. More importantly, your competitors'' moat on "we can afford to do this at scale" just narrowed. Differentiate on the product layer, not the cost layer.',
    'Pin the new pricing. Run your current production token counts against it. Identify the three highest-volume API calls in your system and model what you could do if they cost 10x less. That is your next sprint backlog.',
    '[{"label": "OpenAI pricing page", "url": "https://openai.com/pricing"}, {"label": "The Rundown AI", "url": "https://therundown.ai"}]',
    3
  ),
  (
    2,
    'tools',
    'Cursor hits 1 million paying users — and the dev tool market will never look the same',
    'Cursor announced 1 million paid subscribers this week, generating an estimated $100M+ ARR from a product that did not exist two years ago. The Pragmatic Engineer and Latent Space both covered this, with notably different takes: TPE focused on the product lessons; Latent Space on what it means for the IDE incumbents (JetBrains, VS Code).',
    'This is the fastest B2D (business-to-developer) product to $100M ARR in history, beating even GitHub Copilot''s early growth. Developers are paying $20/month out of pocket — not expensing it, paying themselves — for a tool that makes them meaningfully faster. When developers pay personally, the product has crossed from "nice to have" to "I cannot work without this."',
    'Cursor''s growth is not really about Cursor. It is evidence that the developer''s relationship with their tools is being renegotiated. The IDE was stable for 20 years. It is now the most contested surface in software. What Cursor proved: AI-native beats AI-bolted-on, every time. Copilot was a feature added to VS Code. Cursor built the editor around the model. The lesson transfers beyond dev tools — whatever surface you own, ask whether you are adding AI to it or rebuilding it around AI.',
    'Your engineering team is already using Cursor, with or without your knowledge. The question for PMs is what that means for velocity estimates, PR review norms, and code quality standards. Get ahead of the policy conversation before it becomes a compliance problem.',
    'If you are not a dev tools company, the threat is indirect but real: your competitors are shipping faster. The productivity delta between a Cursor-native team and a non-Cursor team is estimated at 1.3–1.8x. That is a compounding advantage.',
    'If you are not already using Cursor daily, start this week. Not for productivity — for literacy. You need to understand what your PM and founder are about to ask you to do faster.',
    '[{"label": "The Pragmatic Engineer on Cursor", "url": "https://newsletter.pragmaticengineer.com"}, {"label": "Latent Space", "url": "https://www.latent.space"}]',
    4
  ),
  (
    3,
    'business',
    'The quiet $8B flowing into inference infrastructure tells you where 2027 will be won',
    'Three separate funding rounds closed this week for inference infrastructure companies — Groq ($2.8B), Cerebras ($3.1B pre-IPO), and a stealth compute startup ($2.2B). None of the major AI newsletters covered all three together. Ben''s Bites mentioned Groq. The Neuron had the Cerebras item. The stealth round came from a regulatory filing.',
    'The labs are winning the model race. The infrastructure layer — fast inference, low latency, specialised chips — is where the next capital concentration is happening. This is not a coincidence: as models commoditise, the competitive advantage shifts to whoever can serve them cheapest and fastest at scale.',
    'Read these three rounds together and a picture emerges: the inference layer is being treated as critical infrastructure, not just a cost centre. The companies placing these bets are not doing it to run models for $0.04 per million tokens. They are doing it because they believe latency and throughput will be the differentiator when the models themselves are interchangeable. For anyone building on top of foundation models, this means the cost curve will continue to compress — and the reliability and speed of your AI calls will matter more, not less.',
    'When evaluating AI infrastructure vendors, start asking about their inference stack, not just their model offering. The provider that can guarantee 200ms p95 latency at your volume in 18 months is worth more than the one with the best benchmark score today.',
    'The inference infrastructure race is a capital efficiency story. If you are raising, the investors writing these checks understand that AI is infrastructure now. Frame your AI spend as infrastructure investment, not R&D cost.',
    'Benchmark your current inference provider on latency under load. If you have not done a load test with realistic concurrent users, do it this week. The results will tell you whether you have an infrastructure problem you have not noticed yet.',
    '[{"label": "Ben''s Bites", "url": "https://bensbites.beehiiv.com"}, {"label": "The Neuron", "url": "https://www.theneurondaily.com"}]',
    4
  )
) as s(position, category, headline, summary, why_it_matters, deeper_read, lens_pm, lens_founder, lens_builder, sources, read_minutes);

-- Test subscriber
insert into subscribers (email, role, status)
values ('test@example.com', 'pm', 'active');
