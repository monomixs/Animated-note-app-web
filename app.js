// DOM Elements
const overlay = document.getElementById('overlay');
const notesContainer = document.getElementById('notes-container');
const secretNotesContainer = document.getElementById('secret-notes-container');
const notesGrid = document.getElementById('notes-grid');
const secretNotesGrid = document.getElementById('secret-notes-grid');
const searchInput = document.getElementById('search-input');
const secretSearchInput = document.getElementById('secret-search-input');
const emptyState = document.getElementById('empty-state');
const secretEmptyState = document.getElementById('secret-empty-state');

// Popup Elements
const newNotePopup = document.getElementById('new-note-popup');
const editNotePopup = document.getElementById('edit-note-popup');
const deletePopup = document.getElementById('delete-popup');
const settingsPopup = document.getElementById('settings-popup');
const passwordPopup = document.getElementById('password-popup');
const creditsPopup = document.getElementById('credits-popup');
const viewNotePopup = document.getElementById('view-note-popup');

// Form Elements
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const editNoteTitle = document.getElementById('edit-note-title');
const editNoteContent = document.getElementById('edit-note-content');
const editNoteId = document.getElementById('edit-note-id');
const editNoteIsSecret = document.getElementById('edit-note-is-secret');
const deleteNoteId = document.getElementById('delete-note-id');
const deleteNoteIsSecret = document.getElementById('delete-note-is-secret');
const passwordInput = document.getElementById('password-input');
const passwordError = document.getElementById('password-error');

// View Note Elements
const viewNoteTitle = document.getElementById('view-note-title');
const viewNoteContent = document.getElementById('view-note-content');
const viewNoteDate = document.getElementById('view-note-date');
const viewNoteId = document.getElementById('view-note-id');
const viewNoteIsSecret = document.getElementById('view-note-is-secret');

// Buttons
const newNoteBtn = document.getElementById('new-note-btn');
const newSecretNoteBtn = document.getElementById('new-secret-note-btn');
const saveNoteBtn = document.getElementById('save-note');
const cancelNoteBtn = document.getElementById('cancel-note');
const updateNoteBtn = document.getElementById('update-note');
const cancelEditBtn = document.getElementById('cancel-edit');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const settingsBtn = document.getElementById('settings-button');
const secretNotesBtn = document.getElementById('secret-notes-btn');
const creditsBtn = document.getElementById('credits-btn');
const backToNotesBtn = document.getElementById('back-to-notes');
const submitPasswordBtn = document.getElementById('submit-password');
const cancelPasswordBtn = document.getElementById('cancel-password');
const editFromViewBtn = document.getElementById('edit-from-view');
const closeViewBtn = document.getElementById('close-view');

// Close buttons
const closeButtons = document.querySelectorAll('.close-popup');

// Theme Selector
const themeOptions = document.querySelectorAll('.theme-option');

// Data Storage
const NOTES_STORAGE_KEY = 'notes';
const SECRET_NOTES_STORAGE_KEY = 'secretNotes';
const THEME_STORAGE_KEY = 'theme';
const SECRET_PASSWORD = '1111';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    renderNotes();
    renderSecretNotes();
    setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
    // New note
    newNoteBtn.addEventListener('click', () => openPopup(newNotePopup));
    newSecretNoteBtn.addEventListener('click', () => openPopup(newNotePopup, true));
    saveNoteBtn.addEventListener('click', saveNote);
    cancelNoteBtn.addEventListener('click', () => closePopup(newNotePopup));

    // Edit note
    updateNoteBtn.addEventListener('click', updateNote);
    cancelEditBtn.addEventListener('click', () => closePopup(editNotePopup));

    // Delete note
    confirmDeleteBtn.addEventListener('click', deleteNote);
    cancelDeleteBtn.addEventListener('click', () => closePopup(deletePopup));

    // Settings
    settingsBtn.addEventListener('click', () => openPopup(settingsPopup));
    
    // Secret notes
    secretNotesBtn.addEventListener('click', () => openPopup(passwordPopup));
    backToNotesBtn.addEventListener('click', showRegularNotes);
    
    // Password
    submitPasswordBtn.addEventListener('click', checkPassword);
    cancelPasswordBtn.addEventListener('click', () => closePopup(passwordPopup));
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // Credits
    creditsBtn.addEventListener('click', () => openPopup(creditsPopup));
    
    // View Note
    editFromViewBtn.addEventListener('click', () => {
        const id = viewNoteId.value;
        const isSecret = viewNoteIsSecret.value === 'true';
        closePopup(viewNotePopup);
        editNoteHandler(id, isSecret);
    });
    
    closeViewBtn.addEventListener('click', () => closePopup(viewNotePopup));
    
    // Close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const popup = button.closest('.popup-container');
            closePopup(popup);
        });
    });
    
    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            setTheme(theme);
            
            // Update active state
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', () => {
        renderNotes(searchInput.value);
    });
    
    secretSearchInput.addEventListener('input', () => {
        renderSecretNotes(secretSearchInput.value);
    });
    
    // Close popup when clicking overlay
    overlay.addEventListener('click', () => {
        closeAllPopups();
    });
}

// Notes Operations
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!title || !content) {
        shakeElement(newNotePopup.querySelector('.popup'));
        return;
    }
    
    const isSecretView = !secretNotesContainer.classList.contains('hidden');
    const notesArray = isSecretView ? getSecretNotes() : getNotes();
    
    const newNote = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString()
    };
    
    notesArray.push(newNote);
    
    if (isSecretView) {
        saveSecretNotes(notesArray);
        renderSecretNotes();
    } else {
        saveNotes(notesArray);
        renderNotes();
    }
    
    closePopup(newNotePopup);
    resetForm(noteTitle, noteContent);
}

function updateNote() {
    const title = editNoteTitle.value.trim();
    const content = editNoteContent.value.trim();
    const id = editNoteId.value;
    const isSecret = editNoteIsSecret.value === 'true';
    
    if (!title || !content) {
        shakeElement(editNotePopup.querySelector('.popup'));
        return;
    }
    
    const notesArray = isSecret ? getSecretNotes() : getNotes();
    const index = notesArray.findIndex(note => note.id === id);
    
    if (index !== -1) {
        notesArray[index].title = title;
        notesArray[index].content = content;
        notesArray[index].updatedAt = new Date().toISOString();
        
        if (isSecret) {
            saveSecretNotes(notesArray);
            renderSecretNotes();
        } else {
            saveNotes(notesArray);
            renderNotes();
        }
    }
    
    closePopup(editNotePopup);
}

function deleteNote() {
    const id = deleteNoteId.value;
    const isSecret = deleteNoteIsSecret.value === 'true';
    
    const notesArray = isSecret ? getSecretNotes() : getNotes();
    const updatedNotes = notesArray.filter(note => note.id !== id);
    
    if (isSecret) {
        saveSecretNotes(updatedNotes);
        renderSecretNotes();
    } else {
        saveNotes(updatedNotes);
        renderNotes();
    }
    
    closePopup(deletePopup);
}

function editNoteHandler(id, isSecret = false) {
    const notesArray = isSecret ? getSecretNotes() : getNotes();
    const note = notesArray.find(note => note.id === id);
    
    if (note) {
        editNoteTitle.value = note.title;
        editNoteContent.value = note.content;
        editNoteId.value = id;
        editNoteIsSecret.value = isSecret;
        
        openPopup(editNotePopup);
    }
}

function deleteNoteHandler(id, isSecret = false) {
    deleteNoteId.value = id;
    deleteNoteIsSecret.value = isSecret;
    openPopup(deletePopup);
}

// Render Functions
function renderNotes(searchQuery = '') {
    const notes = getNotes();
    renderNotesList(notes, notesGrid, emptyState, searchQuery, false);
}

function renderSecretNotes(searchQuery = '') {
    const notes = getSecretNotes();
    renderNotesList(notes, secretNotesGrid, secretEmptyState, searchQuery, true);
}

function renderNotesList(notes, gridElement, emptyStateElement, searchQuery, isSecret) {
    // Clear existing notes except empty state
    Array.from(gridElement.children).forEach(child => {
        if (!child.classList.contains('empty-state')) {
            gridElement.removeChild(child);
        }
    });
    
    let filteredNotes = notes;
    
    // Filter by search query if provided
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(query) || 
            note.content.toLowerCase().includes(query)
        );
    }
    
    if (filteredNotes.length === 0) {
        emptyStateElement.classList.remove('hidden');
    } else {
        emptyStateElement.classList.add('hidden');
        
        // Sort notes by creation date (newest first)
        filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        filteredNotes.forEach(note => {
            const noteCard = createNoteCard(note, isSecret);
            gridElement.appendChild(noteCard);
        });
    }
}

function createNoteCard(note, isSecret) {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.setAttribute('data-id', note.id);
    
    const noteTitle = document.createElement('h3');
    noteTitle.textContent = note.title;
    
    const noteContent = document.createElement('div');
    noteContent.className = 'note-content';
    noteContent.textContent = note.content;
    
    const noteActions = document.createElement('div');
    noteActions.className = 'note-actions';
    
    // View button
    const viewButton = document.createElement('button');
    viewButton.className = 'icon-button action-view';
    viewButton.innerHTML = '<i class="fas fa-eye"></i>';
    viewButton.addEventListener('click', () => viewNoteHandler(note.id, isSecret));
    viewButton.title = 'View note';
    
    // Edit button
    const editButton = document.createElement('button');
    editButton.className = 'icon-button action-edit';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.addEventListener('click', () => editNoteHandler(note.id, isSecret));
    editButton.title = 'Edit note';
    
    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'icon-button action-delete';
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.addEventListener('click', () => deleteNoteHandler(note.id, isSecret));
    deleteButton.title = 'Delete note';
    
    noteActions.appendChild(viewButton);
    noteActions.appendChild(editButton);
    noteActions.appendChild(deleteButton);
    
    noteCard.appendChild(noteTitle);
    noteCard.appendChild(noteContent);
    noteCard.appendChild(noteActions);
    
    return noteCard;
}

function viewNoteHandler(id, isSecret = false) {
    const notesArray = isSecret ? getSecretNotes() : getNotes();
    const note = notesArray.find(note => note.id === id);
    
    if (note) {
        // Format date for better readability
        const dateOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const createdDate = new Date(note.createdAt);
        const formattedDate = createdDate.toLocaleDateString(undefined, dateOptions);
        
        // Set the values in the view popup
        viewNoteTitle.textContent = note.title;
        viewNoteContent.textContent = note.content;
        viewNoteDate.textContent = formattedDate;
        viewNoteId.value = id;
        viewNoteIsSecret.value = isSecret;
        
        openPopup(viewNotePopup);
    }
}

// Popup Management
function openPopup(popup, isSecretNote = false) {
    closeAllPopups();
    
    popup.classList.remove('hidden');
    overlay.classList.remove('hidden');
    
    if (popup === newNotePopup && isSecretNote) {
        // We're in secret notes view
        const currentTitle = document.querySelector('.popup-header h2');
        if (currentTitle) {
            currentTitle.textContent = 'New Secret Note';
        }
    } else if (popup === newNotePopup) {
        const currentTitle = document.querySelector('.popup-header h2');
        if (currentTitle) {
            currentTitle.textContent = 'New Note';
        }
    }
    
    // Reset password field and error when opening password popup
    if (popup === passwordPopup) {
        passwordInput.value = '';
        passwordError.classList.add('hidden');
    }
    
    // Focus on the first input field if exists
    const firstInput = popup.querySelector('input');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
        }, 100);
    }
}

function closePopup(popup) {
    const popupElement = popup.querySelector('.popup');
    
    // Add closing animation
    popupElement.style.animation = 'flipOut 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards';
    overlay.style.animation = 'fadeOutBlur 0.4s ease forwards';
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        popup.classList.add('hidden');
        overlay.classList.add('hidden');
        // Reset animation for next time
        popupElement.style.animation = '';
        overlay.style.animation = '';
    }, 500);
}

function closeAllPopups() {
    const popups = document.querySelectorAll('.popup-container:not(.hidden)');
    
    if (popups.length > 0) {
        // Add animation to all visible popups
        popups.forEach(popup => {
            const popupElement = popup.querySelector('.popup');
            popupElement.style.animation = 'flipOut 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards';
        });
        
        // Animate overlay
        overlay.style.animation = 'fadeOutBlur 0.4s ease forwards';
        
        // Wait for animation to complete
        setTimeout(() => {
            popups.forEach(popup => {
                popup.classList.add('hidden');
                // Reset animation
                popup.querySelector('.popup').style.animation = '';
            });
            overlay.classList.add('hidden');
            overlay.style.animation = '';
        }, 500);
    }
}

// Authentication
function checkPassword() {
    const password = passwordInput.value;
    
    if (password === SECRET_PASSWORD) {
        closePopup(passwordPopup);
        showSecretNotes();
        passwordError.classList.add('hidden');
    } else {
        passwordError.classList.remove('hidden');
        shakeElement(passwordPopup.querySelector('.popup'));
    }
}

// View Management
function showSecretNotes() {
    notesContainer.classList.add('hidden');
    secretNotesContainer.classList.remove('hidden');
    renderSecretNotes();
}

function showRegularNotes() {
    secretNotesContainer.classList.add('hidden');
    notesContainer.classList.remove('hidden');
    renderNotes();
}

// Theme Management
function loadTheme() {
    const theme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    setTheme(theme);
    
    // Set active state on the current theme button
    themeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === theme) {
            option.classList.add('active');
        }
    });
}

function setTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

// Utility Functions
function getNotes() {
    const notes = localStorage.getItem(NOTES_STORAGE_KEY);
    return notes ? JSON.parse(notes) : [];
}

function saveNotes(notes) {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function getSecretNotes() {
    const notes = localStorage.getItem(SECRET_NOTES_STORAGE_KEY);
    return notes ? JSON.parse(notes) : [];
}

function saveSecretNotes(notes) {
    localStorage.setItem(SECRET_NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function resetForm(...fields) {
    fields.forEach(field => {
        field.value = '';
    });
}

function shakeElement(element) {
    element.style.animation = 'none';
    setTimeout(() => {
        element.style.animation = 'shake 0.5s ease';
    }, 10);
}
