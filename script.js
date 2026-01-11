// ওয়েবসাইট লোড হওয়ার পর
document.addEventListener('DOMContentLoaded', function() {
    console.log('ইসলামিক গাইডলাইন ওয়েবসাইট লোড হয়েছে');
    
    // লোডিং স্টেট শো
    showLoading();
    
    // ট্যাব এলিমেন্টস সিলেক্ট
    const janajaTab = document.getElementById('janaja-tab');
    const qoborTab = document.getElementById('qobor-tab');
    const duaTab = document.getElementById('dua-tab');
    
    // সেকশন এলিমেন্টস সিলেক্ট
    const janajaSection = document.getElementById('janaja-section');
    const qoborSection = document.getElementById('qobor-section');
    const duaSection = document.getElementById('dua-section');
    
    // সকল ট্যাব ও সেকশন সংগ্রহ
    const allTabs = [janajaTab, qoborTab, duaTab];
    const allSections = [janajaSection, qoborSection, duaSection];
    
    // গ্লোবাল ট্যাব সুইচিং ফাংশন
    window.switchToTab = function(tabName) {
        event.preventDefault();
        let selectedTab;
        
        if (tabName === 'janaja') {
            selectedTab = janajaTab;
        } else if (tabName === 'qobor') {
            selectedTab = qoborTab;
        } else if (tabName === 'dua') {
            selectedTab = duaTab;
        } else {
            selectedTab = janajaTab;
        }
        
        switchTab(selectedTab);
        return false;
    };
    
    // ট্যাব সুইচিং ফাংশন
    function switchTab(selectedTab) {
        // প্রথমে সকল ট্যাব ও সেকশন থেকে active ক্লাস রিমুভ
        allTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        allSections.forEach(section => {
            section.classList.remove('active');
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
        });
        
        // নির্বাচিত ট্যাবে active ক্লাস অ্যাড
        selectedTab.classList.add('active');
        
        // সংশ্লিষ্ট সেকশন শো
        let selectedSection;
        if (selectedTab === janajaTab) {
            selectedSection = janajaSection;
        } else if (selectedTab === qoborTab) {
            selectedSection = qoborSection;
        } else if (selectedTab === duaTab) {
            selectedSection = duaSection;
        }
        
        // অ্যানিমেশন সহ সেকশন শো
        setTimeout(() => {
            selectedSection.classList.add('active');
            setTimeout(() => {
                selectedSection.style.opacity = '1';
                selectedSection.style.transform = 'translateY(0)';
                selectedSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            }, 50);
        }, 100);
        
        // URL হ্যাশ আপডেট
        updateUrlHash(selectedTab.id);
        
        // ট্যাব পরিবর্তন নোটিফিকেশন
        showTabNotification(selectedTab);
        
        // পেজের উপরে স্ক্রোল
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // URL হ্যাশ আপডেট ফাংশন
    function updateUrlHash(tabId) {
        const hash = tabId.replace('-tab', '');
        try {
            window.history.replaceState(null, null, `#${hash}`);
        } catch (e) {
            console.log('URL আপডেট এরর:', e);
        }
    }
    
    // ট্যাব পরিবর্তন নোটিফিকেশন
    function showTabNotification(tab) {
        const tabName = tab.querySelector('span').textContent;
        console.log(`সক্রিয় ট্যাব: ${tabName}`);
    }
    
    // ট্যাবগুলিতে ক্লিক ইভেন্ট যোগ
    janajaTab.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(janajaTab);
    });
    
    qoborTab.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(qoborTab);
    });
    
    duaTab.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(duaTab);
    });
    
    // আরবি টেক্সটে কপি ফিচার
    function initCopyToClipboard() {
        const arabicTexts = document.querySelectorAll('.arabic-text');
        
        arabicTexts.forEach(text => {
            // টুলটিপ যোগ
            text.title = 'দোয়া কপি করতে ক্লিক করুন';
            text.style.cursor = 'pointer';
            
            text.addEventListener('click', function() {
                const textToCopy = this.textContent.trim();
                
                // ক্লিপবোর্ডে কপি
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // সফল কপি ফিডব্যাক
                    showCopySuccess(this);
                }).catch(err => {
                    // ফেলব্যাক মেথড
                    try {
                        const textArea = document.createElement('textarea');
                        textArea.value = textToCopy;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        
                        showCopySuccess(this);
                    } catch (e) {
                        showNotification('কপি করতে সমস্যা হয়েছে', 'error');
                    }
                });
            });
        });
    }
    
    // কপি সফল ফিডব্যাক
    function showCopySuccess(element) {
        const originalColor = element.style.color;
        const originalBg = element.style.backgroundColor;
        
        element.style.color = '#2e8b57';
        element.style.backgroundColor = 'rgba(46, 139, 87, 0.1)';
        element.style.transition = 'all 0.3s ease';
        
        // টেম্পোরারি টুলটিপ
        const originalTitle = element.title;
        element.title = 'দোয়া কপি হয়েছে! ✓';
        
        // নোটিফিকেশন শো
        showNotification('দোয়া কপি হয়েছে!', 'success');
        
        setTimeout(() => {
            element.style.color = originalColor;
            element.style.backgroundColor = originalBg;
            element.title = originalTitle;
        }, 1500);
    }
    
    // জেনারেল নোটিফিকেশন
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        let bgColor = 'var(--primary-color)';
        let icon = 'info-circle';
        if (type === 'success') {
            bgColor = 'var(--secondary-color)';
            icon = 'check-circle';
        }
        if (type === 'error') {
            bgColor = '#dc3545';
            icon = 'exclamation-circle';
        }
        
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 30px;
                right: 30px;
                background: ${bgColor};
                color: white;
                padding: 18px 25px;
                border-radius: 12px;
                font-size: 16px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                z-index: 9999;
                animation: slideInRight 0.3s ease;
                display: flex;
                align-items: center;
                gap: 12px;
                max-width: 350px;
                border-left: 5px solid rgba(255,255,255,0.3);
            ">
                <i class="fas fa-${icon}" style="font-size: 1.2rem;"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
        
        // ক্লিক করে বন্ধ করা
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    }
    
    // কার্ড হোভার এফেক্ট
    function initCardHoverEffects() {
        const cards = document.querySelectorAll('.step-card, .guide-card, .dua-card, .sura-item');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                if (!this.classList.contains('sura-item')) {
                    this.style.transform = 'translateY(-8px)';
                }
                this.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.15)';
            });
            
            card.addEventListener('mouseleave', function() {
                if (!this.classList.contains('sura-item')) {
                    this.style.transform = 'translateY(0)';
                }
                this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            });
        });
    }
    
    // সূরাহ আইটেম ক্লিক ইভেন্ট
    function initSuraClickEvents() {
        const suraItems = document.querySelectorAll('.sura-item');
        
        suraItems.forEach(item => {
            item.addEventListener('click', function() {
                const suraName = this.querySelector('.sura-name').textContent;
                showNotification(`"${suraName}" নির্বাচিত হয়েছে`, 'info');
            });
        });
    }
    
    // লোডিং ফাংশন
    function showLoading() {
        // ছোট ডিলে দেই যাতে লোডিং দেখা যায়
        setTimeout(hideLoading, 800);
    }
    
    function hideLoading() {
        const body = document.body;
        body.style.opacity = '0';
        body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            body.style.opacity = '1';
            // ওয়েবসাইট লোড হয়েছে নোটিফিকেশন
            showNotification('ইসলামিক গাইডলাইন প্রস্তুত', 'success');
        }, 100);
    }
    
    // URL হ্যাশ থেকে ট্যাব সেট
    function setTabFromHash() {
        const hash = window.location.hash.substring(1);
        if (hash === 'qobor') {
            switchTab(qoborTab);
        } else if (hash === 'dua') {
            switchTab(duaTab);
        } else {
            switchTab(janajaTab);
        }
    }
    
    // কাস্টম CSS এনিমেশন যোগ
    function addCustomAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .notification {
                animation: slideInRight 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // স্ক্রল টপ বাটন
    function addScrollToTopButton() {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            z-index: 999;
            display: none;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(scrollBtn);
        
        // স্ক্রল ইভেন্ট
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.style.display = 'flex';
            } else {
                scrollBtn.style.display = 'none';
            }
        });
        
        // ক্লিক ইভেন্ট
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // হোভার ইফেক্ট
        scrollBtn.addEventListener('mouseenter', () => {
            scrollBtn.style.transform = 'scale(1.1)';
            scrollBtn.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        });
        
        scrollBtn.addEventListener('mouseleave', () => {
            scrollBtn.style.transform = 'scale(1)';
            scrollBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
        });
    }
    
    // পেজ ভিজিবিলিটি API
    function initPageVisibility() {
        let hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        }
        
        document.addEventListener(visibilityChange, () => {
            if (!document[hidden]) {
                // পেজ আবার ভিজিবল হলে
                console.log('পেজ আবার ভিজিবল হয়েছে');
            }
        }, false);
    }
    
    // ইনিশিয়ালাইজেশন ফাংশন কল
    function initializeWebsite() {
        // কাস্টম এনিমেশন যোগ
        addCustomAnimations();
        
        // প্রথমে ডিফল্ট ট্যাব সেট
        setTimeout(() => {
            setTabFromHash();
        }, 100);
        
        // অন্যান্য ফাংশন ইনিশিয়ালাইজ
        initCopyToClipboard();
        initCardHoverEffects();
        initSuraClickEvents();
        
        // স্ক্রল টপ বাটন যোগ
        addScrollToTopButton();
        
        // পেজ ভিজিবিলিটি
        initPageVisibility();
        
        // রিসাইজ ইভেন্ট হ্যান্ডলার
        window.addEventListener('resize', handleResize);
        
        console.log('ওয়েবসাইট সম্পূর্ণভাবে ইনিশিয়ালাইজ হয়েছে');
    }
    
    // রিসাইজ হ্যান্ডলার
    function handleResize() {
        // রিসাইজে কোনো অপ্রয়োজনীয় রিফ্রেশ নেই
        console.log('উইন্ডো রিসাইজ হয়েছে:', window.innerWidth, 'x', window.innerHeight);
    }
    
    // ওয়েবসাইট ইনিশিয়ালাইজ
    setTimeout(initializeWebsite, 500);
    
    // হ্যাশ পরিবর্তন হলে ট্যাব আপডেট
    window.addEventListener('hashchange', setTabFromHash);
    
    // এরর হ্যান্ডলিং
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('ওয়েবসাইটে এরর:', message);
        return true;
    };
    
    // আনলোড ইভেন্ট
    window.addEventListener('beforeunload', () => {
        // কোনো বিশেষ কাজ নেই
    });
});
