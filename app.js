const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxoLG0yyYYfCmtyfa2r637ydD0_8WzsluqEtk8aXLqHD0cbqC6t9ukKAZoP2KpXRmpt6Q/exec"; 
const GEMINI_KEY = "AQ.Ab8RN6Ko0MIWGxECtes_XOAfxBpIBbBEoixANLl-aQZsZhiVaA"; // حط مفتاح جوجل هنا
const IMGBB_KEY = "3b5826821ec6486f42b5f719c97795ff"; 

let appData = JSON.parse(localStorage.getItem('jm_app_data')) || { theme: 'dark', lang: 'ar', meals: [], target: null, dailyWorkouts: "" };

// --- قاعدة البيانات الضخمة (30 أكلة أساسية) ---
const defaultFoods = [
  {id: 1, name: "صدور دجاج مسلوق/مشوي", cal: 165, p: 31, c: 0, f: 3.6},
  {id: 2, name: "أرز أبيض مطبوخ", cal: 130, p: 2.7, c: 28, f: 0.3},
  {id: 3, name: "بيض مسلوق (بيضة كاملة)", cal: 155, p: 13, c: 1.1, f: 11},
  {id: 4, name: "بياض بيض مسلوق", cal: 52, p: 11, c: 0.7, f: 0.2},
  {id: 5, name: "شوفان", cal: 389, p: 17, c: 66, f: 7},
  {id: 6, name: "موز", cal: 89, p: 1.1, c: 23, f: 0.3},
  {id: 7, name: "بطاطس مسلوقة", cal: 87, p: 1.9, c: 20, f: 0.1},
  {id: 8, name: "بطاطا حلوة مسلوقة", cal: 86, p: 1.6, c: 20, f: 0.1},
  {id: 9, name: "تونة معلبة في ماء", cal: 116, p: 26, c: 0, f: 1},
  {id: 10, name: "جبنة قريش", cal: 98, p: 11, c: 3.4, f: 4.3},
  {id: 11, name: "فول مدمس", cal: 110, p: 7.6, c: 20, f: 0.5},
  {id: 12, name: "عدس مطبوخ", cal: 116, p: 9, c: 20, f: 0.4},
  {id: 13, name: "لحم مفروم (قليل الدسم)", cal: 250, p: 26, c: 0, f: 15},
  {id: 14, name: "سمك بلطي مشوي", cal: 128, p: 26, c: 0, f: 2.7},
  {id: 15, name: "مكرونة مسلوقة", cal: 158, p: 5.8, c: 31, f: 0.9},
  {id: 16, name: "خبز بلدي (عيش مصري)", cal: 275, p: 9, c: 58, f: 1.5},
  {id: 17, name: "حليب كامل الدسم", cal: 61, p: 3.2, c: 4.8, f: 3.3},
  {id: 18, name: "حليب خالي الدسم", cal: 35, p: 3.4, c: 5, f: 0.1},
  {id: 19, name: "لوز نيء", cal: 579, p: 21, c: 22, f: 50},
  {id: 20, name: "فول سوداني", cal: 567, p: 26, c: 16, f: 49},
  {id: 21, name: "زبدة فول سوداني", cal: 588, p: 25, c: 20, f: 50},
  {id: 22, name: "زيت زيتون", cal: 884, p: 0, c: 0, f: 100},
  {id: 23, name: "تفاح", cal: 52, p: 0.3, c: 14, f: 0.2},
  {id: 24, name: "برتقال", cal: 47, p: 0.9, c: 12, f: 0.1},
  {id: 25, name: "خيار", cal: 15, p: 0.7, c: 3.6, f: 0.1},
  {id: 26, name: "طماطم", cal: 18, p: 0.9, c: 3.9, f: 0.2},
  {id: 27, name: "زبادي يوناني (سادة)", cal: 97, p: 9, c: 4, f: 5},
  {id: 28, name: "زبادي عادي", cal: 61, p: 3.5, c: 4.7, f: 3.3},
  {id: 29, name: "واي بروتين سكوب", cal: 120, p: 24, c: 3, f: 1.5},
  {id: 30, name: "تمر", cal: 282, p: 2.5, c: 75, f: 0.4}
];

let foodDB = JSON.parse(localStorage.getItem('jm_food_db')) || [];
if (foodDB.length < 15) {
    foodDB = defaultFoods;
    localStorage.setItem('jm_food_db', JSON.stringify(foodDB));
}

let currentClientId = ""; 
let waterIntake = 0; 
let codeReader = null; 
let isScannerOpen = false; 
let selectedFood = null; 
let clientWorkoutsData = "";

function showToast(msg) { 
    const t = document.getElementById("toast"); t.innerText = msg; t.className = "show"; 
    setTimeout(() => t.className = t.className.replace("show", ""), 3000); 
}

// --- التنقل بين التابات والسحب (Swipe) ---
const tabsList = ['dashboard', 'nutrition', 'workouts'];
let currentTabIndex = 0;

function switchTab(tabName, element) {
    currentTabIndex = tabsList.indexOf(tabName);
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.animation = 'none'; 
    });
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.classList.add('active');
    void activeTab.offsetWidth; 
    activeTab.style.animation = 'swipeAnim 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards';
    
    element.classList.add('active');
}

let touchstartX = 0; let touchstartY = 0; let touchendX = 0; let touchendY = 0;

document.addEventListener('touchstart', function(e) {
    touchstartX = e.changedTouches[0].screenX;
    touchstartY = e.changedTouches[0].screenY;
}, {passive: true});

document.addEventListener('touchend', function(e) {
    touchendX = e.changedTouches[0].screenX;
    touchendY = e.changedTouches[0].screenY;
    handleSwipe();
}, {passive: true});

function handleSwipe() {
    const xDiff = Math.abs(touchendX - touchstartX);
    const yDiff = Math.abs(touchendY - touchstartY);
    if (xDiff > yDiff && xDiff > 60) {
        if (touchendX < touchstartX) {
            if(currentTabIndex < tabsList.length - 1) { currentTabIndex++; activateTabByIndex(currentTabIndex); }
        } else {
            if(currentTabIndex > 0) { currentTabIndex--; activateTabByIndex(currentTabIndex); }
        }
    }
}

function activateTabByIndex(index) {
    const navItems = document.querySelectorAll('.nav-item');
    switchTab(tabsList[index], navItems[index]);
}

// --- الإعدادات ---
function init() {
    document.body.setAttribute('data-theme', appData.theme);
    document.documentElement.setAttribute('data-theme', appData.theme);
    document.getElementById('themeBtn').textContent = appData.theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    appData.theme = appData.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', appData.theme);
    document.documentElement.setAttribute('data-theme', appData.theme);
    document.getElementById('themeBtn').textContent = appData.theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('jm_app_data', JSON.stringify(appData));
}

// --- الدخول ---
function login() {
    const id = document.getElementById('clientIdInput').value.trim(); const pass = document.getElementById('clientPassInput').value.trim();
    if (!id || !pass) return showToast("أدخل الكود وكلمة المرور!");
    
    document.getElementById('loginBtn').innerText = "جاري التحميل...";
    fetch(`${SCRIPT_URL}?action=getMacros&clientId=${id}&pass=${pass}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                currentClientId = id;
                appData.target = { cal: data.calories, pro: data.protein, carb: data.carbs, fat: data.fats };
                document.getElementById('coachPlanText').textContent = data.plan || "التزم بالماكروز المحددة."; 
                clientWorkoutsData = data.workouts || ""; 
                
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('mainApp').style.display = 'block';
                document.getElementById('bottomNav').style.display = 'flex';
                
                renderProgress(); renderMealsUI(); renderWorkoutsUI();
                showToast("تم الدخول بنجاح! 🔥");
            } else { showToast("بيانات غير صحيحة!"); document.getElementById('loginBtn').innerText = "دخول"; }
        }).catch(err => showToast("خطأ في الاتصال بالخادم"));
}

// --- التمارين ---
function renderWorkoutsUI() {
    const container = document.getElementById('workoutsList');
    if (!clientWorkoutsData) {
        container.innerHTML = "<p style='text-align:center;'>لا توجد تمارين مخصصة.</p>";
        return;
    }

    const lines = clientWorkoutsData.split('\n');
    let html = "";
    let currentDayOpen = false;

    lines.forEach((line, index) => {
        if (!line.trim()) return;
        
        if (!line.includes('|')) {
            if (currentDayOpen) html += `</div></details>`;
            html += `
            <details style="background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 15px; padding: 15px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <summary style="font-weight: bold; font-size: 1.2rem; color: var(--primary); cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📅 ${line.trim()}</span>
                    <span style="font-size: 0.8rem; background: var(--primary); color: #fff; padding: 4px 10px; border-radius: 8px;">افتح التمرين ⬇️</span>
                </summary>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            `;
            currentDayOpen = true;
            return;
        }

        const parts = line.split('|');
        const exName = parts[0] ? parts[0].trim() : `تمرين`;
        const setsCount = parseInt(parts[1]) || 3;
        const targetReps = parts[2] ? parts[2].trim() : "10-12";
        const videoUrl = parts[3] ? parts[3].trim() : "";

        if (!currentDayOpen) {
            html += `
            <details open style="background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 15px; padding: 15px; margin-bottom: 15px;">
                <summary style="font-weight: bold; font-size: 1.2rem; color: var(--primary); cursor: pointer; list-style: none;">📅 تمارين الأسبوع</summary>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            `;
            currentDayOpen = true;
        }

        html += `
        <div class="exercise-card" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 15px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">
            <div class="exercise-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span class="exercise-title" style="font-weight: bold; font-size: 1.05rem; color: var(--text-primary);">🏋️ ${exName} (${targetReps} عدات)</span>
                ${videoUrl ? `<button class="video-btn" onclick="openVideo('${videoUrl}')" style="background: var(--nav-icon); width: auto; padding: 5px 10px; margin: 0; border-radius: 8px; font-size: 0.85rem;">🎬 فيديو</button>` : ''}
            </div>
        `;

        for (let s = 1; s <= setsCount; s++) {
            html += `
            <div class="set-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.95rem;">
                <span>المجموعة ${s}:</span>
                <div class="set-inputs" style="display: flex; gap: 8px; width: 65%;">
                    <input type="number" placeholder="وزن(كجم)" class="ex-weight" data-ex="${exName}" data-set="${s}" style="margin: 0; padding: 8px; text-align: center; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);">
                    <input type="number" placeholder="عدات" class="ex-reps" data-ex="${exName}" data-set="${s}" style="margin: 0; padding: 8px; text-align: center; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);">
                </div>
            </div>
            `;
        }
        html += `</div>`;
    });

    if (currentDayOpen) html += `</div></details>`;
    container.innerHTML = html;
}

function openVideo(url) {
    const container = document.getElementById('videoContainer');
    let embedUrl = url;
    if (url.includes("watch?v=")) embedUrl = url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
    if (url.includes("youtube.com/shorts/")) embedUrl = url.replace("youtube.com/shorts/", "youtube.com/embed/").split("?")[0]; 
    
    container.innerHTML = `<iframe width="100%" height="300" src="${embedUrl}" frameborder="0" allowfullscreen style="border-radius: 12px;"></iframe>`;
    document.getElementById('videoModal').style.display = 'flex';
}

function closeVideo() {
    document.getElementById('videoContainer').innerHTML = '';
    document.getElementById('videoModal').style.display = 'none';
}

function saveWorkoutLog() {
    let workoutText = "";
    const weights = document.querySelectorAll('.ex-weight');
    let hasData = false;
    
    weights.forEach(input => {
        const ex = input.getAttribute('data-ex');
        const set = input.getAttribute('data-set');
        const weight = input.value;
        const repsInput = document.querySelector(`.ex-reps[data-ex="${ex}"][data-set="${set}"]`);
        const reps = repsInput ? repsInput.value : 0;

        if (weight || reps) {
            workoutText += `- ${ex} (مجموعة ${set}): ${weight || 0} كجم × ${reps || 0} عدات\n`;
            hasData = true;
            input.value = "";
            if(repsInput) repsInput.value = "";
        }
    });

    if (!hasData) return showToast("⚠️ لم تقم بإدخال أي أوزان أو عدات للحفظ!");

    appData.dailyWorkouts = (appData.dailyWorkouts || "") + workoutText;
    localStorage.setItem('jm_app_data', JSON.stringify(appData));

    showToast("✅ تم حفظ أوزانك بنجاح! اذهب لتاب الخطة واضغط إرسال التقرير.");
    activateTabByIndex(0); // العودة لتاب الخطة
}

// --- الأكل والماكروز ---
function renderProgress() {
    if (!appData.target) return;
    let curr = { cal: 0, p: 0, c: 0, f: 0 };
    appData.meals.forEach(m => { curr.cal += m.cal; curr.p += m.pro; curr.c += m.carb; curr.f += m.fat; });
    const update = (key, current, tgt, unit = "g") => {
        const bar = document.getElementById(key + 'Bar'); const text = document.getElementById(key + 'Text');
        if (bar && text) {
            bar.style.width = Math.min((current / tgt) * 100, 100) + '%';
            text.textContent = `${Math.round(current)} / ${tgt}${unit}`;
            if (current > tgt) bar.classList.add('overlimit'); else bar.classList.remove('overlimit');
        }
    };
    update('cal', curr.cal, appData.target.cal, ''); update('prot', curr.p, appData.target.pro); update('carb', curr.c, appData.target.carb); update('fat', curr.f, appData.target.fat);
}

function handleSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase().trim(); 
    const box = document.getElementById('suggestions');
    box.innerHTML = ''; 
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
        let div = document.createElement('div'); div.className = 'suggestion-item'; div.innerHTML = `➕ إضافة "${q}" كأكلة جديدة`;
        div.onpointerdown = (e) => { e.preventDefault(); box.style.display = 'none'; showToast("أضف الأكلة عبر الباركود أو الـ AI ✨"); };
        box.appendChild(div);
    }
}

function addMeal() {
    const g = parseFloat(document.getElementById('gramsInput').value);
    if (!selectedFood || !g) return showToast("اختر أكلة وأدخل الكمية بالجرام!");
    const ratio = g / 100;
    appData.meals.push({ id: Date.now(), name: selectedFood.name, g: g, cal: selectedFood.cal * ratio, pro: selectedFood.p * ratio, carb: selectedFood.c * ratio, fat: selectedFood.f * ratio, pinned: false });
    localStorage.setItem('jm_app_data', JSON.stringify(appData));
    document.getElementById('searchInput').value = ''; document.getElementById('gramsInput').value = ''; selectedFood = null;
    renderProgress(); renderMealsUI(); showToast("تم إضافة الوجبة!");
}

function addMealToLog(name, cal, pro, carb, fat) {
    const meal = { id: Date.now(), name: name, g: "AI", cal: Math.round(cal), pro: Math.round(pro), carb: Math.round(carb), fat: Math.round(fat), pinned: false };
    appData.meals.push(meal); localStorage.setItem('jm_app_data', JSON.stringify(appData));
    renderProgress(); renderMealsUI();
}

function deleteMeal(id) { appData.meals = appData.meals.filter(m => m.id !== id); localStorage.setItem('jm_app_data', JSON.stringify(appData)); renderProgress(); renderMealsUI(); }

function resetDay() { 
    if (!confirm("مسح وجبات اليوم؟")) return; 
    appData.meals = []; localStorage.setItem('jm_app_data', JSON.stringify(appData)); 
    renderProgress(); renderMealsUI(); 
}

function renderMealsUI() {
    const list = document.getElementById('mealsList'); list.innerHTML = '';
    appData.meals.forEach(m => {
        list.innerHTML += `
        <div class="meal-item">
            <div><b>${m.name}</b> (${m.g}g)<div class="meal-macros">${m.cal.toFixed(0)} Cal | P:${m.pro.toFixed(1)} | C:${m.carb.toFixed(1)} | F:${m.fat.toFixed(1)}</div></div>
            <button class="delete-btn" onclick="deleteMeal(${m.id})">❌</button>
        </div>`;
    });
}

function updateWater(amt) { waterIntake += amt; if (waterIntake < 0) waterIntake = 0; document.getElementById('waterCount').innerText = `${waterIntake} 💧`; }

// --- إرسال التقرير النهائي والتمارين ---
async function saveDailyLog() {
    document.getElementById('submitBtn').innerText = "جاري الإرسال...";
    
    let notes = document.getElementById('dailyNotes').value;
    if (appData.meals.length > 0) { notes += "\n الأكل المسجل: " + appData.meals.map(m => `${m.name}(${m.g}g)`).join(", "); }
    
    let workoutsData = appData.dailyWorkouts || "";
    
    let photoUrl = ""; const photoInput = document.getElementById('progressPhoto');
    if (photoInput && photoInput.files[0]) {
        const formData = new FormData(); formData.append("image", photoInput.files[0]);
        try { const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: formData }); photoUrl = (await imgRes.json()).data.url; } catch(e) {}
    }
    
    fetch(`${SCRIPT_URL}?action=saveLog&clientId=${currentClientId}&water=${waterIntake}&notes=${encodeURIComponent(notes)}&photoUrl=${encodeURIComponent(photoUrl)}&workouts=${encodeURIComponent(workoutsData)}`)
        .then(res => res.json()).then(data => {
            if (data.status === 'success') { 
                showToast("تم إرسال التقرير والتمارين بنجاح 🚀"); 
                document.getElementById('submitBtn').innerText = "إرسال التقرير للكوتش 🚀"; 
                document.getElementById('dailyNotes').value = ""; 
                appData.dailyWorkouts = ""; 
                localStorage.setItem('jm_app_data', JSON.stringify(appData));
            }
        });
}

function exportDB() { navigator.clipboard.writeText(btoa(unescape(encodeURIComponent(JSON.stringify(foodDB))))); showToast("تم نسخ قاعدة الأكلات!"); }
function importDB() { const code = prompt("أدخل كود النسخ الاحتياطي:"); if(code) { try { foodDB = JSON.parse(decodeURIComponent(escape(atob(code.trim())))); localStorage.setItem('jm_food_db', JSON.stringify(foodDB)); showToast("تم الاستعادة بنجاح!"); } catch(e) { showToast("كود غير صحيح!"); } } }

function toggleScanner() {
    const container = document.getElementById('scannerContainer');
    if(isScannerOpen) { if(codeReader) codeReader.reset(); container.style.display = 'none'; isScannerOpen = false; } 
    else {
        container.style.display = 'block'; isScannerOpen = true; if(!codeReader) codeReader = new ZXing.BrowserMultiFormatReader();
        codeReader.decodeFromVideoDevice(null, 'scannerVideo', (res, err) => {
            if(res) { codeReader.reset(); container.style.display = 'none'; isScannerOpen = false; fetchBarcode(res.text); }
        });
    }
}

function fetchBarcode(code) {
    showToast("جاري البحث...");
    fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`).then(res => res.json()).then(data => {
        if(data.status === 1 && data.product) {
            const p = data.product; const nut = p.nutriments;
            showToast(`تم قراءة: ${p.product_name}. أضفه يدوياً ببياناته.`);
        } else { showToast("منتج غير معروف."); }
    });
}

async function analyzeFoodAI(input) {
    const file = input.files[0]; if (!file) return;
    showToast("✨ جاري تحليل الطبق بالذكاء الاصطناعي... ⏳");
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = async function () {
        const base64Image = reader.result.split(',')[1];
        const promptText = `أنت خبير تغذية. حلل صورة الطعام هذه. قدر الحجم بالجرامات، ثم احسب السعرات، البروتين، الكارب، والدهون. رد بـ JSON فقط: {"name": "اسم الوجبة والكمية", "cal": السعرات, "pro": البروتين, "carb": الكارب, "fat": الدهون}`;
        const requestBody = { contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType: file.type, data: base64Image } }] }] };
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
            const data = await response.json();
            let aiText = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
            const aiResult = JSON.parse(aiText);
            addMealToLog("✨ " + aiResult.name, aiResult.cal, aiResult.pro, aiResult.carb, aiResult.fat);
            showToast("✅ تم تحليل الطبق وإضافته!");
        } catch (error) { showToast("❌ تعذر التعرف على الصورة."); }
    };
}

init();
