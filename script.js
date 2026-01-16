// Configuration
const CONFIG = {
    ADMIN_PASSWORD: "studio@2024",
    STORAGE_KEY: "studio_photos",
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png']
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
            
            // Clear all status messages
            clearStatusMessages();
        });
    });
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize upload functionality
    initializeUpload();
    
    // Initialize gallery functionality
    initializeGallery();
    
    // Initialize modal functionality
    initializeModal();
    
    // Check if there's existing data
    checkExistingData();
}

// Search functionality
function initializeSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-number');
    const searchResults = document.getElementById('search-results');
    const searchStatus = document.getElementById('search-status');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    function performSearch() {
        const searchNumber = searchInput.value.trim();
        
        // Validate input
        if (!searchNumber) {
            showStatus(searchStatus, "দয়া করে মোবাইল নম্বর লিখুন", "error");
            return;
        }
        
        if (!/^[0-9]{11}$/.test(searchNumber)) {
            showStatus(searchStatus, "১১ ডিজিটের বৈধ মোবাইল নম্বর লিখুন", "error");
            return;
        }
        
        // Get photos from storage
        const photos = getAllPhotos();
        const customerPhotos = photos.filter(photo => 
            photo.customerNumber === searchNumber
        );
        
        // Display results
        displaySearchResults(customerPhotos, searchNumber);
    }
    
    function displaySearchResults(photos, searchNumber) {
        searchResults.innerHTML = '';
        
        if (photos.length === 0) {
            searchResults.innerHTML = `
                <div class="status-message info">
                    <i class="fas fa-info-circle"></i>
                    এই নম্বর দিয়ে কোন ছবি পাওয়া যায়নি: ${searchNumber}
                </div>
            `;
            return;
        }
        
        // Show success status
        showStatus(searchStatus, 
            `<i class="fas fa-check-circle"></i> ${photos.length}টি ছবি পাওয়া গেছে`,
            "success"
        );
        
        // Display each photo
        photos.forEach((photo, index) => {
            const photoCard = document.createElement('div');
            photoCard.className = 'photo-card';
            photoCard.innerHTML = `
                <div class="photo-preview">
                    <img src="${photo.imageData}" alt="ছবি ${index + 1}">
                </div>
                <div class="photo-info">
                    <h4><i class="fas fa-image"></i> ছবি ${index + 1}</h4>
                    <div class="photo-details">
                        <span><i class="fas fa-mobile-alt"></i> নম্বর: ${photo.customerNumber}</span>
                        <span><i class="far fa-calendar"></i> তারিখ: ${photo.uploadDate}</span>
                        <span><i class="fas fa-file"></i> সাইজ: ${photo.fileSize}</span>
                    </div>
                    <button class="btn btn-success download-photo-btn" data-id="${photo.id}">
                        <i class="fas fa-download"></i> পিডিএফ ডাউনলোড করুন
                    </button>
                </div>
            `;
            searchResults.appendChild(photoCard);
        });
        
        // Add download event listeners
        document.querySelectorAll('.download-photo-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const photoId = this.dataset.id;
                const photo = photos.find(p => p.id === photoId);
                if (photo) {
                    downloadPhotoAsPDF(photo);
                }
            });
        });
    }
}

// Upload functionality
function initializeUpload() {
    const uploadForm = document.getElementById('upload-form');
    const fileDropArea = document.getElementById('file-drop-area');
    const photoFileInput = document.getElementById('photo-file');
    const filePreview = document.getElementById('file-preview');
    const uploadStatus = document.getElementById('upload-status');
    let selectedFile = null;
    
    // File drop area functionality
    fileDropArea.addEventListener('click', () => {
        photoFileInput.click();
    });
    
    fileDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropArea.style.borderColor = '#3182CE';
        fileDropArea.style.background = '#EBF8FF';
    });
    
    fileDropArea.addEventListener('dragleave', () => {
        fileDropArea.style.borderColor = '#E2E8F0';
        fileDropArea.style.background = '#F7FAFC';
    });
    
    fileDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropArea.style.borderColor = '#E2E8F0';
        fileDropArea.style.background = '#F7FAFC';
        
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
    
    photoFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    function handleFileSelect(file) {
        // Validate file
        if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
            showStatus(uploadStatus, "শুধুমাত্র JPG, JPEG, PNG ফাইল গ্রহণযোগ্য", "error");
            return;
        }
        
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            showStatus(uploadStatus, "ফাইলের সাইজ ১০MB-এর বেশি হতে পারবে না", "error");
            return;
        }
        
        selectedFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            filePreview.innerHTML = `
                <img src="${e.target.result}" alt="ছবি প্রিভিউ">
                <p style="margin-top: 10px; color: #38A169;">
                    <i class="fas fa-check-circle"></i> 
                    ফাইল নির্বাচিত হয়েছে: ${file.name} (${formatFileSize(file.size)})
                </p>
            `;
            filePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    // Form submission
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const customerNumber = document.getElementById('customer-number').value.trim();
        const adminPassword = document.getElementById('admin-pass-upload').value;
        
        // Validate inputs
        if (!customerNumber || !/^[0-9]{11}$/.test(customerNumber)) {
            showStatus(uploadStatus, "১১ ডিজিটের বৈধ মোবাইল নম্বর লিখুন", "error");
            return;
        }
        
        if (!selectedFile) {
            showStatus(uploadStatus, "একটি ছবি ফাইল নির্বাচন করুন", "error");
            return;
        }
        
        if (adminPassword !== CONFIG.ADMIN_PASSWORD) {
            showStatus(uploadStatus, "ভুল অ্যাডমিন পাসওয়ার্ড", "error");
            return;
        }
        
        // Upload photo
        uploadPhoto(customerNumber, selectedFile);
    });
    
    function uploadPhoto(customerNumber, file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Create photo object
            const photo = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                customerNumber: customerNumber,
                fileName: file.name,
                fileSize: formatFileSize(file.size),
                uploadDate: new Date().toLocaleString('bn-BD'),
                imageData: e.target.result,
                uploadedBy: "admin",
                timestamp: Date.now()
            };
            
            // Save to storage
            savePhoto(photo);
            
            // Show success message
            showStatus(uploadStatus, 
                `<i class="fas fa-check-circle"></i> ছবি সফলভাবে আপলোড হয়েছে!<br>
                গ্রাহক নম্বর: ${customerNumber}<br>
                ফাইল: ${file.name}`,
                "success"
            );
            
            // Reset form
            uploadForm.reset();
            filePreview.innerHTML = '';
            filePreview.style.display = 'none';
            selectedFile = null;
            
            // Clear form after 3 seconds
            setTimeout(() => {
                uploadStatus.className = 'status-message';
                uploadStatus.style.display = 'none';
            }, 5000);
        };
        
        reader.readAsDataURL(file);
    }
}

// Gallery functionality
function initializeGallery() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminPassInput = document.getElementById('admin-pass-gallery');
    const authSection = document.getElementById('auth-section');
    const galleryContent = document.getElementById('gallery-content');
    const galleryGrid = document.getElementById('gallery-grid');
    const emptyGallery = document.getElementById('empty-gallery');
    const gallerySearch = document.getElementById('gallery-search');
    const totalPhotos = document.getElementById('total-photos');
    const galleryStatus = document.getElementById('gallery-status');
    
    let isAuthenticated = false;
    
    // Login functionality
    loginBtn.addEventListener('click', () => {
        const password = adminPassInput.value;
        
        if (password !== CONFIG.ADMIN_PASSWORD) {
            showStatus(galleryStatus, "ভুল অ্যাডমিন পাসওয়ার্ড", "error");
            return;
        }
        
        isAuthenticated = true;
        authSection.style.display = 'none';
        galleryContent.style.display = 'block';
        
        // Load gallery photos
        loadGalleryPhotos();
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        isAuthenticated = false;
        authSection.style.display = 'block';
        galleryContent.style.display = 'none';
        adminPassInput.value = '';
        galleryStatus.className = 'status-message';
        galleryStatus.style.display = 'none';
    });
    
    // Search functionality
    gallerySearch.addEventListener('input', () => {
        const searchTerm = gallerySearch.value.trim();
        loadGalleryPhotos(searchTerm);
    });
    
    function loadGalleryPhotos(searchTerm = '') {
        const photos = getAllPhotos();
        
        // Update stats
        totalPhotos.textContent = `মোট ছবি: ${photos.length}`;
        
        // Filter photos if search term exists
        const filteredPhotos = searchTerm ? 
            photos.filter(photo => photo.customerNumber.includes(searchTerm)) : 
            photos;
        
        // Display photos
        displayGalleryPhotos(filteredPhotos);
    }
    
    function displayGalleryPhotos(photos) {
        galleryGrid.innerHTML = '';
        
        if (photos.length === 0) {
            emptyGallery.style.display = 'block';
            galleryGrid.style.display = 'none';
            return;
        }
        
        emptyGallery.style.display = 'none';
        galleryGrid.style.display = 'grid';
        
        photos.forEach(photo => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.id = photo.id;
            
            galleryItem.innerHTML = `
                <img src="${photo.imageData}" alt="ছবি">
                <div class="gallery-item-info">
                    <h4><i class="fas fa-mobile-alt"></i> ${photo.customerNumber}</h4>
                    <p><i class="far fa-calendar"></i> ${photo.uploadDate}</p>
                    <p><i class="fas fa-file"></i> ${photo.fileSize}</p>
                </div>
            `;
            
            galleryItem.addEventListener('click', () => {
                showPhotoModal(photo);
            });
            
            galleryGrid.appendChild(galleryItem);
        });
    }
    
    // Load initial gallery state
    loadGalleryPhotos();
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('image-modal');
    const modalClose = document.querySelector('.modal-close');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const deletePhotoBtn = document.getElementById('delete-photo');
    
    let currentPhoto = null;
    
    // Close modal
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Download PDF
    downloadPdfBtn.addEventListener('click', () => {
        if (currentPhoto) {
            downloadPhotoAsPDF(currentPhoto);
            modal.style.display = 'none';
        }
    });
    
    // Delete photo
    deletePhotoBtn.addEventListener('click', () => {
        if (currentPhoto) {
            if (confirm("আপনি কি নিশ্চিত এই ছবি ডিলিট করতে চান?")) {
                deletePhoto(currentPhoto.id);
                modal.style.display = 'none';
                loadGalleryPhotos();
            }
        }
    });
    
    function showPhotoModal(photo) {
        currentPhoto = photo;
        
        const modalImage = document.getElementById('modal-image');
        const modalInfo = document.getElementById('modal-info');
        
        modalImage.src = photo.imageData;
        modalInfo.innerHTML = `
            <div style="background: #F7FAFC; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h4 style="margin-bottom: 10px; color: #2D3748;">ছবি তথ্য</h4>
                <p><strong><i class="fas fa-mobile-alt"></i> মোবাইল নম্বর:</strong> ${photo.customerNumber}</p>
                <p><strong><i class="fas fa-file"></i> ফাইল নাম:</strong> ${photo.fileName}</p>
                <p><strong><i class="far fa-calendar"></i> আপলোড তারিখ:</strong> ${photo.uploadDate}</p>
                <p><strong><i class="fas fa-weight-hanging"></i> ফাইল সাইজ:</strong> ${photo.fileSize}</p>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
}

// Storage functions
function getAllPhotos() {
    try {
        const photos = localStorage.getItem(CONFIG.STORAGE_KEY);
        return photos ? JSON.parse(photos) : [];
    } catch (error) {
        console.error("Error reading photos from storage:", error);
        return [];
    }
}

function savePhoto(photo) {
    try {
        const photos = getAllPhotos();
        photos.push(photo);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(photos));
        
        // Update gallery if it's open
        const galleryContent = document.getElementById('gallery-content');
        if (galleryContent && galleryContent.style.display === 'block') {
            loadGalleryPhotos();
        }
        
        return true;
    } catch (error) {
        console.error("Error saving photo:", error);
        return false;
    }
}

function deletePhoto(photoId) {
    try {
        const photos = getAllPhotos();
        const filteredPhotos = photos.filter(photo => photo.id !== photoId);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(filteredPhotos));
        
        showStatus(document.getElementById('gallery-status'), 
            "ছবি সফলভাবে ডিলিট হয়েছে", 
            "success"
        );
        
        return true;
    } catch (error) {
        console.error("Error deleting photo:", error);
        return false;
    }
}

// Helper functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showStatus(element, message, type) {
    element.innerHTML = message;
    element.className = 'status-message ' + type;
    element.style.display = 'block';
}

function clearStatusMessages() {
    const statusMessages = document.querySelectorAll('.status-message');
    statusMessages.forEach(msg => {
        msg.className = 'status-message';
        msg.style.display = 'none';
    });
}

function downloadPhotoAsPDF(photo) {
    // In a real implementation, this would generate a PDF
    // For demo purposes, we'll simulate PDF download with the image
    
    showStatus(document.getElementById('search-status'), 
        "পিডিএফ তৈরি করা হচ্ছে... দয়া করে অপেক্ষা করুন",
        "info"
    );
    
    setTimeout(() => {
        // Create download link
        const link = document.createElement('a');
        link.href = photo.imageData;
        link.download = `studio_photo_${photo.customerNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showStatus(document.getElementById('search-status'), 
            `<i class="fas fa-check-circle"></i> পিডিএফ ডাউনলোড শুরু হয়েছে!`,
            "success"
        );
    }, 2000);
}

function checkExistingData() {
    const photos = getAllPhotos();
    console.log(`Total photos in storage: ${photos.length}`);
}

// Make loadGalleryPhotos available globally for gallery updates
window.loadGalleryPhotos = function(searchTerm = '') {
    const photos = getAllPhotos();
    const galleryGrid = document.getElementById('gallery-grid');
    const emptyGallery = document.getElementById('empty-gallery');
    const totalPhotos = document.getElementById('total-photos');
    
    if (totalPhotos) {
        totalPhotos.textContent = `মোট ছবি: ${photos.length}`;
    }
    
    if (!galleryGrid) return;
    
    // Filter photos if search term exists
    const filteredPhotos = searchTerm ? 
        photos.filter(photo => photo.customerNumber.includes(searchTerm)) : 
        photos;
    
    // Display photos
    if (filteredPhotos.length === 0) {
        if (emptyGallery) {
            emptyGallery.style.display = 'block';
        }
        if (galleryGrid) {
            galleryGrid.style.display = 'none';
        }
        return;
    }
    
    if (emptyGallery) {
        emptyGallery.style.display = 'none';
    }
    if (galleryGrid) {
        galleryGrid.style.display = 'grid';
        galleryGrid.innerHTML = '';
        
        filteredPhotos.forEach(photo => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.id = photo.id;
            
            galleryItem.innerHTML = `
                <img src="${photo.imageData}" alt="ছবি">
                <div class="gallery-item-info">
                    <h4><i clas
