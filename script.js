// গ্লোবাল ভেরিয়েবল
const ADMIN_PASSWORD = "ShimuStudio@2024"; // এটা আপনার পছন্দমতো পরিবর্তন করুন
let images = [];
let selectedFiles = [];

// লোকাল স্টোরেজ থেকে ছবি লোড করা
function loadImages() {
    const savedImages = localStorage.getItem('shimuImages');
    if (savedImages) {
        images = JSON.parse(savedImages);
        displayGalleryImages();
    }
}

// ছবি সেভ করা
function saveImages() {
    localStorage.setItem('shimuImages', JSON.stringify(images));
}

// নোটিফিকেশন দেখানো
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ইমেজ প্রিভিউ
document.getElementById('fileInput').addEventListener('change', function(e) {
    handleFiles(e.target.files);
});

// Drag and Drop functionality
const dropArea = document.getElementById('dropArea');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.classList.add('dragover');
}

function unhighlight() {
    dropArea.classList.remove('dragover');
}

dropArea.addEventListener('drop', function(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
});

function handleFiles(files) {
    selectedFiles = [...files];
    displayPreview();
}

function displayPreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button class="remove-btn" onclick="removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            preview.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(index) {
    selectedFiles.splice(index, 1);
    displayPreview();
}

// ছবি আপলোড ফাংশন
function uploadImages() {
    const adminPass = document.getElementById('adminPass').value;
    const imageName = document.getElementById('imageName').value;
    const imageNumber = document.getElementById('imageNumber').value;
    
    if (adminPass !== ADMIN_PASSWORD) {
        showNotification('ভুল পাসওয়ার্ড!', 'error');
        return;
    }
    
    if (selectedFiles.length === 0) {
        showNotification('কোনো ছবি সিলেক্ট করা হয়নি!', 'warning');
        return;
    }
    
    if (!imageName) {
        showNotification('ছবির নাম দিন!', 'warning');
        return;
    }
    
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = {
                id: Date.now() + index,
                name: imageName,
                number: imageNumber || `IMG${Date.now()}`,
                data: e.target.result,
                uploadedAt: new Date().toISOString()
            };
            
            images.push(imageData);
            
            if (index === selectedFiles.length - 1) {
                saveImages();
                showNotification(`${selectedFiles.length} টি ছবি সফলভাবে আপলোড হয়েছে!`);
                
                // ফর্ম রিসেট
                document.getElementById('adminPass').value = '';
                document.getElementById('imageName').value = '';
                document.getElementById('imageNumber').value = '';
                selectedFiles = [];
                displayPreview();
            }
        };
        reader.readAsDataURL(file);
    });
}

// ছবি সার্চ ফাংশন
function searchImage() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const searchResult = document.getElementById('searchResult');
    
    if (!searchTerm) {
        showNotification('সার্চ করতে কিছু লিখুন!', 'warning');
        return;
    }
    
    const results = images.filter(img => 
        img.name.toLowerCase().includes(searchTerm) || 
        img.number.toLowerCase().includes(searchTerm)
    );
    
    if (results.length === 0) {
        searchResult.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc;"></i>
                <p style="text-align: center; color: #666; margin-top: 1rem;">কোনো ছবি পাওয়া যায়নি!</p>
            </div>
        `;
        return;
    }
    
    displaySearchResults(results);
}

function displaySearchResults(results) {
    const searchResult = document.getElementById('searchResult');
    searchResult.innerHTML = `
        <div class="gallery-grid">
            ${results.map(img => `
                <div class="gallery-item">
                    <img src="${img.data}" alt="${img.name}">
                    <div class="gallery-item-info">
                        <span>${img.name} - ${img.number}</span>
                        <button class="download-btn" onclick="downloadImage('${img.data}', '${img.name}.jpg')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ডাউনলোড ফাংশন
function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('ডাউনলোড শুরু হয়েছে!');
}

// গ্যালারি আনলক ফাংশন
function unlockGallery() {
    const galleryPass = document.getElementById('galleryPass').value;
    
    if (galleryPass === ADMIN_PASSWORD) {
        document.getElementById('galleryLogin').style.display = 'none';
        document.getElementById('galleryContent').style.display = 'block';
        displayGalleryImages();
        showNotification('গ্যালারি আনলক করা হয়েছে!');
    } else {
        showNotification('ভুল পাসওয়ার্ড!', 'error');
    }
}

function logoutGallery() {
    document.getElementById('galleryLogin').style.display = 'block';
    document.getElementById('galleryContent').style.display = 'none';
    document.getElementById('galleryPass').value = '';
    showNotification('গ্যালারি থেকে লগআউট করা হয়েছে!');
}

function displayGalleryImages() {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (images.length === 0) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-images" style="font-size: 4rem; color: #ccc;"></i>
                <p style="color: #666; margin-top: 1rem;">কোনো ছবি নেই। প্রথমে ছবি আপলোড করুন!</p>
            </div>
        `;
        return;
    }
    
    galleryGrid.innerHTML = images.map(img => `
        <div class="gallery-item">
            <img src="${img.data}" alt="${img.name}">
            <div class="gallery-item-info">
                <span>${img.name} - ${img.number}</span>
                <button class="download-btn" onclick="downloadImage('${img.data}', '${img.name}.jpg')">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// স্মুথ স্ক্রোল
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// মোবাইল মেনু
document.querySelector('.mobile-menu').addEventListener('click', function() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// স্ক্রোল ইফেক্ট
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'var(--box-shadow)';
    }
});

// অ্যাক্টিভ নেভিগেশন লিংক
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const scroll = window.scrollY;
        
        if (scroll >= sectionTop && scroll < sectionBottom) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${section.id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// লোকাল স্টোরেজ থেকে ছবি লোড করা
loadImages();

// ইনিশিয়ালাইজেশন
document.addEventListener('DOMContentLoaded', function() {
    console.log('শিমু ডিজিটাল স্টুডিও রেডি!');
    
    // ফেসবুক আইকন লিংক সেট করা
    const fbLinks = document.querySelectorAll('.facebook-icon, .footer-social a');
    fbLinks.forEach(link => {
        link.href = 'https://www.facebook.com/share/14Wu77AfRTs/';
    });
});
