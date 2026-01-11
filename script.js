/* ইসলামিক থিমের রং */
:root {
    --primary-color: #1a472a;
    --secondary-color: #2e8b57;
    --accent-color: #3aab78;
    --light-color: #f8f9fa;
    --dark-color: #1e3a29;
    --text-color: #333;
    --border-color: #e0e0e0;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --arabic-font: 'Amiri', serif;
    --bengali-font: 'Noto Sans Bengali', sans-serif;
    --gold-color: #d4af37;
    --green-color: #2e8b57;
    --facebook-blue: #1877F2;
    --whatsapp-green: #25D366;
    --light-green: #e8f5e9;
    --medium-green: #c8e6c9;
}

/* বেসিক স্টাইল */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--bengali-font);
    background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
    color: var(--text-color);
    line-height: 1.6;
    min-height: 100vh;
    background-attachment: fixed;
    overflow-x: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* হেডার স্টাইল */
header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.header-top {
    padding: 2rem 0;
    background: rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 1rem;
}

.logo {
    display: flex;
    align-items: center;
    gap: 20px;
    text-align: center;
}

.logo i {
    font-size: 3.5rem;
    color: var(--gold-color);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.logo-text h1 {
    font-size: 2.8rem;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    margin-bottom: 0.5rem;
    color: white;
    line-height: 1.2;
}

.tagline {
    font-size: 1.3rem;
    opacity: 0.95;
    font-style: italic;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.header-bottom {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.5rem 0;
}

.nav-tabs {
    display: flex;
    gap: 2px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    max-width: 800px;
    margin: 0 auto;
}

.tab-btn {
    flex: 1;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: white;
    font-family: var(--bengali-font);
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.tab-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s ease;
}

.tab-btn:hover::before {
    left: 100%;
}

.tab-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

.tab-btn.active {
    background: var(--gold-color);
    color: var(--dark-color);
    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
}

.tab-btn.active i {
    color: var(--dark-color);
}

.tab-btn i {
    font-size: 1.4rem;
    transition: all 0.3s ease;
}

/* ফুটার সোশ্যাল বাটন */
.footer-social {
    margin-top: 1.5rem;
}

.footer-social h4 {
    color: var(--gold-color);
    margin-bottom: 1rem;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.social-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.footer-social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 14px 25px;
    border-radius: 12px;
    color: white;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    text-align: center;
}

.fb-btn {
    background: linear-gradient(135deg, var(--facebook-blue) 0%, #166fe5 100%);
}

.wa-btn {
    background: linear-gradient(135deg, var(--whatsapp-green) 0%, #1da851 100%);
}

.footer-social-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    letter-spacing: 0.5px;
}

.footer-social-btn i {
    font-size: 1.4rem;
}

/* কুইক লিংক */
.quick-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.quick-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: white;
    text-decoration: none;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-link:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(8px);
    border-color: var(--accent-color);
}

.quick-link i {
    color: var(--accent-color);
    font-size: 1.1rem;
}

/* কন্টাক্ট ইনফো */
.contact-info {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
}

.contact-info p {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.1rem;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 25px;
    transition: all 0.3s ease;
}

.contact-info p:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.contact-info i {
    color: var(--accent-color);
    font-size: 1.3rem;
}

.copyright {
    font-size: 1.1rem;
    color: var(--gold-color);
    margin: 1rem 0;
    font-weight: 600;
}

/* মেইন কন্টেন্ট */
main {
    padding: 3rem 0;
    min-height: calc(100vh - 300px);
}

.content-section {
    display: none;
    animation: fadeIn 0.5s ease;
}

.content-section.active {
    display: block;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* সেকশন হেডার */
.section-header {
    text-align: center;
    margin-bottom: 3rem;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, white 0%, var(--light-green) 100%);
    border-radius: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border-left: 8px solid var(--accent-color);
    border-right: 8px solid var(--accent-color);
    position: relative;
    overflow: hidden;
}

.section-header::before {
    content: "";
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 4rem;
    color: rgba(58, 171, 120, 0.1);
    z-index: 0;
}

.section-header h2 {
    color: var(--primary-color);
    font-size: 2.5rem;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.section-header h2 i {
    color: var(--secondary-color);
    background: rgba(46, 139, 87, 0.1);
    padding: 15px;
    border-radius: 50%;
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.section-subtitle {
    color: var(--secondary-color);
    font-size: 1.4rem;
    font-style: italic;
    position: relative;
    z-index: 1;
    background: rgba(255, 255, 255, 0.7);
    display: inline-block;
    padding: 8px 25px;
    border-radius: 25px;
    margin-top: 1rem;
}

/* জানাজার স্টেপ কার্ড */
.step-container {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.step-card {
    background: linear-gradient(135deg, white 0%, #f8fff9 100%);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    transition: all 0.4s ease;
    border: 2px solid var(--medium-green);
    position: relative;
}

.step-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--accent-color));
}

.step-card:hover {
    transform: translateY(-10px) scale(1.01);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.step-number {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    font-size: 3rem;
    font-weight: bold;
    width: 100px;
    min-width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-family: var(--arabic-font);
}

.step-number::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 15px solid var(--secondary-color);
}

.step-content {
    flex: 1;
    padding: 2.5rem;
}

.step-title {
    color: var(--primary-color);
    font-size: 1.8rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 3px solid var(--accent-color);
    position: relative;
}

.step-title::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 100px;
    height: 3px;
    background: var(--gold-color);
}

.arabic-text {
    font-family: var(--arabic-font);
    font-size: 2rem;
    text-align: right;
    direction: rtl;
    line-height: 1.9;
    color: #1a472a;
    margin: 2rem 0;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(58, 171, 120, 0.08) 0%, rgba(46, 139, 87, 0.08) 100%);
    border-radius: 15px;
    border-right: 6px solid var(--accent-color);
    position: relative;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
}

.arabic-text::before {
    content: "";
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(58, 171, 120, 0.15);
    font-size: 3rem;
}

.translation {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    margin: 1.5rem 0;
    border-left: 5px solid var(--secondary-color);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.meaning {
    background: #fff8e1;
    padding: 1.5rem;
    border-radius: 12px;
    border-left: 5px solid var(--gold-color);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

/* কবর জিয়ারত গাইড */
.qobor-guide {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.guide-card {
    background: linear-gradient(135deg, white 0%, #f8fff9 100%);
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 2.5rem;
    align-items: flex-start;
    transition: all 0.4s ease;
    border: 2px solid var(--medium-green);
    position: relative;
    overflow: hidden;
}

.guide-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 8px;
    height: 100%;
    background: linear-gradient(to bottom, var(--primary-color), var(--secondary-color), var(--accent-color));
}

.guide-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.guide-icon {
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--secondary-color) 100%);
    color: white;
    width: 70px;
    height: 70px;
    min-width: 70px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    flex-shrink: 0;
    box-shadow: 0 6px 15px rgba(58, 171, 120, 0.4);
    transition: all 0.3s ease;
}

.guide-card:hover .guide-icon {
    transform: rotate(15deg) scale(1.1);
}

.guide-content {
    flex: 1;
}

.guide-content h3 {
    color: var(--primary-color);
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--medium-green);
}

.guide-content ul {
    list-style: none;
    padding-left: 1rem;
}

.guide-content li {
    margin-bottom: 0.8rem;
    padding-left: 2rem;
    position: relative;
    font-size: 1.1rem;
    line-height: 1.6;
}

.guide-content li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--green-color);
    font-weight: bold;
    font-size: 1.2rem;
    background: rgba(46, 139, 87, 0.1);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sura-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.2rem;
    margin: 1.5rem 0;
}

.sura-item {
    background: #f8f9fa;
    padding: 1.2rem;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 2px solid var(--border-color);
    transition: all 0.3s ease;
    cursor: pointer;
}

.sura-item:hover {
    background: #e3f2fd;
    border-color: var(--accent-color);
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.sura-name {
    font-weight: 600;
    color: var(--primary-color);
    font-size: 1.1rem;
}

.sura-count {
    background: var(--accent-color);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.95rem;
    font-weight: 600;
}

.instruction {
    background: #e8f5e9;
    padding: 1.5rem;
    border-radius: 12px;
    margin-top: 1.5rem;
    border-left: 5px solid var(--green-color);
    font-size: 1.1rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

/* দোয়া গ্রিড */
.dua-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 2.5rem;
    margin-bottom: 4rem;
}

.dua-card {
    background: linear-gradient(135deg, white 0%, #f8fff9 100%);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.4s ease;
    border: 2px solid var(--medium-green);
    position: relative;
}

.dua-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.dua-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    border-color: var(--accent-color);
}

.dua-number {
    position: absolute;
    top: 15px;
    right: 15px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    z-index: 2;
    font-family: var(--arabic-font);
}

.dua-content {
    padding: 2.5rem;
    position: relative;
}

.dua-content .arabic-text {
    font-size: 1.8rem;
    margin: 1.5rem 0;
    padding: 1.5rem;
    background: rgba(58, 171, 120, 0.05);
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.transliteration {
    background: #f8f9fa;
    padding: 1.2rem;
    border-radius: 10px;
    margin: 1.2rem 0;
    font-size: 1.15rem;
    border-left: 4px solid var(--secondary-color);
}

.transliteration strong {
    color: var(--primary-color);
}

.dua-content .meaning {
    background: #fff8e1;
    padding: 1.2rem;
    border-radius: 10px;
    margin-top: 1.2rem;
    border-left: 4px solid var(--gold-color);
    font-size: 1.1rem;
    line-height: 1.6;
}

/* দোয়া রিমাইন্ডার */
.dua-reminder {
    background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
    border-radius: 20px;
    padding: 2.5rem;
    display: flex;
    gap: 2.5rem;
    align-items: center;
    box-shadow: 0 10px 30px rgba(255, 193, 7, 0.2);
    border: 2px solid #ffd54f;
    position: relative;
    overflow: hidden;
}

.dua-reminder::before {
    content: '';
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
    position: absolute;
    right: 20px;
    bottom: 20px;
    font-size: 5rem;
    color: rgba(255, 213, 79, 0.1);
    z-index: 0;
}

.reminder-icon {
    background: var(--gold-color);
    color: white;
    width: 70px;
    height: 70px;
    min-width: 70px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    flex-shrink: 0;
    box-shadow: 0 6px 15px rgba(212, 175, 55, 0.4);
    z-index: 1;
}

.reminder-content {
    flex: 1;
    position: relative;
    z-index: 1;
}

.reminder-content h4 {
    color: var(--primary-color);
    font-size: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.reminder-content p {
    color: #5d4037;
    line-height: 1.7;
    font-size: 1.1rem;
}

/* ফুটার */
footer {
    background: linear-gradient(135deg, var(--dark-color) 0%, #15291e 100%);
    color: white;
    padding: 4rem 0 2rem;
    margin-top: 4rem;
    position: relative;
    overflow: hidden;
}

footer::before {
    content: '';
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 20rem;
    color: rgba(255, 255, 255, 0.02);
    z-index: 0;
    pointer-events: none;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 3rem;
    margin-bottom: 3rem;
    position: relative;
    z-index: 1;
}

.footer-section h3 {
    color: var(--gold-color);
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(212, 175, 55, 0.3);
}

.footer-section p {
    opacity: 0.9;
    line-height: 1.7;
    font-size: 1.1rem;
}

.footer-section ul {
    list-style: none;
}

.footer-section li {
    margin-bottom: 0.8rem;
    padding-left: 1.8rem;
    position: relative;
    font-size: 1.1rem;
    line-height: 1.6;
}

.footer-section li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--accent-color);
    font-size: 1.5rem;
    line-height: 1;
}

.footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 2rem;
    text-align: center;
    position: relative;
    z-index: 1;
}

.disclaimer {
    font-size: 1rem;
    opacity: 0.7;
    font-style: italic;
    line-height: 1.6;
    margin-top: 1.5rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

/* রেসপন্সিভ ডিজাইন */
@media (max-width: 1024px) {
    .logo-text h1 {
        font-size: 2.4rem;
    }
    
    .dua-grid {
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
    }
    
    .logo {
        flex-direction: column;
        gap: 15px;
    }
    
    .logo i {
        font-size: 3rem;
    }
    
    .logo-text h1 {
        font-size: 2rem;
    }
    
    .tagline {
        font-size: 1.1rem;
    }
    
    .nav-tabs {
        flex-direction: column;
        border-radius: 12px;
        gap: 1px;
    }
    
    .tab-btn {
        padding: 1.2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .tab-btn:last-child {
        border-bottom: none;
    }
    
    .section-header {
        padding: 2rem 1.5rem;
    }
    
    .section-header h2 {
        font-size: 1.8rem;
        flex-direction: column;
        gap: 10px;
    }
    
    .section-subtitle {
        font-size: 1.2rem;
    }
    
    .step-card {
        flex-direction: column;
    }
    
    .step-number {
        width: 100%;
        height: 80px;
        min-width: 100%;
    }
    
    .step-number::after {
        display: none;
    }
    
    .guide-card {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
    }
    
    .guide-icon {
        align-self: center;
    }
    
    .dua-grid {
        grid-template-columns: 1fr;
    }
    
    .sura-list {
        grid-template-columns: 1fr;
    }
    
    .dua-reminder {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
    }
    
    .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
    }
    
    .contact-info {
        flex-direction: column;
        align-items: center;
        gap: 15px;
        padding: 15px;
    }
    
    .footer-social-btn {
        padding: 12px 20px;
        font-size: 1rem;
    }
    
    .arabic-text {
        font-size: 1.6rem;
        padding: 1.5rem;
    }
    
    .dua-content .arabic-text {
        font-size: 1.5rem;
    }
}

@media (max-width: 480px) {
    .container {
        padding: 0 15px;
    }
    
    .logo-text h1 {
        font-size: 1.8rem;
    }
    
    .section-header {
        padding: 1.5rem;
    }
    
    .section-header h2 {
        font-size: 1.5rem;
    }
    
    .arabic-text {
        font-size: 1.4rem;
        padding: 1rem;
    }
    
    .step-content, .guide-content, .dua-content {
        padding: 1.5rem;
    }
    
    .footer-social-btn {
        font-size: 0.9rem;
        padding: 10px 15px;
    }
    
    .contact-info p {
        font-size: 0.95rem;
        padding: 8px 15px;
    }
    
    .quick-link {
        padding: 10px 15px;
    }
}

/* ইসলামিক প্যাটার্ন ব্যাকগ্রাউন্ড */
body::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%231a472a' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
    z-index: -1;
    pointer-events: none;
}

/* স্ক্রলবার স্টাইল */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 5px;
}

::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
    border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

/* সিলেকশন কালার */
::selection {
    background-color: rgba(58, 171, 120, 0.3);
    color: var(--primary-color);
}

/* ফোকাস স্টাইল */
:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
}

/* লোডিং এনিমেশন */
.loading {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```
