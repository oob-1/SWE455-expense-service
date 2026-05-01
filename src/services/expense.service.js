const { getPool } = require('../db/pool');

class HttpError extends Error {
  constructor(status, code, message) {
    super(message); this.status = status; this.code = code; this.expose = true;
  }
}
exports.HttpError = HttpError;

const SELECT_COLUMNS = `id, user_id, title, amount, category, expense_date, notes, created_at, updated_at`;

exports.create = async (userId, body) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    `INSERT INTO expenses (user_id, title, amount, category, expense_date, notes)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING ${SELECT_COLUMNS}`,
    [userId, body.title, body.amount, body.category, body.expense_date, body.notes ?? null]
  );
  return rows[0];
};

exports.list = async (userId, { limit, offset, from, to, category }) => {
  const pool = await getPool();
  const params = [userId];
  let where = `user_id = $1`;
  if (from)     { params.push(from);     where += ` AND expense_date >= $${params.length}`; }
  if (to)       { params.push(to);       where += ` AND expense_date <= $${params.length}`; }
  if (category) { params.push(category); where += ` AND category = $${params.length}`; }
  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM expenses
     WHERE ${where}
     ORDER BY expense_date DESC, id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return { items: rows, limit, offset, count: rows.length };
};

exports.getOne = async (userId, id) => {
  const pool = await getPool();
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM expenses WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (!rows[0]) throw new HttpError(404, 'NOT_FOUND', 'expense not found');
  return rows[0];
};

exports.update = async (userId, id, patch) => {
  const allowed = ['title', 'amount', 'category', 'expense_date', 'notes'];
  const sets = []; const params = [];
  for (const key of allowed) {
    if (patch[key] !== undefined) {
      params.push(patch[key]);
      sets.push(`${key} = $${params.length}`);
    }
  }
  if (!sets.length) return exports.getOne(userId, id);

  params.push(id, userId);
  const pool = await getPool();
  const { rows } = await pool.query(
    `UPDATE expenses SET ${sets.join(', ')}
     WHERE id = $${params.length - 1} AND user_id = $${params.length}
     RETURNING ${SELECT_COLUMNS}`,
    params
  );
  if (!rows[0]) throw new HttpError(404, 'NOT_FOUND', 'expense not found');
  return rows[0];
};

exports.remove = async (userId, id) => {
  const pool = await getPool();
  const { rowCount } = await pool.query(
    `DELETE FROM expenses WHERE id = $1 AND user_id = $2`, [id, userId]);
  if (!rowCount) throw new HttpError(404, 'NOT_FOUND', 'expense not found');
};
