---
name: ai-automation-workflows
description: AI workflows that actually sell. Build and monetize AI automations for businesses.
triggers:
  - ai automation
  - n8n workflows
  - make money with ai
  - sell ai agents
  - ai agency
  - automate workflows
  - ai workflows 2026
  - ai business
tools:
  - n8n
  - supabase
  - Gemini API
  - Claude API
---

# AI Automation Workflows That Sell

## Overview

Based on Nate Herk's research of 500+ AI workflows, these are the automation patterns that actually generate revenue in 2026. The key insight: **build for specific business problems, not generic AI features**.

## The 5 Most Profitable AI Workflows

### 1. Personalized Outreach Writer
**Price Range:** $1,500 - $2,500
**Problem Solved:** Manual cold outreach writing

**How it works:**
1. Feed a list of contacts (CSV, Google Sheets)
2. AI researches each person (LinkedIn, company data)
3. Generates personalized messages for each contact
4. Output: Ready-to-send emails/messages

**Use case for insurance CRM:**
- Generate personalized WhatsApp messages for leads
- Create follow-up sequences based on lead data
- Auto-generate email templates per coverage type

---

### 2. Sales Quoting Agent
**Price Range:** $3,000 - $5,000
**Problem Solved:** Hours of admin work on quotes

**How it works:**
1. Customer submits inquiry
2. AI pulls relevant pricing/availability data
3. Generates quote with all variables
4. Logs into CRM automatically
5. Sends confirmation to customer

**Use case for insurance CRM:**
- Auto-generate insurance quotes based on form inputs
- Calculate coverage options and premiums
- Populate lead data from quote into CRM

---

### 3. Internal Slack/Teams Assistant
**Price Range:** $4,000 - $7,000
**Problem Solved:** Constant context switching, digging through files

**How it works:**
1. Connects to company data sources
2. Answers common questions instantly
3. Retrieves internal docs/policies
4. Summarizes meetings and threads

**Use case for insurance CRM:**
- Chat with your lead database
- "Show me all leads from CDMX interested in family plans"
- Auto-generate reports from natural language queries

---

### 4. Customer Support AI Agent
**Price Range:** $5,000 - $10,000
**Problem Solved:** Slow response times, repetitive questions

**How it works:**
1. Connects to knowledge base
2. Handles tier-1 support questions
3. Escalates complex issues to humans
4. Books appointments automatically

**Use case for insurance CRM:**
- WhatsApp bot for instant lead responses
- Answer coverage questions 24/7
- Schedule advisor calls automatically

---

### 5. AI Concierge/Onboarding Agent
**Price Range:** $8,000 - $15,000
**Problem Solved:** Manual onboarding, member management

**How it works:**
1. Greets new customers
2. Collects necessary information
3. Guides through onboarding steps
4. Manages appointments and reminders
5. Remembers context across conversations

**Use case for insurance CRM:**
- Onboard new leads automatically
- Collect documents via WhatsApp
- Schedule policy review calls
- Send personalized reminders

---

## Pricing Strategy: Value-Based

### The Formula
```
Client Hourly Rate × Hours Saved/Week × 52 weeks × Confidence Factor = Annual Value
Annual Value × 0.1-0.2 = Project Price
```

### Example for Insurance
- **Client saves:** 10 hours/week
- **Advisor hourly rate:** $50 USD
- **Annual value:** $50 × 10 × 52 = $26,000
- **Your price:** $2,600 - $5,200

### What to Show Clients
1. Current state: Manual process, X hours/week
2. Future state: Automated, 0 hours/week
3. Time saved: X hours × $rate = $Y/month
4. Your price: $Z (with 3-month ROI)

---

## Tech Stack for Building

### For This Insurance CRM Project
```javascript
// Stack: n8n + Supabase + Gemini/Claude

// 1. Lead Qualification Agent
n8n workflow → Supabase leads table → Gemini API → 
  Score lead → Update lead status → Send WhatsApp notification

// 2. Auto-Quote Generator
Form submission → Supabase products → Claude API → 
  Generate quote → Store in DB → Email to lead

// 3. WhatsApp Onboarding Bot
WhatsApp webhook → Lead data → Gemini → 
  Guide through steps → Collect documents → Schedule call
```

---

## Key Insights from 500 Workflows

1. **Specific > Generic:** "Lead qualifier for insurance" > "AI chatbot"
2. **Outcome > Technology:** "Save 10 hours/week" > "Uses GPT-4"
3. **Simple > Complex:** 3-step workflow > 50-step automation
4. **Integrations > AI:** n8n connections > custom code

---

## Implementation Examples

### Example 1: Lead Scoring Workflow
```javascript
// Trigger: New lead created in Supabase
// Process:
// 1. Get lead data (age, coverage, city, plan)
// 2. Score based on conversion likelihood
// 3. If score > 80: Auto-send WhatsApp welcome
// 4. If score < 40: Add to "needs nurture" list
// 5. Update lead status and score in DB
```

### Example 2: Quote Follow-up Automation
```javascript
// Trigger: 48 hours after quote sent
// Process:
// 1. Check lead status in Supabase
// 2. If no response: Send personalized follow-up
// 3. Include coverage summary from original quote
// 4. Offer to schedule call
// 5. Log follow-up in lead timeline
```

### Example 3: Renewal Reminder System
```javascript
// Trigger: 30 days before policy renewal
// Process:
// 1. Query leads with expiring policies
// 2. Generate personalized renewal offer
// 3. Send via preferred channel (WhatsApp/Email)
// 4. Create follow-up task for advisor
```

---

## Resources

- **Video Source:** [I Built 500 AI Workflows, These 5 Actually Sell in 2026](https://www.youtube.com/watch?v=Y3PcRp5RFzk)
- **n8n Workflow Builder:** https://n8n.io
- **Nate Herk's Course:** https://www.skool.com/ai-automation-society

---

## Difficulty Level

- **Level:** Intermediate
- **Time to Build First Workflow:** 2-4 hours
- **Time to First Paid Client:** 1-2 weeks

## Related Skills

- n8n-automation
- automate-whatsapp
- supabase-postgres-best-practices
