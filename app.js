const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyqY4lVP1T8OcJmZzwGWC6yjIGsx1Tm2bDLXVSZVn7c-ZbJajc1FicI-N25iuHdzseDrQ/exec"; 
const GEMINI_KEY = "AQ.Ab8RN6Ko0MIWGxECtes_XOAfxBpIBbBEoixANLl-aQZsZhiVaA"; // حط مفتاح جوجل هنا
const IMGBB_KEY = "3b5826821ec6486f42b5f719c97795ff"; 

let appData = JSON.parse(localStorage.getItem('jm_app_data')) || { theme: 'dark', lang: 'ar', meals: [], target: null };
let foodDB = JSON.parse(localStorage.getItem('jm_food_db')) || [
  {id: 1, name: "صدور دجاج مسلوق", cal: 165, p: 31, c: 0, f: 3.6},
  {id: 2, name: "أرز أبيض مطبوخ", cal: 130, p: 2.7, c: 28, f: 0.3},
  {id: 3, name: "بيض مسلوق", cal: 155, p: 13, c: 1.1, f: 11},
  {id: 4, name: "شوفان", cal: 389, p: 17, c: 66, f: 7}
];

let currentClientId = ""; let waterIntake = 0; let codeReader = null; let isScannerOpen = false; let selectedFood = null;

const dict = {
  ar: { login: "تسجيل الدخول", planTitle: "📋 خطة الكوتش", progTitle: "متابعة اليوم", cal: "السعرات", pro: "البروتين", carb: "الكارب", fat: "الدهون", addTitle: "إضافة وجبة إضافية", addBtn: "إضافة الوجبة +", searchPlaceholder: "ابحث عن أكلة...", customTitle: "إضافة أكلة جديدة لقاعدتك", saveBtn: "حفظ بقاعدة البيانات", historyTitle: "سجل اليوم", resetBtn: "إعادة ضبط 🔄", reportTitle: "الماء والتقرير" },
  en: { login: "Login", planTitle: "📋 Coach's Plan", progTitle: "Daily Progress", cal: "Calories", pro: "Protein", carb: "Carbs", fat: "Fats", addTitle: "Add Extra Meal", addBtn: "Add Meal +", searchPlaceholder: "Search food...", customTitle: "Add New Food to DB", saveBtn: "Save to DB", historyTitle: "Today's Log", resetBtn: "Reset 🔄", reportTitle: "Water & Report" }
};

function showToast(msg) { const t = document.getElementById("toast"); t.innerText = msg; t.className = "show"; setTimeout(() => t.className = t.className.replace("show", ""), 3000); }

// --- الإعدادات واللغة والذاكرة ---
function init() {
    document.documentElement.setAttribute('data-theme', appData.theme);
    document.getElementById('themeBtn').textContent = appData.theme === 'dark' ? '☀️' : '🌙';
    applyLang();
}

function toggleTheme() {
    appData.theme = appData.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', appData.theme);
    document.getElementById('themeBtn').textContent = appData.theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('jm_app_data', JSON.stringify(appData));
}

function toggleLang() {
    appData.lang = appData.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('jm_app_data', JSON.stringify(appData));
    applyLang(); renderMealsUI();
}

function applyLang() {
    const l = appData.lang; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('langBtn').textContent = l === 'ar' ? 'EN' : 'AR';
    const t = dict[l];
    document.getElementById('t_login').textContent = t.login; document.getElementById('t_planTitle').textContent = t.planTitle;
    document.getElementById('t_progTitle').textContent = t.progTitle; document.getElementById('t_cal').textContent = t.cal;
    document.getElementById('t_pro').textContent = t.pro; document.getElementById('t_carb').textContent = t.carb;
    document.getElementById('t_fat').textContent = t.fat; document.getElementById('t_addTitle').textContent = t.addTitle;
    document.getElementById('t_addBtn').textContent = t.addBtn; document.getElementById('searchInput').placeholder = t.searchPlaceholder;
    document.getElementById('t_customTitle').textContent = t.customTitle; document.getElementById('t_saveFoodBtn').textContent = t.saveBtn;
    document.getElementById('t_historyTitle').textContent = t.historyTitle; document.getElementById('t_resetBtn').textContent = t.resetBtn;
    document.getElementById('t_reportTitle').textContent = t.reportTitle;
}

function exportDB() {
    navigator.clipboard.writeText(btoa(unescape(encodeURIComponent(JSON.stringify(foodDB)))));
    showToast("تم نسخ قاعدة الأكلات!");
}
function importDB() {
    const code = prompt("أدخل كود النسخ الاحتياطي:");
    if(code) { try { foodDB = JSON.parse(decodeURIComponent(escape(atob(code.trim())))); localStorage.setItem('jm_food_db', JSON.stringify(foodDB)); showToast("تم الاستعادة بنجاح!"); } catch(e) { showToast("كود غير صحيح!"); } }
}

// --- الدخول والماكروز ---
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
                document.getElementById('coachPlanText').textContent = data.plan; // عرض خطة الكوتش
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                renderProgress(); renderMealsUI(); showToast("تم الدخول!");
            } else { showToast("بيانات غير صحيحة!"); document.getElementById('loginBtn').innerText = "دخول"; }
        }).catch(err => showToast("خطأ في الاتصال"));
}

function renderProgress() {
    if(!appData.target) return;
    let curr = { cal: 0, p: 0, c: 0, f: 0 };
    appData.meals.forEach(m => { curr.cal+=m.cal; curr.p+=m.pro; curr.c+=m.carb; curr.f+=m.fat; });

    const update = (key, current, tgt, unit="g") => {
        const bar = document.getElementById(key + 'Bar'); const text = document.getElementById(key + 'Text');
        bar.style.width = Math.min((current / tgt) * 100, 100) + '%';
        text.textContent = `${Math.round(current)} / ${tgt}${unit}`;
        if(current > tgt) bar.classList.add('overlimit'); else bar.classList.remove('overlimit');
    };
    update('cal', curr.cal, appData.target.cal, ''); update('prot', curr.p, appData.target.pro);
    update('carb', curr.c, appData.target.carb); update('fat', curr.f, appData.target.fat);
}

// --- البحث والباركود ---
function handleSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase(); const box = document.getElementById('suggestions');
    box.innerHTML = ''; if(q === '') { box.style.display = 'none'; return; }
    const results = foodDB.filter(f => f.name.toLowerCase().includes(q));
    box.style.display = 'block';
    if(results.length > 0) {
        results.forEach(f => {
            let div = document.createElement('div'); div.className = 'suggestion-item'; div.innerText = f.name;
            div.onclick = () => { selectedFood = f; document.getElementById('searchInput').value = f.name; box.style.display = 'none'; };
            box.appendChild(div);
        });
    } else {
        let div = document.createElement('div'); div.className = 'suggestion-item'; div.innerHTML = `➕ إضافة "${q}" كأكلة جديدة`;
        div.onclick = () => { document.getElementById('suggestions').style.display = 'none'; document.getElementById('foodFormCard').style.display = 'block'; document.getElementById('foodName').value = q; };
        box.appendChild(div);
    }
}

function saveFoodDB() {
    const name = document.getElementById('foodName').value.trim(); const cal = parseFloat(document.getElementById('foodCal').value);
    const p = parseFloat(document.getElementById('foodPro').value); const c = parseFloat(document.getElementById('foodCarb').value); const f = parseFloat(document.getElementById('foodFat').value);
    if(!name || isNaN(cal)) return showToast("أكمل البيانات المطلوبة!");
    foodDB.push({ id: Date.now(), name, cal, p, c, f }); localStorage.setItem('jm_food_db', JSON.stringify(foodDB));
    showToast("تم الحفظ في قاعدتك!"); cancelEdit(); selectedFood = foodDB[foodDB.length-1]; document.getElementById('searchInput').value = name;
}
function cancelEdit() { document.getElementById('foodFormCard').style.display = 'none'; }

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
            document.getElementById('foodFormCard').style.display = 'block';
            document.getElementById('foodName').value = p.product_name || "منتج جديد";
            document.getElementById('foodCal').value = nut['energy-kcal_100g'] || 0;
            document.getElementById('foodPro').value = nut['proteins_100g'] || 0;
            document.getElementById('foodCarb').value = nut['carbohydrates_100g'] || 0;
            document.getElementById('foodFat').value = nut['fat_100g'] || 0;
            showToast("تم قراءة المنتج، تأكد من البيانات واحفظه!");
        } else { showToast("منتج غير معروف، أدخله يدوياً."); }
    });
}

// --- الوجبات ---
function addMeal() {
    const g = parseFloat(document.getElementById('gramsInput').value);
    if(!selectedFood || !g) return showToast("اختر أكلة وأدخل الكمية بالجرام!");
    const ratio = g / 100;
    appData.meals.push({ id: Date.now(), name: selectedFood.name, g: g, cal: selectedFood.cal*ratio, pro: selectedFood.p*ratio, carb: selectedFood.c*ratio, fat: selectedFood.f*ratio, pinned: false });
    localStorage.setItem('jm_app_data', JSON.stringify(appData));
    document.getElementById('searchInput').value = ''; document.getElementById('gramsInput').value = ''; selectedFood = null;
    renderProgress(); renderMealsUI(); showToast("تم إضافة الوجبة!");
}

function deleteMeal(id) { appData.meals = appData.meals.filter(m => m.id !== id); localStorage.setItem('jm_app_data', JSON.stringify(appData)); renderProgress(); renderMealsUI(); }
function togglePin(id) { const m = appData.meals.find(x => x.id === id); if(m) { m.pinned = !m.pinned; localStorage.setItem('jm_app_data', JSON.stringify(appData)); renderMealsUI(); } }
function resetDay() { if(!confirm("هل أنت متأكد؟ سيتم مسح الوجبات غير المثبتة.")) return; appData.meals = appData.meals.filter(m => m.pinned); localStorage.setItem('jm_app_data', JSON.stringify(appData)); renderProgress(); renderMealsUI(); }

function renderMealsUI() {
    const list = document.getElementById('mealsList'); list.innerHTML = '';
    [...appData.meals].sort((a,b)=> (b.pinned?1:0)-(a.pinned?1:0)).forEach(m => {
        list.innerHTML += `
        <div class="meal-item ${m.pinned ? 'pinned':''}">
            <div><b>${m.name}</b> (${m.g}g)<div class="meal-macros">${m.cal.toFixed(0)} Cal | P:${m.pro.toFixed(1)} | C:${m.carb.toFixed(1)} | F:${m.fat.toFixed(1)}</div></div>
            <div class="meal-actions"><button class="pin-btn" onclick="togglePin(${m.id})">${m.pinned?'⭐':'☆'}</button><button class="delete-btn" onclick="deleteMeal(${m.id})">❌</button></div>
        </div>`;
    });
}

// --- الإرسال لجوجل ---
function updateWater(amt) { waterIntake += amt; if(waterIntake < 0) waterIntake = 0; document.getElementById('waterCount').innerText = `${waterIntake} 💧`; }

async function saveDailyLog() {
    document.getElementById('submitBtn').innerText = "جاري الإرسال...";
    let notes = document.getElementById('dailyNotes').value;
    if(appData.meals.length > 0) { notes += " | الأكل الإضافي/المسجل: " + appData.meals.map(m => `${m.name}(${m.g}g)`).join(", "); }
    let photoUrl = ""; const photoInput = document.getElementById('progressPhoto').files[0];
    if(photoInput) {
        const formData = new FormData(); formData.append("image", photoInput);
        try { const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: formData }); photoUrl = (await imgRes.json()).data.url; } catch(e) {}
    }
    fetch(`${SCRIPT_URL}?action=saveLog&clientId=${currentClientId}&water=${waterIntake}&notes=${encodeURIComponent(notes)}&photoUrl=${encodeURIComponent(photoUrl)}`)
        .then(res => res.json()).then(data => {
            if(data.status === 'success') { showToast("تم الإرسال بنجاح 🚀"); document.getElementById('submitBtn').innerText = "إرسال التقرير للكوتش 🚀"; }
        });
}
fetch(`${SCRIPT_URL}?action=saveLog&clientId=${currentClientId}&water=${waterIntake}&notes=${encodeURIComponent(notes)}&photoUrl=${encodeURIComponent(photoUrl)}`)
        .then(res => res.json()).then(data => {
            if(data.status === 'success') { showToast("تم الإرسال بنجاح 🚀"); document.getElementById('submitBtn').innerText = "إرسال التقرير للكوتش 🚀"; }
        });
}

// --- دالة الذكاء الاصطناعي السحرية (ده المكان الصح بتاعها) ---
async function analyzeFoodAI(input) {
    const file = input.files[0];
    if (!file) return;

    showToast("✨ جاري تحليل الطبق بالذكاء الاصطناعي... ثواني يا بطل ⏳");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function () {
        const base64Image = reader.result.split(',')[1];

        const promptText = `أنت خبير تغذية. حلل صورة الطعام هذه. قدر حجم الحصة التقريبي بالجرامات، ثم احسب السعرات الحرارية، البروتين، الكربوهيدرات، والدهون. 
        يجب أن ترد فقط بكود JSON صحيح بهذا الشكل دون أي نصوص إضافية أو علامات:
        {"name": "اسم الوجبة بالعربي مع الكمية التقديرية", "cal": السعرات, "pro": البروتين, "carb": الكارب, "fat": الدهون}`;

        const requestBody = {
            contents: [{
                parts: [
                    { text: promptText },
                    { inlineData: { mimeType: file.type, data: base64Image } }
                ]
            }]
        };

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            if (data.error) throw new Error("API Error");

            let aiText = data.candidates[0].content.parts[0].text;
            aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
            const aiResult = JSON.parse(aiText);

            addMealToLog("✨ " + aiResult.name, aiResult.cal, aiResult.pro, aiResult.carb, aiResult.fat);
            
            showToast("✅ الـ AI حلل طبقك وخصمه من الماكروز بنجاح!");

        } catch (error) {
            showToast("❌ الـ AI مقدرش يتعرف على الصورة بوضوح، صورها في إضاءة أحسن.");
            console.error(error);
        }
    };
}

init(); // ده سطر تشغيل الأبليكيشن، خليه في الآخر خالص دايماً

init();
