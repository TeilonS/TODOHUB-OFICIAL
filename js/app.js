// js/app.js - Aplicação principal TodoHub

class TodoHub {
  constructor() {
    this.userId = null;
    this.isGuest = false;
    this.lists = [];
    this.currentListId = null;
    this.tasks = [];
    
    // Filtros
    this.stateFilter = 'all';
    this.priorityFilter = 'all';
    this.tagFilter = null;
    this.searchQuery = '';
    this.sortBy = 'created-desc';
    
    // Seleção
    this.selectionMode = false;
    this.selectedIds = new Set();
    
    // Prioridade ao adicionar
    this.newTaskPriority = 'medium';
    
    // Edição
    this.editTaskPriority = 'medium';
    this.editSubtasks = [];
    this.currentEditTaskId = null;
    
    // View
    this.currentView = 'list';
    
    this.init();
  }

  // ========== INICIALIZAÇÃO ==========
  init() {
    this.cacheElements();
    this.initTheme();
    this.initAuth();
    this.bindEvents();
  }

  cacheElements() {
    this.el = {
      // Login
      loginScreen: document.getElementById('loginScreen'),
      loginGoogle: document.getElementById('loginGoogle'),
      loginGithub: document.getElementById('loginGithub'),
      loginGuest: document.getElementById('loginGuest'),
      
      // App container
      appContainer: document.getElementById('appContainer'),
      appLoader: document.getElementById('appLoader'),
      
      // Sidebar
      sidebar: document.getElementById('sidebar'),
      sidebarOverlay: document.getElementById('sidebarOverlay'),
      openSidebar: document.getElementById('openSidebar'),
      closeSidebar: document.getElementById('closeSidebar'),
      listContainer: document.getElementById('listContainer'),
      newListBtn: document.getElementById('newListBtn'),
      
      // User menu
      userBtn: document.getElementById('userBtn'),
      userDropdown: document.getElementById('userDropdown'),
      userAvatar: document.getElementById('userAvatar'),
      userName: document.getElementById('userName'),
      dropdownAvatar: document.getElementById('dropdownAvatar'),
      dropdownName: document.getElementById('dropdownName'),
      dropdownEmail: document.getElementById('dropdownEmail'),
      logoutBtn: document.getElementById('logoutBtn'),
      
      // Theme
      themeToggle: document.getElementById('themeToggle'),
      themeIcon: document.getElementById('themeIcon'),
      
      // Add task
      taskInput: document.getElementById('taskInput'),
      tagInput: document.getElementById('tagInput'),
      dueDateInput: document.getElementById('dueDateInput'),
      dueTimeInput: document.getElementById('dueTimeInput'),
      notesInput: document.getElementById('notesInput'),
      priorityPicker: document.getElementById('priorityPicker'),
      addTaskBtn: document.getElementById('addTaskBtn'),
      
      // Task list
      taskList: document.getElementById('taskList'),
      emptyState: document.getElementById('emptyState'),
      listView: document.getElementById('listView'),
      
      // Kanban
      kanbanView: document.getElementById('kanbanView'),
      kanbanTodo: document.getElementById('kanbanTodo'),
      kanbanDoing: document.getElementById('kanbanDoing'),
      kanbanDone: document.getElementById('kanbanDone'),
      kanbanTodoCount: document.getElementById('kanbanTodoCount'),
      kanbanDoingCount: document.getElementById('kanbanDoingCount'),
      kanbanDoneCount: document.getElementById('kanbanDoneCount'),
      
      // Filters
      filtersContainer: document.getElementById('filtersContainer'),
      searchInput: document.getElementById('searchInput'),
      sortSelect: document.getElementById('sortSelect'),
      
      // Bulk
      bulkBar: document.getElementById('bulkBar'),
      bulkCount: document.getElementById('bulkCount'),
      bulkFavoriteBtn: document.getElementById('bulkFavoriteBtn'),
      bulkDoneBtn: document.getElementById('bulkDoneBtn'),
      bulkDeleteBtn: document.getElementById('bulkDeleteBtn'),
      bulkExitBtn: document.getElementById('bulkExitBtn'),
      
      // Edit dialog
      editDialog: document.getElementById('editDialog'),
      editForm: document.getElementById('editForm'),
      editText: document.getElementById('editText'),
      editPriorityPicker: document.getElementById('editPriorityPicker'),
      editStatus: document.getElementById('editStatus'),
      editTags: document.getElementById('editTags'),
      editDueDate: document.getElementById('editDueDate'),
      editDueTime: document.getElementById('editDueTime'),
      editNotes: document.getElementById('editNotes'),
      subtasksList: document.getElementById('subtasksList'),
      newSubtaskText: document.getElementById('newSubtaskText'),
      addSubtaskBtn: document.getElementById('addSubtaskBtn'),
      editClose: document.getElementById('editClose'),
      editCancelBtn: document.getElementById('editCancelBtn'),
      
      // Stats
      totalCount: document.getElementById('totalCount'),
      activeCount: document.getElementById('activeCount'),
      doneCount: document.getElementById('doneCount'),
      overdueCount: document.getElementById('overdueCount'),
      favoriteCount: document.getElementById('favoriteCount'),
      
      // Charts
      donutChart: document.getElementById('donutChart'),
      donutValue: document.getElementById('donutValue'),
      highBar: document.getElementById('highBar'),
      mediumBar: document.getElementById('mediumBar'),
      lowBar: document.getElementById('lowBar'),
      highCount: document.getElementById('highCount'),
      mediumCount: document.getElementById('mediumCount'),
      lowCount: document.getElementById('lowCount'),
    };
  }

  // ========== THEME ==========
  initTheme() {
    const theme = Storage.getTheme();
    this.applyTheme(theme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    Storage.setTheme(theme);
    const icons = { dark: '🌙', light: '☀️', oled: '🌑' };
    if (this.el.themeIcon) {
      this.el.themeIcon.textContent = icons[theme] || '🌙';
    }
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : current === 'light' ? 'oled' : 'dark';
    this.applyTheme(next);
    this.toast('Tema alterado', 'info');
  }

  // ========== AUTH ==========
  initAuth() {
    Auth.init((user, isGuest) => {
      this.userId = user ? user.uid : null;
      this.isGuest = isGuest;
      
      if (user || isGuest) {
        this.showApp();
        this.loadData();
        this.updateUserUI();
      } else {
        this.showLogin();
      }
      
      this.hideLoader();
    });
  }

  showLogin() {
    this.el.loginScreen.classList.remove('hidden');
    this.el.appContainer.classList.add('hidden');
  }

  showApp() {
    this.el.loginScreen.classList.add('hidden');
    this.el.appContainer.classList.remove('hidden');
  }

  hideLoader() {
    setTimeout(() => {
      this.el.appLoader.classList.add('hidden');
    }, 500);
  }

  updateUserUI() {
    const userInfo = Auth.getUserInfo();
    if (!userInfo) return;

    this.el.userName.textContent = userInfo.name;
    this.el.dropdownName.textContent = userInfo.name;
    this.el.dropdownEmail.textContent = userInfo.email;

    if (userInfo.avatar) {
      this.el.userAvatar.src = userInfo.avatar;
      this.el.dropdownAvatar.src = userInfo.avatar;
    } else {
      // Avatar padrão
      const initials = userInfo.name.charAt(0).toUpperCase();
      this.el.userAvatar.style.display = 'none';
      this.el.dropdownAvatar.style.display = 'none';
    }
  }

  // ========== EVENTS ==========
  bindEvents() {
    // Login buttons
    this.el.loginGoogle?.addEventListener('click', () => this.handleLogin('google'));
    this.el.loginGithub?.addEventListener('click', () => this.handleLogin('github'));
    this.el.loginGuest?.addEventListener('click', () => this.handleLogin('guest'));

    // Logout
    this.el.logoutBtn?.addEventListener('click', () => this.handleLogout());

    // User menu
    this.el.userBtn?.addEventListener('click', () => {
      this.el.userDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-menu')) {
        this.el.userDropdown?.classList.remove('open');
      }
    });

    // Sidebar
    this.el.openSidebar?.addEventListener('click', () => this.openSidebar());
    this.el.closeSidebar?.addEventListener('click', () => this.closeSidebar());
    this.el.sidebarOverlay?.addEventListener('click', () => this.closeSidebar());
    this.el.newListBtn?.addEventListener('click', () => this.createList());
    this.el.listContainer?.addEventListener('click', (e) => this.handleListClick(e));

    // Theme
    this.el.themeToggle?.addEventListener('click', () => this.toggleTheme());

    // Add task
    this.el.addTaskBtn?.addEventListener('click', () => this.addTask());
    this.el.taskInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.addTask();
    });

    // Priority picker
    this.el.priorityPicker?.addEventListener('click', (e) => {
      const btn = e.target.closest('.prio-btn');
      if (btn) {
        this.newTaskPriority = btn.dataset.priority;
        this.setPrioActive(this.el.priorityPicker, this.newTaskPriority);
      }
    });

    this.el.editPriorityPicker?.addEventListener('click', (e) => {
      const btn = e.target.closest('.prio-btn');
      if (btn) {
        this.editTaskPriority = btn.dataset.priority;
        this.setPrioActive(this.el.editPriorityPicker, this.editTaskPriority);
      }
    });

    // View tabs
    document.querySelectorAll('.view-tab').forEach(tab => {
      tab.addEventListener('click', () => this.setView(tab.dataset.view));
    });

    // Sort
    this.el.sortSelect?.addEventListener('change', () => {
      this.sortBy = this.el.sortSelect.value;
      this.renderTasks();
    });

    // Filters
    this.el.filtersContainer?.addEventListener('click', (e) => this.handleFilterClick(e));

    // Search
    this.el.searchInput?.addEventListener('input', () => {
      this.searchQuery = this.el.searchInput.value.toLowerCase();
      this.renderTasks();
    });

    // Bulk actions
    this.el.bulkFavoriteBtn?.addEventListener('click', () => this.bulkAction('favorite'));
    this.el.bulkDoneBtn?.addEventListener('click', () => this.bulkAction('done'));
    this.el.bulkDeleteBtn?.addEventListener('click', () => this.bulkAction('delete'));
    this.el.bulkExitBtn?.addEventListener('click', () => this.exitSelection());

    // Task list
    this.el.taskList?.addEventListener('click', (e) => this.handleTaskClick(e));
    this.el.taskList?.addEventListener('change', (e) => this.handleTaskChange(e));

    // Edit dialog
    this.el.editClose?.addEventListener('click', () => this.closeEditDialog());
    this.el.editCancelBtn?.addEventListener('click', () => this.closeEditDialog());
    this.el.editForm?.addEventListener('submit', (e) => this.saveEdit(e));
    this.el.addSubtaskBtn?.addEventListener('click', () => this.addSubtask());
    this.el.newSubtaskText?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addSubtask();
      }
    });
    this.el.subtasksList?.addEventListener('click', (e) => this.handleSubtaskClick(e));
    this.el.subtasksList?.addEventListener('change', (e) => this.handleSubtaskChange(e));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  async handleLogin(provider) {
    let result;
    
    switch (provider) {
      case 'google':
        result = await Auth.loginWithGoogle();
        break;
      case 'github':
        result = await Auth.loginWithGithub();
        break;
      case 'guest':
        result = Auth.loginAsGuest();
        break;
    }

    if (result.error) {
      this.toast(result.error, 'error');
    }
  }

  async handleLogout() {
    await Auth.logout();
    this.showLogin();
    this.toast('Você saiu da conta', 'info');
  }

  handleKeyboard(e) {
    // Ignorar se estiver em input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      if (e.key === 'Escape') e.target.blur();
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault();
        this.el.taskInput?.focus();
        break;
      case '/':
        e.preventDefault();
        this.el.searchInput?.focus();
        break;
      case 't':
        this.toggleTheme();
        break;
      case 'v':
        this.setView(this.currentView === 'list' ? 'kanban' : 'list');
        break;
      case 's':
        if (e.shiftKey) {
          e.preventDefault();
          this.toggleSelection();
        }
        break;
    }
  }

  // ========== DATA ==========
  loadData() {
    this.lists = Storage.getLists(this.userId);
    
    if (!this.lists.length) {
      const defaultList = {
        id: this.uuid(),
        name: 'Minhas Tarefas',
        createdAt: new Date().toISOString()
      };
      this.lists = [defaultList];
      Storage.setLists(this.userId, this.lists);
    }

    this.currentListId = Storage.getCurrentListId(this.userId) || this.lists[0].id;
    this.loadTasks();
    this.render();
  }

  loadTasks() {
    this.tasks = Storage.getTasks(this.userId, this.currentListId);
  }

  saveLists() {
    Storage.setLists(this.userId, this.lists);
  }

  saveTasks() {
    Storage.setTasks(this.userId, this.currentListId, this.tasks);
  }

  saveCurrentList() {
    Storage.setCurrentListId(this.userId, this.currentListId);
  }

  // ========== UTILITIES ==========
  uuid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatDate(dateStr, timeStr) {
    if (!dateStr) return 'Sem prazo';
    const [y, m, d] = dateStr.split('-');
    return timeStr ? `${d}/${m} ${timeStr}` : `${d}/${m}`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  toast(message, type = 'info') {
    const stack = document.getElementById('toastStack');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    stack.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========== SIDEBAR ==========
  openSidebar() {
    this.el.sidebar.classList.add('open');
    this.el.sidebarOverlay.classList.add('open');
  }

  closeSidebar() {
    this.el.sidebar.classList.remove('open');
    this.el.sidebarOverlay.classList.remove('open');
  }

  createList() {
    const name = prompt('Nome da nova lista:');
    if (!name?.trim()) return;

    const list = {
      id: this.uuid(),
      name: name.trim(),
      createdAt: new Date().toISOString()
    };

    this.lists.push(list);
    this.saveLists();
    this.currentListId = list.id;
    this.saveCurrentList();
    this.tasks = [];
    this.saveTasks();
    this.selectedIds.clear();
    this.render();
    this.toast('Lista criada!', 'success');
  }

  handleListClick(e) {
    const item = e.target.closest('.sidebar-item');
    if (!item) return;

    if (e.target.closest('.delete-list')) {
      e.stopPropagation();
      this.deleteList(item.dataset.id);
      return;
    }

    const id = item.dataset.id;
    if (id && id !== this.currentListId) {
      this.currentListId = id;
      this.saveCurrentList();
      this.loadTasks();
      this.selectedIds.clear();
      this.tagFilter = null;
      this.render();
      this.closeSidebar();
    }
  }

  deleteList(id) {
    if (this.lists.length <= 1) {
      this.toast('Você precisa ter pelo menos uma lista', 'warn');
      return;
    }
    if (!confirm('Excluir esta lista e todas suas tarefas?')) return;

    this.lists = this.lists.filter(l => l.id !== id);
    Storage.clearListTasks(this.userId, id);
    this.saveLists();

    if (this.currentListId === id) {
      this.currentListId = this.lists[0].id;
      this.saveCurrentList();
      this.loadTasks();
    }

    this.render();
    this.toast('Lista excluída', 'success');
  }

  renderSidebar() {
    this.el.listContainer.innerHTML = this.lists.map(list => `
      <li class="sidebar-item ${list.id === this.currentListId ? 'active' : ''}" data-id="${list.id}">
        <span>📁 ${this.escapeHtml(list.name)}</span>
        <button class="delete-list" title="Excluir">🗑️</button>
      </li>
    `).join('');
  }

  // ========== VIEW ==========
  setView(view) {
    this.currentView = view;
    document.querySelectorAll('.view-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.view === view);
    });
    
    if (view === 'list') {
      this.el.listView.style.display = 'block';
      this.el.kanbanView.classList.remove('active');
    } else {
      this.el.listView.style.display = 'none';
      this.el.kanbanView.classList.add('active');
    }
    
    this.renderTasks();
  }

  // ========== ADD TASK ==========
  addTask() {
    const text = this.el.taskInput.value.trim();
    if (!text) {
      this.toast('Digite uma tarefa', 'warn');
      return;
    }

    const tags = this.el.tagInput.value.trim()
      ? this.el.tagInput.value.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const task = {
      id: this.uuid(),
      text,
      done: false,
      priority: this.newTaskPriority,
      tags,
      dueDate: this.el.dueDateInput.value || null,
      dueTime: this.el.dueTimeInput.value || null,
      notes: this.el.notesInput.value.trim() || null,
      subtasks: [],
      favorite: false,
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.unshift(task);
    this.saveTasks();

    // Limpar inputs
    this.el.taskInput.value = '';
    this.el.tagInput.value = '';
    this.el.dueDateInput.value = '';
    this.el.dueTimeInput.value = '';
    this.el.notesInput.value = '';

    this.render();
    this.toast('Tarefa adicionada!', 'success');
  }

  setPrioActive(container, value) {
    container.querySelectorAll('.prio-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.priority === value);
    });
  }

  // ========== FILTERS ==========
  handleFilterClick(e) {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    if (chip.dataset.filterState) {
      this.stateFilter = chip.dataset.filterState;
      this.el.filtersContainer.querySelectorAll('.chip[data-filter-state]').forEach(c => {
        c.classList.toggle('active', c === chip);
      });
    }

    if (chip.dataset.filterPriority) {
      const prio = chip.dataset.filterPriority;
      if (this.priorityFilter === prio) {
        this.priorityFilter = 'all';
        chip.classList.remove('active');
      } else {
        this.priorityFilter = prio;
        this.el.filtersContainer.querySelectorAll('.prio-chip').forEach(c => {
          c.classList.toggle('active', c === chip);
        });
      }
    }

    this.renderTasks();
  }

  getFilteredTasks() {
    let filtered = [...this.tasks];

    // Filtro de estado
    switch (this.stateFilter) {
      case 'active':
        filtered = filtered.filter(t => !t.done);
        break;
      case 'done':
        filtered = filtered.filter(t => t.done);
        break;
      case 'favorites':
        filtered = filtered.filter(t => t.favorite);
        break;
    }

    // Filtro de prioridade
    if (this.priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === this.priorityFilter);
    }

    // Filtro de tag
    if (this.tagFilter) {
      filtered = filtered.filter(t => (t.tags || []).includes(this.tagFilter));
    }

    // Busca
    if (this.searchQuery) {
      filtered = filtered.filter(t =>
        t.text.toLowerCase().includes(this.searchQuery) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(this.searchQuery))
      );
    }

    return this.sortTasks(filtered);
  }

  sortTasks(tasks) {
    const sorted = [...tasks];

    // Favoritos sempre primeiro
    sorted.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

    const [field, dir] = this.sortBy.split('-');

    sorted.sort((a, b) => {
      // Manter favoritos no topo
      if (a.favorite !== b.favorite) return b.favorite ? 1 : -1;

      switch (field) {
        case 'created':
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dir === 'desc' ? dateB - dateA : dateA - dateB;
        
        case 'alpha':
          return dir === 'asc' 
            ? a.text.localeCompare(b.text) 
            : b.text.localeCompare(a.text);
        
        case 'priority':
          const prioOrder = { high: 3, medium: 2, low: 1 };
          return dir === 'high'
            ? prioOrder[b.priority] - prioOrder[a.priority]
            : prioOrder[a.priority] - prioOrder[b.priority];
        
        case 'due':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return dir === 'asc'
            ? a.dueDate.localeCompare(b.dueDate)
            : b.dueDate.localeCompare(a.dueDate);
      }
      return 0;
    });

    return sorted;
  }

  // ========== SELECTION ==========
  toggleSelection() {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) this.selectedIds.clear();
    this.updateBulkBar();
    this.renderTasks();
    this.toast(`Modo seleção: ${this.selectionMode ? 'ON' : 'OFF'}`, 'info');
  }

  exitSelection() {
    this.selectionMode = false;
    this.selectedIds.clear();
    this.updateBulkBar();
    this.renderTasks();
  }

  updateBulkBar() {
    const show = this.selectionMode && this.selectedIds.size > 0;
    this.el.bulkBar.classList.toggle('hidden', !show);
    this.el.bulkCount.textContent = `${this.selectedIds.size} selecionada${this.selectedIds.size !== 1 ? 's' : ''}`;
  }

  bulkAction(action) {
    if (!this.selectedIds.size) return;

    if (action === 'delete') {
      if (!confirm(`Excluir ${this.selectedIds.size} tarefa(s)?`)) return;
      this.tasks = this.tasks.filter(t => !this.selectedIds.has(t.id));
    } else {
      const now = new Date().toISOString();
      this.tasks = this.tasks.map(t => {
        if (!this.selectedIds.has(t.id)) return t;
        
        switch (action) {
          case 'done':
            return { ...t, done: true, status: 'done', updatedAt: now };
          case 'favorite':
            return { ...t, favorite: !t.favorite, updatedAt: now };
        }
        return t;
      });
    }

    this.saveTasks();
    this.selectedIds.clear();
    this.updateBulkBar();
    this.render();
    this.toast('Ação aplicada!', 'success');
  }

  // ========== TASK EVENTS ==========
  handleTaskClick(e) {
    const item = e.target.closest('.item');
    if (!item) return;
    const id = item.dataset.id;

    // Tag click
    const tagChip = e.target.closest('.tag-chip');
    if (tagChip) {
      const tag = tagChip.dataset.tag;
      this.tagFilter = this.tagFilter === tag ? null : tag;
      this.toast(this.tagFilter ? `Filtrando: ${tag}` : 'Filtro removido', 'info');
      this.renderTasks();
      return;
    }

    // Favorite button
    if (e.target.closest('.favorite-btn')) {
      this.toggleFavorite(id);
      return;
    }

    // Action buttons
    const btn = e.target.closest('.icon');
    if (btn) {
      const action = btn.dataset.action;
      switch (action) {
        case 'edit':
          this.openEditDialog(id);
          break;
        case 'delete':
          this.deleteTask(id);
          break;
        case 'select':
          this.toggleTaskSelection(id);
          break;
      }
      return;
    }

    // Selection mode
    if (this.selectionMode) {
      this.toggleTaskSelection(id);
    }
  }

  handleTaskChange(e) {
    const checkbox = e.target.closest('.task-toggle');
    if (!checkbox) return;
    const id = checkbox.closest('.item').dataset.id;
    this.toggleDone(id);
  }

  toggleTaskSelection(id) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.updateBulkBar();
    this.renderTasks();
  }

  toggleDone(id) {
    this.tasks = this.tasks.map(t => {
      if (t.id === id) {
        const newDone = !t.done;
        return {
          ...t,
          done: newDone,
          status: newDone ? 'done' : 'todo',
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    this.saveTasks();
    this.render();
  }

  toggleFavorite(id) {
    this.tasks = this.tasks.map(t => {
      if (t.id === id) {
        return { ...t, favorite: !t.favorite, updatedAt: new Date().toISOString() };
      }
      return t;
    });
    this.saveTasks();
    this.render();
  }

  deleteTask(id) {
    if (!confirm('Excluir esta tarefa?')) return;
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.selectedIds.delete(id);
    this.saveTasks();
    this.render();
    this.toast('Tarefa excluída', 'success');
  }

  // ========== KANBAN ==========
  moveTask(id, newStatus) {
    this.tasks = this.tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          done: newStatus === 'done',
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    this.saveTasks();
    this.render();
  }

  // ========== EDIT DIALOG ==========
  openEditDialog(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    this.currentEditTaskId = id;
    this.el.editText.value = task.text;
    this.el.editTags.value = (task.tags || []).join(', ');
    this.el.editDueDate.value = task.dueDate || '';
    this.el.editDueTime.value = task.dueTime || '';
    this.el.editNotes.value = task.notes || '';
    this.el.editStatus.value = task.status || 'todo';
    this.editTaskPriority = task.priority || 'medium';
    this.setPrioActive(this.el.editPriorityPicker, this.editTaskPriority);
    this.editSubtasks = Array.isArray(task.subtasks) ? [...task.subtasks] : [];
    this.renderSubtasks();

    this.el.editDialog.classList.add('open');
  }

  closeEditDialog() {
    this.el.editDialog.classList.remove('open');
    this.currentEditTaskId = null;
  }

  saveEdit(e) {
    e.preventDefault();
    if (!this.currentEditTaskId) return;

    const text = this.el.editText.value.trim();
    if (!text) {
      this.toast('Digite o texto da tarefa', 'warn');
      return;
    }

    const tags = this.el.editTags.value.split(',').map(t => t.trim()).filter(Boolean);
    const status = this.el.editStatus.value;

    this.tasks = this.tasks.map(t => {
      if (t.id === this.currentEditTaskId) {
        return {
          ...t,
          text,
          priority: this.editTaskPriority,
          status,
          done: status === 'done',
          tags,
          dueDate: this.el.editDueDate.value || null,
          dueTime: this.el.editDueTime.value || null,
          notes: this.el.editNotes.value.trim() || null,
          subtasks: this.editSubtasks,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    this.saveTasks();
    this.closeEditDialog();
    this.render();
    this.toast('Tarefa atualizada!', 'success');
  }

  // ========== SUBTASKS ==========
  addSubtask() {
    const text = this.el.newSubtaskText.value.trim();
    if (!text) return;

    this.editSubtasks.push({
      id: this.uuid(),
      text,
      done: false
    });

    this.el.newSubtaskText.value = '';
    this.renderSubtasks();
  }

  handleSubtaskClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.closest('.subtask-item')?.dataset.id;
    if (id) {
      this.editSubtasks = this.editSubtasks.filter(s => s.id !== id);
      this.renderSubtasks();
    }
  }

  handleSubtaskChange(e) {
    if (e.target.type !== 'checkbox') return;
    const id = e.target.closest('.subtask-item')?.dataset.id;
    if (id) {
      this.editSubtasks = this.editSubtasks.map(s =>
        s.id === id ? { ...s, done: e.target.checked } : s
      );
      this.renderSubtasks();
    }
  }

  renderSubtasks() {
    this.el.subtasksList.innerHTML = this.editSubtasks.map(s => `
      <li class="subtask-item ${s.done ? 'done' : ''}" data-id="${s.id}">
        <input type="checkbox" ${s.done ? 'checked' : ''}>
        <span>${this.escapeHtml(s.text)}</span>
        <button type="button">✕</button>
      </li>
    `).join('');
  }

  // ========== STATS ==========
  updateStats() {
    const total = this.tasks.length;
    const done = this.tasks.filter(t => t.done).length;
    const active = total - done;
    const today = this.todayISO();
    const overdue = this.tasks.filter(t => !t.done && t.dueDate && t.dueDate < today).length;
    const favorites = this.tasks.filter(t => t.favorite).length;

    this.el.totalCount.textContent = total;
    this.el.activeCount.textContent = active;
    this.el.doneCount.textContent = done;
    this.el.overdueCount.textContent = overdue;
    this.el.favoriteCount.textContent = favorites;

    // Donut chart
    const percent = total ? Math.round((done / total) * 100) : 0;
    this.el.donutValue.textContent = `${percent}%`;
    this.el.donutChart.style.background = `conic-gradient(var(--primary) ${percent * 3.6}deg, var(--bg-soft) 0deg)`;

    // Priority bars
    const high = this.tasks.filter(t => t.priority === 'high' && !t.done).length;
    const medium = this.tasks.filter(t => t.priority === 'medium' && !t.done).length;
    const low = this.tasks.filter(t => t.priority === 'low' && !t.done).length;
    const maxPrio = Math.max(high, medium, low, 1);

    this.el.highBar.style.width = `${(high / maxPrio) * 100}%`;
    this.el.mediumBar.style.width = `${(medium / maxPrio) * 100}%`;
    this.el.lowBar.style.width = `${(low / maxPrio) * 100}%`;
    this.el.highCount.textContent = high;
    this.el.mediumCount.textContent = medium;
    this.el.lowCount.textContent = low;

    // Kanban counts
    const todoCount = this.tasks.filter(t => t.status === 'todo' && !t.done).length;
    const doingCount = this.tasks.filter(t => t.status === 'doing' && !t.done).length;
    const doneKanban = this.tasks.filter(t => t.status === 'done' || t.done).length;

    this.el.kanbanTodoCount.textContent = todoCount;
    this.el.kanbanDoingCount.textContent = doingCount;
    this.el.kanbanDoneCount.textContent = doneKanban;
  }

  // ========== RENDER ==========
  renderTasks() {
    const filtered = this.getFilteredTasks();
    const today = this.todayISO();

    // List View
    if (this.currentView === 'list') {
      if (filtered.length === 0) {
        this.el.taskList.innerHTML = '';
        this.el.emptyState.classList.add('show');
      } else {
        this.el.emptyState.classList.remove('show');

        this.el.taskList.innerHTML = filtered.map(t => {
          const overdue = !t.done && t.dueDate && t.dueDate < today;
          const subtasks = t.subtasks || [];
          const stDone = subtasks.filter(s => s.done).length;
          const stPct = subtasks.length ? Math.round((stDone / subtasks.length) * 100) : 0;
          const prioLabel = { high: 'Alta', medium: 'Média', low: 'Baixa' };
          const statusLabel = { todo: 'A fazer', doing: 'Fazendo', done: 'Feito' };

          return `
            <li class="item ${t.done ? 'done' : ''} ${t.favorite ? 'favorite' : ''} priority-${t.priority} ${this.selectedIds.has(t.id) ? 'selected' : ''}" data-id="${t.id}">
              <button class="favorite-btn ${t.favorite ? 'active' : ''}" title="Favoritar">
                ${t.favorite ? '⭐' : '☆'}
              </button>
              <input type="checkbox" class="task-toggle" ${t.done ? 'checked' : ''}>
              <div class="item-content">
                <div class="item-text">${this.escapeHtml(t.text)}</div>
                ${t.notes ? `<div class="item-notes">${this.escapeHtml(t.notes)}</div>` : ''}
                <div class="item-meta">
                  <span>
                    <span class="priority-badge ${t.priority}"></span>
                    ${prioLabel[t.priority]}
                  </span>
                  <span>📅 ${this.formatDate(t.dueDate, t.dueTime)}</span>
                  ${overdue ? '<span class="overdue">⚠️ Atrasada</span>' : ''}
                  ${subtasks.length ? `
                    <span class="subtasks-progress">
                      📌 ${stDone}/${subtasks.length}
                      <span class="subtasks-bar">
                        <span class="subtasks-bar-fill" style="width: ${stPct}%"></span>
                      </span>
                    </span>
                  ` : ''}
                  <span>📋 ${statusLabel[t.status] || 'A fazer'}</span>
                </div>
                ${(t.tags || []).length ? `
                  <div class="tag-list">
                    ${t.tags.map(tag => `
                      <span class="tag-chip ${this.tagFilter === tag ? 'active' : ''}" data-tag="${this.escapeHtml(tag)}">
                        ${this.escapeHtml(tag)}
                      </span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
              <div class="item-actions">
                ${this.selectionMode ? '<button class="icon" data-action="select" title="Selecionar">☑️</button>' : ''}
                <button class="icon" data-action="edit" title="Editar">✏️</button>
                <button class="icon danger" data-action="delete" title="Excluir">🗑️</button>
              </div>
            </li>
          `;
        }).join('');
      }
    } else {
      // Kanban View
      const todo = filtered.filter(t => t.status === 'todo' && !t.done);
      const doing = filtered.filter(t => t.status === 'doing' && !t.done);
      const done = filtered.filter(t => t.status === 'done' || t.done);

      const renderKanbanItem = t => {
        const overdue = !t.done && t.dueDate && t.dueDate < today;
        return `
          <div class="kanban-item ${t.favorite ? 'favorite' : ''} priority-${t.priority}" data-id="${t.id}">
            <div class="kanban-item-text">${t.favorite ? '⭐ ' : ''}${this.escapeHtml(t.text)}</div>
            <div class="kanban-item-meta">
              <span>${t.priority === 'high' ? '🔴' : t.priority === 'low' ? '🟢' : '🟡'}</span>
              <span>📅 ${this.formatDate(t.dueDate)}</span>
              ${overdue ? '<span style="color: var(--prio-high)">⚠️</span>' : ''}
            </div>
            <div class="kanban-item-actions">
              ${t.status !== 'todo' ? `<button class="kanban-move-btn" onclick="app.moveTask('${t.id}', 'todo')">◀ A fazer</button>` : ''}
              ${t.status !== 'doing' ? `<button class="kanban-move-btn" onclick="app.moveTask('${t.id}', 'doing')">🔄 Fazendo</button>` : ''}
              ${t.status !== 'done' && !t.done ? `<button class="kanban-move-btn" onclick="app.moveTask('${t.id}', 'done')">✅ Feito</button>` : ''}
            </div>
          </div>
        `;
      };

      const emptyMessage = '<p style="text-align: center; padding: 20px; color: var(--muted);">Nenhuma tarefa</p>';

      this.el.kanbanTodo.innerHTML = todo.length ? todo.map(renderKanbanItem).join('') : emptyMessage;
      this.el.kanbanDoing.innerHTML = doing.length ? doing.map(renderKanbanItem).join('') : emptyMessage;
      this.el.kanbanDone.innerHTML = done.length ? done.map(renderKanbanItem).join('') : emptyMessage;
    }
  }

  render() {
    this.renderSidebar();
    this.renderTasks();
    this.updateStats();
    this.updateBulkBar();
  }
}

// Inicializar
window.addEventListener('DOMContentLoaded', () => {
  window.app = new TodoHub();
});