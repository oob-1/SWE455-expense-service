const router = require('express').Router();
const { z } = require('zod');
const auth     = require('../middleware/auth');
const validate = require('../middleware/validate');
const svc      = require('../services/expense.service');

const createSchema = z.object({
  title:        z.string().min(1).max(140),
  amount:       z.number().nonnegative().multipleOf(0.01),
  category:     z.string().min(1).max(40),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes:        z.string().max(2000).optional(),
});

const patchSchema = createSchema.partial();

router.use(auth);

router.post('/expenses', validate(createSchema), async (req, res, next) => {
  try { res.status(201).json(await svc.create(req.user.id, req.body)); }
  catch (e) { next(e); }
});

router.get('/expenses', async (req, res, next) => {
  try {
    const limit  = Math.min(Number(req.query.limit  || 20), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    res.json(await svc.list(req.user.id, {
      limit, offset,
      from:     req.query.from,
      to:       req.query.to,
      category: req.query.category,
    }));
  } catch (e) { next(e); }
});

router.get('/expenses/:id', async (req, res, next) => {
  try { res.json(await svc.getOne(req.user.id, Number(req.params.id))); }
  catch (e) { next(e); }
});

router.patch('/expenses/:id', validate(patchSchema), async (req, res, next) => {
  try { res.json(await svc.update(req.user.id, Number(req.params.id), req.body)); }
  catch (e) { next(e); }
});

router.delete('/expenses/:id', async (req, res, next) => {
  try { await svc.remove(req.user.id, Number(req.params.id)); res.status(204).end(); }
  catch (e) { next(e); }
});

module.exports = router;
