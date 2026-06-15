const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseFacultyRow } = require('../utils/faculty');

describe('parseFacultyRow', () => {
  it('returns defaults for missing array fields', () => {
    const result = parseFacultyRow({ id: 1, name: 'Dr. Test', email: 'test@example.com', department: 'CS', available_slots: 0, last_updated: '2024-01-01' });
    assert.deepStrictEqual(result.degree_types, []);
    assert.deepStrictEqual(result.research_areas, []);
    assert.deepStrictEqual(result.recent_papers, []);
    assert.deepStrictEqual(result.cosupervisors, []);
  });

  it('preserves provided fields', () => {
    const row = { id: 2, name: 'Dr. Smith', email: 's@example.com', department: 'EE', available_slots: 3, last_updated: '2024-01-01', degree_types: ['MSc'], research_areas: ['AI'] };
    const result = parseFacultyRow(row);
    assert.strictEqual(result.name, 'Dr. Smith');
    assert.deepStrictEqual(result.degree_types, ['MSc']);
  });
});
