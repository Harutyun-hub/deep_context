-- Migration: Optimize chat tables for Conversational RAG
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Add content_text column to messages table
-- This column stores plain text extracted from AI JSON responses
-- for easier n8n/RAG querying
-- ============================================
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS content_text TEXT;

-- ============================================
-- 2. Add summary column to conversations table
-- This stores a brief summary of the conversation for quick context
-- ============================================
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- ============================================
-- 3. Create index on content_text for faster text search
-- ============================================
CREATE INDEX IF NOT EXISTS idx_messages_content_text 
ON messages USING gin(to_tsvector('english', COALESCE(content_text, '')));

-- ============================================
-- 4. Create index on conversation_id for faster message lookups
-- ============================================
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

-- ============================================
-- 5. Create index on created_at for time-based queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at DESC);

-- ============================================
-- 6. Backfill existing messages with extracted text
-- This extracts the 'text' field from JSON content in existing messages
-- ============================================
UPDATE messages 
SET content_text = 
    CASE 
        WHEN content LIKE '{%' AND content LIKE '%"text"%' THEN
            -- Extract text from JSON structure
            (content::jsonb->>'text')
        ELSE 
            -- Keep as-is for plain text messages
            content
    END
WHERE content_text IS NULL;

-- ============================================
-- 7. Backfill conversation titles from first user message
-- ============================================
UPDATE conversations c
SET title = COALESCE(
    c.title,
    (
        SELECT 
            CASE 
                WHEN LENGTH(m.content) > 50 THEN LEFT(m.content, 50) || '...'
                ELSE m.content
            END
        FROM messages m
        WHERE m.conversation_id = c.id 
        AND m.role = 'user'
        ORDER BY m.created_at ASC
        LIMIT 1
    )
)
WHERE c.title IS NULL OR c.title = '';

-- ============================================
-- VERIFICATION QUERIES (run these to verify)
-- ============================================
-- Check messages structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages';

-- Check conversations structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'conversations';

-- Sample message data:
-- SELECT id, role, LEFT(content, 50) as content_preview, LEFT(content_text, 50) as text_preview 
-- FROM messages ORDER BY created_at DESC LIMIT 10;
