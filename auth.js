let currentUser = null;
let authSupabase = null;

async function initAuth() {
    authSupabase = await initSupabase();
    
    if (!authSupabase) {
        console.error('Failed to initialize Supabase');
        return null;
    }
    
    const { data: { session } } = await authSupabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await ensureUserExists(session.user);
    }
    
    authSupabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            await ensureUserExists(session.user);
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
        }
    });
    
    return session;
}

async function ensureUserExists(user) {
    if (!user) return;
    
    const { data: existingUser, error: fetchError } = await authSupabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (!existingUser) {
        const { error: insertError } = await authSupabase
            .from('users')
            .insert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
                google_id: user.user_metadata?.sub || ''
            }]);
        
        if (insertError) {
            console.error('Error creating user:', insertError);
        }
    }
}

async function signInWithGoogle() {
    try {
        if (!authSupabase) {
            await initAuth();
        }
        
        if (!authSupabase) {
            throw new Error('Authentication service not available');
        }
        
        const { data, error } = await authSupabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/index.html'
            }
        });
        
        if (error) {
            console.error('Error signing in:', error);
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('Sign-in failed:', error);
        if (typeof showToast !== 'undefined') {
            showToast('Failed to sign in with Google. Please try again.', 'error');
        }
        throw error;
    }
}

async function signOut() {
    const { error } = await authSupabase.auth.signOut();
    
    if (error) {
        console.error('Error signing out:', error);
        throw error;
    }
    
    if (typeof window.cleanupChatDropdowns === 'function') {
        window.cleanupChatDropdowns();
    }
    
    currentUser = null;
    window.location.href = '/login.html';
}

function getCurrentUser() {
    return currentUser;
}

async function requireAuth() {
    const session = await initAuth();
    
    if (!session && !window.location.pathname.includes('login.html')) {
        window.location.href = '/login.html';
        return null;
    }
    
    return session;
}
