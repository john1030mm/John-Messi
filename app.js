// 1. ضع رابط Apps Script هنا
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4-GZZKOGtj9SQSD_B68uXEggC3GHamdhrYgsJzTBL78xySzSdI94iPWUO4CnXjfkSpA/exec";
// 2. سجل مجاناً في api.imgbb.com للحصول على مفتاح مجاني لرفع الصور وضعه هنا
const IMGBB_KEY = "3b5826821ec6486f42b5f719c97795ff";

let currentClientId = "";
let waterIntake = 0;
let consumedFood = [];

// الماكروز
let targetMacros = { cal: 0, pro: 0, carb: 0, fat: 0 };
let remainingMacros = { cal: 0, pro: 0, carb: 0, fat: 0 };

// --- نظام الإشعارات (UX) ---
function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

// --- الوضع الليلي ---
function toggleTheme() {
    const body = document.body;
    if (body.getAttribute("data-theme") === "dark") {
        body.removeAttribute("data-theme");
    } else {
        body.setAttribute("data-theme", "dark");
    }
}

// --- تسجيل الدخول ---
function login() {
    const id = document.getElementById('clientIdInput').value.trim();
    const pass = document.getElementById('clientPassInput').value.trim();
    if (!id || !pass) return showToast("⚠️ أدخل الكود وكلمة المرور!");

    document.getElementById('loginBtn').innerText = "جاري التحميل...";

    fetch(`${SCRIPT_URL}?action=getMacros&clientId=${id}&pass=${pass}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                currentClientId = id;
                targetMacros = { cal: data.calories, pro: data.protein, carb: data.carbs, fat: data.fats };
                remainingMacros = { ...targetMacros }; // في بداية اليوم المتبقي هو الهدف كاملاً

                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                updateUI();
                showToast("✅ تم الدخول بنجاح");
            } else {
                showToast("❌ بيانات غير صحيحة!");
                document.getElementById('loginBtn').innerText = "تسجيل الدخول";
            }
        }).catch(err => { showToast("⚠️ خطأ في الاتصال"); });
}

// --- تحديث الأرقام في الشاشة ---
function updateUI() {
    document.getElementById('calVal').innerText = remainingMacros.cal;
    document.getElementById('proVal').innerText = remainingMacros.pro;
    document.getElementById('carbVal').innerText = remainingMacros.carb;
    document.getElementById('fatVal').innerText = remainingMacros.fat;
}

// --- تتبع المياه ---
function updateWater(amount) {
    waterIntake += amount;
    if (waterIntake < 0) waterIntake = 0;
    document.getElementById('waterCount').innerText = waterIntake;
}

// --- واجهة بدائل الأكل والأكل المخصص ---
function toggleSubstitutes() {
    const el = document.getElementById('substitutesSection');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
function toggleCustomFood() {
    const el = document.getElementById('customFoodSection');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// --- إضافة أكل مخصص للدايت ---
function addCustomFood() {
    const name = document.getElementById('cName').value || "أكلة مخصصة";
    const cal = parseInt(document.getElementById('cCal').value) || 0;
    const pro = parseInt(document.getElementById('cPro').value) || 0;
    const carb = parseInt(document.getElementById('cCarb').value) || 0;
    const fat = parseInt(document.getElementById('cFat').value) || 0;

    applyFood(name, cal, pro, carb, fat);
    showToast(`✅ تم إضافة ${name} وخصم سعراتها`);
}

// --- البحث عن الأكل باستخدام API مجاني (OpenFoodFacts) ---
function searchFood() {
    const query = document.getElementById('foodSearchInput').value;
    if (!query) return;

    document.getElementById('foodResults').innerHTML = "جاري البحث... ⏳";

    fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`)
        .then(res => res.json())
        .then(data => {
            let resultsHTML = "";
            if (data.products && data.products.length > 0) {
                // عرض أول 3 نتائج فقط
                for (let i = 0; i < 3; i++) {
                    if (!data.products[i]) break;
                    const p = data.products[i];
                    const name = p.product_name || "بدون اسم";
                    const nut = p.nutriments || {};
                    const cal = Math.round(nut['energy-kcal_100g']) || 0;
                    const pro = Math.round(nut['proteins_100g']) || 0;
                    const carb = Math.round(nut['carbohydrates_100g']) || 0;
                    const fat = Math.round(nut['fat_100g']) || 0;

                    resultsHTML += `
                <div class="food-item">
                    <span>${name} (100g)</span>
                    <button onclick="applyFood('${name}', ${cal}, ${pro}, ${carb}, ${fat})" style="width: auto; padding: 5px;">+ أضف</button>
                </div>`;
                }
                document.getElementById('foodResults').innerHTML = resultsHTML;
            } else {
                document.getElementById('foodResults').innerHTML = "لم يتم العثور على الأكلة، جرب إضافتها يدوياً.";
            }
        }).catch(() => { document.getElementById('foodResults').innerHTML = "حدث خطأ في البحث."; });
}

// خصم الأكل من السعرات الكلية
function applyFood(name, cal, pro, carb, fat) {
    remainingMacros.cal -= cal;
    remainingMacros.pro -= pro;
    remainingMacros.carb -= carb;
    remainingMacros.fat -= fat;

    consumedFood.push(`${name} (${cal} Cal)`);
    updateUI();
}

// --- إرسال التقرير الشامل والصورة للكوتش ---
async function saveDailyLog() {
    document.getElementById('submitBtn').innerText = "جاري الإرسال...";
    let finalNotes = document.getElementById('dailyNotes').value;

    // إضافة الأكل اللي العميل أضافه للتقرير
    if (consumedFood.length > 0) {
        finalNotes += " | الأكل: " + consumedFood.join(", ");
    }

    let photoUrl = "";
    const photoInput = document.getElementById('progressPhoto').files[0];

    // رفع الصورة على ImgBB لو العميل حط صورة
    if (photoInput) {
        if (IMGBB_KEY === "YOUR_IMGBB_API_KEY") {
            showToast("⚠️ لم تقم بإضافة مفتاح ImgBB كمدرب!");
        } else {
            const formData = new FormData();
            formData.append("image", photoInput);
            try {
                const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: formData });
                const imgData = await imgRes.json();
                photoUrl = imgData.data.url;
            } catch (e) {
                showToast("⚠️ فشل رفع الصورة");
            }
        }
    }

    // إرسال البيانات لجوجل شيت
    fetch(`${SCRIPT_URL}?action=saveLog&clientId=${currentClientId}&water=${waterIntake}&notes=${encodeURIComponent(finalNotes)}&photoUrl=${encodeURIComponent(photoUrl)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showToast("🎉 تم إرسال التقرير بنجاح يا بطل!");
                document.getElementById('submitBtn').innerText = "إرسال التقرير للكوتش";
            }
        });
}
