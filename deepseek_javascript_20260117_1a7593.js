// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_7v5hYtB9K2V7s8JQwXzM6nPqR1T2U3V",
    authDomain: "shimu-digital-studio.firebaseapp.com",
    projectId: "shimu-digital-studio",
    storageBucket: "shimu-digital-studio.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// System Configuration
const CONFIG = {
    ADMIN_PASSWORD: "shimu2024",
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    MAX_FILES_PER_UPLOAD: 20
};

// Global State
let currentUser = null;
let galleryAuthenticated = false;
let noticeAuthenticated = false;
let selectedFiles = [];
let currentSearchResults = [];
let currentGalleryPhotos = [];
let currentModalIndex = 0;

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    // Hide loading screen after 1.5 seconds
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 1500);
    
    // Initialize UI components
    initUI();
    
    // Initialize Firebase connection
    await initFirebase();
    
    // Load initial data
    await loadInitialData();
    
    // Setup realtime listeners
    setupRealtimeListeners();
});

// Initialize UI Components
function initUI() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Tab navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Footer links
    document.querySelectorAll('.footer-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.dataset.tab;
            if (tabId) switchTab(tabId);
        });
    });
    
    // Initialize search functionality
    initSearch();
    
    // Initialize upload functionality
    initUpload();
    
    // Initialize gallery functionality
    initGallery();
    
    // Initialize notice board functionality
    initNoticeBoard();
    
    // Initialize modal functionality
    initModal();
}

// Theme toggle function
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
}

// Switch between tabs
function switchTab(tabId) {
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Update tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}-tab`) {
            content.classList.add('active');
        }
    });
    
    // Clear status messages
    clearStatusMessages();
    
    // Load data if needed
    if (tabId === 'gallery' && galleryAuthenticated) {
        loadGalleryPhotos();
    } else if (tabId === 'notice') {
        loadPublicNotices();
    }
}

// Initialize Firebase
async function initFirebase() {
    try {
        // Test Firestore connection
        await db.collection('system').doc('status').set({
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            version: '2.0'
        }, { merge: true });
        
        console.log('✅ Firebase connected successfully');
        showStatus('search-status', 'সিস্টেম প্রস্তুত ✓ ক্লাউডে সংযুক্ত', 'success');
        
    } catch (error) {
        console.error('Firebase connection error:', error);
        showStatus('search-status', 
            '⚠️ ক্লাউড সংযোগে সমস্যা, স্থানীয়ভাবে কাজ চলছে', 
            'error'
        );
    }
}

// Load initial data
async function loadInitialData() {
    try {
        // Load stats
        await loadStats();
        
        // Load public notices
        await loadPublicNotices();
        
    } catch (error) {
        console.error('Initial data load error:', error);
    }
}

// Setup realtime listeners
function setupRealtimeListeners() {
    // Listen for new photos
    db.collection('photos')
        .orderBy('uploadedAt', 'desc')
        .limit(10)
        .onSnapshot((snapshot) => {
            updateStatsFromSnapshot(snapshot);
        }, (error) => {
            console.error('Photos listener error:', error);
        });
    
    // Listen for new notices
    db.collection('notices')
        .where('type', '==', 'public')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .onSnapshot((snapshot) => {
            loadPublicNotices();
        }, (error) => {
            console.error('Notices listener error:', error);
        });
}

// Search Functionality
function initSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

async function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchNumber = searchInput.value.trim();
    const resultsGrid = document.getElementById('results-grid');
    const emptyResults = document.getElementById('empty-results');
    const resultCount = document.getElementById('result-count');
    
    // Validate input
    if (!searchNumber) {
        showStatus('search-status', "দয়া করে মোবাইল নম্বর লিখুন", "error");
        return;
    }
    
    if (!/^[0-9]{11}$/.test(searchNumber)) {
        showStatus('search-status', "১১ ডিজিটের বৈধ মোবাইল নম্বর লিখুন", "error");
        return;
    }
    
    // Show loading state
    resultsGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <div class="spinner"></div>
            <p style="margin-top: 20px; color: var(--light-text);">ছবি খোঁজা হচ্ছে...</p>
        </div>
    `;
    emptyResults.style.display = 'none';
    
    try {
        // Search in Firestore
        const photosSnapshot = await db.collection('photos')
            .where('customerNumber', '==', searchNumber)
            .orderBy('uploadedAt', 'desc')
            .get();
        
        // Store results globally for modal navigation
        currentSearchResults = photosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        if (photosSnapshot.empty) {
            resultsGrid.innerHTML = '';
            emptyResults.style.display = 'block';
            resultCount.textContent = '0 টি ছবি';
            showStatus('search-status', 
                `এই নম্বর দিয়ে কোন ছবি নেই: ${searchNumber}`, 
                "info"
            );
            return;
        }
        
        // Display results
        displaySearchResults(currentSearchResults);
        resultCount.textContent = `${photosSnapshot.size} টি ছবি`;
        
        showStatus('search-status', 
            `✅ ${photosSnapshot.size}টি ছবি পাওয়া গেছে`, 
            "success"
        );
        
    } catch (error) {
        console.error('Search error:', error);
        resultsGrid.innerHTML = '';
        emptyResults.style.display = 'block';
        showStatus('search-status', 
            "সার্চ করতে সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন", 
            "error"
        );
    }
}

function displaySearchResults(photos) {
    const resultsGrid = document.getElementById('results-grid');
    const emptyResults = document.getElementById('empty-results');
    
    if (photos.length === 0) {
        resultsGrid.innerHTML = '';
        emptyResults.style.display = 'block';
        return;
    }
    
    emptyResults.style.display = 'none';
    resultsGrid.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const photoCard = createPhotoCard(photo, index);
        resultsGrid.appendChild(photoCard);
    });
}

function createPhotoCard(photo, index) {
    const card = document.createElement('div');
    card.className = 'photo-card slide-in-up';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Format date
    const uploadDate = photo.uploadDate || 'তারিখ নেই';
    const fileSize = photo.fileSize || 'সাইজ জানা নেই';
    
    card.innerHTML = `
        <img src="${photo.imageUrl}" 
             alt="${photo.fileName || 'ছবি'}" 
             class="photo-image"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZTwvdGV4dD48L3N2Zz4='">
        <div class="photo-info">
            <h4 class="photo-title">ছবি ${index + 1}</h4>
            <div class="photo-details">
                <div class="detail-item">
                    <i class="fas fa-mobile-alt"></i>
                    <span>${photo.customerNumber}</span>
                </div>
                <div class="detail-item">
                    <i class="far fa-calendar"></i>
                    <span>${uploadDate}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-file"></i>
                    <span>${fileSize}</span>
                </div>
            </div>
            <button class="btn btn-success download-btn" data-index="${index}">
                <i class="fas fa-download"></i> ডাউনলোড করুন
            </button>
        </div>
    `;
    
    // Add click event for modal
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.download-btn')) {
            showImageModal(photo, index, 'search');
        }
    });
    
    // Add download button event
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadPhoto(photo);
    });
    
    return card;
}

// Upload Functionality
function initUpload() {
    const uploadForm = document.getElementById('upload-form');
    const fileDropArea = document.getElementById('file-drop-area');
    const photoUpload = document.getElementById('photo-upload');
    const selectFilesBtn = fileDropArea.querySelector('.select-files-btn');
    const clearFormBtn = document.getElementById('clear-upload-form');
    const selectedFilesContainer = document.getElementById('selected-files');
    
    // File selection
    selectFilesBtn.addEventListener('click', () => {
        photoUpload.click();
    });
    
    photoUpload.addEventListener('change', handleFileSelection);
    
    // Drag and drop
    fileDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropArea.style.borderColor = 'var(--primary-color)';
        fileDropArea.style.background = 'rgba(67, 97, 238, 0.05)';
    });
    
    fileDropArea.addEventListener('dragleave', () => {
        fileDropArea.style.borderColor = '';
        fileDropArea.style.background = '';
    });
    
    fileDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropArea.style.borderColor = '';
        fileDropArea.style.background = '';
        
        if (e.dataTransfer.files.length) {
            photoUpload.files = e.dataTransfer.files;
            handleFileSelection({ target: photoUpload });
        }
    });
    
    // Clear form
    clearFormBtn.addEventListener('click', clearUploadForm);
    
    // Form submission
    uploadForm.addEventListener('submit', handleUploadSubmit);
}

function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    const selectedFilesContainer = document.getElementById('selected-files');
    
    // Validate number of files
    if (files.length > CONFIG.MAX_FILES_PER_UPLOAD) {
        showStatus('upload-status', 
            `সর্বোচ্চ ${CONFIG.MAX_FILES_PER_UPLOAD}টি ছবি আপলোড করতে পারবেন`, 
            "error"
        );
        return;
    }
    
    // Validate each file
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
        // Check file type
        if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
            invalidFiles.push(`${file.name}: সাপোর্টেড ফরম্যাট নয়`);
            return;
        }
        
        // Check file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            invalidFiles.push(`${file.name}: ১০MB এর বেশি`);
            return;
        }
        
        validFiles.push(file);
    });
    
    // Show validation errors
    if (invalidFiles.length > 0) {
        showStatus('upload-status', 
            `সমস্যা: ${invalidFiles.join(', ')}`, 
            "error"
        );
    }
    
    if (validFiles.length === 0) {
        return;
    }
    
    // Add to selected files
    selectedFiles = [...selectedFiles, ...validFiles];
    
    // Display selected files
    updateSelectedFilesDisplay();
    
    // Show success message
    if (validFiles.length > 0) {
        showStatus('upload-status', 
            `${validFiles.length}টি ফাইল নির্বাচিত হয়েছে`, 
            "success"
        );
    }
}

function updateSelectedFilesDisplay() {
    const selectedFilesContainer = document.getElementById('selected-files');
    
    if (selectedFiles.length === 0) {
        selectedFilesContainer.innerHTML = '';
        return;
    }
    
    selectedFilesContainer.innerHTML = `
        <h4 style="margin-bottom: 15px; color: var(--light-text);">
            <i class="fas fa-list"></i> নির্বাচিত ফাইলসমূহ (${selectedFiles.length})
        </h4>
    `;
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-image" style="color: var(--primary-color);"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="remove-file" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add remove functionality
        const removeBtn = fileItem.querySelector('.remove-file');
        removeBtn.addEventListener('click', () => {
            selectedFiles.splice(index, 1);
            updateSelectedFilesDisplay();
        });
        
        selectedFilesContainer.appendChild(fileItem);
    });
}

function clearUploadForm() {
    document.getElementById('upload-form').reset();
    selectedFiles = [];
    document.getElementById('selected-files').innerHTML = '';
    document.getElementById('upload-progress').style.display = 'none';
    showStatus('upload-status', 'ফর্ম ক্লিয়ার করা হয়েছে', 'success');
}

async function handleUploadSubmit(e) {
    e.preventDefault();
    
    const customerNumber = document.getElementById('customer-number').value.trim();
    const adminPassword = document.getElementById('admin-password').value;
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressText = document.getElementById('progress-text');
    const fileCounter = document.getElementById('file-counter');
    
    // Validate inputs
    if (!customerNumber || !/^[0-9]{11}$/.test(customerNumber)) {
        showStatus('upload-status', "১১ ডিজিটের বৈধ মোবাইল নম্বর লিখুন", "error");
        return;
    }
    
    if (selectedFiles.length === 0) {
        showStatus('upload-status', "অন্তত একটি ছবি নির্বাচন করুন", "error");
        return;
    }
    
    if (adminPassword !== CONFIG.ADMIN_PASSWORD) {
        showStatus('upload-status', "ভুল অ্যাডমিন পাসওয়ার্ড", "error");
        return;
    }
    
    // Show progress bar
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressPercentage.textContent = '0%';
    progressText.textContent = 'প্রস্তুত হচ্ছে...';
    fileCounter.textContent = `0/${selectedFiles.length} ফাইল`;
    
    let uploadedCount = 0;
    let successfulUploads = 0;
    let failedUploads = [];
    
    try {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            // Update progress
            progressText.textContent = `আপলোড হচ্ছে: ${file.name}`;
            fileCounter.textContent = `${i + 1}/${selectedFiles.length} ফাইল`;
            
            try {
                // Upload to Firebase Storage
                const timestamp = Date.now();
                const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const storagePath = `photos/${customerNumber}/${fileName}`;
                const storageRef = storage.ref(storagePath);
                
                // Create upload task
                const uploadTask = storageRef.put(file);
                
                // Wait for upload to complete
                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            // Update progress
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            const totalProgress = ((uploadedCount * 100) + progress) / selectedFiles.length;
                            progressFill.style.width = `${totalProgress}%`;
                            progressPercentage.textContent = `${Math.round(totalProgress)}%`;
                        },
                        (error) => {
                            reject(error);
                        },
                        async () => {
                            try {
                                // Get download URL
                                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                                
                                // Save to Firestore
                                const photoData = {
                                    customerNumber: customerNumber,
                                    fileName: file.name,
                                    fileSize: formatFileSize(file.size),
                                    uploadDate: new Date().toLocaleString('bn-BD'),
                                    imageUrl: downloadURL,
                                    storagePath: storagePath,
                                    uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                                    uploadedBy: 'admin'
                                };
                                
                                await db.collection('photos').add(photoData);
                                
                                uploadedCount++;
                                successfulUploads++;
                                resolve();
                                
                            } catch (error) {
                                reject(error);
                            }
                        }
                    );
                });
                
            } catch (error) {
                console.error(`Upload failed for ${file.name}:`, error);
                failedUploads.push(file.name);
            }
            
            // Update overall progress
            progressFill.style.width = `${((i + 1) / selectedFiles.length) * 100}%`;
            progressPercentage.textContent = `${Math.round(((i + 1) / selectedFiles.length) * 100)}%`;
        }
        
        // Finalize
        progressText.textContent = 'সম্পন্ন হচ্ছে...';
        
        // Update stats
        await updateStats();
        
        // Prepare result message
        let resultMessage = `${successfulUploads}টি ছবি সফলভাবে আপলোড হয়েছে!`;
        
        if (failedUploads.length > 0) {
            resultMessage += ` (${failedUploads.length}টি ব্যর্থ: ${failedUploads.join(', ')})`;
        }
        
        // Show success message
        showStatus('upload-status', resultMessage, "success");
        
        // Reset form
        clearUploadForm();
        
        // Hide progress after delay
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 3000);
        
        // Refresh gallery if open
        if (galleryAuthenticated) {
            loadGalleryPhotos();
        }
        
    } catch (error) {
        console.error('Upload process error:', error);
        showStatus('upload-status', "আপলোড করতে সমস্যা হয়েছে", "error");
        uploadProgress.style.display = 'none';
    }
}

// Gallery Functionality
function initGallery() {
    const loginBtn = document.getElementById('gallery-login');
    const logoutBtn = document.getElementById('logout-gallery');
    const refreshBtn = document.getElementById('refresh-gallery');
    const gallerySearch = document.getElementById('gallery-search');
    const clearSearchBtn = document.getElementById('clear-gallery-search');
    
    loginBtn.addEventListener('click', handleGalleryLogin);
    logoutBtn.addEventListener('click', handleGalleryLogout);
    refreshBtn.addEventListener('click', () => loadGalleryPhotos());
    
    gallerySearch.addEventListener('input', () => {
        loadGalleryPhotos(gallerySearch.value.trim());
    });
    
    clearSearchBtn.addEventListener('click', () => {
        gallerySearch.value = '';
        loadGalleryPhotos();
    });
}

function handleGalleryLogin() {
    const password = document.getElementById('gallery-password').value;
    const authContainer = document.getElementById('gallery-auth');
    const galleryContainer = document.getElementById('gallery-container');
    
    if (password !== CONFIG.ADMIN_PASSWORD) {
        showStatus('gallery-status', "ভুল অ্যাডমিন পাসওয়ার্ড", "error");
        return;
    }
    
    galleryAuthenticated = true;
    authContainer.style.display = 'none';
    galleryContainer.style.display = 'block';
    
    // Load gallery photos
    loadGalleryPhotos();
    
    showStatus('gallery-status', "অ্যাডমিন হিসাবে লগইন হয়েছে", "success");
}

function handleGalleryLogout() {
    galleryAuthenticated = false;
    document.getElementById('gallery-auth').style.display = 'block';
    document.getElementById('gallery-container').style.display = 'none';
    document.getElementById('gallery-password').value = '';
    clearStatus('gallery-status');
}

async function loadGalleryPhotos(searchTerm = '') {
    const galleryGrid = document.getElementById('gallery-grid');
    const emptyGallery = document.getElementById('empty-gallery');
    
    // Show loading
    galleryGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <div class="spinner"></div>
            <p style="margin-top: 20px; color: var(--light-text);">গ্যালারি লোড হচ্ছে...</p>
        </div>
    `;
    emptyGallery.style.display = 'none';
    
    try {
        let query = db.collection('photos').orderBy('uploadedAt', 'desc');
        
        // Apply search filter
        if (searchTerm) {
            // Try to search by customer number
            query = query.where('customerNumber', '==', searchTerm);
        }
        
        const snapshot = await query.limit(100).get();
        
        // Store globally for modal
        currentGalleryPhotos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        if (snapshot.empty) {
            galleryGrid.innerHTML = '';
            emptyGallery.style.display = 'block';
            updateGalleryStats(snapshot);
            return;
        }
        
        // Display gallery
        displayGalleryPhotos(currentGalleryPhotos);
        updateGalleryStats(snapshot);
        
    } catch (error) {
        console.error('Gallery load error:', error);
        galleryGrid.innerHTML = '';
        emptyGallery.style.display = 'block';
        showStatus('gallery-status', "গ্যালারি লোড করতে সমস্যা", "error");
    }
}

function displayGalleryPhotos(photos) {
    const galleryGrid = document.getElementById('gallery-grid');
    const emptyGallery = document.getElementById('empty-gallery');
    
    if (photos.length === 0) {
        galleryGrid.innerHTML = '';
        emptyGallery.style.display = 'block';
        return;
    }
    
    emptyGallery.style.display = 'none';
    galleryGrid.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const galleryItem = createGalleryItem(photo, index);
        galleryGrid.appendChild(galleryItem);
    });
}

function createGalleryItem(photo, index) {
    const item = document.createElement('div');
    item.className = 'photo-card slide-in-up';
    item.style.animationDelay = `${index * 0.05}s`;
    item.dataset.id = photo.id;
    
    // Format date
    const uploadDate = photo.uploadDate || 'তারিখ নেই';
    
    item.innerHTML = `
        <img src="${photo.imageUrl}" 
             alt="${photo.fileName}" 
             class="photo-image"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZTwvdGV4dD48L3N2Zz4='">
        <div class="photo-info">
            <h4 class="photo-title">
                <i class="fas fa-mobile-alt" style="color: var(--primary-color);"></i>
                ${photo.customerNumber}
            </h4>
            <div class="photo-details">
                <div class="detail-item">
                    <i class="far fa-calendar"></i>
                    <span>${uploadDate}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-file"></i>
                    <span>${photo.fileSize || 'সাইজ নেই'}</span>
                </div>
            </div>
        </div>
    `;
    
    item.addEventListener('click', () => {
        showImageModal(photo, index, 'gallery');
    });
    
    return item;
}

// Notice Board Functionality
function initNoticeBoard() {
    const noticeLoginBtn = document.getElementById('notice-login');
    const noticeLogoutBtn = document.getElementById('notice-logout');
    const publishNoticeBtn = document.getElementById('publish-notice');
    const saveDraftBtn = document.getElementById('save-draft');
    
    noticeLoginBtn.addEventListener('click', handleNoticeLogin);
    noticeLogoutBtn.addEventListener('click', handleNoticeLogout);
    publishNoticeBtn.addEventListener('click', publishNotice);
    saveDraftBtn.addEventListener('click', saveNoticeDraft);
}

function handleNoticeLogin() {
    const password = document.getElementById('notice-password').value;
    const noticeAuthStatus = document.getElementById('notice-auth-status');
    const noticeAdminArea = document.getElementById('notice-admin-area');
    const noticeEditor = document.getElementById('notice-editor');
    
    if (password !== CONFIG.ADMIN_PASSWORD) {
        showStatus('notice-status', "ভুল অ্যাডমিন পাসওয়ার্ড", "error");
        return;
    }
    
    noticeAuthenticated = true;
    noticeAuthStatus.innerHTML = `
        <i class="fas fa-unlock" style="color: var(--success-color);"></i>
        <span>অ্যাডমিন লগইন করা আছে</span>
    `;
    noticeAdminArea.style.display = 'none';
    noticeEditor.style.display = 'block';
    
    showStatus('notice-status', "নোটিশ লিখতে প্রস্তুত", "success");
}

function handleNoticeLogout() {
    noticeAuthenticated = false;
    document.getElementById('notice-auth-status').innerHTML = `
        <i class="fas fa-lock"></i>
        <span>অ্যাডমিন লগইন প্রয়োজন</span>
    `;
    document.getElementById('notice-admin-area').style.display = 'block';
    document.getElementById('notice-editor').style.display = 'none';
    document.getElementById('notice-password').value = '';
    clearStatus('notice-status');
}

async function loadPublicNotices() {
    const publicNoticesContainer = document.getElementById('public-notices');
    
    try {
        const snapshot = await db.collection('notices')
            .where('type', '==', 'public')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        if (snapshot.empty) {
            publicNoticesContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px; color: var(--light-text); opacity: 0.6;">
                    <i class="fas fa-bullhorn"></i>
                    <h4 style="margin-top: 15px;">কোন নোটিশ নেই</h4>
                    <p>শীঘ্রই নতুন নোটিশ যোগ করা হবে</p>
                </div>
            `;
            return;
        }
        
        publicNoticesContainer.innerHTML = '';
        
        snapshot.docs.forEach(doc => {
            const notice = doc.data();
            const noticeItem = createNoticeItem(notice);
            publicNoticesContainer.appendChild(noticeItem);
        });
        
    } catch (error) {
        console.error('Notices load error:', error);
        publicNoticesContainer.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px; color: var(--light-text); opacity: 0.6;">
                <i class="fas fa-exclamation-triangle"></i>
                <h4 style="margin-top: 15px;">নোটিশ লোড করতে সমস্যা</h4>
                <p>দয়া করে আবার চেষ্টা করুন</p>
            </div>
        `;
    }
}

function createNoticeItem(notice) {
    const item = document.createElement('div');
    item.className = `notice-item ${notice.noticeType || 'general'}`;
    
    // Format date
    const createdAt = notice.createdAt ? 
        new Date(notice.createdAt.seconds * 1000).toLocaleString('bn-BD') : 
        'তারিখ নেই';
    
    // Get type icon
    let typeIcon = 'fas fa-info-circle';
    let typeColor = 'var(--primary-color)';
    
    switch (notice.noticeType) {
        case 'important':
            typeIcon = 'fas fa-exclamation-triangle';
            typeColor = 'var(--danger-color)';
            break;
        case 'service':
            typeIcon = 'fas fa-cogs';
            typeColor = 'var(--success-color)';
            break;
        case 'offer':
            typeIcon = 'fas fa-gift';
            typeColor = 'var(--warning-color)';
            break;
    }
    
    item.innerHTML = `
        <div class="notice-item-header">
            <div class="notice-item-title" style="display: flex; align-items: center; gap: 10px;">
                <i class="${typeIcon}" style="color: ${typeColor};"></i>
                <span>${notice.title}</span>
            </div>
            <div class="notice-item-date">${createdAt}</div>
        </div>
        <div class="notice-item-content">
            ${notice.content}
        </div>
    `;
    
    return item;
}

async function publishNotice() {
    if (!noticeAuthenticated) {
        showStatus('notice-status', "প্রথমে অ্যাডমিন হিসাবে লগইন করুন", "error");
        return;
    }
    
    const title = document.getElementById('notice-title').value.trim();
    const content = document.getElementById('notice-content').value.trim();
    const noticeType = document.getElementById('notice-type').value;
    
    if (!title || !content) {
        showStatus('notice-status', "শিরোনাম এবং বিবরণ লিখুন", "error");
        return;
    }
    
    try {
        const noticeData = {
            title: title,
            content: content,
            noticeType: noticeType,
            type: 'public',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: 'admin'
        };
        
        await db.collection('notices').add(noticeData);
        
        // Clear form
        document.getElementById('notice-title').value = '';
        document.getElementById('notice-content').value = '';
        
        showStatus('notice-status', "নোটিশ সফলভাবে প্রকাশিত হয়েছে", "success");
        
        // Reload notices
        loadPublicNotices();
        
    } catch (error) {
        console.error('Publish notice error:', error);
        showStatus('notice-status', "নোটিশ প্রকাশ করতে সমস্যা", "error");
    }
}

function saveNoticeDraft() {
    const title = document.getElementById('notice-title').value.trim();
    const content = document.getElementById('notice-content').value.trim();
    const noticeType = document.getElementById('notice-type').value;
    
    if (!title && !content) {
        showStatus('notice-status', "ড্রাফট সেভ করার জন্য কিছু লিখুন", "error");
        return;
    }
    
    const draft = {
        title: title,
        content: content,
        noticeType: noticeType,
        savedAt: new Date().toLocaleString('bn-BD')
    };
    
    localStorage.setItem('notice_draft', JSON.stringify(draft));
    showStatus('notice-status', "ড্রাফট সেভ করা হয়েছে", "success");
}

// Modal Functionality
function initModal() {
    const modal = document.getElementById('image-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    const downloadBtn = document.getElementById('download-image');
    const deleteBtn = document.getElementById('delete-image');
    const shareBtn = document.getElementById('share-image');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    downloadBtn.addEventListener('click', downloadCurrentImage);
    deleteBtn.addEventListener('click', deleteCurrentImage);
    shareBtn.addEventListener('click', shareCurrentImage);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            }
        }
    });
}

let currentModalContext = ''; // 'search' or 'gallery'

function showImageModal(photo, index, context) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const imageInfo = document.getElementById('image-info');
    const deleteBtn = document.getElementById('delete-image');
    const downloadBtn = document.getElementById('download-image');
    
    // Store current context and index
    currentModalContext = context;
    currentModalIndex = index;
    
    // Show loading
    modalImage.style.display = 'none';
    modal.querySelector('.image-loader').style.display = 'flex';
    
    // Set image source
    modalImage.onload = () => {
        modalImage.style.display = 'block';
        modal.querySelector('.image-loader').style.display = 'none';
    };
    
    modalImage.src = photo.imageUrl;
    
    // Update info
    const uploadDate = photo.uploadDate || 'তারিখ নেই';
    const fileSize = photo.fileSize || 'সাইজ জানা নেই';
    
    imageInfo.innerHTML = `
        <h4><i class="fas fa-info-circle"></i> ছবি তথ্য</h4>
        <div class="info-row">
            <span class="info-label">মোবাইল নম্বর:</span>
            <span class="info-value">${photo.customerNumber}</span>
        </div>
        <div class="info-row">
            <span class="info-label">ফাইল নাম:</span>
            <span class="info-value">${photo.fileName || 'নাম নেই'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">আপলোড তারিখ:</span>
            <span class="info-value">${uploadDate}</span>
        </div>
        <div class="info-row">
            <span class="info-label">ফাইল সাইজ:</span>
            <span class="info-value">${fileSize}</span>
        </div>
    `;
    
    // Show delete button only for gallery (admin)
    if (context === 'gallery' && galleryAuthenticated) {
        deleteBtn.style.display = 'block';
        deleteBtn.dataset.id = photo.id;
        deleteBtn.dataset.storagePath = photo.storagePath;
    } else {
        deleteBtn.style.display = 'none';
    }
    
    // Set download button data
    downloadBtn.dataset.url = photo.imageUrl;
    downloadBtn.dataset.filename = `shimu_studio_${photo.customerNumber}_${Date.now()}.jpg`;
    
    // Show modal
    modal.style.display = 'flex';
}

function showPrevImage() {
    let photos = [];
    
    if (currentModalContext === 'search') {
        photos = currentSearchResults;
    } else if (currentModalContext === 'gallery') {
        photos = currentGalleryPhotos;
    }
    
    if (photos.length === 0) return;
    
    currentModalIndex = (currentModalIndex - 1 + photos.length) % photos.length;
    const photo = photos[currentModalIndex];
    showImageModal(photo, currentModalIndex, currentModalContext);
}

function showNextImage() {
    let photos = [];
    
    if (currentModalContext === 'search') {
        photos = currentSearchResults;
    } else if (currentModalContext === 'gallery') {
        photos = currentGalleryPhotos;
    }
    
    if (photos.length === 0) return;
    
    currentModalIndex = (currentModalIndex + 1) % photos.length;
    const photo = photos[currentModalIndex];
    showImageModal(photo, currentModalIndex, currentModalContext);
}

function downloadCurrentImage() {
    const downloadBtn = document.getElementById('download-image');
    const imageUrl = downloadBtn.dataset.url;
    const filename = downloadBtn.dataset.filename;
    
    if (!imageUrl) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Log download
    logDownload(filename);
}

async function deleteCurrentImage() {
    const deleteBtn = document.getElementById('delete-image');
    const photoId = deleteBtn.dataset.id;
    const storagePath = deleteBtn.dataset.storagePath;
    
    if (!photoId || !storagePath) return;
    
    if (!confirm("আপনি কি নিশ্চিত এই ছবি ডিলিট করতে চান? এটি পুনরুদ্ধার করা যাবে না।")) {
        return;
    }
    
    try {
        // Delete from Storage
        await storage.ref(storagePath).delete();
        
        // Delete from Firestore
        await db.collection('photos').doc(photoId).delete();
        
        // Update stats
        await updateStats();
        
        // Close modal
        document.getElementById('image-modal').style.display = 'none';
        
        // Refresh gallery
        loadGalleryPhotos();
        
        showStatus('gallery-status', "ছবি সফলভাবে ডিলিট হয়েছে", "success");
        
    } catch (error) {
        console.error('Delete error:', error);
        showStatus('gallery-status', "ডিলিট করতে সমস্যা", "error");
    }
}

function shareCurrentImage() {
    const downloadBtn = document.getElementById('download-image');
    const imageUrl = downloadBtn.dataset.url;
    
    if (!imageUrl) return;
    
    // Copy to clipboard
    navigator.clipboard.writeText(imageUrl)
        .then(() => {
            showStatus('gallery-status', "লিংক কপি করা হয়েছে", "success");
        })
        .catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = imageUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showStatus('gallery-status', "লিংক কপি করা হয়েছে", "success");
        });
}

// Helper Functions
async function loadStats() {
    try {
        // Get photo count
        const photosSnapshot = await db.collection('photos').get();
        const totalPhotos = photosSnapshot.size;
        
        // Get unique customers
        const customerNumbers = new Set();
        photosSnapshot.forEach(doc => {
            customerNumbers.add(doc.data().customerNumber);
        });
        const totalCustomers = customerNumbers.size;
        
        // Get today's uploads
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySnapshot = await db.collection('photos')
            .where('uploadedAt', '>=', today)
            .get();
        const todayUploads = todaySnapshot.size;
        
        // Update UI
        document.getElementById('total-photos-count').textContent = totalPhotos;
        document.getElementById('total-customers').textContent = totalCustomers;
        document.getElementById('today-uploads').textContent = todayUploads;
        
    } catch (error) {
        console.error('Stats load error:', error);
    }
}

function updateStatsFromSnapshot(snapshot) {
    const totalPhotos = snapshot.size;
    document.getElementById('total-photos-count').textContent = totalPhotos;
    
    // Update customers count
    const customerNumbers = new Set();
    snapshot.forEach(doc => {
        customerNumbers.add(doc.data().customerNumber);
    });
    document.getElementById('total-customers').textContent = customerNumbers.size;
}

function updateGalleryStats(snapshot) {
    const galleryTotal = document.getElementById('gallery-total');
    const gallerySize = document.getElementById('gallery-size');
    const galleryToday = document.getElementById('gallery-today');
    
    if (galleryTotal && gallerySize && galleryToday) {
        galleryTotal.textContent = snapshot.size;
        
        // Calculate total size (approximate)
        let totalSize = 0;
        snapshot.forEach(doc => {
            const size = doc.data().fileSize || '0 KB';
            const sizeInBytes = parseFileSize(size);
            totalSize += sizeInBytes;
        });
        
        gallerySize.textContent = formatFileSize(totalSize);
        
        // Calculate today's uploads
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let todayCount = 0;
        
        snapshot.forEach(doc => {
            const uploadDate = doc.data().uploadedAt;
            if (uploadDate && uploadDate.toDate() >= today) {
                todayCount++;
            }
        });
        
        galleryToday.textContent = todayCount;
    }
}

function formatFileSize(bytes) {
    if (typeof bytes === 'string') {
        // If it's already formatted, return as is
        if (bytes.includes('KB') || bytes.includes('MB') || bytes.includes('GB')) {
            return bytes;
        }
        // Try to parse string to number
        bytes = parseInt(bytes);
    }
    
    if (bytes === 0 || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function parseFileSize(sizeString) {
    if (typeof sizeString === 'number') return sizeString;
    
    const match = sizeString.match(/(\d+(?:\.\d+)?)\s*(Bytes|KB|MB|GB)/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    switch (unit) {
        case 'KB': return value * 1024;
        case 'MB': return value * 1024 * 1024;
        case 'GB': return value * 1024 * 1024 * 1024;
        default: return value;
    }
}

async function downloadPhoto(photo) {
    try {
        const link = document.createElement('a');
        link.href = photo.imageUrl;
        link.download = `shimu_studio_${photo.customerNumber}_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Log download
        await logDownload(photo.fileName || 'unknown');
        
    } catch (error) {
        console.error('Download error:', error);
        showStatus('search-status', "ডাউনলোড করতে সমস্যা", "error");
    }
}

async function logDownload(filename) {
    try {
        await db.collection('downloads').add({
            filename: filename,
            downloadedAt: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error('Download log error:', error);
    }
}

async function updateStats() {
    try {
        // Get latest counts
        const photosSnapshot = await db.collection('photos').get();
        const totalPhotos = photosSnapshot.size;
        
        const customerNumbers = new Set();
        photosSnapshot.forEach(doc => {
            customerNumbers.add(doc.data().customerNumber);
        });
        const totalCustomers = customerNumbers.size;
        
        // Update system stats
        await db.collection('system').doc('stats').set({
            totalPhotos: totalPhotos,
            totalCustomers: totalCustomers,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Update UI
        document.getElementById('total-photos-count').textContent = totalPhotos;
        document.getElementById('total-customers').textContent = totalCustomers;
        
        // Update gallery stats if open
        if (galleryAuthenticated) {
            updateGalleryStats(photosSnapshot);
        }
        
    } catch (error) {
        console.error('Stats update error:', error);
    }
}

// Status Message Functions
function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = message;
    element.className = `status-container ${type}`;
    element.style.display = 'block';
    
    // Auto hide non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

function clearStatus(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function clearStatusMessages() {
    const statusContainers = document.querySelectorAll('.status-container');
    statusContainers.forEach(container => {
        container.style.display = 'none';
    });
}

// Auto backup to localStorage
function backupToLocalStorage() {
    try {
        const backupData = {
            lastBackup: new Date().toISOString(),
            config: CONFIG,
            selectedFiles: selectedFiles.length
        };
        localStorage.setItem('shimu_backup', JSON.stringify(backupData));
    } catch (error) {
        console.error('Backup error:', error);
    }
}

// Run backup every 30 minutes
setInterval(backupToLocalStorage, 30 * 60 * 1000);

// Initial backup
backupToLocalStorage();

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}