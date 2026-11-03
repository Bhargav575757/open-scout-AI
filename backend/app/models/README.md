# OpenScout Database Models

This package defines SQLAlchemy ORM models, relational tables, and vector schemas for PostgreSQL and pgvector.

## Implemented Data Entities (Phase 6)

1. **Repository Record (`repository.py`)**:
   - `id`: GitHub numeric repository ID (BigInteger, Primary Key).
   - `owner`: GitHub user or organization name.
   - `name`: Repository name.
   - `full_name`: Unique combined identifier `owner/name` (Indexed).
   - `description`: Primary summary.
   - `html_url`: Canonical GitHub URL.
   - `language`: Primary programming language.
   - `topics`: JSON list of string topic tags.
   - `stargazers_count`: Stargazers count.
   - `forks_count`: Forks count.
   - `open_issues_count`: Open issues count.
   - `license_name`: SPDX license identifier.
   - `readme_content`: Full crawled markdown content.
   - `embedding`: Vector column (`vector(384)`) for semantic repository search.
   - `is_indexed`: Boolean flag indicating if README documentation is chunked & indexed.
   - `last_indexed_at`: Timestamp of most recent documentation indexing.

2. **Documentation Chunk (`documentation.py`)**:
   - `id`: Integer Primary Key.
   - `repository_id`: Foreign key reference to `repositories.id` (Indexed).
   - `chunk_index`: Integer ordering within the documentation.
   - `chunk_text`: Cleaned markdown text chunk.
   - `embedding`: Vector column (`vector(384)`) for RAG retrieval.
   - `token_count`: Estimated token count.

3. **Chat Conversation & Messages (`chat.py`)**:
   - **`ChatConversation`**:
     - `id`: UUID string Primary Key.
     - `repository_id`: Foreign key reference to `repositories.id`.
     - `created_at`, `updated_at`: Session timestamps.
   - **`ChatMessage`**:
     - `id`: Integer Primary Key.
     - `conversation_id`: Foreign key reference to `chat_conversations.id` (Indexed).
     - `role`: Message role (`user`, `assistant`, or `system`).
     - `content`: Message markdown content.
     - `sources`: JSON list of referenced chunk citations and similarity scores.
     - `created_at`: Message timestamp.
