// js/storage.js - Gerenciamento de dados locais

const Storage = {
  // Prefixo para evitar conflitos
  PREFIX: 'todohub_',

  // Tema
  getTheme() {
    return localStorage.getItem(this.PREFIX + 'theme') || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(this.PREFIX + 'theme', theme);
  },

  // Listas
  getLists(userId) {
    const key = userId ? `${this.PREFIX}lists_${userId}` : `${this.PREFIX}lists_guest`;
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  },

  setLists(userId, lists) {
    const key = userId ? `${this.PREFIX}lists_${userId}` : `${this.PREFIX}lists_guest`;
    localStorage.setItem(key, JSON.stringify(lists));
  },

  // Lista atual
  getCurrentListId(userId) {
    const key = userId ? `${this.PREFIX}currentList_${userId}` : `${this.PREFIX}currentList_guest`;
    return localStorage.getItem(key);
  },

  setCurrentListId(userId, listId) {
    const key = userId ? `${this.PREFIX}currentList_${userId}` : `${this.PREFIX}currentList_guest`;
    localStorage.setItem(key, listId);
  },

  // Tarefas
  getTasks(userId, listId) {
    const key = userId 
      ? `${this.PREFIX}tasks_${userId}_${listId}` 
      : `${this.PREFIX}tasks_guest_${listId}`;
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  },

  setTasks(userId, listId, tasks) {
    const key = userId 
      ? `${this.PREFIX}tasks_${userId}_${listId}` 
      : `${this.PREFIX}tasks_guest_${listId}`;
    localStorage.setItem(key, JSON.stringify(tasks));
  },

  // Limpar dados de uma lista
  clearListTasks(userId, listId) {
    const key = userId 
      ? `${this.PREFIX}tasks_${userId}_${listId}` 
      : `${this.PREFIX}tasks_guest_${listId}`;
    localStorage.removeItem(key);
  }
};