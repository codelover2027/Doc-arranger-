export interface SampleDoc {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'business_report',
    title: 'Q3 Operations & Growth Review (Messy Draft)',
    category: 'Business & Operations',
    description: 'Scattered findings, misplaced financial data, spelling typos ("definately", "recieved"), and missing executive flow.',
    content: `# Q3 Operations And Growth Revue

We should definately invest more in automated dispatching systems because customer retention droped 14% last month. Also Sarah will follow up on the vendor contracts by next friday.

## Financials and Misc Thoughts
The server costs was higher than projected by 22% in August. We spent $42,500 on infrastructure cloud billings. However customer aqquisition cost fell from $85 to $68 which is a good trend. 

[Insert detailed CAC breakdown here TBD]

John from logistics mentioned that packaging delays is causing 3 day backorders in Midwest region. In spite of the fact that the team worked overtime, they could not fullfill the backlog.

## Background and History
Our company was founded in 2021 with the goal of providing rapid on-demand logistics solutions for mid-sized manufacturers. Last year we expanded into 4 new territories across North America.

## Recommendations
- Buy 5 new forklift units
- Fix the API latency bug in order ingestion
- Hire 3 customer support reps for night shift
- We must make sure that all invoices is signed before delivery

## Next Steps and Action Items
Tom will schedule a meeting with the cloud provider to negotiate committed use discounts. Also we need to revise the Q4 forecast before the board meeting on November 15th.`
  },
  {
    id: 'project_proposal',
    title: 'Customer Portal 2.0 Scope & Architecture',
    category: 'Product & Tech',
    description: 'Jumbled chronology, broken lists, run-on sentences, typos, and out-of-order architecture specs.',
    content: `# Customer Portal 2.0 Project Scope

The project will cost approximately $120,000 and take 14 weeks to complete, but the risk of delay is high if security sign-off is postponed.

## Technical Architecture
We are planning to migrate the frontend from legacy Backbone to React 19, and the database should be upgraded to Postgres 16 with read replicas because during peak flash sales our current MySQL database throttled out and caused 504 gateway timeout errors for over twenty minutes.

- Authentication: OAuth2 with JWT tokens
- Payment processing: Stripe Elements integration
- File uploads: Direct to S3 presigned urls
- Analytics: Segment plus Mixpanel tracking

## Problem Statement
Our current portal was built in 2018 and customers frequently complain about sluggish load times, confusing navigation on mobile devices, and frequent session logouts during checkout.

## Deliverables & Milestones
- Phase 3: User Acceptance Testing and staging dry-run (Week 11-12)
- Phase 1: UX Wireframes and Design System tokens (Week 1-3)
- Phase 4: Production cutover and DNS switch (Week 13-14)
- Phase 2: Core API endpoints and Dashboard UI development (Week 4-10)

## Security and Compliance
All user passwords must be hashed with argon2. We must comply with SOC2 Type II controls. [Insert DPA agreement with data processor].`
  },
  {
    id: 'meeting_notes',
    title: 'Executive Sync & Product Strategy Notes',
    category: 'Strategy & Meetings',
    description: 'Raw bullet points, disconnected thoughts, missing structure, typos, and unorganized decisions.',
    content: `# Monday Exec Sync Notes

Date: Oct 26
Attendees: Elena, Marcus, Priya, Dave

notes:
Priya showed the retention numbers. Churn is higher among free tier users who dont onboard within 48 hours. Marcus suggested sending an automated email drip sequence with interactive tutorials. 

Elena raised concerns about marketing budget burning too fast on paid search ads without clear attribution. Dave said attribution tracking was broken since the last iOS update and need fixing ASAP.

Decisions:
1. pause search campaign beta until attribution fix is deployed
2. approve hire for Senior Growth Designer
3. push mobile app launch from Nov 1 to Nov 20 to allow regression testing

Follow-ups:
- Dave: talk to analytics team by wednesday
- Elena: draft updated budget spreadsheet
- Priya: prepare onboarding wireframes for Friday review

Other discussion:
The annual company offsite was discussed. Tentative location is Denver or Salt Lake City. Budget cap is $450 per person excluding flights.`
  },
  {
    id: 'research_summary',
    title: 'AI in Supply Chain Logistics - Research Paper',
    category: 'Academic & Research',
    description: 'Dense unformatted text, passive voice, missing headings, punctuation lapses, and weak transitions.',
    content: `Artificial intelligence has increasingly permeated supply chain management in recent years due to the exponential growth of predictive analytics and neural networks. Many supply chains suffers from information asymmetry and delayed bullwhip effects where small fluctuations in retail demand causes massive distortions upstream at manufacturing plants. In our empirical survey of 45 distribution centers across Germany and France, it was observed that machine learning demand-forecasting algorithms reduced inventory holding costs by 18.4 percent on average. Furthermore delivery routing optimization models demonstrated a 12.2 percent reduction in diesel fuel consumption. Nevertheless significant hurdles remains regarding legacy ERP software integration and resistance from warehouse floor operators who is reluctant to trust automated inventory allocation suggestions. In conclusion, while AI deployment delivers measurable efficiency dividends, organizational change management and robust API middleware is indispensable for enduring success.`
  }
];
