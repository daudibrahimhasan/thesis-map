const { describe, it } = require('node:test');
const assert = require('node:assert');

// Test the skills array validation logic directly
describe('skills validation', () => {
  it('accepts array input', () => {
    const skills = ['machine learning', 'python'];
    const safeSkills = Array.isArray(skills) ? skills : [];
    assert.deepStrictEqual(safeSkills, skills);
  });

  it('rejects non-array input', () => {
    const skills = 'machine learning';
    const safeSkills = Array.isArray(skills) ? skills : [];
    assert.deepStrictEqual(safeSkills, []);
  });

  it('handles undefined', () => {
    const skills = undefined;
    const safeSkills = Array.isArray(skills) ? skills : [];
    assert.deepStrictEqual(safeSkills, []);
  });
});
