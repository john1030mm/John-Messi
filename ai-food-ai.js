/* AI Food Analysis add-on
   Keeps the existing app.js intact and replaces only the AI calls with a secure Apps Script backend.
*/
(function () {
  const AI_ENDPOINT = typeof SCRIPT_URL !== 'undefined' ? SCRIPT_URL : '';
  let pendingAIFoodResult = null;

  window.closeAIFoodModal = function () {
    const modal = document.getElementById('aiFoodModal');
    if (modal) modal.style.display = 'none';
    pendingAIFoodResult = null;
  };

  function showModal() {
    const modal = document.getElementById('aiFoodModal');
    const loading = document.getElementById('aiFoodLoading');
    const result = document.getElementById('aiFoodResult');
    const actions = document.getElementById('aiFoodActions');
    if (!modal) return;
    modal.style.display = 'flex';
    if (loading) loading.style.display = 'none';
    if (result) result.innerHTML = '';
    if (actions) actions.style.display = 'none';
  }

  function setLoading(on, text) {
    const loading = document.getElementById('aiFoodLoading');
    const result = document.getElementById('aiFoodResult');
    const actions = document.getElementById('aiFoodActions');
    if (loading) loading.style.display = on ? 'block' : 'none';
    if (result && on) result.innerHTML = '';
    if (actions) actions.style.display = 'none';
    const label = document.getElementById('aiFoodLoadingText');
    if (label && text) label.textContent = text;
  }

  function toastSafe(msg) {
    if (typeof showToast === 'function') showToast(msg);
    else if (typeof toast === 'function') toast(msg);
    else alert(msg);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function n(value) {
    const x = Number(value);
    return Number.isFinite(x) ? Math.max(0, x) : 0;
  }

  function normalizeResult(raw) {
    const items = Array.isArray(raw.items) ? raw.items : [];
    const cleanItems = items.map(item => ({
      name: String(item.name || 'مكوّن غير معروف'),
      grams: n(item.grams),
      cal: n(item.cal),
      pro: n(item.pro),
      carb: n(item.carb),
      fat: n(item.fat)
    }));
    const total = raw.total || {};
    return {
      name: String(raw.name || 'وجبة محللة بالذكاء الاصطناعي'),
      items: cleanItems,
      total: {
        cal: n(total.cal), pro: n(total.pro), carb: n(total.carb), fat: n(total.fat)
      },
      note: String(raw.note || 'القيم تقديرية وقد تختلف حسب الكمية وطريقة التحضير.')
    };
  }

  function renderResult(raw) {
    const data = normalizeResult(raw);
    pendingAIFoodResult = data;
    const result = document.getElementById('aiFoodResult');
    const actions = document.getElementById('aiFoodActions');
    if (!result) return;

    const itemsHtml = data.items.length
      ? data.items.map(item => `
        <div class="ai-food-item">
          <div>
            <div class="ai-food-item-name">${escapeHtml(item.name)}</div>
            <div class="ai-food-item-meta">${Math.round(item.grams)} جم</div>
          </div>
          <div class="ai-food-macros">
            ${Math.round(item.cal)} kcal · P ${item.pro.toFixed(1)} · C ${item.carb.toFixed(1)} · F ${item.fat.toFixed(1)}
          </div>
        </div>`).join('')
      : '<div class="ai-food-error">لم يتمكن الذكاء الاصطناعي من تحديد مكونات واضحة في الصورة.</div>';

    result.innerHTML = `
      <div style="font-weight:800;margin-bottom:10px;">${escapeHtml(data.name)}</div>
      ${itemsHtml}
      <div class="ai-food-total">
        <strong>الإجمالي التقريبي</strong>
        <div class="ai-food-total-grid">
          <div><b>${Math.round(data.total.cal)}</b><span>سعرة</span></div>
          <div><b>${data.total.pro.toFixed(1)}</b><span>بروتين</span></div>
          <div><b>${data.total.carb.toFixed(1)}</b><span>كارب</span></div>
          <div><b>${data.total.fat.toFixed(1)}</b><span>دهون</span></div>
        </div>
      </div>
      <div class="ai-food-note">${escapeHtml(data.note)}</div>`;
    if (actions) actions.style.display = 'flex';
  }

  async function postAI(payload) {
    if (!AI_ENDPOINT) throw new Error('SCRIPT_URL غير موجود في app.js');
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    let json;
    try { json = JSON.parse(text); } catch (_) { throw new Error('استجابة غير صالحة من الخادم'); }
    if (!response.ok || json.status === 'error') throw new Error(json.message || 'حدث خطأ أثناء تحليل الطعام');
    return json.data || json;
  }

  function resizeImage(file, maxWidth = 1280, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('تعذر قراءة الصورة'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('الصورة غير صالحة'));
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d', { alpha: false });
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(blob => {
            if (!blob) return reject(new Error('تعذر ضغط الصورة'));
            const r = new FileReader();
            r.onload = () => {
              const dataUrl = String(r.result || '');
              resolve({ mimeType: 'image/jpeg', base64: dataUrl.split(',')[1] || '' });
            };
            r.onerror = () => reject(new Error('تعذر تجهيز الصورة'));
            r.readAsDataURL(blob);
          }, 'image/jpeg', quality);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  window.analyzeFoodAI = async function (input) {
    const file = input && input.files && input.files[0];
    if (!file) return;
    showModal();
    setLoading(true, 'جاري ضغط الصورة وتحليل الوجبة...');
    try {
      const image = await resizeImage(file);
      const lang = (typeof appData !== 'undefined' && appData.lang === 'en') ? 'en' : 'ar';
      const data = await postAI({ action: 'analyzeFoodImage', image: image.base64, mimeType: image.mimeType, lang });
      setLoading(false);
      renderResult(data);
    } catch (err) {
      setLoading(false);
      const result = document.getElementById('aiFoodResult');
      if (result) result.innerHTML = `<div class="ai-food-error">${escapeHtml(err.message || 'حدث خطأ غير متوقع')}</div>`;
    } finally {
      try { input.value = ''; } catch (_) {}
    }
  };

  window.confirmAIFood = function () {
    if (!pendingAIFoodResult) return;
    const t = pendingAIFoodResult.total;
    const grams = pendingAIFoodResult.items.reduce((sum, item) => sum + n(item.grams), 0);
    const name = '✨ ' + pendingAIFoodResult.name;
    if (typeof addMealToLog === 'function') {
      addMealToLog(name, t.cal, t.pro, t.carb, t.fat, grams ? Math.round(grams) + ' جم' : 'AI');
      closeAIFoodModal();
      toastSafe('تمت إضافة الوجبة إلى يومك');
    } else {
      toastSafe('تعذر إضافة الوجبة: دالة addMealToLog غير موجودة');
    }
  };

  // Override the old frontend Gemini text lookup so the API key is never shipped to the browser.
  window.searchFoodAIText = async function (foodName) {
    try {
      const lang = (typeof appData !== 'undefined' && appData.lang === 'en') ? 'en' : 'ar';
      const data = await postAI({ action: 'aiFoodText', foodName: String(foodName || '').trim(), lang });
      return normalizeResult({
        name: data.name,
        items: [{ name: data.name, grams: 100, cal: data.cal, pro: data.pro, carb: data.carb, fat: data.fat }],
        total: data,
        note: 'القيم مقدّرة لكل 100 جرام.'
      });
    } catch (err) {
      toastSafe(err.message || 'تعذر تحليل الأكلة');
      return null;
    }
  };
})();
