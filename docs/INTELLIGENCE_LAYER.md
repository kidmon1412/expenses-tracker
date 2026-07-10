# Intelligence Layer — Expenses Tracker

## Messy Inputs
- Free-text transaction notes: "grabbed lunch w/ client", "uber home", "paid rent"
- No category selected by user
- Inconsistent channel labels

## Auto-Structure (v1 rule-based, v2 AI)
```json
{
  "raw_note": "grabbed lunch w/ client",
  "suggested_category": "Food",
  "suggested_channel": "online",
  "source": "keyword-rules-v1",
  "confidence": 0.75,
  "review_status": "unreviewed"
}
```

## Events to Track
- Transaction logged
- Category changed after suggestion
- Budget threshold crossed (80 %, 100 %)
- Savings target met
- Report generated

## Scoring Rules (rule-based first)
| Signal | Score |
|---|---|
| Keyword match in note → category | +0.6 |
| Amount range matches category median | +0.2 |
| User previously accepted same suggestion | +0.2 |

## What Gets Ranked
- Category suggestion confidence (shown inline on form)
- Months where overspend risk is highest (dashboard callout)

## v1 vs Later
**v1:** keyword-rule category suggestion stored with confidence + review_status.
**Next:** LLM-based suggestion replacing keyword rules, same storage schema.
**Later:** Monthly spend-pattern summary narrative, proactive savings advice.
