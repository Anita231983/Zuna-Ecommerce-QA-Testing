# Zuna E-Commerce QA Testing

End-to-end QA of a live e-commerce storefront and admin CRM, completed as part of SkillShikshya QA Batch 10.

## What was done
- Test plan and 104 test scenarios; 16 test cases executed (13 Pass / 2 Fail / 1 Blocked)
- 16 items logged in the bug report (9 bugs + 7 observations), with severity and screenshots
- API testing with Postman (4 tests) and baseline security checks (4 tests: XSS, SQL injection, HTTPS, token storage)
- Database validation through the CRM (10 checks)
- Load test with JMeter: 10 concurrent users, 302 ms average response, 0% errors
- Playwright + TypeScript automation (Page Object Model) for Login → Add to Bag → Checkout, run across 6 browsers/devices

## Folder guide
All deliverables are inside `Zuna_QA_Final_Package/`:
- `01` Test Plan, `02` Test Scenarios, `03` Test Execution Report, `04` Bug Report
- `05` API Testing, `06` Security Testing, `07` Performance Testing, `08` Database Validation
- `09_Automation_Test_Script`, `10_Cross_Browser_Screenshots`
- `11` Final QA Summary Report, `12` Project Defense slides

## Tools
Postman, Apache JMeter, Playwright, TypeScript, Chrome DevTools, Git

Author: Anita Singh
