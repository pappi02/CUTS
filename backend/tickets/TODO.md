# Priority & SLA + Automation Rules Implementation

**Status: In Progress [1/11]**

1. [ ] Create backend/core/utils/__init__.py (empty)
2. [ ] Create backend/core/utils/rule_engine.py (evaluate_condition, apply_actions)
3. [ ] Add BusinessHours & Rule models to backend/core/models.py
4. [ ] Update backend/core/admin.py (register BusinessHoursAdmin, RuleAdmin)
5. [ ] Create backend/tickets/utils.py (add_business_hours function)
6. [ ] Update backend/tickets/models.py (import utils, conditional SLA with business hours)
7. [ ] Create backend/tickets/signals.py (post_save automation rules)
8. [ ] Update backend/tickets/apps.py (ready() -> import signals)
9. [ ] Create backend/tickets/tasks.py (SLA breach checks)
10. [ ] Update backend/cuts/settings/base.py (DEFAULT_FROM_EMAIL, CELERY_BEAT_SCHEDULE)
11. [ ] Run makemigrations/migrate; test (business hours, rules, celery beat)

**Next:** Step 1-2 (core utils).
