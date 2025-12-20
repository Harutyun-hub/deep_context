const DB_CONTEXT = 'Database';
let dbRequestCounter = 0;

function generateRequestId() {
    return `req_${++dbRequestCounter}_${Date.now()}`;
}

function withTimeout(promise, timeoutMs, requestId, operationName) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`[${requestId}] ${operationName} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutId);
    });
}

function createSuccessResult(data) {
    return { success: true, data, error: null };
}

function createErrorResult(error) {
    const errorMessage = error?.message || String(error);
    return { 
        success: false, 
        data: null, 
        error: {
            message: errorMessage,
            code: error?.code || 'UNKNOWN',
            details: error?.details || null
        }
    };
}

async function createConversation(userId, title = null, sessionId = null) {
    const requestId = generateRequestId();
    Logger.info(`Creating conversation for user: ${userId}`, DB_CONTEXT, { requestId });
    
    try {
        const supabase = getSupabase();
        
        const { data, error } = await supabase
            .from('conversations')
            .insert([{
                user_id: userId,
                title: title,
                session_id: sessionId
            }])
            .select()
            .single();
        
        if (error) {
            Logger.error(error, DB_CONTEXT, { operation: 'createConversation', requestId, userId });
            return createErrorResult(error);
        }
        
        Logger.info(`Conversation created: ${data.id}`, DB_CONTEXT, { requestId });
        return createSuccessResult(data);
        
    } catch (err) {
        Logger.error(err, DB_CONTEXT, { operation: 'createConversation', requestId, userId });
        return createErrorResult(err);
    }
}

async function getUserConversations(userId, limit = 50) {
    const requestId = generateRequestId();
    Logger.info(`Getting conversations for user: ${userId}`, DB_CONTEXT, { requestId, limit });
    
    try {
        const supabase = getSupabase();
        
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(limit);
        
        if (error) {
            Logger.error(error, DB_CONTEXT, { operation: 'getUserConversations', requestId, userId });
            return createErrorResult(error);
        }
        
        const conversations = data || [];
        Logger.info(`Retrieved ${conversations.length} conversations`, DB_CONTEXT, { requestId });
        return createSuccessResult(conversations);
        
    } catch (err) {
        Logger.error(err, DB_CONTEXT, { operation: 'getUserConversations', requestId, userId });
        return createErrorResult(err);
    }
}

async function getConversation(conversationId) {
    const requestId = generateRequestId();
    const startTime = Date.now();
    Logger.info(`Getting conversation: ${conversationId}`, DB_CONTEXT, { requestId });
    
    try {
        const supabase = getSupabase();
        
        const queryPromise = supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();
        
        const result = await withTimeout(queryPromise, 10000, requestId, 'getConversation');
        const { data, error, status, statusText } = result;
        const elapsed = Date.now() - startTime;
        
        Logger.info(`getConversation response`, DB_CONTEXT, {
            requestId,
            hasData: !!data,
            status,
            statusText,
            elapsedMs: elapsed
        });
        
        if (error) {
            Logger.error(error, DB_CONTEXT, { operation: 'getConversation', requestId, conversationId });
            return createErrorResult(error);
        }
        
        return createSuccessResult(data);
        
    } catch (err) {
        const elapsed = Date.now() - startTime;
        Logger.error(err, DB_CONTEXT, { operation: 'getConversation', requestId, conversationId, elapsedMs: elapsed });
        return createErrorResult(err);
    }
}

async function updateConversationTitle(conversationId, title) {
    const requestId = generateRequestId();
    Logger.info(`Updating conversation title`, DB_CONTEXT, { requestId, conversationId, title });
    
    try {
        const supabase = getSupabase();
        
        const { data, error } = await supabase
            .from('conversations')
            .update({ title: title })
            .eq('id', conversationId)
            .select()
            .single();
        
        if (error) {
            Logger.error(error, DB_CONTEXT, { operation: 'updateConversationTitle', requestId, conversationId });
            return createErrorResult(error);
        }
        
        Logger.info('Title updated successfully', DB_CONTEXT, { requestId });
        return createSuccessResult(data);
        
    } catch (err) {
        Logger.error(err, DB_CONTEXT, { operation: 'updateConversationTitle', requestId, conversationId });
        return createErrorResult(err);
    }
}

async function deleteConversation(conversationId) {
    const requestId = generateRequestId();
    Logger.info(`Deleting conversation: ${conversationId}`, DB_CONTEXT, { requestId });
    
    try {
        const supabase = getSupabase();
        
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', conversationId);
        
        if (error) {
            Logger.error(error, DB_CONTEXT, { operation: 'deleteConversation', requestId, conversationId });
            return createErrorResult(error);
        }
        
        Logger.info('Conversation deleted successfully', DB_CONTEXT, { requestId });
        return createSuccessResult(true);
        
    } catch (err) {
        Logger.error(err, DB_CONTEXT, { operation: 'deleteConversation', requestId, conversationId });
        return createErrorResult(err);
    }
}

async function saveMessageToSupabase(conversationId, userId, role, content) {
    const requestId = generateRequestId();
    Logger.info(`Saving message`, DB_CONTEXT, { 
        requestId, 
        conversationId, 
        role, 
        contentLength: content?.length 
    });
    
    try {
        const supabase = getSupabase();
        
        let contentToSave = content;
        if (typeof content === 'object' && content !== null) {
            contentToSave = JSON.stringify(content);
        }
        
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                conversation_id: conversationId,
                user_id: userId,
                role: role,
                content: contentToSave
            }])
            .select()
            .single();
        
        if (error) {
            Logger.error(error, DB_CONTEXT, { operation: 'saveMessageToSupabase', requestId, conversationId });
            return createErrorResult(error);
        }
        
        Logger.info(`Message saved: ${data.id}`, DB_CONTEXT, { requestId });
        
        supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId)
            .then(() => Logger.info('Conversation timestamp updated', DB_CONTEXT, { requestId }))
            .catch(err => Logger.warn('Failed to update conversation timestamp', DB_CONTEXT, { 
                requestId, 
                error: err.message 
            }));
        
        return createSuccessResult(data);
        
    } catch (err) {
        Logger.error(err, DB_CONTEXT, { operation: 'saveMessageToSupabase', requestId, conversationId });
        return createErrorResult(err);
    }
}

async function loadMessagesFromSupabase(conversationId) {
    const requestId = generateRequestId();
    const startTime = Date.now();
    Logger.info(`Loading messages for conversation: ${conversationId}`, DB_CONTEXT, { requestId });
    
    try {
        const supabase = getSupabase();
        
        const queryPromise = supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        
        const result = await withTimeout(queryPromise, 10000, requestId, 'loadMessagesFromSupabase');
        const { data, error, status, statusText } = result;
        const elapsed = Date.now() - startTime;
        
        Logger.info(`loadMessagesFromSupabase response`, DB_CONTEXT, {
            requestId,
            hasData: !!data,
            count: (data || []).length,
            status,
            statusText,
            elapsedMs: elapsed
        });
        
        if (error) {
            Logger.error(error, DB_CONTEXT, { operation: 'loadMessagesFromSupabase', requestId, conversationId });
            return createErrorResult(error);
        }
        
        const messages = (data || []).map(msg => {
            let content = msg.content;
            
            if (typeof content === 'string' && content.trim().startsWith('{')) {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    Logger.warn('Failed to parse message content as JSON', DB_CONTEXT, { requestId, messageId: msg.id });
                }
            }
            
            return {
                ...msg,
                content: content
            };
        });
        
        return createSuccessResult(messages);
        
    } catch (err) {
        const elapsed = Date.now() - startTime;
        Logger.error(err, DB_CONTEXT, { operation: 'loadMessagesFromSupabase', requestId, conversationId, elapsedMs: elapsed });
        return createErrorResult(err);
    }
}

async function deleteAllUserConversations(userId) {
    const requestId = generateRequestId();
    Logger.info(`Deleting all conversations for user: ${userId}`, DB_CONTEXT, { requestId });
    
    try {
        const supabase = getSupabase();
        
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('user_id', userId);
        
        if (error) {
            Logger.error(error, DB_CONTEXT, { operation: 'deleteAllUserConversations', requestId, userId });
            return createErrorResult(error);
        }
        
        Logger.info('All user conversations deleted', DB_CONTEXT, { requestId });
        return createSuccessResult(true);
        
    } catch (err) {
        Logger.error(err, DB_CONTEXT, { operation: 'deleteAllUserConversations', requestId, userId });
        return createErrorResult(err);
    }
}

async function getMessageCount(conversationId) {
    const requestId = generateRequestId();
    Logger.info(`Getting message count for conversation: ${conversationId}`, DB_CONTEXT, { requestId });
    
    try {
        const supabase = getSupabase();
        
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId);
        
        if (error) {
            Logger.error(error, DB_CONTEXT, { operation: 'getMessageCount', requestId, conversationId });
            return createErrorResult(error);
        }
        
        Logger.info(`Message count: ${count || 0}`, DB_CONTEXT, { requestId });
        return createSuccessResult(count || 0);
        
    } catch (err) {
        Logger.error(err, DB_CONTEXT, { operation: 'getMessageCount', requestId, conversationId });
        return createErrorResult(err);
    }
}
