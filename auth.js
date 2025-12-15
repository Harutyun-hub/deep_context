let currentUser = null;
let supabase = null;

async function initAuth() {
    supabase = await initSupabase();
    
    if (!supabase) {
        console.error('Failed to initialize Supabase');
        return null;
    }
    
    const hasOAuthCallback = window.location.hash && 
        (window.location.hash.includes('access_token') || window.location.hash.includes('error'));
    
    let session = null;
    
    if (hasOAuthCallback) {
        console.log('OAuth callback detected, waiting for session...');
        session = await new Promise((resolve) => {
            let subscription = null;
            
            const timeout = setTimeout(() => {
                console.warn('OAuth callback timeout - no session received');
                if (subscription) subscription.unsubscribe();
                resolve(null);
            }, 5000);
            
            const { data } = supabase.auth.onAuthStateChange((event, sess) => {
                console.log('Auth state during callback:', event);
                if (event === 'SIGNED_IN' && sess) {
                    clearTimeout(timeout);
                    data.subscription.unsubscribe();
                    resolve(sess);
                } else if (event === 'INITIAL_SESSION') {
                    if (sess) {
                        clearTimeout(timeout);
                        data.subscription.unsubscribe();
                        resolve(sess);
                    }
                }
            });
            subscription = data.subscription;
        });
        
        if (session) {
            const cleanUrl = window.location.pathname + window.location.search;
            window.history.replaceState(null, '', cleanUrl);
        }
    } else {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error getting session:', error);
        }
        session = data?.session;
    }
    
    if (session) {
        currentUser = session.user;
        await ensureUserExists(session.user);
    }
    
    supabase.auth.onAuthStateChange(async (event, sess) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && sess) {
            currentUser = sess.user;
            await ensureUserExists(sess.user);
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
        }
    });
    
    return session;
}

async function ensureUserExists(user) {
    if (!user) return;
    
    const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (!existingUser) {
        const { error: insertError } = await supabase
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
        } else {
            console.log('User created successfully');
        }
    }
}

async function signInWithGoogle() {
    try {
        if (!supabase) {
            await initAuth();
        }
        
        if (!supabase) {
            throw new Error('Authentication service not available');
        }
        
        const { data, error } = await supabase.auth.signInWithOAuth({
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
    const { error } = await supabase.auth.signOut();
    
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
