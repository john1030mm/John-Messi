const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx3g8BOYwMPgu8s3aJVNtdBHImQxFUbA-ztR-0SEZOq9txLc64yfshCbH4kbwrddfTUjA/exec"; 
const GEMINI_KEY = "AQ.Ab8RN6JV8vreHKDMUiHMU-KYdIqL4nFrLa4Z68G4TSnqRFiylQ"; // حط مفتاح جوجل هنا
const IMGBB_KEY = "3b5826821ec6486f42b5f719c97795ff";  

let appData = JSON.parse(localStorage.getItem('jm_app_data')) || { theme: 'dark', lang: 'ar', meals: [], target: null, dailyWorkouts: "", history: [] };
if(!appData.history) appData.history = [];

const defaultFoods = [
  {id: 1, name: "صدور دجاج مسلوق/مشوي", cal: 165, p: 31, c: 0, f: 3.6}, {id: 2, name: "وراك دجاج مشوية", cal: 209, p: 26, c: 0, f: 10.9}, {id: 3, name: "لحم بقري صافي مشوي", cal: 250, p: 26, c: 0, f: 15}, {id: 4, name: "كفتة مشوية", cal: 250, p: 18, c: 3, f: 18}, {id: 5, name: "سمك بلطي مشوي", cal: 128, p: 26, c: 0, f: 2.7}, {id: 6, name: "سمك فيليه مشوي", cal: 105, p: 24, c: 0, f: 1.2}, {id: 7, name: "سلمون مشوي", cal: 206, p: 22, c: 0, f: 13}, {id: 8, name: "تونة معلبة في ماء (مصفاة)", cal: 116, p: 26, c: 0, f: 1}, {id: 9, name: "تونة معلبة في زيت (مصفاة)", cal: 198, p: 29, c: 0, f: 8},
  {id: 10, name: "بيض مسلوق (بيضة 50ج = نص الكمية)", cal: 155, p: 13, c: 1.1, f: 11}, {id: 11, name: "بياض بيض مسلوق", cal: 52, p: 11, c: 0.7, f: 0.2}, {id: 12, name: "جبنة قريش", cal: 98, p: 11, c: 3.4, f: 4.3}, {id: 13, name: "جبنة فيتا لايت", cal: 150, p: 10, c: 3, f: 11}, {id: 14, name: "جبنة بيضاء كاملة الدسم", cal: 264, p: 11, c: 2, f: 23}, {id: 15, name: "جبنة رومي", cal: 393, p: 26, c: 2, f: 31}, {id: 16, name: "حليب كامل الدسم", cal: 61, p: 3.2, c: 4.8, f: 3.3}, {id: 17, name: "حليب خالي الدسم", cal: 35, p: 3.4, c: 5, f: 0.1}, {id: 18, name: "زبادي يوناني (سادة)", cal: 97, p: 9, c: 4, f: 5}, {id: 19, name: "زبادي عادي", cal: 61, p: 3.5, c: 4.7, f: 3.3},
  {id: 20, name: "أرز أبيض مطبوخ", cal: 130, p: 2.7, c: 28, f: 0.3}, {id: 21, name: "أرز بسمتي مطبوخ", cal: 121, p: 3.5, c: 25, f: 0.4}, {id: 22, name: "مكرونة مسلوقة", cal: 158, p: 5.8, c: 31, f: 0.9}, {id: 23, name: "شوفان (نيء)", cal: 389, p: 17, c: 66, f: 7}, {id: 24, name: "خبز بلدي (عيش مصري)", cal: 275, p: 9, c: 58, f: 1.5}, {id: 25, name: "عيش فينو", cal: 289, p: 9, c: 53, f: 3}, {id: 26, name: "عيش توست أسمر", cal: 259, p: 11, c: 47, f: 4}, {id: 27, name: "بطاطس مسلوقة", cal: 87, p: 1.9, c: 20, f: 0.1}, {id: 28, name: "بطاطس مقلية", cal: 312, p: 3.4, c: 41, f: 15}, {id: 29, name: "بطاطا حلوة مسلوقة/مشوية", cal: 86, p: 1.6, c: 20, f: 0.1},
  {id: 30, name: "فول مدمس (بدون زيت)", cal: 110, p: 7.6, c: 20, f: 0.5}, {id: 31, name: "عدس مطبوخ", cal: 116, p: 9, c: 20, f: 0.4}, {id: 32, name: "حمص مطبوخ", cal: 164, p: 8.9, c: 27, f: 2.6}, {id: 33, name: "فاصوليا بيضاء مطبوخة", cal: 139, p: 9.7, c: 25, f: 0.4},
  {id: 35, name: "موز", cal: 89, p: 1.1, c: 23, f: 0.3}, {id: 36, name: "تفاح", cal: 52, p: 0.3, c: 14, f: 0.2}, {id: 37, name: "برتقال", cal: 47, p: 0.9, c: 12, f: 0.1}, {id: 38, name: "عنب", cal: 69, p: 0.7, c: 18, f: 0.2}, {id: 39, name: "بطيخ", cal: 30, p: 0.6, c: 7.6, f: 0.2}, {id: 40, name: "فراولة", cal: 32, p: 0.7, c: 7.7, f: 0.3}, {id: 41, name: "مانجو", cal: 60, p: 0.8, c: 15, f: 0.4}, {id: 43, name: "تمر", cal: 282, p: 2.5, c: 75, f: 0.4},
  {id: 44, name: "زيت زيتون", cal: 884, p: 0, c: 0, f: 100}, {id: 45, name: "زبدة حيواني", cal: 717, p: 0.9, c: 0.1, f: 81}, {id: 46, name: "لوز نيء", cal: 579, p: 21, c: 22, f: 50}, {id: 47, name: "فول سوداني", cal: 567, p: 26, c: 16, f: 49}, {id: 48, name: "زبدة فول سوداني", cal: 588, p: 25, c: 20, f: 50}, {id: 50, name: "عين جمل", cal: 654, p: 15, c: 14, f: 65},
  {id: 51, name: "كشري مصري", cal: 160, p: 6, c: 27, f: 3}, {id: 52, name: "محشي كرنب", cal: 130, p: 3, c: 16, f: 6}, {id: 53, name: "محشي ورق عنب", cal: 170, p: 4, c: 20, f: 8}, {id: 54, name: "طعمية (فلافل) مقلية", cal: 333, p: 13, c: 32, f: 18}, {id: 55, name: "شاورما دجاج (بدون خبز)", cal: 180, p: 20, c: 5, f: 9}, {id: 56, name: "شاورما لحم (بدون خبز)", cal: 230, p: 18, c: 6, f: 15}, {id: 57, name: "بيتزا", cal: 266, p: 11, c: 33, f: 10}, {id: 60, name: "كبدة إسكندراني", cal: 190, p: 22, c: 4, f: 9},
  {id: 71, name: "واي بروتين (سكوب 30ج)", cal: 383, p: 80, c: 10, f: 5}, {id: 73, name: "ماس جينر (سكوب)", cal: 380, p: 16, c: 75, f: 2.5}
];

let foodDB = JSON.parse(localStorage.getItem('jm_food_db')) || defaultFoods;
let currentClientId = ""; let waterIntake = 0; let selectedFood = null; let clientWorkoutsData = "";
let zxingReader = null; let isScannerOpen = false;

// --- الحفظ التلقائي في الخلفية (Cloud Sync) ---
let syncTimer = null;
function syncStateToServer() {
    if(!currentClientId) return;
    clearTimeout(syncTimer);
    // هنستنى ثانيتين بعد آخر إضافة عشان مانعملش ضغط على السيرفر
    syncTimer = setTimeout(() => {
        let stateObj = { meals: appData.meals, water: waterIntake, workouts: appData.dailyWorkouts };
        let stateStr = JSON.stringify(stateObj);
        fetch(`${SCRIPT_URL}?action=syncState&clientId=${currentClientId}&pass=${encodeURIComponent(appData.clientPass)}&state=${encodeURIComponent(stateStr)}`)
        .catch(e => console.log('Background sync failed'));
    }, 2000); 
}

const uiTranslations = {
    'en': {
        'loginTitle': 'Login', 'clientIdInput': 'Client Code (e.g., 1001)', 'clientPassInput': 'Password', 'loginBtn': 'Login',
        'coachPlanTitle': 'Coach Tips 🎯', 'intakeTitle': 'Today\'s Intake 📊', 'calLabel': 'Calories', 'protLabel': 'Protein', 'carbLabel': 'Carbs', 'fatLabel': 'Fats',
        'waterTitle': 'Water Intake 💧', 'reportTitle': 'Daily Report 🚀', 'dailyNotes': 'Write notes (e.g., slept well, tired...)', 'submitBtn': 'Send to Coach 🚀',
        'addMealTitle': 'Add Meal 🍽️', 'camInstruction': 'Point camera at product barcode', 'searchInput': 'Search (Chicken, Rice...)', 'gramsInput': 'Amount (grams)', 'addBtn': 'Add +',
        'todayLogTitle': 'Today\'s Food', 'resetBtn': 'Clear All 🔄',
        'saveWorkoutBtn': 'Save Weights 💾',
        'navDashboard': 'Dashboard', 'navNutrition': 'Nutrition', 'navWorkouts': 'Workouts', 'navHistory': 'Progress',
        'videoTitle': 'Exercise Tutorial', 'historyTitle': 'Your Progress 📈', 'noHistory': 'No past records yet.'
    },
    'ar': {
        'loginTitle': 'تسجيل الدخول', 'clientIdInput': 'كود العميل (مثال: 1001)', 'clientPassInput': 'الباسورد', 'loginBtn': 'ادخل',
        'coachPlanTitle': 'نصايح الكوتش 🎯', 'intakeTitle': 'استهلاكك النهاردة 📊', 'calLabel': 'السعرات', 'protLabel': 'البروتين', 'carbLabel': 'الكارب', 'fatLabel': 'الدهون',
        'waterTitle': 'شرب الماية 💧', 'reportTitle': 'تقريرك اليومي 🚀', 'dailyNotes': 'ملاحظاتك النهاردة (مثلاً: نمت كويس، حاسس بإرهاق...)', 'submitBtn': 'ابعت التقرير للكوتش 🚀',
        'addMealTitle': 'ضيف أكلة 🍽️', 'camInstruction': 'وجه الكاميرا لباركود المنتج', 'searchInput': 'دور على أكلة (فراخ، رز، شوفان...)', 'gramsInput': 'الكمية بالجرام', 'addBtn': 'ضيف +',
        'todayLogTitle': 'أكل النهاردة', 'resetBtn': 'امسح الكل 🔄',
        'saveWorkoutBtn': 'احفظ أوزانك 💾',
        'navDashboard': 'الخطة', 'navNutrition': 'الأكل', 'navWorkouts': 'التمارين', 'navHistory': 'التطور',
        'videoTitle': 'شرح التمرين', 'historyTitle': 'مستواك وتطورك 📈', 'noHistory': 'لسه مفيش بيانات سابقة سجلتها.'
    }
};

function applyLanguage() {
    const lang = appData.lang || 'ar';
    const t = uiTranslations[lang];
    const setTxt = (id, key) => { const el = document.getElementById(id); if(el) el.innerText = t[key]; };
    setTxt('loginTitle', 'loginTitle'); setTxt('loginBtn', 'loginBtn');
    setTxt('coachPlanTitle', 'coachPlanTitle'); setTxt('intakeTitle', 'intakeTitle');
    setTxt('calLabel', 'calLabel'); setTxt('protLabel', 'protLabel'); setTxt('carbLabel', 'carbLabel'); setTxt('fatLabel', 'fatLabel');
    setTxt('waterTitle', 'waterTitle'); setTxt('reportTitle', 'reportTitle'); setTxt('submitBtn', 'submitBtn');
    setTxt('addMealTitle', 'addMealTitle'); setTxt('camInstruction', 'camInstruction'); setTxt('addBtn', 'addBtn');
    setTxt('todayLogTitle', 'todayLogTitle'); setTxt('resetBtn', 'resetBtn');
    setTxt('saveWorkoutBtn', 'saveWorkoutBtn');
    setTxt('navDashboard', 'navDashboard'); setTxt('navNutrition', 'navNutrition'); setTxt('navWorkouts', 'navWorkouts'); setTxt('navHistory', 'navHistory');
    setTxt('videoTitle', 'videoTitle'); setTxt('historyTitle', 'historyTitle');

    const setPlc = (id, key) => { const el = document.getElementById(id); if(el) el.placeholder = t[key]; };
    setPlc('clientIdInput', 'clientIdInput'); setPlc('clientPassInput', 'clientPassInput');
    setPlc('dailyNotes', 'dailyNotes'); setPlc('searchInput', 'searchInput'); setPlc('gramsInput', 'gramsInput');

    updatePhotoStatus(); renderHistoryUI(); 
    document.getElementById('langBtn').innerText = lang === 'en' ? '🌐 EN' : '🌐 AR';
    document.body.dir = lang === 'en' ? 'ltr' : 'rtl';
}

function showToast(msg) { 
    const t = document.getElementById("toast"); t.innerText = msg; t.className = "show"; 
    setTimeout(() => t.className = t.className.replace("show", ""), 3000); 
}

const tabsList = ['dashboard', 'nutrition', 'workouts', 'history']; 
let currentTabIndex = 0;

function switchTab(tabName, element) {
    currentTabIndex = tabsList.indexOf(tabName);
    document.querySelectorAll('.tab-content').forEach(tab => { tab.classList.remove('active'); tab.style.animation = 'none'; });
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const activeTab = document.getElementById(`tab-${tabName}`);
    if(activeTab) { activeTab.classList.add('active'); void activeTab.offsetWidth; activeTab.style.animation = 'swipeAnim 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards'; }
    if(element) element.classList.add('active');
}

let touchstartX = 0; let touchstartY = 0; let touchendX = 0; let touchendY = 0;
window.addEventListener('DOMContentLoaded', () => {
    const btmNav = document.getElementById('bottomNav');
    if (btmNav) {
        btmNav.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; touchstartY = e.changedTouches[0].screenY; }, {passive: true});
        btmNav.addEventListener('touchend', e => { touchendX = e.changedTouches[0].screenX; touchendY = e.changedTouches[0].screenY; handleSwipe(); }, {passive: true});
    }
});

function handleSwipe() {
    const xDiff = Math.abs(touchendX - touchstartX); const yDiff = Math.abs(touchendY - touchstartY);
    if (xDiff > yDiff && xDiff > 60) {
        if (touchendX < touchstartX) { if(currentTabIndex < tabsList.length - 1) { currentTabIndex++; activateTabByIndex(currentTabIndex); } } 
        else { if(currentTabIndex > 0) { currentTabIndex--; activateTabByIndex(currentTabIndex); } }
    }
}
function activateTabByIndex(index) { const navItems = document.querySelectorAll('.nav-item'); switchTab(tabsList[index], navItems[index]); }

function toggleTheme() {
    appData.theme = appData.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', appData.theme);
    document.documentElement.setAttribute('data-theme', appData.theme);
    document.getElementById('themeBtn').textContent = appData.theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('jm_app_data', JSON.stringify(appData));
}

function toggleLang() {
    appData.lang = appData.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('jm_app_data', JSON.stringify(appData));
    applyLanguage(); 
}

function init() {
    document.body.setAttribute('data-theme', appData.theme);
    document.documentElement.setAttribute('data-theme', appData.theme);
    document.getElementById('themeBtn').textContent = appData.theme === 'dark' ? '☀️' : '🌙';
    applyLanguage(); 
}

function login() {
    const id = document.getElementById('clientIdInput').value.trim(); const pass = document.getElementById('clientPassInput').value.trim();
    if (!id || !pass) return showToast(appData.lang === 'en' ? "Enter ID and Password!" : "أدخل الكود والباسورد!");
    
    document.getElementById('loginBtn').innerText = appData.lang === 'en' ? "Loading..." : "جاري التحميل...";
    fetch(`${SCRIPT_URL}?action=getMacros&clientId=${id}&pass=${pass}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                currentClientId = id; appData.clientPass = pass;
                appData.target = { cal: data.calories, pro: data.protein, carb: data.carbs, fat: data.fats };
                document.getElementById('coachPlanText').textContent = data.plan || (appData.lang === 'en' ? "Follow the macros." : "التزم بالماكروز المحددة."); 
                clientWorkoutsData = data.workouts || ""; 
                
                // إضافة الترحيب بالاسم
                const isEn = appData.lang === 'en';
                const greetEl = document.getElementById('greetingTitle');
                if(greetEl) greetEl.innerText = isEn ? `Hello, ${data.name}! 👋` : `ازيك يا ${data.name}! 👋`;

                // مزامنة حالة اليوم (عشان لو فتح من جهاز تاني)
                if (data.savedState) {
                    try {
                        let st = JSON.parse(data.savedState);
                        appData.meals = st.meals || [];
                        waterIntake = st.water || 0;
                        appData.dailyWorkouts = st.workouts || "";
                        localStorage.setItem('jm_app_data', JSON.stringify(appData));
                    } catch(e) {}
                }

                if (data.globalFoods && data.globalFoods.length > 0) {
                    let localMap = new Map();
                    defaultFoods.forEach(f => localMap.set(f.name, f));
                    data.globalFoods.forEach((gf, i) => { localMap.set(gf.name, { id: 1000 + i, name: gf.name + " 🌍", cal: gf.cal, p: gf.p, c: gf.c, f: gf.f }); });
                    foodDB = Array.from(localMap.values());
                    localStorage.setItem('jm_food_db', JSON.stringify(foodDB));
                }

                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('mainApp').style.display = 'block';
                document.getElementById('bottomNav').style.display = 'flex';
                
                renderProgress(); renderMealsUI(); renderWorkoutsUI(); renderHistoryUI(); 
                document.getElementById('waterCount').innerText = `${waterIntake} 💧`; // تحديث شاشة الماية
                showToast(isEn ? "Login Successful! 🔥" : "تم الدخول بنجاح! 🔥");
            } else { 
                showToast(appData.lang === 'en' ? "Invalid Credentials!" : "بيانات غير صحيحة!"); 
                document.getElementById('loginBtn').innerText = appData.lang === 'en' ? "Login" : "ادخل"; 
            }
        }).catch(err => { 
            showToast(appData.lang === 'en' ? "Server Error" : "خطأ في الاتصال بالخادم"); 
            document.getElementById('loginBtn').innerText = appData.lang === 'en' ? "Login" : "ادخل"; 
        });
}

function renderWorkoutsUI() {
    const container = document.getElementById('workoutsList');
    if (!clientWorkoutsData) { container.innerHTML = appData.lang === 'en' ? "<p style='text-align:center;'>No workouts assigned.</p>" : "<p style='text-align:center;'>لا توجد تمارين مخصصة.</p>"; return; }
    const lines = clientWorkoutsData.split('\n'); let html = ""; let currentDayOpen = false;
    lines.forEach((line) => {
        if (!line.trim()) return;
        if (!line.includes('|')) {
            if (currentDayOpen) html += `</div></details>`;
            html += `<details style="background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 15px; padding: 15px; margin-bottom: 15px;">
                <summary style="font-weight: bold; font-size: 1.2rem; color: var(--primary); cursor: pointer; list-style: none; display: flex; justify-content: space-between;">
                    <span>📅 ${line.trim()}</span><span style="font-size: 0.8rem; background: var(--primary); color: #fff; padding: 4px 10px; border-radius: 8px;">افتح ⬇️</span>
                </summary><div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">`;
            currentDayOpen = true; return;
        }
        const parts = line.split('|'); const exName = parts[0] ? parts[0].trim() : `تمرين`; const setsCount = parseInt(parts[1]) || 3; const targetReps = parts[2] ? parts[2].trim() : "10-12"; const videoUrl = parts[3] ? parts[3].trim() : "";
        if (!currentDayOpen) { html += `<details open style="background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 15px; padding: 15px; margin-bottom: 15px;"><summary style="font-weight: bold; font-size: 1.2rem; color: var(--primary); cursor: pointer; list-style: none;">📅 تمارين الأسبوع</summary><div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">`; currentDayOpen = true; }
        
        const safeName = exName.replace(/"/g, '&quot;');
        html += `<div class="exercise-card" data-ex-name="${safeName}" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 15px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">
            <div class="exercise-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span class="exercise-title" style="font-weight: bold; font-size: 1.05rem; color: var(--text-primary);">🏋️ ${exName} (${targetReps} عدات)</span>
                ${videoUrl ? `<button class="video-btn" onclick="openVideo('${videoUrl}')" style="background: var(--nav-icon); width: auto; padding: 5px 10px; margin: 0; border-radius: 8px; font-size: 0.85rem;">🎬 فيديو</button>` : ''}
            </div>`;
        for (let s = 1; s <= setsCount; s++) {
            html += `<div class="set-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.95rem;">
                <span>المجموعة ${s}:</span>
                <div class="set-inputs" style="display: flex; gap: 8px; width: 65%;">
                    <input type="number" placeholder="وزن" class="ex-weight" data-set="${s}" style="margin: 0; padding: 8px; text-align: center; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);">
                    <input type="number" placeholder="عدات" class="ex-reps" data-set="${s}" style="margin: 0; padding: 8px; text-align: center; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);">
                </div></div>`;
        }
        html += `</div>`;
    });
    if (currentDayOpen) html += `</div></details>`;
    container.innerHTML = html;
}

function openVideo(url) {
    const container = document.getElementById('videoContainer'); let embedUrl = url;
    if (url.includes("watch?v=")) embedUrl = url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
    if (url.includes("youtube.com/shorts/")) embedUrl = url.replace("youtube.com/shorts/", "youtube.com/embed/").split("?")[0]; 
    container.innerHTML = `<iframe width="100%" height="300" src="${embedUrl}" frameborder="0" allowfullscreen style="border-radius: 12px;"></iframe>`;
    document.getElementById('videoModal').style.display = 'flex';
}
function closeVideo() { document.getElementById('videoContainer').innerHTML = ''; document.getElementById('videoModal').style.display = 'none'; }

function saveWorkoutLog() {
    let workoutText = ""; const cards = document.querySelectorAll('.exercise-card'); let hasData = false;
    cards.forEach(card => {
        const exName = card.getAttribute('data-ex-name');
        const weights = card.querySelectorAll('.ex-weight');
        weights.forEach(wInput => {
            const set = wInput.getAttribute('data-set'); const weight = wInput.value;
            const rInput = card.querySelector(`.ex-reps[data-set="${set}"]`); const reps = rInput ? rInput.value : 0;
            if (weight || (reps && reps > 0)) { 
                workoutText += `- ${exName} (مجموعة ${set}): ${weight || 0} كجم × ${reps || 0} عدات\n`; 
                hasData = true; wInput.value = ""; if(rInput) rInput.value = ""; 
            }
        });
    });
    if (!hasData) return showToast(appData.lang === 'en' ? "⚠️ Enter weights to save!" : "⚠️ أدخل أوزان للحفظ!");
    appData.dailyWorkouts = (appData.dailyWorkouts || "") + workoutText; 
    localStorage.setItem('jm_app_data', JSON.stringify(appData));
    syncStateToServer(); // مزامنة للسيرفر
    showToast(appData.lang === 'en' ? "✅ Weights saved! Go to Dashboard to submit." : "✅ تم حفظ أوزانك بنجاح! اذهب لتاب الخطة واضغط إرسال التقرير."); 
    activateTabByIndex(0);
}

function renderProgress() {
    if (!appData.target) return;
    let curr = { cal: 0, p: 0, c: 0, f: 0 };
    appData.meals.forEach(m => { curr.cal += m.cal; curr.p += m.pro; curr.c += m.carb; curr.f += m.fat; });
    const update = (key, current, tgt, unit = "g") => {
        const bar = document.getElementById(key + 'Bar'); const text = document.getElementById(key + 'Text');
        if (bar && text) { bar.style.width = Math.min((current / tgt) * 100, 100) + '%'; text.textContent = `${Math.round(current)} / ${tgt}${unit}`; if (current > tgt) bar.classList.add('overlimit'); else bar.classList.remove('overlimit'); }
    };
    update('cal', curr.cal, appData.target.cal, ''); update('prot', curr.p, appData.target.pro); update('carb', curr.c, appData.target.carb); update('fat', curr.f, appData.target.fat);
}

function handleSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase().trim(); 
    const box = document.getElementById('suggestions'); box.innerHTML = ''; 
    if (q === '') { box.style.display = 'none'; return; }
    const results = foodDB.filter(f => f.name.toLowerCase().includes(q));
    box.style.display = 'block';
    if (results.length > 0) {
        results.forEach(f => {
            let div = document.createElement('div'); div.className = 'suggestion-item'; div.innerText = f.name;
            div.onpointerdown = (e) => { e.preventDefault(); selectedFood = f; document.getElementById('searchInput').value = f.name; box.style.display = 'none'; };
            box.appendChild(div);
        });
    } else {
        let div = document.createElement('div'); div.className = 'suggestion-item'; div.innerHTML = `✨ ${appData.lang === 'en' ? 'Ask AI for' : 'اسأل الـ AI عن'}: "${q}"`;
        div.onpointerdown = (e) => { e.preventDefault(); searchFoodAIText(q); box.style.display = 'none'; };
        box.appendChild(div);
    }
}

async function searchFoodAIText(foodName) {
    showToast(`✨ ${appData.lang === 'en' ? 'Asking AI...' : 'جاري سؤال الـ AI...'}`);
    const promptText = `أنت خبير تغذية. قدر السعرات الحرارية والماكروز لـ 100 جرام من "${foodName}". رد بكود JSON فقط بهذا الشكل: {"name": "${foodName}", "cal": السعرات, "pro": البروتين, "carb": الكارب, "fat": الدهون}`;
    const requestBody = { contents: [{ parts: [{ text: promptText }] }] };
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
        const data = await response.json();
        let aiText = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
        const aiResult = JSON.parse(aiText);
        const newFood = { id: Date.now(), name: aiResult.name + " 🌍", cal: aiResult.cal, p: aiResult.pro, c: aiResult.carb, f: aiResult.fat };
        foodDB.push(newFood); localStorage.setItem('jm_food_db', JSON.stringify(foodDB));
        selectedFood = newFood; document.getElementById('searchInput').value = newFood.name;
        showToast(appData.lang === 'en' ? "✅ AI found it! Enter amount." : "✅ الـ AI جابها! دخل الجرامات واضغط إضافة.");
        fetch(`${SCRIPT_URL}?action=addFood&name=${encodeURIComponent(aiResult.name)}&cal=${aiResult.cal}&p=${aiResult.pro}&c=${aiResult.carb}&f=${aiResult.fat}`).catch(e => console.log("error"));
    } catch (error) { showToast(appData.lang === 'en' ? "❌ AI couldn't recognize it." : "❌ الـ AI مقدرش يتعرف على الأكلة."); }
}

function addMeal() {
    const g = parseFloat(document.getElementById('gramsInput').value);
    if (!selectedFood || !g) return showToast(appData.lang === 'en' ? "Select food and amount!" : "اختر أكلة وأدخل الكمية!");
    const ratio = g / 100;
    appData.meals.push({ id: Date.now(), name: selectedFood.name, g: g, cal: selectedFood.cal * ratio, pro: selectedFood.p * ratio, carb: selectedFood.c * ratio, fat: selectedFood.f * ratio, pinned: false });
    localStorage.setItem('jm_app_data', JSON.stringify(appData));
    syncStateToServer(); // مزامنة
    document.getElementById('searchInput').value = ''; document.getElementById('gramsInput').value = ''; selectedFood = null;
    renderProgress(); renderMealsUI(); showToast(appData.lang === 'en' ? "Meal added!" : "تم إضافة الوجبة!");
}

function addMealToLog(name, cal, pro, carb, fat) {
    const meal = { id: Date.now(), name: name, g: "AI", cal: Math.round(cal), pro: Math.round(pro), carb: Math.round(carb), fat: Math.round(fat), pinned: false };
    appData.meals.push(meal); localStorage.setItem('jm_app_data', JSON.stringify(appData));
    syncStateToServer(); // مزامنة
    renderProgress(); renderMealsUI();
}

function deleteMeal(id) { appData.meals = appData.meals.filter(m => m.id !== id); localStorage.setItem('jm_app_data', JSON.stringify(appData)); syncStateToServer(); renderProgress(); renderMealsUI(); }
function resetDay() { if (!confirm(appData.lang === 'en' ? "Clear all?" : "مسح الكل؟")) return; appData.meals = []; localStorage.setItem('jm_app_data', JSON.stringify(appData)); syncStateToServer(); renderProgress(); renderMealsUI(); }

function renderMealsUI() {
    const list = document.getElementById('mealsList'); list.innerHTML = '';
    appData.meals.forEach(m => { list.innerHTML += `<div class="meal-item"><div><b>${m.name}</b> (${m.g}g)<div class="meal-macros">${m.cal.toFixed(0)} Cal | P:${m.pro.toFixed(1)} | C:${m.carb.toFixed(1)} | F:${m.fat.toFixed(1)}</div></div><button class="delete-btn" onclick="deleteMeal(${m.id})">❌</button></div>`; });
}

function updateWater(amt) { 
    waterIntake += amt; if (waterIntake < 0) waterIntake = 0; 
    document.getElementById('waterCount').innerText = `${waterIntake} 💧`; 
    syncStateToServer(); // مزامنة
}

function updatePhotoStatus() {
    const input = document.getElementById('progressPhoto'); const status = document.getElementById('photoStatus'); const label = document.getElementById('photoLabel');
    const isEn = (appData.lang === 'en');
    if (input && input.files && input.files[0]) { 
        if(status) { status.innerHTML = (isEn ? "✅ Selected: " : "✅ تم اختيار الصورة: ") + input.files[0].name.substring(0, 15) + "..."; status.style.color = "var(--primary)"; }
        if(label) { label.style.border = "1px solid var(--primary)"; label.style.background = "rgba(74, 222, 128, 0.1)"; }
    } else { 
        if(status) { status.innerHTML = isEn ? "📸 Add Progress Photo (Optional)" : "📸 ضيف صورة تطور (اختياري)"; status.style.color = "#fff"; }
        if(label) { label.style.border = "1px solid rgba(255,255,255,0.1)"; label.style.background = "rgba(0,0,0,0.3)"; }
    }
}

function renderHistoryUI() {
    const list = document.getElementById('historyList'); if (!list) return;
    const isEn = appData.lang === 'en';
    if (!appData.history || appData.history.length === 0) { list.innerHTML = `<p style="text-align:center; color:var(--text-secondary); margin-top: 20px;">${uiTranslations[appData.lang].noHistory}</p>`; return; }
    let html = "";
    appData.history.forEach(h => {
        html += `<div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:12px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);">
            <div style="color:var(--primary); font-weight:bold; margin-bottom:10px; font-size:1.1rem;">📅 ${h.date}</div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.95rem;"><span>🍔 ${isEn ? "Calories" : "السعرات"}: <b>${h.cal}</b></span><span>💧 ${isEn ? "Water" : "الماية"}: <b>${h.water}</b></span></div>
            ${h.workouts ? `<div style="font-size:0.85rem; color:var(--text-secondary); white-space:pre-wrap; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">🏋️ ${isEn ? "Weights" : "الأوزان"}:\n${h.workouts}</div>` : ''}
        </div>`;
    });
    list.innerHTML = html;
}

async function saveDailyLog() {
    const isEn = appData.lang === 'en';
    document.getElementById('submitBtn').innerText = isEn ? "Sending..." : "جاري الإرسال...";
    let notes = document.getElementById('dailyNotes').value;
    if (appData.meals.length > 0) { notes += "\n الأكل المسجل: " + appData.meals.map(m => `${m.name}(${m.g}g)`).join(", "); }
    let workoutsData = appData.dailyWorkouts || "";
    
    let totalCal = appData.meals.reduce((sum, m) => sum + m.cal, 0);
    appData.history.unshift({ date: new Date().toLocaleDateString(isEn ? 'en-GB' : 'ar-EG'), cal: Math.round(totalCal), workouts: workoutsData, water: waterIntake });
    if(appData.history.length > 30) appData.history.pop(); 
    
    let photoUrl = ""; const photoInput = document.getElementById('progressPhoto');
    if (photoInput && photoInput.files[0]) {
        const formData = new FormData(); formData.append("image", photoInput.files[0]);
        try { const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: formData }); photoUrl = (await imgRes.json()).data.url; } catch(e) {}
    }
    
    fetch(`${SCRIPT_URL}?action=saveLog&clientId=${currentClientId}&pass=${encodeURIComponent(appData.clientPass || "")}&water=${waterIntake}&notes=${encodeURIComponent(notes)}&photoUrl=${encodeURIComponent(photoUrl)}&workouts=${encodeURIComponent(workoutsData)}`)
        .then(res => res.json()).then(data => {
            if (data.status === 'success') { 
                showToast(isEn ? "Report sent! 🚀" : "تم إرسال التقرير 🚀"); 
                document.getElementById('submitBtn').innerText = isEn ? "Send to Coach 🚀" : "ابعت التقرير للكوتش 🚀"; 
                document.getElementById('dailyNotes').value = ""; appData.dailyWorkouts = ""; 
                appData.meals = []; waterIntake = 0; localStorage.setItem('jm_app_data', JSON.stringify(appData));
                syncStateToServer(); // تفريغ اليوم من السيرفر بعد الإرسال
                renderProgress(); renderMealsUI(); renderHistoryUI(); document.getElementById('waterCount').innerText = `0 💧`;
                if(photoInput) photoInput.value = ""; updatePhotoStatus();
            } else { showToast(isEn ? "Error! Check data." : "حدث خطأ!"); document.getElementById('submitBtn').innerText = isEn ? "Send to Coach 🚀" : "ابعت التقرير للكوتش 🚀"; }
        }).catch(err => { showToast(isEn ? "Server Error" : "خطأ خادم"); document.getElementById('submitBtn').innerText = isEn ? "Send to Coach 🚀" : "ابعت التقرير للكوتش 🚀"; });
}

async function analyzeFoodAI(input) {
    const file = input.files[0]; 
    if (!file) return;
    const isEn = appData.lang === 'en';
    showToast(isEn ? "✨ Analyzing image... ⏳" : "✨ جاري التحليل... ⏳");
    const reader = new FileReader(); 
    reader.readAsDataURL(file);
    reader.onload = async function () {
        const base64Image = reader.result.split(',')[1];
        const promptText = `أنت خبير تغذية محترف. حلل صورة الطعام هذه. تعرف على المكونات، قدر الحجم والوزن بالجرامات تقريباً بمجرد النظر، ثم احسب السعرات الحرارية، البروتين، الكاربوهيدرات، والدهون الكلية. رد بكود JSON فقط لا غير بهذا الشكل بالضبط: {"name": "اسم الوجبة والكمية التقريبية", "cal": السعرات, "pro": البروتين, "carb": الكارب, "fat": الدهون}`;
        const requestBody = { contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType: file.type, data: base64Image } }] }] };
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, { 
                method: "POST", 
                headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY }, 
                body: JSON.stringify(requestBody) 
            });
            const data = await response.json();
            if (data.error) { showToast(isEn ? "❌ API Error." : "❌ خطأ في السيرفر أو المفتاح."); input.value = ""; return; }
            let aiText = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
            const aiResult = JSON.parse(aiText);
            addMealToLog("✨ " + aiResult.name, aiResult.cal, aiResult.pro, aiResult.carb, aiResult.fat);
            showToast(isEn ? "✅ Meal calculated & added!" : "✅ تم حساب الوجبة وإضافتها بنجاح!");
            input.value = ""; 
        } catch (error) { 
            showToast(isEn ? "❌ Couldn't recognize the meal." : "❌ الصورة مش واضحة، حاول تصور الطبق تاني."); 
            input.value = ""; 
        }
    };
}
async function toggleScanner() {
    const container = document.getElementById('scannerContainer');
    if (isScannerOpen) { if (zxingReader) zxingReader.reset(); container.style.display = 'none'; isScannerOpen = false;
    } else {
        container.style.display = 'block'; isScannerOpen = true;
        if (!zxingReader) zxingReader = new ZXing.BrowserMultiFormatReader();
        try { zxingReader.decodeFromVideoDevice(null, 'scannerVideo', (result, err) => { if (result) { zxingReader.reset(); container.style.display = 'none'; isScannerOpen = false; fetchProductByBarcode(result.text); } });
        } catch (err) { showToast(appData.lang === 'en' ? "❌ Camera Error" : "❌ خطأ في الكاميرا"); }
    }
}

async function fetchProductByBarcode(barcode) {
    const isEn = appData.lang === 'en'; showToast(isEn ? "🔍 Searching product..." : "🔍 جاري البحث...");
    try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`); const data = await res.json();
        if (data.status === 1) {
            const p = data.product; const name = p.product_name || "Unknown"; const nut = p.nutriments;
            const cal = nut['energy-kcal_100g'] || 0; const pro = nut.proteins_100g || 0; const carb = nut.carbohydrates_100g || 0; const fat = nut.fat_100g || 0;
            selectedFood = { id: Date.now(), name: name + " 🛒", cal: cal, p: pro, c: carb, f: fat };
            document.getElementById('searchInput').value = name; showToast(isEn ? `✅ Found: ${name}` : `✅ تم العثور على: ${name}`);
        } else { showToast(isEn ? "❌ Not found." : "❌ غير مسجل."); }
    } catch (err) { showToast(isEn ? "❌ Connection Error." : "❌ خطأ في الاتصال."); }
}

init();
