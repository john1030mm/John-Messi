const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_NYegv4cshm2nnAdiRXg6Zw0IwwdY7P7XSpMAIlgXhENc3wu_6xlY2l81OY6h9-nZtA/exec"; 
const GEMINI_KEY = "AQ.Ab8RN6Ko0MIWGxECtes_XOAfxBpIBbBEoixANLl-aQZsZhiVaA"; // حط مفتاح جوجل هنا
const IMGBB_KEY = "3b5826821ec6486f42b5f719c97795ff"; 

let appData = JSON.parse(localStorage.getItem('jm_app_data')) || { theme: 'dark', lang: 'ar', meals: [], target: null };
let foodDB = JSON.parse(localStorage.getItem('jm_food_db')) || [];

let currentClientId = ""; let waterIntake = 0; let codeReader = null; let isScannerOpen = false; let selectedFood = null; let clientWorkoutsData = "";

function showToast(msg) { 
    const t = document.getElementById("toast"); t.innerText = msg; t.className = "show"; 
    setTimeout(() => t.className = t.className.replace("show", ""), 3000); 
}

// --- التنقل بين التابات ---
function switchTab(tabName, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    element.classList.add('active');
}

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

// --- تسجيل الدخول وجلب البيانات ---
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

// --- عرض التمارين بنظام (أيام الأسبوع الذكية) ---
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
        
        // لو مفيش علامة | يبقى ده عنوان يوم (مثال: اليوم الأول: بنش)
        if (!line.includes('|')) {
            if (currentDayOpen) html += `</div></details>`; // نقفل اليوم القديم
            
            // نفتح يوم جديد
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

        // لو فيه علامة | يبقى دي تمرينة
        const parts = line.split('|');
        const exName = parts[0] ? parts[0].trim() : `تمرين`;
        const setsCount = parseInt(parts[1]) || 3;
        const targetReps = parts[2] ? parts[2].trim() : "10-12";
        const videoUrl = parts[3] ? parts[3].trim() : "";

        // لو المدرب كتب تمرينة ومكتبش اسم اليوم فوقيها، نفتحله يوم افتراضي
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
                    <input type="number" placeholder="وزن (كجم)" class="ex-weight" data-ex="${exName}" data-set="${s}" style="margin: 0; padding: 8px; text-align: center; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);">
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

// --- عرض وإغلاق فيديو التمرينة ---
function openVideo(url) {
    const container = document.getElementById('videoContainer');
    let embedUrl = url;
    if (url.includes("watch?v=")) embedUrl = url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
    
    container.innerHTML = `<iframe width="100%" height="300" src="${embedUrl}" frameborder="0" allowfullscreen style="border-radius: 12px;"></iframe>`;
    document.getElementById('videoModal').style.display = 'flex';
}

function closeVideo() {
    document.getElementById('videoContainer').innerHTML = '';
    document.getElementById('videoModal').style.display = 'none';
}

// --- حفظ الأوزان ---
function saveWorkoutLog() {
    let workoutNotes = "🏋️ أوزان التمارين المسجلة اليوم:\n";
    const weights = document.querySelectorAll('.ex-weight');
    let hasData = false;
    
    weights.forEach(input => {
        const ex = input.getAttribute('data-ex');
        const set = input.getAttribute('data-set');
        const weight = input.value;
        const repsInput = document.querySelector(`.ex-reps[data-ex="${ex}"][data-set="${set}"]`);
        const reps = repsInput ? repsInput.value : 0;

        if (weight || reps) {
            workoutNotes += `- ${ex} (مجموعة ${set}): ${weight || 0} كجم × ${reps || 0} عدات\n`;
            hasData = true;
            // تفريغ الخانات بعد الحفظ عشان العميل ميبعتهاش مرتين
            input.value = "";
            if(repsInput) repsInput.value = "";
        }
    });

    if (!hasData) return showToast("⚠️ لم تقم بإدخال أي أوزان أو عدات للحفظ!");

    document.getElementById('dailyNotes').value += "\n" + workoutNotes;
    showToast("✅ تم تسجيل أوزانك! اذهب لتاب الخطة واضغط إرسال التقرير.");
    switchTab('dashboard', document.querySelectorAll('.nav-item')[0]);
}

// --- باقي الأكواد الأساسية (الماكروز، الأكل، AI) ---
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

async function saveDailyLog() {
    document.getElementById('submitBtn').innerText = "جاري الإرسال...";
    let notes = document.getElementById('dailyNotes').value;
    if (appData.meals.length > 0) { notes += "\n الأكل المسجل: " + appData.meals.map(m => `${m.name}(${m.g}g)`).join(", "); }
    
    let photoUrl = ""; const photoInput = document.getElementById('progressPhoto');
    if (photoInput && photoInput.files[0]) {
        const formData = new FormData(); formData.append("image", photoInput.files[0]);
        try { const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: formData }); photoUrl = (await imgRes.json()).data.url; } catch(e) {}
    }
    
    fetch(`${SCRIPT_URL}?action=saveLog&clientId=${currentClientId}&water=${waterIntake}&notes=${encodeURIComponent(notes)}&photoUrl=${encodeURIComponent(photoUrl)}`)
        .then(res => res.json()).then(data => {
            if (data.status === 'success') { 
                showToast("تم إرسال التقرير والتمارين بنجاح 🚀"); 
                document.getElementById('submitBtn').innerText = "إرسال التقرير للكوتش 🚀"; 
                document.getElementById('dailyNotes').value = ""; // تفريغ بعد الإرسال
            }
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
