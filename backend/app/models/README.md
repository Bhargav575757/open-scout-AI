# OpenScout Database Models

This package defines data models, relational tables, and vector schemas for subsequent persistence phases.

## Planned Data Entities (Phase 4+)

1. **Repository Entity (`repository.py`)**:
   - `id`: Unique identifier / slug.
   - `owner`: GitHub user or organization name.
   - `name`: Repository name.
   - `full_name`: Combined `owner/name`.
   - `description`: Primary summary.
   - `language`: Primary programming language.
   - `stars`: Stargazers count.
   - `forks`: Forks count.
   - `topics`: Array of string topic tags.
   - `license`: SPDX license identifier.
   - `readme_content`: Raw crawled markdown.
   - `last_pushed_at`: Last commit timestamp.

2. **Embedding Entity (`embedding.py`)**:
   - `id`: Vector record ID.
   - `repository_id`: Foreign key reference to Repository.
   - `embedding`: Vector column (`vector(384)`) indexed using HNSW / IVFFlat via `pgvector`.
   - `chunk_text`: Associated documentation chunk.

3. **Search Interaction Entity (`search_history.py`)**:
   - `id`: Unique interaction ID.
   - `query`: Raw user query.
   - `extracted_criteria`: JSON breakdown of Mistral-parsed requirements.
   - `created_at`: Interaction timestamp.
   - `result_count`: Number of returned candidates.

