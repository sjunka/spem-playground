# 04 — Persistencia y JSON

**What to build:** The user's work survives. Edits autosave, so a stray refresh costs
nothing. The whole model can be exported as a JSON file to keep beside the document or send
to a colleague, and imported back on another machine. A "Restablecer" action reloads the
four **Fases** from the source document after confirming, so an experiment can be abandoned
safely.

A malformed or unrelated JSON file must be rejected with a message naming what was wrong —
never partially applied, never silently coerced. Both file import and reading the saved
value are untrusted input and go through the same validation.

**Blocked by:** 03.

**Status:** ready-for-agent

- [ ] Every change autosaves; reloading the page restores the model exactly
- [ ] "Exportar JSON" downloads the whole model as a file
- [ ] "Importar JSON" reads a file and replaces the model after validation
- [ ] "Restablecer" asks for confirmation, then reseeds the four **Fases** from the document
- [ ] A corrupted saved value falls back to the seed instead of crashing the app
- [ ] A rejected import leaves the current model untouched and shows a message naming the
      problem
- [ ] Validation is hand-written — no schema library added
- [ ] Validation test: a model round-tripped through export and import is unchanged
- [ ] Validation test: an unknown `version` is rejected
- [ ] Validation test: a payload missing `fases` is rejected
- [ ] Validation test: a **Fase** missing a required field is rejected
- [ ] Validation test: a **Fase** whose `roles` is a string instead of an array is
      rejected, not coerced
- [ ] Validation test: `null`, an array, a string and a number are each rejected
- [ ] Validation test: unrecognised extra properties are tolerated and dropped
- [ ] Validation test: rejection returns a message, it does not throw
- [ ] Work happens on a branch named `ticket/04-persistencia-y-json`; it is merged into
      `main` once all criteria pass and tests are green
