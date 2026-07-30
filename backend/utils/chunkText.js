function chunkText(text) {

  const CHUNK_SIZE = 8000;
  const chunks = [];

  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  return chunks;
}

module.exports = chunkText;