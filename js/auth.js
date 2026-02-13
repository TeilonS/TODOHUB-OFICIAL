// js/auth.js - Autenticação com Firebase

// ⚠️ IMPORTANTE: Substitua estas configurações pelas suas do Firebase Console
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializar Firebase
let app, auth, db;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
} catch (e) {
  console.warn('Firebase não configurado. Usando modo offline.');
}

const Auth = {
  currentUser: null,
  isGuest: false,
  onAuthChangeCallback: null,

  // Inicializar autenticação
  init(callback) {
    this.onAuthChangeCallback = callback;

    // Verificar se tem usuário salvo como convidado
    const guestMode = localStorage.getItem('todohub_guestMode');
    if (guestMode === 'true') {
      this.isGuest = true;
      this.currentUser = null;
      callback(null, true);
      return;
    }

    // Se Firebase está configurado, escutar mudanças de auth
    if (auth) {
      auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.isGuest = false;
        callback(user, false);
      });
    } else {
      // Modo offline
      this.isGuest = true;
      callback(null, true);
    }
  },

  // Login com Google
  async loginWithGoogle() {
    if (!auth) {
      console.error('Firebase não configurado');
      return { error: 'Firebase não configurado. Use o modo convidado.' };
    }

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      localStorage.removeItem('todohub_guestMode');
      return { user: result.user };
    } catch (error) {
      console.error('Erro no login Google:', error);
      return { error: error.message };
    }
  },

  // Login com GitHub
  async loginWithGithub() {
    if (!auth) {
      console.error('Firebase não configurado');
      return { error: 'Firebase não configurado. Use o modo convidado.' };
    }

    try {
      const provider = new firebase.auth.GithubAuthProvider();
      const result = await auth.signInWithPopup(provider);
      localStorage.removeItem('todohub_guestMode');
      return { user: result.user };
    } catch (error) {
      console.error('Erro no login GitHub:', error);
      return { error: error.message };
    }
  },

  // Modo convidado
  loginAsGuest() {
    localStorage.setItem('todohub_guestMode', 'true');
    this.isGuest = true;
    this.currentUser = null;
    if (this.onAuthChangeCallback) {
      this.onAuthChangeCallback(null, true);
    }
    return { guest: true };
  },

  // Logout
  async logout() {
    localStorage.removeItem('todohub_guestMode');
    this.isGuest = false;

    if (auth && this.currentUser) {
      try {
        await auth.signOut();
      } catch (error) {
        console.error('Erro no logout:', error);
      }
    }

    this.currentUser = null;
    if (this.onAuthChangeCallback) {
      this.onAuthChangeCallback(null, false);
    }
  },

  // Obter ID do usuário (ou 'guest')
  getUserId() {
    if (this.currentUser) {
      return this.currentUser.uid;
    }
    return this.isGuest ? null : null;
  },

  // Obter info do usuário
  getUserInfo() {
    if (this.currentUser) {
      return {
        name: this.currentUser.displayName || 'Usuário',
        email: this.currentUser.email || '',
        avatar: this.currentUser.photoURL || '',
        uid: this.currentUser.uid
      };
    }
    if (this.isGuest) {
      return {
        name: 'Convidado',
        email: 'Modo offline',
        avatar: '',
        uid: null
      };
    }
    return null;
  }
};