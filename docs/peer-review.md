# Sprint 2 – Partial Peer Review Template Used

**Date:** YYYY-MM-DD  
**Reviewer:** <name or self-review>  
**Scope:** /src (controllers, routes, models), .env usage

## Checklist
- [ ] API starts with `npm run dev` and connects to MongoDB
- [ ] Endpoints: POST/GET/PATCH/DELETE restaurants; POST/GET/PATCH/DELETE reviews
- [ ] Validation returns 400 on bad input; 404 on missing ids
- [ ] Central error handler returns JSON and proper status codes
- [ ] Mongoose models align with Sprint-1 structure (`address.coord` legacy pair)
- [ ] `ratingSummary` updates after review create/update/delete
- [ ] Postman collection runs end-to-end (green tests)
- [ ] README explains install/run/test; screenshots added