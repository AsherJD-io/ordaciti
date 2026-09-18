# AI Log

*This document records all AI usage in the Ordaciti project.*

**Status:** Empty — no AI calls made yet.

---

## Format

Each entry records:

- **Date:** When the AI call was made
- **Task:** What the AI was asked to do
- **AI model/tool:** Which model or tool was used
- **Prompt purpose:** What the prompt was designed to achieve
- **Human review:** Whether and how a human reviewed the output
- **Changes accepted:** What changes were made based on AI output
- **Tests performed:** What tests validated the output

---

## Entries

[Nothing yet — to be populated during Phase 10 (AI) and later]

---

## Rules

Per implementation.md section 25, the system prompt enforces:

1. Use only supplied evidence.
2. Never invent facts.
3. Never invent numbers.
4. Never invent dates.
5. Never invent contractors.
6. Never infer political motivation.
7. Never infer corruption.
8. Never infer fraud.
9. Never infer collusion.
10. Never treat missing evidence as evidence of absence.
11. Distinguish fact, signal, and question.
12. State uncertainty.
13. Reference supplied source IDs.
14. Avoid sensational language.
15. Do not rank political actors.
16. Do not recommend political choices.
17. Do not make unsupported policy conclusions.
18. Do not turn analytical signals into accusations.

---

## AI Test Cases

Per implementation.md section 49, the following test cases must be verified:

1. **Missing implementation** — AI says "Implementation evidence is unavailable in the retrieved records," not "The project was not implemented."
2. **Repeated project** — AI generates repeat intervention signal, not "waste."
3. **Recurring contractor** — AI generates contractor recurrence signal, not "favoritism."
4. **Geographic concentration** — AI says "Recorded expenditure concentration differs from population distribution," not "misallocation."
5. **Contract change** — AI says "Recorded contract value changed from X to Y," not "contract inflation."
