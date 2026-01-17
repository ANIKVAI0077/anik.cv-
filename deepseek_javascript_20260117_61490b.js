// ===== CONFIGURATION =====
const CONFIG = {
    ADMIN_PASSWORD: "anik0077",
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES_PER_UPLOAD: 20,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    FIREBASE_CONFIG: {
        apiKey: "YOUR_API_KEY",
        authDomain: "shimu-digital-studio.firebaseapp.com",
        projectId: "shimu-digital-studio",
        storageBucket: "shimu-digital-studio.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    DEFAULT_SERVICES: [
        {
            id: 1,
            title: "ওয়েডিং ফটোগ্রাফি",
            description: "বিয়ে ও ওয়ালিমার সম্পূর্ণ ফটোগ্রাফি ও ভিডিওগ্রাফি সেবা",
            icon: "camera",
            price: "১০,০০০ - ৫০,০০০ টাকা"
        },
        {
            id: 2,
            title: "পাসপোর্ট সাইজ ফটো",
            description: "ভিসা, পাসপোর্ট ও সরকারি কাজের জন্য ফটো",
            icon: "id-card",
            price: "১০০ - ৫০০ টাকা"
        },
        {
            id: 3,
            title: "স্টুডিও ফটোশুট",
            description: "পারিবারিক, ব্যক্তিগত ও পেশাদার ফটোশুট",
            icon: "camera-retro",
            price: "১,০০০ - ১০,০০০ টাকা"
        },
        {
            id: 4,
            title: "ভিডিও এডিটিং",
            description: "প্রফেশনাল ভিডিও এডিটিং ও মন্টাজ",
            icon: "video",
            price: "২,০০০ - ২০,০০০ টাকা"
        },
        {
            id: 5,
            title: "ফটো প্রিন্টিং",
            description: "উচ্চ রেজুলেশনে ফটো প্রিন্টিং সেবা",
            icon: "print",
            price: "২০ - ৫০০ টাকা"
        },
        {
            id: 6,
            title: "অ্যালবাম তৈরি",
            description: "ডিজিটাল ও হার্ডকপি অ্যালবাম তৈরি",
            icon: "images",
            price: "৫০০ - ৫,০০০ টাকা"
        }
    ]
};

// ===== GLOBAL VARIABLES =====
let currentUser = null;
let galleryAuth = false;
let noticeAuth = false;
let servicesAuth = false;
let selectedFiles = [];
let currentSearchResults = [];
let currentGalleryPhotos = [];
let currentModalIndex = 0;
let currentModalContext = '';
let currentPage = 1;
let itemsPerPage = 12;
let totalPages = 1;
let totalGalleryItems = 0;
let currentFilter = 'all';
let currentSort = 'newest';

// Firebase instances
let db, storage;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 শিমু ডিজিটাল স্টুডিও লোড হচ্ছে...');
    
    // Hide loading screen after delay
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            showToast('সিস্টেম প্রস্তুত ✓', 'স্বাগতম! আপনার স্টুডিও ম্যানেজমেন্ট সিস্টেম', 'success');
        }, 500);
    }, 2000);

    // Initialize Firebase
    await initFirebase();
    
    // Initialize UI
    initUI();
    
    // Load initial data
    await loadInitialData();
});

// ===== FIREBASE INITIALIZATION =====
async function initFirebase() {
    try {
        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
        }
        
        db = firebase.firestore();
        storage = firebase.storage();
        
        // Enable offline persistence
        await db.enablePersistence()
            .catch((err) => {
                console.warn('Offline persistence not supported:', err);
            });
        
        console.log('✅ Firebase initialized successfully');
        
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        showToast('Firebase সংযোগ ব্যর্থ', 'অফলাইন মোডে কাজ চালিয়ে যাচ্ছি', 'error');
        
        // Create mock database for offline use
        createMockDatabase();
    }
}

function createMockDatabase() {
    // Create local storage for offline use
    if (!localStorage.getItem('shimu_photos')) {
        localStorage.setItem('shimu_photos', JSON.stringify([]));
    }
    if (!localStorage.getItem('shimu_notices')) {
        localStorage.setItem('shimu_notices', JSON.stringify([]));
    }
    if (!localStorage.getItem('shimu_services')) {
        localStorage.setItem('shimu_services', JSON.stringify(CONFIG.DEFAULT_SERVICES));
    }
    
    db = {
        collection: (name) => ({
            doc: (id) => ({
                get: () => Promise.resolve({
                    exists: false,
                    data: () => null
                }),
                set: (data) => {
                    return new Promise((resolve) => {
                        const items = JSON.parse(localStorage.getItem(`shimu_${name}`) || '[]');
                        if (id) {
                            const index = items.findIndex(item => item.id === id);
                            if (index > -1) {
                                items[index] = { id, ...data };
                            } else {
                                items.push({ id, ...data });
                            }
                        } else {
                            items.push({ id: Date.now().toString(), ...data });
                        }
                        localStorage.setItem(`shimu_${name}`, JSON.stringify(items));
                        resolve();
                    });
                },
                delete: () => {
                    return new Promise((resolve) => {
                        const items = JSON.parse(localStorage.getItem(`shimu_${name}`) || '[]');
                        const filtered = items.filter(item => item.id !== id);
                        localStorage.setItem(`shimu_${name}`, JSON.stringify(filtered));
                        resolve();
                    });
                }
            }),
            add: (data) => {
                return new Promise((resolve) => {
                    const items = JSON.parse(localStorage.getItem(`shimu_${name}`) || '[]');
                    const id = Date.now().toString();
                    items.push({ id, ...data });
                    localStorage.setItem(`shimu_${name}`, JSON.stringify(items));
                    resolve({ id });
                });
            },
            get: () => {
                return new Promise((resolve) => {
                    const items = JSON.parse(localStorage.getItem(`shimu_${name}`) || '[]');
                    resolve({
                        docs: items.map(item => ({
                            id: item.id,
                            data: () => {
                                const { id, ...data } = item;
                                return data;
                            }
                        })),
                        empty: items.length === 0,
                        size: items.length
                    });
                });
            },
            where: () => ({ orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ docs: [], empty: true, size: 0 }) }) }) })
        })
    };
    
    storage = {
        ref: (path) => ({
            put: (file) => ({
                on: (event, progress, error, complete) => {
                    const task = {
                        snapshot: {
                            ref: { getDownloadURL: () => Promise.resolve(URL.createObjectURL(file)) },
                            bytesTransferred: 0,
                            totalBytes: file.size
                        }
                    };
                    
                    // Simulate progress
                    let progressInterval = setInterval(() => {
                        if (task.snapshot.bytesTransferred < file.size) {
                            task.snapshot.bytesTransferred += file.size / 10;
                            progress && progress(task.snapshot);
                        } else {
                            clearInterval(progressInterval);
                            complete && complete(task);
                        }
                    }, 100);
                    
                    return task;
                }
            })
        })
    };
}

// ===== UI INITIALIZATION =====
function initUI() {
    // Theme toggle
    initTheme();
    
    // Navigation
    initNavigation();
    
    // Search functionality
    initSearch();
    
    // Upload functionality
    initUpload();
    
    // Gallery functionality
    initGallery();
    
    // Notice board functionality
    initNoticeBoard();
    
    // Services functionality
    initServices();
    
    // Modal functionality
    initModal();
    
    // Footer links
    initFooter();
}

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i><span class="toggle-text">লাইট মোড</span>';
    }
    
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i><span class="toggle-text">ডার্ক মোড</span>';
        localStorage.setItem('theme', 'light');
        showToast('লাইট মোড চালু হয়েছে', 'থিম পরিবর্তন সফল', 'success');
    } else {
        body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i><span class="toggle-text">লাইট মোড</span>';
        localStorage.setItem('theme', 'dark');
        showToast('ডার্ক মোড চালু হয়েছে', 'থিম পরিবর্তন সফল', 'success');
    }
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section specific data
        switch(sectionId) {
            case 'search':
                clearSearchResults();
                break;
            case 'gallery':
                if (galleryAuth) {
                    loadGalleryPhotos();
                }
                break;
            case 'notice':
                loadNotices();
                break;
            case 'services':
                loadServices();
                break;
        }
        
        showToast('সেকশন পরিবর্তন', `${targetSection.querySelector('h2').textContent} লোড হয়েছে`, 'info');
    }
}

function initFooter() {
    document.querySelectorAll('.footer-links a, .footer-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.dataset.section) {
                e.preventDefault();
                switchSection(link.dataset.section);
                
                // Update navigation
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                    if (nav.dataset.section === link.dataset.section) {
                        nav.classList.add('active');
                    }
                });
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// ===== SEARCH FUNCTIONALITY =====
function initSearch() {
    const searchBtn = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchPhone');
    const clearBtn = document.getElementById('clearSearch');
    const refreshBtn = document.getElementById('refreshResults');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const searchHelpBtn = document.getElementById('searchHelp');
    
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        clearSearchResults();
    });
    
    refreshBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            performSearch();
        }
    });
    
    downloadAllBtn.addEventListener('click', downloadAllPhotos);
    
    searchHelpBtn.addEventListener('click', () => {
        showToast('সার্চ সাহায্য', 
            '১. ১১ ডিজিটের মোবাইল নম্বর দিন\n২. স্টুডিওতে যে নম্বর দিয়েছেন সেটি ব্যবহার করুন\n৩. যেকোনো ডিভাইস থেকে সার্চ করতে পারেন',
            'info');
    });
}

function validatePhoneNumber(phone) {
    if (!phone) return 'মোবাইল নম্বর দিন';
    if (!/^01[3-9]\d{8}$/.test(phone)) return 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন';
    return null;
}

async function performSearch() {
    const phoneInput = document.getElementById('searchPhone');
    const phone = phoneInput.value.trim();
    const resultsGrid = document.getElementById('resultsGrid');
    const resultCount = document.getElementById('resultCount');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    
    // Validation
    const error = validatePhoneNumber(phone);
    if (error) {
        showToast('সার্চ ত্রুটি', error, 'error');
        phoneInput.focus();
        return;
    }
    
    // Show loading
    resultsGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 60px;">
            <div class="spinner"></div>
            <p style="margin-top: 20px; color: var(--light-text);">ছবি খোঁজা হচ্ছে...</p>
        </div>
    `;
    
    try {
        // Search in database
        const photos = await searchPhotosByPhone(phone);
        
        // Store results globally
        currentSearchResults = photos;
        
        if (photos.length === 0) {
            resultsGrid.innerHTML = `
                <div class="empty-state" id="emptyResults">
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>কোন ছবি পাওয়া যায়নি</h3>
                    <p>এই নম্বর দিয়ে কোন ছবি নেই: ${phone}</p>
                    <button class="btn-secondary" onclick="document.getElementById('searchPhone').focus()">
                        <i class="fas fa-mobile-alt"></i>
                        নতুন করে সার্চ করুন
                    </button>
                </div>
            `;
            resultCount.textContent = '0';
            downloadAllBtn.style.display = 'none';
            showToast('ফলাফল', 'কোন ছবি পাওয়া যায়নি', 'info');
        } else {
            displaySearchResults(photos);
            resultCount.textContent = photos.length;
            downloadAllBtn.style.display = 'flex';
            showToast('ফলাফল পাওয়া গেছে', `${photos.length}টি ছবি পাওয়া গেছে`, 'success');
        }
        
    } catch (error) {
        console.error('Search error:', error);
        resultsGrid.innerHTML = `
            <div class="empty-state" id="emptyResults">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>সার্চ ব্যর্থ</h3>
                <p>দয়া করে আবার চেষ্টা করুন</p>
                <button class="btn-secondary" onclick="performSearch()">
                    <i class="fas fa-redo"></i>
                    পুনরায় চেষ্টা করুন
                </button>
            </div>
        `;
        showToast('সার্চ ব্যর্থ', 'ইন্টারনেট সংযোগ চেক করুন', 'error');
    }
}

async function searchPhotosByPhone(phone) {
    try {
        const snapshot = await db.collection('photos')
            .where('customerNumber', '==', phone)
            .orderBy('uploadedAt', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Database search error:', error);
        
        // Fallback to local storage
        const photos = JSON.parse(localStorage.getItem('shimu_photos') || '[]');
        return photos.filter(photo => photo.customerNumber === phone);
    }
}

function displaySearchResults(photos) {
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (photos.length === 0) {
        resultsGrid.innerHTML = `
            <div class="empty-state" id="emptyResults">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>কোন ছবি পাওয়া যায়নি</h3>
                <p>মোবাইল নম্বর দিয়ে সার্চ করুন</p>
            </div>
        `;
        return;
    }
    
    resultsGrid.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const photoCard = createPhotoCard(photo, index, 'search');
        resultsGrid.appendChild(photoCard);
    });
}

function createPhotoCard(photo, index, context) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.id = photo.id;
    card.dataset.index = index;
    
    // Format date
    const uploadDate = photo.uploadDate || 
        (photo.uploadedAt ? new Date(photo.uploadedAt.seconds * 1000).toLocaleDateString('bn-BD') : 'তারিখ নেই');
    
    // Format file size
    const fileSize = photo.fileSize || 'সাইজ জানা নেই';
    
    card.innerHTML = `
        <img src="${photo.imageUrl}" 
             alt="${photo.fileName || 'ছবি'}" 
             class="photo-image"
             onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZTwvdGV4dD48L3N2Zz4='">
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
            <div class="photo-actions">
                <button class="btn-success download-btn">
                    <i class="fas fa-download"></i>
                    ডাউনলোড
                </button>
                <button class="btn-secondary view-btn">
                    <i class="fas fa-eye"></i>
                    দেখুন
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const downloadBtn = card.querySelector('.download-btn');
    const viewBtn = card.querySelector('.view-btn');
    
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadPhoto(photo);
    });
    
    viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImageModal(photo, index, context);
    });
    
    card.addEventListener('click', () => {
        showImageModal(photo, index, context);
    });
    
    return card;
}

function clearSearchResults() {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultCount = document.getElementById('resultCount');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    
    resultsGrid.innerHTML = `
        <div class="empty-state" id="emptyResults">
            <div class="empty-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3>ছবি খুঁজুন</h3>
            <p>আপনার মোবাইল নম্বর দিয়ে সার্চ করুন</p>
        </div>
    `;
    
    resultCount.textContent = '0';
    downloadAllBtn.style.display = 'none';
    currentSearchResults = [];
}

async function downloadPhoto(photo) {
    try {
        const link = document.createElement('a');
        link.href = photo.imageUrl;
        link.download = `shimu_${photo.customerNumber}_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('ডাউনলোড শুরু', 'ছবি ডাউনলোড শুরু হয়েছে', 'success');
        
        // Log download
        await logDownload(photo);
        
    } catch (error) {
        console.error('Download error:', error);
        showToast('ডাউনলোড ব্যর্থ', 'দয়া করে আবার চেষ্টা করুন', 'error');
    }
}

async function downloadAllPhotos() {
    if (currentSearchResults.length === 0) return;
    
    showToast('ডাউনলোড শুরু', `${currentSearchResults.length}টি ছবি ডাউনলোড শুরু হচ্ছে...`, 'info');
    
    for (let i = 0; i < currentSearchResults.length; i++) {
        try {
            await downloadPhoto(currentSearchResults[i]);
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay between downloads
        } catch (error) {
            console.error(`Failed to download photo ${i}:`, error);
        }
    }
    
    showToast('ডাউনলোড সম্পন্ন', 'সব ছবি ডাউনলোড সম্পন্ন', 'success');
}

async function logDownload(photo) {
    try {
        await db.collection('downloads').add({
            photoId: photo.id,
            customerNumber: photo.customerNumber,
            downloadedAt: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error('Download log error:', error);
    }
}

// ===== UPLOAD FUNCTIONALITY =====
function initUpload() {
    const uploadForm = document.getElementById('uploadForm');
    const dropArea = document.getElementById('dropArea');
    const photoInput = document.getElementById('photoInput');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    const resetFormBtn = document.getElementById('resetForm');
    const submitBtn = document.getElementById('submitUpload');
    const uploadGuideBtn = document.getElementById('uploadGuideBtn');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const adminPasswordInput = document.getElementById('adminPassword');
    
    // File selection
    selectFilesBtn.addEventListener('click', () => {
        photoInput.click();
    });
    
    photoInput.addEventListener('change', handleFileSelection);
    
    // Drag and drop
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = 'var(--primary-color)';
        dropArea.style.background = 'var(--light-card)';
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = '';
        dropArea.style.background = '';
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.background = '';
        
        if (e.dataTransfer.files.length) {
            photoInput.files = e.dataTransfer.files;
            handleFileSelection({ target: photoInput });
        }
    });
    
    // Form reset
    resetFormBtn.addEventListener('click', resetUploadForm);
    
    // Form submission
    uploadForm.addEventListener('submit', handleUploadSubmit);
    
    // Password toggle
    togglePasswordBtn.addEventListener('click', () => {
        const type = adminPasswordInput.type === 'password' ? 'text' : 'password';
        adminPasswordInput.type = type;
        togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    // Upload guide
    uploadGuideBtn.addEventListener('click', () => {
        showToast('আপলোড গাইড', 
            '১. গ্রাহকের সঠিক মোবাইল নম্বর দিন\n২. ছবি নির্বাচন করুন (সর্বোচ্চ ২০টি)\n৩. অ্যাডমিন পাসওয়ার্ড দিন\n৪. আপলোড বাটনে ক্লিক করুন',
            'info');
    });
}

function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    updateSelectedFiles(files);
}

function updateSelectedFiles(newFiles) {
    // Validate files
    const validFiles = [];
    const errors = [];
    
    newFiles.forEach(file => {
        // Check file type
        if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
            errors.push(`${file.name}: সাপোর্টেড ফরম্যাট নয়`);
            return;
        }
        
        // Check file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            errors.push(`${file.name}: ১০MB এর বেশি`);
            return;
        }
        
        // Check total files
        if (selectedFiles.length + validFiles.length >= CONFIG.MAX_FILES_PER_UPLOAD) {
            errors.push(`সর্বোচ্চ ${CONFIG.MAX_FILES_PER_UPLOAD}টি ফাইল আপলোড করতে পারবেন`);
            return;
        }
        
        validFiles.push(file);
    });
    
    // Show errors
    if (errors.length > 0) {
        showToast('ফাইল ত্রুটি', errors.join(', '), 'error');
    }
    
    // Add valid files
    selectedFiles = [...selectedFiles, ...validFiles];
    displaySelectedFiles();
    
    // Update stats
    updateUploadStats();
}

function displaySelectedFiles() {
    const filesList = document.getElementById('filesList');
    const fileCount = document.getElementById('fileCount');
    
    fileCount.textContent = selectedFiles.length;
    
    if (selectedFiles.length === 0) {
        filesList.innerHTML = `
            <div class="empty-files">
                <i class="fas fa-folder-open"></i>
                <p>কোন ফাইল নির্বাচন করা হয়নি</p>
            </div>
        `;
        return;
    }
    
    filesList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.index = index;
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas fa-image"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button class="file-remove" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add remove event
        const removeBtn = fileItem.querySelector('.file-remove');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFile(index);
        });
        
        filesList.appendChild(fileItem);
    });
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    displaySelectedFiles();
    updateUploadStats();
}

function updateUploadStats() {
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    document.getElementById('totalSize').textContent = formatFileSize(totalSize);
}

function resetUploadForm() {
    document.getElementById('uploadForm').reset();
    selectedFiles = [];
    displaySelectedFiles();
    document.getElementById('uploadProgress').style.display = 'none';
    showToast('ফর্ম রিসেট', 'ফর্ম ক্লিয়ার করা হয়েছে', 'success');
}

async function handleUploadSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerName = document.getElementById('customerName').value.trim();
    const adminPassword = document.getElementById('adminPassword').value;
    
    // Validation
    const phoneError = validatePhoneNumber(customerPhone);
    if (phoneError) {
        showToast('ভ্যালিডেশন ত্রুটি', phoneError, 'error');
        return;
    }
    
    if (selectedFiles.length === 0) {
        showToast('ভ্যালিডেশন ত্রুটি', 'অন্তত একটি ছবি নির্বাচন করুন', 'error');
        return;
    }
    
    if (adminPassword !== CONFIG.ADMIN_PASSWORD) {
        showToast('অথোরাইজেশন ত্রুটি', 'ভুল অ্যাডমিন পাসওয়ার্ড', 'error');
        return;
    }
    
    // Disable submit button
    const submitBtn = document.getElementById('submitUpload');
    const spinner = document.getElementById('uploadSpinner');
    submitBtn.disabled = true;
    spinner.style.display = 'block';
    
    // Show progress
    const progress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressText = document.getElementById('progressText');
    const progressCount = document.getElementById('progressCount');
    
    progress.style.display = 'block';
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    progressText.textContent = 'প্রস্তুত হচ্ছে...';
    
    let successCount = 0;
    let failedCount = 0;
    
    try {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            // Update progress
            progressText.textContent = `আপলোড হচ্ছে: ${file.name}`;
            progressCount.textContent = `${i + 1}/${selectedFiles.length} সম্পূর্ণ`;
            
            const progress = ((i + 1) / selectedFiles.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressPercent.textContent = `${Math.round(progress)}%`;
            
            try {
                await uploadFile(file, customerPhone, customerName);
                successCount++;
                
                // Update success count
                document.getElementById('successCount').textContent = successCount;
                
            } catch (error) {
                console.error(`Upload failed for ${file.name}:`, error);
                failedCount++;
                
                // Update failed count
                document.getElementById('failedCount').textContent = failedCount;
            }
        }
        
        // Complete
        progressText.textContent = 'আপলোড সম্পন্ন';
        progressFill.style.width = '100%';
        progressPercent.textContent = '100%';
        
        // Show result
        let message = `${successCount}টি ছবি সফলভাবে আপলোড হয়েছে!`;
        if (failedCount > 0) {
            message += ` (${failedCount}টি ব্যর্থ)`;
        }
        
        showToast('আপলোড সম্পন্ন', message, successCount > 0 ? 'success' : 'error');
        
        // Reset form after delay
        setTimeout(() => {
            resetUploadForm();
            progress.style.display = 'none';
            
            // Refresh stats
            updateSystemStats();
            
            // Refresh gallery if authenticated
            if (galleryAuth) {
                loadGalleryPhotos();
            }
        }, 3000);
        
    } catch (error) {
        console.error('Upload process error:', error);
        showToast('আপলোড ব্যর্থ', 'দয়া করে আবার চেষ্টা করুন', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        spinner.style.display = 'none';
    }
}

async function uploadFile(file, phone, name) {
    try {
        // Create unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storagePath = `photos/${phone}/${fileName}`;
        
        // Upload to storage
        const storageRef = storage.ref(storagePath);
        const uploadTask = storageRef.put(file);
        
        // Wait for upload to complete
        await new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                null,
                reject,
                resolve
            );
        });
        
        // Get download URL
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        
        // Save to database
        const photoData = {
            customerNumber: phone,
            customerName: name || 'নাম জানা নেই',
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            uploadDate: new Date().toLocaleString('bn-BD'),
            imageUrl: downloadURL,
            storagePath: storagePath,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
            uploadedBy: 'admin'
        };
        
        await db.collection('photos').add(photoData);
        
        // Also save to local storage for offline use
        const localPhotos = JSON.parse(localStorage.getItem('shimu_photos') || '[]');
        localPhotos.push({ id: timestamp.toString(), ...photoData });
        localStorage.setItem('shimu_photos', JSON.stringify(localPhotos));
        
        return { success: true, data: photoData };
        
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
}

// ===== GALLERY FUNCTIONALITY =====
function initGallery() {
    const loginBtn = document.getElementById('galleryLoginBtn');
    const logoutBtn = document.getElementById('logoutGallery');
    const refreshBtn = document.getElementById('refreshGallery');
    const gallerySearch = document.getElementById('gallerySearch');
    const clearSearchBtn = document.getElementById('clearGallerySearch');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortGallery');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const togglePasswordBtn = document.getElementById('toggleGalleryPassword');
    const galleryPasswordInput = document.getElementById('galleryPassword');
    
    // Login
    loginBtn.addEventListener('click', handleGalleryLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleGalleryLogout);
    
    // Refresh
    refreshBtn.addEventListener('click', () => loadGalleryPhotos());
    
    // Search
    gallerySearch.addEventListener('input', () => {
        currentPage = 1;
        loadGalleryPhotos();
    });
    
    clearSearchBtn.addEventListener('click', () => {
        gallerySearch.value = '';
        currentPage = 1;
        loadGalleryPhotos();
    });
    
    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            loadGalleryPhotos();
        });
    });
    
    // Sort
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        currentPage = 1;
        loadGalleryPhotos();
    });
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadGalleryPhotos();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadGalleryPhotos();
        }
    });
    
    // Password toggle
    togglePasswordBtn.addEventListener('click', () => {
        const type = galleryPasswordInput.type === 'password' ? 'text' : 'password';
        galleryPasswordInput.type = type;
        togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
}

function handleGalleryLogin() {
    const password = document.getElementById('galleryPassword').value;
    
    if (password !== CONFIG.ADMIN_PASSWORD) {
        showToast('লগইন ব্যর্থ', 'ভুল অ্যাডমিন পাসওয়ার্ড', 'error');
        return;
    }
    
    galleryAuth = true;
    document.getElementById('galleryAuth').style.display = 'none';
    document.getElementById('galleryContent').style.display = 'block';
    
    showToast('লগইন সফল', 'অ্যাডমিন হিসাবে প্রবেশ করা হয়েছে', 'success');
    loadGalleryPhotos();
}

function handleGalleryLogout() {
    galleryAuth = false;
    document.getElementById('galleryAuth').style.display = 'block';
    document.getElementById('galleryContent').style.display = 'none';
    document.getElementById('galleryPassword').value = '';
    showToast('লগআউট সফল', 'সফলভাবে লগআউট করা হয়েছে', 'info');
}

async function loadGalleryPhotos() {
    if (!galleryAuth) return;
    
    const galleryGrid = document.getElementById('galleryGrid');
    const searchTerm = document.getElementById('gallerySearch').value.trim();
    
    // Show loading
    galleryGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 60px;">
            <div class="spinner"></div>
            <p style="margin-top: 20px; color: var(--light-text);">গ্যালারি লোড হচ্ছে...</p>
        </div>
    `;
    
    try {
        // Get all photos
        let photos = await getAllPhotos();
        
        // Apply search filter
        if (searchTerm) {
            photos = photos.filter(photo => 
                photo.customerNumber.includes(searchTerm) ||
                (photo.customerName && photo.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        // Apply time filter
        const now = new Date();
        switch(currentFilter) {
            case 'today':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                photos = photos.filter(photo => {
                    const uploadDate = photo.uploadedAt ? new Date(photo.uploadedAt.seconds * 1000) : new Date();
                    return uploadDate >= today;
                });
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                photos = photos.filter(photo => {
                    const uploadDate = photo.uploadedAt ? new Date(photo.uploadedAt.seconds * 1000) : new Date();
                    return uploadDate >= weekAgo;
                });
                break;
        }
        
        // Apply sorting
        switch(currentSort) {
            case 'newest':
                photos.sort((a, b) => {
                    const dateA = a.uploadedAt ? a.uploadedAt.seconds : 0;
                    const dateB = b.uploadedAt ? b.uploadedAt.seconds : 0;
                    return dateB - dateA;
                });
                break;
            case 'oldest':
                photos.sort((a, b) => {
                    const dateA = a.uploadedAt ? a.uploadedAt.seconds : 0;
                    const dateB = b.uploadedAt ? b.uploadedAt.seconds : 0;
                    return dateA - dateB;
                });
                break;
            case 'number':
                photos.sort((a, b) => a.customerNumber.localeCompare(b.customerNumber));
                break;
        }
        
        // Store globally
        currentGalleryPhotos = photos;
        totalGalleryItems = photos.length;
        totalPages = Math.ceil(totalGalleryItems / itemsPerPage);
        
        // Get current page items
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = photos.slice(startIndex, endIndex);
        
        // Display
        displayGalleryPhotos(pageItems);
        updateGalleryStats(photos);
        updatePagination();
        
    } catch (error) {
        console.error('Gallery load error:', error);
        galleryGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>গ্যালারি লোড ব্যর্থ</h3>
                <p>দয়া করে আবার চেষ্টা করুন</p>
                <button class="btn-secondary" onclick="loadGalleryPhotos()">
                    <i class="fas fa-redo"></i>
                    পুনরায় চেষ্টা করুন
                </button>
            </div>
        `;
    }
}

async function getAllPhotos() {
    try {
        const snapshot = await db.collection('photos').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Get photos error:', error);
        
        // Fallback to local storage
        return JSON.parse(localStorage.getItem('shimu_photos') || '[]');
    }
}

function displayGalleryPhotos(photos) {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (photos.length === 0) {
        galleryGrid.innerHTML = `
            <div class="empty-gallery" id="emptyGallery">
                <div class="empty-content">
                    <i class="fas fa-images"></i>
                    <h3>কোন ছবি পাওয়া যায়নি</h3>
                    <p>ছবি আপলোড করে শুরু করুন</p>
                </div>
            </div>
        `;
        return;
    }
    
    galleryGrid.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const globalIndex = currentGalleryPhotos.findIndex(p => p.id === photo.id);
        const galleryItem = createPhotoCard(photo, globalIndex, 'gallery');
        galleryGrid.appendChild(galleryItem);
    });
}

function updateGalleryStats(photos) {
    // Update counts
    document.getElementById('galleryTotal').textContent = photos.length;
    
    // Calculate storage size
    const totalSize = photos.reduce((sum, photo) => {
        if (photo.fileSize) {
            const size = parseFileSize(photo.fileSize);
            return sum + size;
        }
        return sum;
    }, 0);
    document.getElementById('galleryStorage').textContent = formatFileSize(totalSize);
    
    // Count unique customers
    const customers = new Set(photos.map(p => p.customerNumber));
    document.getElementById('galleryCustomers').textContent = customers.size;
    
    // Count today's uploads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = photos.filter(photo => {
        const uploadDate = photo.uploadedAt ? new Date(photo.uploadedAt.seconds * 1000) : new Date();
        return uploadDate >= today;
    }).length;
    document.getElementById('galleryToday').textContent = todayCount;
}

function updatePagination() {
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// ===== NOTICE BOARD FUNCTIONALITY =====
function initNoticeBoard() {
    const addNoticeBtn = document.getElementById('addNoticeBtn');
    const closeEditorBtn = document.getElementById('closeEditor');
    const publishNoticeBtn = document.getElementById('publishNotice');
    const saveDraftBtn = document.getElementById('saveDraft');
    const clearEditorBtn = document.getElementById('clearEditor');
    const noticeContent = document.getElementById('noticeContent');
    const charCount = document.getElementById('charCount');
    
    // Add notice button
    addNoticeBtn.addEventListener('click', () => {
        if (!noticeAuth) {
            requestNoticeAuth();
        } else {
            showNoticeEditor();
        }
    });
    
    // Close editor
    closeEditorBtn.addEventListener('click', hideNoticeEditor);
    
    // Publish notice
    publishNoticeBtn.addEventListener('click', publishNotice);
    
    // Save draft
    saveDraftBtn.addEventListener('click', saveNoticeDraft);
    
    // Clear editor
    clearEditorBtn.addEventListener('click', clearNoticeEditor);
    
    // Character count
    noticeContent.addEventListener('input', () => {
        charCount.textContent = noticeContent.value.length;
    });
}

function requestNoticeAuth() {
    const password = prompt('নোটিশ লিখতে অ্যাডমিন পাসওয়ার্ড দিন:');
    
    if (password === CONFIG.ADMIN_PASSWORD) {
        noticeAuth = true;
        showNoticeEditor();
        showToast('অথোরাইজেশন সফল', 'নোটিশ লিখতে পারবেন', 'success');
    } else if (password !== null) {
        showToast('অথোরাইজেশন ব্যর্থ', 'ভুল পাসওয়ার্ড', 'error');
    }
}

function showNoticeEditor() {
    document.getElementById('noticeEditor').style.display = 'block';
    
    // Load draft if exists
    const draft = localStorage.getItem('notice_draft');
    if (draft) {
        const { title, content, type } = JSON.parse(draft);
        document.getElementById('noticeTitle').value = title || '';
        document.getElementById('noticeContent').value = content || '';
        document.getElementById('noticeType').value = type || 'general';
        document.getElementById('charCount').textContent = content?.length || 0;
    }
    
    // Scroll to editor
    document.getElementById('noticeEditor').scrollIntoView({ behavior: 'smooth' });
}

function hideNoticeEditor() {
    document.getElementById('noticeEditor').style.display = 'none';
}

async function loadNotices() {
    const noticesGrid = document.getElementById('noticesGrid');
    
    noticesGrid.innerHTML = `
        <div class="loading-notices">
            <div class="spinner"></div>
            <p>নোটিশ লোড হচ্ছে...</p>
        </div>
    `;
    
    try {
        const notices = await getNotices();
        displayNotices(notices);
    } catch (error) {
        console.error('Load notices error:', error);
        noticesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>নোটিশ লোড ব্যর্থ</h3>
                <p>দয়া করে আবার চেষ্টা করুন</p>
            </div>
        `;
    }
}

async function getNotices() {
    try {
        const snapshot = await db.collection('notices')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Get notices error:', error);
        
        // Fallback to local storage
        return JSON.parse(localStorage.getItem('shimu_notices') || '[]');
    }
}

function displayNotices(notices) {
    const noticesGrid = document.getElementById('noticesGrid');
    
    if (notices.length === 0) {
        noticesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-bullhorn"></i>
                <h3>কোন নোটিশ নেই</h3>
                <p>প্রথম নোটিশ লিখুন</p>
            </div>
        `;
        return;
    }
    
    noticesGrid.innerHTML = '';
    
    notices.forEach(notice => {
        const noticeCard = createNoticeCard(notice);
        noticesGrid.appendChild(noticeCard);
    });
}

function createNoticeCard(notice) {
    const card = document.createElement('div');
    card.className = `notice-card ${notice.noticeType || 'general'}`;
    card.dataset.id = notice.id;
    
    // Format date
    const createdAt = notice.createdAt ? 
        new Date(notice.createdAt.seconds * 1000).toLocaleString('bn-BD') : 
        'তারিখ নেই';
    
    // Get icon based on type
    let icon = 'fas fa-info-circle';
    switch(notice.noticeType) {
        case 'important': icon = 'fas fa-exclamation-triangle'; break;
        case 'offer': icon = 'fas fa-gift'; break;
        case 'update': icon = 'fas fa-sync-alt'; break;
        case 'service': icon = 'fas fa-concierge-bell'; break;
    }
    
    card.innerHTML = `
        <div class="notice-header">
            <div class="notice-title">
                <i class="${icon}"></i>
                <h4>${notice.title}</h4>
            </div>
            <div class="notice-date">${createdAt}</div>
        </div>
        <div class="notice-content">
            ${notice.content}
        </div>
        <div class="notice-footer">
            <div class="notice-author">
                ${notice.createdBy || 'অ্যাডমিন'}
            </div>
            ${noticeAuth ? `
                <div class="notice-actions">
                    <button class="notice-btn edit-notice" title="এডিট">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="notice-btn delete-notice" title="ডিলিট">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    // Add event listeners for admin actions
    if (noticeAuth) {
        const editBtn = card.querySelector('.edit-notice');
        const deleteBtn = card.querySelector('.delete-notice');
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editNotice(notice);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNotice(notice.id);
        });
    }
    
    return card;
}

async function publishNotice() {
    if (!noticeAuth) {
        showToast('অনুমতি প্রয়োজন', 'অ্যাডমিন হিসাবে লগইন করুন', 'error');
        return;
    }
    
    const title = document.getElementById('noticeTitle').value.trim();
    const content = document.getElementById('noticeContent').value.trim();
    const type = document.getElementById('noticeType').value;
    const expiry = document.getElementById('noticeExpiry').value;
    
    if (!title || !content) {
        showToast('ভ্যালিডেশন ত্রুটি', 'শিরোনাম ও বিবরণ লিখুন', 'error');
        return;
    }
    
    if (content.length > 500) {
        showToast('ভ্যালিডেশন ত্রুটি', 'বিবরণ ৫০০ অক্ষরের বেশি হবে না', 'error');
        return;
    }
    
    try {
        const noticeData = {
            title: title,
            content: content,
            noticeType: type,
            expiry: expiry || null,
            createdBy: 'admin',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('notices').add(noticeData);
        
        // Also save to local storage
        const localNotices = JSON.parse(localStorage.getItem('shimu_notices') || '[]');
        localNotices.push({ id: Date.now().toString(), ...noticeData });
        localStorage.setItem('shimu_notices', JSON.stringify(localNotices));
        
        // Clear editor
        clearNoticeEditor();
        hideNoticeEditor();
        
        // Reload notices
        loadNotices();
        
        showToast('নোটিশ প্রকাশিত', 'নোটিশ সফলভাবে প্রকাশিত হয়েছে', 'success');
        
    } catch (error) {
        console.error('Publish notice error:', error);
        showToast('প্রকাশ ব্যর্থ', 'নোটিশ প্রকাশ করতে সমস্যা', 'error');
    }
}

function saveNoticeDraft() {
    const title = document.getElementById('noticeTitle').value.trim();
    const content = document.getElementById('noticeContent').value.trim();
    const type = document.getElementById('noticeType').value;
    
    if (!title && !content) return;
    
    const draft = { title, content, type };
    localStorage.setItem('notice_draft', JSON.stringify(draft));
    
    showToast('ড্রাফট সেভ', 'ড্রাফট সফলভাবে সেভ হয়েছে', 'success');
}

function clearNoticeEditor() {
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeContent').value = '';
    document.getElementById('noticeType').value = 'general';
    document.getElementById('noticeExpiry').value = '';
    document.getElementById('charCount').textContent = '0';
    localStorage.removeItem('notice_draft');
}

async function editNotice(notice) {
    // Load notice into editor
    document.getElementById('noticeTitle').value = notice.title;
    document.getElementById('noticeContent').value = notice.content;
    document.getElementById('noticeType').value = notice.noticeType || 'general';
    document.getElementById('noticeExpiry').value = notice.expiry || '';
    document.getElementById('charCount').textContent = notice.content.length;
    
    showNoticeEditor();
    
    // Change publish button to update
    const publishBtn = document.getElementById('publishNotice');
    publishBtn.innerHTML = '<i class="fas fa-save"></i> আপডেট করুন';
    publishBtn.onclick = () => updateNotice(notice.id);
}

async function updateNotice(noticeId) {
    const title = document.getElementById('noticeTitle').value.trim();
    const content = document.getElementById('noticeContent').value.trim();
    const type = document.getElementById('noticeType').value;
    const expiry = document.getElementById('noticeExpiry').value;
    
    if (!title || !content) return;
    
    try {
        await db.collection('notices').doc(noticeId).update({
            title: title,
            content: content,
            noticeType: type,
            expiry: expiry || null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update local storage
        const localNotices = JSON.parse(localStorage.getItem('shimu_notices') || '[]');
        const index = localNotices.findIndex(n => n.id === noticeId);
        if (index > -1) {
            localNotices[index] = { ...localNotices[index], title, content, noticeType: type, expiry };
            localStorage.setItem('shimu_notices', JSON.stringify(localNotices));
        }
        
        hideNoticeEditor();
        loadNotices();
        showToast('নোটিশ আপডেট', 'নোটিশ সফলভাবে আপডেট হয়েছে', 'success');
        
    } catch (error) {
        console.error('Update notice error:', error);
        showToast('আপডেট ব্যর্থ', 'নোটিশ আপডেট করতে সমস্যা', 'error');
    }
}

async function deleteNotice(noticeId) {
    if (!confirm('আপনি কি নিশ্চিত এই নোটিশ ডিলিট করতে চান?')) return;
    
    try {
        await db.collection('notices').doc(noticeId).delete();
        
        // Delete from local storage
        const localNotices = JSON.parse(localStorage.getItem('shimu_notices') || '[]');
        const filtered = localNotices.filter(n => n.id !== noticeId);
        localStorage.setItem('shimu_notices', JSON.stringify(filtered));
        
        loadNotices();
        showToast('নোটিশ ডিলিট', 'নোটিশ সফলভাবে ডিলিট হয়েছে', 'success');
        
    } catch (error) {
        console.error('Delete notice error:', error);
        showToast('ডিলিট ব্যর্থ', 'নোটিশ ডিলিট করতে সমস্যা', 'error');
    }
}

// ===== SERVICES FUNCTIONALITY =====
function initServices() {
    const manageBtn = document.getElementById('manageServicesBtn');
    const closeManagementBtn = document.getElementById('closeManagement');
    const addServiceBtn = document.getElementById('addService');
    const updateServicesBtn = document.getElementById('updateServices');
    
    // Manage services
    manageBtn.addEventListener('click', () => {
        if (!servicesAuth) {
            requestServicesAuth();
        } else {
            showServicesManagement();
        }
    });
    
    // Close management
    closeManagementBtn.addEventListener('click', hideServicesManagement);
    
    // Add service
    addServiceBtn.addEventListener('click', addService);
    
    // Update services
    updateServicesBtn.addEventListener('click', updateServices);
}

function requestServicesAuth() {
    const password = prompt('সার্ভিস ম্যানেজ করতে অ্যাডমিন পাসওয়ার্ড দিন:');
    
    if (password === CONFIG.ADMIN_PASSWORD) {
        servicesAuth = true;
        showServicesManagement();
        showToast('অথোরাইজেশন সফল', 'সার্ভিস ম্যানেজ করতে পারবেন', 'success');
    } else if (password !== null) {
        showToast('অথোরাইজেশন ব্যর্থ', 'ভুল পাসওয়ার্ড', 'error');
    }
}

function showServicesManagement() {
    document.getElementById('servicesManagement').style.display = 'block';
    document.getElementById('servicesManagement').scrollIntoView({ behavior: 'smooth' });
}

function hideServicesManagement() {
    document.getElementById('servicesManagement').style.display = 'none';
}

async function loadServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    
    try {
        const services = await getServices();
        displayServices(services);
    } catch (error) {
        console.error('Load services error:', error);
        servicesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>সার্ভিস লোড ব্যর্থ</h3>
                <p>ডিফল্ট সার্ভিস লোড হচ্ছে...</p>
            </div>
        `;
        displayServices(CONFIG.DEFAULT_SERVICES);
    }
}

async function getServices() {
    try {
        const snapshot = await db.collection('services').get();
        
        if (snapshot.empty) {
            // Create default services if none exist
            await createDefaultServices();
            return CONFIG.DEFAULT_SERVICES;
        }
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Get services error:', error);
        return JSON.parse(localStorage.getItem('shimu_services') || JSON.stringify(CONFIG.DEFAULT_SERVICES));
    }
}

async function createDefaultServices() {
    try {
        for (const service of CONFIG.DEFAULT_SERVICES) {
            await db.collection('services').add(service);
        }
    } catch (error) {
        console.error('Create default services error:', error);
    }
}

function displayServices(services) {
    const servicesGrid = document.getElementById('servicesGrid');
    
    if (!services || services.length === 0) {
        servicesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-concierge-bell"></i>
                <h3>কোন সার্ভিস নেই</h3>
                <p>সার্ভিস যোগ করুন</p>
            </div>
        `;
        return;
    }
    
    servicesGrid.innerHTML = '';
    
    services.forEach(service => {
        const serviceCard = createServiceCard(service);
        servicesGrid.appendChild(serviceCard);
    });
}

function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.dataset.id = service.id;
    
    // Get icon class
    let iconClass = 'fas fa-camera';
    switch(service.icon) {
        case 'video': iconClass = 'fas fa-video'; break;
        case 'edit': iconClass = 'fas fa-edit'; break;
        case 'print': iconClass = 'fas fa-print'; break;
        case 'album': iconClass = 'fas fa-images'; break;
        case 'frame': iconClass = 'fas fa-square'; break;
        case 'id-card': iconClass = 'fas fa-id-card'; break;
        case 'camera-retro': iconClass = 'fas fa-camera-retro'; break;
    }
    
    card.innerHTML = `
        <div class="service-icon">
            <i class="${iconClass}"></i>
        </div>
        <h3 class="service-title">${service.title}</h3>
        <p class="service-description">${service.description}</p>
        <div class="service-price">${service.price}</div>
        ${servicesAuth ? `
            <div class="service-actions">
                <button class="service-btn edit-service" title="এডিট">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="service-btn delete-service" title="ডিলিট">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        ` : ''}
    `;
    
    // Add event listeners for admin actions
    if (servicesAuth) {
        const editBtn = card.querySelector('.edit-service');
        const deleteBtn = card.querySelector('.delete-service');
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editService(service);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteService(service.id);
        });
    }
    
    return card;
}

async function addService() {
    const title = document.getElementById('serviceTitle').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const icon = document.getElementById('serviceIcon').value;
    const price = document.getElementById('servicePrice').value.trim();
    
    if (!title || !description) {
        showToast('ভ্যালিডেশন ত্রুটি', 'সার্ভিসের নাম ও বিবরণ লিখুন', 'error');
        return;
    }
    
    try {
        const serviceData = {
            title: title,
            description: description,
            icon: icon,
            price: price || 'মূল্য জানতে কল করুন',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('services').add(serviceData);
        
        // Clear form
        document.getElementById('serviceTitle').value = '';
        document.getElementById('serviceDescription').value = '';
        document.getElementById('serviceIcon').value = 'camera';
        document.getElementById('servicePrice').value = '';
        
        // Reload services
        loadServices();
        
        showToast('সার্ভিস যোগ', 'নতুন সার্ভিস যোগ করা হয়েছে', 'success');
        
    } catch (error) {
        console.error('Add service error:', error);
        showToast('যোগ ব্যর্থ', 'সার্ভিস যোগ করতে সমস্যা', 'error');
    }
}

async function updateServices() {
    // This would typically update all services from the UI
    // For simplicity, we just reload
    loadServices();
    showToast('সার্ভিস আপডেট', 'সার্ভিস লিস্ট আপডেট করা হয়েছে', 'success');
}

async function editService(service) {
    // Load service into form
    document.getElementById('serviceTitle').value = service.title;
    document.getElementById('serviceDescription').value = service.description;
    document.getElementById('serviceIcon').value = service.icon || 'camera';
    document.getElementById('servicePrice').value = service.price || '';
    
    showServicesManagement();
    
    // Change add button to update
    const addBtn = document.getElementById('addService');
    addBtn.innerHTML = '<i class="fas fa-save"></i> আপডেট করুন';
    addBtn.onclick = () => updateService(service.id);
}

async function updateService(serviceId) {
    const title = document.getElementById('serviceTitle').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const icon = document.getElementById('serviceIcon').value;
    const price = document.getElementById('servicePrice').value.trim();
    
    if (!title || !description) return;
    
    try {
        await db.collection('services').doc(serviceId).update({
            title: title,
            description: description,
            icon: icon,
            price: price || 'মূল্য জানতে কল করুন',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Reset button
        const addBtn = document.getElementById('addService');
        addBtn.innerHTML = '<i class="fas fa-plus"></i> সার্ভিস যোগ করুন';
        addBtn.onclick = addService;
        
        // Clear form
        document.getElementById('serviceTitle').value = '';
        document.getElementById('serviceDescription').value = '';
        document.getElementById('serviceIcon').value = 'camera';
        document.getElementById('servicePrice').value = '';
        
        // Reload services
        loadServices();
        
        showToast('সার্ভিস আপডেট', 'সার্ভিস সফলভাবে আপডেট হয়েছে', 'success');
        
    } catch (error) {
        console.error('Update service error:', error);
        showToast('আপডেট ব্যর্থ', 'সার্ভিস আপডেট করতে সমস্যা', 'error');
    }
}

async function deleteService(serviceId) {
    if (!confirm('আপনি কি নিশ্চিত এই সার্ভিস ডিলিট করতে চান?')) return;
    
    try {
        await db.collection('services').doc(serviceId).delete();
        
        loadServices();
        showToast('সার্ভিস ডিলিট', 'সার্ভিস সফলভাবে ডিলিট হয়েছে', 'success');
        
    } catch (error) {
        console.error('Delete service error:', error);
        showToast('ডিলিট ব্যর্থ', 'সার্ভিস ডিলিট করতে সমস্যা', 'error');
    }
}

// ===== MODAL FUNCTIONALITY =====
function initModal() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.getElementById('closeModal');
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    const downloadBtn = document.getElementById('downloadImage');
    const deleteBtn = document.getElementById('deleteImage');
    const shareBtn = document.getElementById('shareImage');
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Navigation
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    
    // Actions
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

function showImageModal(photo, index, context) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const imageInfo = document.getElementById('imageInfo');
    const deleteBtn = document.getElementById('deleteImage');
    const downloadBtn = document.getElementById('downloadImage');
    
    // Store current context
    currentModalContext = context;
    currentModalIndex = index;
    
    // Show loading
    modalImage.style.display = 'none';
    modal.querySelector('.image-loader').style.display = 'flex';
    
    // Set image
    modalImage.onload = () => {
        modalImage.style.display = 'block';
        modal.querySelector('.image-loader').style.display = 'none';
    };
    
    modalImage.onerror = () => {
        modalImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZTwvdGV4dD48L3N2Zz4=';
        modalImage.style.display = 'block';
        modal.querySelector('.image-loader').style.display = 'none';
    };
    
    modalImage.src = photo.imageUrl;
    
    // Set info
    const uploadDate = photo.uploadDate || 
        (photo.uploadedAt ? new Date(photo.uploadedAt.seconds * 1000).toLocaleString('bn-BD') : 'তারিখ নেই');
    
    imageInfo.innerHTML = `
        <h4><i class="fas fa-info-circle"></i> ছবি তথ্য</h4>
        <div class="info-row">
            <span class="info-label">মোবাইল নম্বর:</span>
            <span class="info-value">${photo.customerNumber}</span>
        </div>
        <div class="info-row">
            <span class="info-label">গ্রাহকের নাম:</span>
            <span class="info-value">${photo.customerName || 'নাম জানা নেই'}</span>
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
            <span class="info-value">${photo.fileSize || 'সাইজ জানা নেই'}</span>
        </div>
    `;
    
    // Show delete button only in gallery context with admin auth
    if (context === 'gallery' && galleryAuth) {
        deleteBtn.style.display = 'block';
        deleteBtn.dataset.id = photo.id;
        deleteBtn.dataset.storagePath = photo.storagePath;
    } else {
        deleteBtn.style.display = 'none';
    }
    
    // Set download data
    downloadBtn.dataset.url = photo.imageUrl;
    downloadBtn.dataset.filename = `shimu_${photo.customerNumber}_${Date.now()}.jpg`;
    
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
    const downloadBtn = document.getElementById('downloadImage');
    const imageUrl = downloadBtn.dataset.url;
    const filename = downloadBtn.dataset.filename;
    
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('ডাউনলোড শুরু', 'ছবি ডাউনলোড শুরু হয়েছে', 'success');
}

async function deleteCurrentImage() {
    const deleteBtn = document.getElementById('deleteImage');
    const photoId = deleteBtn.dataset.id;
    const storagePath = deleteBtn.dataset.storagePath;
    
    if (!photoId || !confirm('আপনি কি নিশ্চিত এই ছবি ডিলিট করতে চান?')) return;
    
    try {
        // Delete from storage
        if (storagePath) {
            await storage.ref(storagePath).delete();
        }
        
        // Delete from database
        await db.collection('photos').doc(photoId).delete();
        
        // Delete from local storage
        const localPhotos = JSON.parse(localStorage.getItem('shimu_photos') || '[]');
        const filtered = localPhotos.filter(p => p.id !== photoId);
        localStorage.setItem('shimu_photos', JSON.stringify(filtered));
        
        // Close modal
        document.getElementById('imageModal').style.display = 'none';
        
        // Refresh gallery
        loadGalleryPhotos();
        
        // Update stats
        updateSystemStats();
        
        showToast('ছবি ডিলিট', 'ছবি সফলভাবে ডিলিট হয়েছে', 'success');
        
    } catch (error) {
        console.error('Delete image error:', error);
        showToast('ডিলিট ব্যর্থ', 'ছবি ডিলিট করতে সমস্যা', 'error');
    }
}

function shareCurrentImage() {
    const downloadBtn = document.getElementById('downloadImage');
    const imageUrl = downloadBtn.dataset.url;
    
    if (!imageUrl) return;
    
    if (navigator.share) {
        navigator.share({
            title: 'শিমু ডিজিটাল স্টুডিও',
            text: 'আপনার ছবি দেখুন',
            url: imageUrl
        })
        .catch(console.error);
    } else {
        // Copy to clipboard
        navigator.clipboard.writeText(imageUrl)
            .then(() => {
                showToast('লিংক কপি', 'ছবির লিংক কপি করা হয়েছে', 'success');
            })
            .catch(() => {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = imageUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('লিংক কপি', 'ছবির লিংক কপি করা হয়েছে', 'success');
            });
    }
}

// ===== UTILITY FUNCTIONS =====
function formatFileSize(bytes) {
    if (typeof bytes !== 'number') return '0 Bytes';
    
    if (bytes === 0) return '0 Bytes';
    
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

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fas fa-info-circle';
    switch(type) {
        case 'success': icon = 'fas fa-check-circle'; break;
        case 'error': icon = 'fas fa-exclamation-circle'; break;
        case 'warning': icon = 'fas fa-exclamation-triangle'; break;
    }
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${icon}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add close event
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
    
    container.appendChild(toast);
}

async function loadInitialData() {
    try {
        // Load stats
        await updateSystemStats();
        
        // Load notices
        await loadNotices();
        
        // Load services
        await loadServices();
        
    } catch (error) {
        console.error('Initial data load error:', error);
    }
}

async function updateSystemStats() {
    try {
        const photos = await getAllPhotos();
        
        // Update counts
        document.getElementById('totalPhotos').textContent = photos.length;
        
        // Count unique customers
        const customers = new Set(photos.map(p => p.customerNumber));
        document.getElementById('totalCustomers').textContent = customers.size;
        
        // Count today's uploads
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayUploads = photos.filter(photo => {
            const uploadDate = photo.uploadedAt ? new Date(photo.uploadedAt.seconds * 1000) : new Date();
            return uploadDate >= today;
        }).length;
        document.getElementById('todayUploads').textContent = todayUploads;
        
    } catch (error) {
        console.error('Update stats error:', error);
    }
}

// ===== OFFLINE SUPPORT =====
// Check online status
window.addEventListener('online', () => {
    showToast('অনলাইন', 'ইন্টারনেট সংযোগ পুনরুদ্ধার হয়েছে', 'success');
    updateSystemStats();
});

window.addEventListener('offline', () => {
    showToast('অফলাইন', 'ইন্টারনেট সংযোগ নেই, অফলাইন মোডে কাজ চালিয়ে যাচ্ছি', 'warning');
});

// Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    showToast('অ্যাপ ইন্সটল', 'শিমু ডিজিটাল স্টুডিও অ্যাপ ইন্সটল করুন', 'info');
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});