
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrQ4UJA9mUUgcsJk3wWhRnyZ86qngkpgcCqaUNxH3gs7HEv8_ANzXNXDkR5zM1-wIlBQ/exec";

let currentClientId = "";
let waterIntake = 0;

function login() {
    const id = document.getElementById('clientIdInput').value.trim();
    const pass = document.getElementById('clientPassInput').value.trim();

    if (!id || !pass) return alert("الرجاء إدخال كود العميل وكلمة المرور!");

    document.getElementById('loginBtn').innerText = "جاري التحميل...";

    fetch(`${SCRIPT_URL}?action=getMacros&clientId=${id}&pass=${pass}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                currentClientId = id;
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';

                document.getElementById('calVal').innerText = data.calories;
                document.getElementById('proVal').innerText = data.protein;
                document.getElementById('carbVal').innerText = data.carbs;
                document.getElementById('fatVal').innerText = data.fats;
            } else {
                alert("كود العميل أو كلمة المرور غير صحيحة!");
                document.getElementById('loginBtn').innerText = "تسجيل الدخول";
            }
        })
        .catch(err => {
            alert("حدث خطأ في الاتصال.");
            document.getElementById('loginBtn').innerText = "تسجيل الدخول";
        });
}

function updateWater(amount) {
    waterIntake += amount;
    if (waterIntake < 0) waterIntake = 0;
    document.getElementById('waterCount').innerText = waterIntake;
}

function saveDailyLog() {
    const notes = document.getElementById('dailyNotes').value;
    document.getElementById('submitBtn').innerText = "جاري الإرسال...";

    fetch(`${SCRIPT_URL}?action=saveLog&clientId=${currentClientId}&water=${waterIntake}&notes=${encodeURIComponent(notes)}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert("تم إرسال التقرير للكوتش بنجاح! عاش يا بطل 👏");
                document.getElementById('dailyNotes').value = "";
                waterIntake = 0;
                document.getElementById('waterCount').innerText = waterIntake;
                document.getElementById('submitBtn').innerText = "إرسال التقرير للكوتش";
            }
        })
        .catch(err => {
            alert("حدث خطأ أثناء الإرسال.");
            document.getElementById('submitBtn').innerText = "إرسال التقرير للكوتش";
        });
}
