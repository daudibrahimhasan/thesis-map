function createEnvelope(success, data = null, error = null) {
  return { success, data, error };
}

module.exports = { createEnvelope };
