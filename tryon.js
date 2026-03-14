/* ============================================================
   MYNTRA CLONE — tryon.js
   Virtual Try-On AI + WhatsApp Share Preview
   ============================================================ */

var tryonStream    = null;
var tryonActive    = false;
var tryonItem      = null;

/* ══════════════════════════════════════
   INJECT BUTTONS INTO PRODUCT PAGE
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
    // Wait for product.js to render product
    setTimeout(injectTryOnButtons, 600);
    buildTryOnModal();
    buildWAModal();
    buildSnapPreview();
});

function injectTryOnButtons() {
    // Find "Add to Bag" button area
    var addBagBtn = document.querySelector('.pd-add-bag-btn') ||
                    document.querySelector('.btn-add-bag') ||
                    document.querySelector('[onclick*="addToBag"]');

    if (!addBagBtn) { setTimeout(injectTryOnButtons, 400); return; }

    var parent = addBagBtn.parentNode;

    // Virtual Try-On button
    var tryBtn = document.createElement('button');
    tryBtn.className = 'tryon-btn';
    tryBtn.innerHTML = '<span class="material-symbols-outlined">auto_fix_high</span> Virtual Try-On (AI)';
    tryBtn.onclick   = openTryOn;
    parent.insertBefore(tryBtn, addBagBtn);

    // WhatsApp Share button
    var waBtn = document.createElement('button');
    waBtn.className = 'whatsapp-share-btn';
    waBtn.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.571a.75.75 0 00.918.918l5.716-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.506-5.218-1.388l-.374-.216-3.892 1.001 1.001-3.892-.216-.374A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
        Share on WhatsApp
    `;
    waBtn.onclick = openWAShare;
    parent.insertBefore(waBtn, addBagBtn);
}

/* ══════════════════════════════════════
   BUILD TRY-ON MODAL HTML
══════════════════════════════════════ */
function buildTryOnModal() {
    var el = document.createElement('div');
    el.innerHTML = `
    <div class="tryon-overlay" id="tryonOverlay">
        <div class="tryon-modal">
            <div class="tryon-header">
                <div class="tryon-header-left">
                    <span class="material-symbols-outlined">auto_fix_high</span>
                    <div>
                        <h3>Virtual Try-On</h3>
                        <p>AI-powered • See how it looks on you</p>
                    </div>
                </div>
                <button class="tryon-close" onclick="closeTryOn()">✕</button>
            </div>

            <div class="tryon-camera-wrap" id="tryonCameraWrap">
                <!-- Start screen -->
                <div class="tryon-start" id="tryonStart">
                    <div class="tryon-start-icon">🪄</div>
                    <h4>Try it on yourself!</h4>
                    <p>Our AI will overlay the product on your camera feed so you can see how it looks before buying</p>
                    <button class="tryon-start-btn" onclick="startCamera()">
                        <span class="material-symbols-outlined">videocam</span>
                        Enable Camera
                    </button>
                    <button style="background:none;border:none;color:rgba(255,255,255,.5);font-size:12px;cursor:pointer;margin-top:4px" onclick="showUploadFallback()">
                        No camera? Upload a photo instead
                    </button>
                </div>

                <!-- Video feed -->
                <video id="tryonVideo" autoplay playsinline muted style="display:none"></video>
                <canvas id="tryonCanvas"></canvas>
                <img id="tryonProductOverlay" class="tryon-product-overlay" src="" alt="">
                <div class="tryon-scan-line" id="tryonScanLine"></div>
                <div class="tryon-corner tl" id="tcTL"></div>
                <div class="tryon-corner tr" id="tcTR"></div>
                <div class="tryon-corner bl" id="tcBL"></div>
                <div class="tryon-corner br" id="tcBR"></div>
                <div class="tryon-status" id="tryonStatus" style="display:none"></div>

                <!-- Upload fallback -->
                <div class="tryon-upload-section" id="tryonUploadSection">
                    <label class="tryon-upload-label" for="tryonFileInput">
                        <span class="material-symbols-outlined">upload_file</span>
                        <span>Upload your photo</span>
                        <span style="font-size:11px;color:rgba(255,255,255,.4)">JPG, PNG supported</span>
                    </label>
                    <input type="file" id="tryonFileInput" accept="image/*" style="display:none" onchange="handlePhotoUpload(event)">
                </div>
            </div>

            <div class="tryon-controls" id="tryonControls" style="display:none">
                <button class="tryon-snap-btn" onclick="takeSnapshot()">
                    <span class="material-symbols-outlined">photo_camera</span> Snapshot
                </button>
                <button class="tryon-whatsapp-btn" onclick="shareSnapToWhatsApp()">
                    <span class="material-symbols-outlined">share</span> Share Look
                </button>
            </div>
        </div>
    </div>`;
    document.body.appendChild(el);
}

/* ══════════════════════════════════════
   CAMERA & AI OVERLAY
══════════════════════════════════════ */
async function startCamera() {
    try {
        var stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        tryonStream = stream;

        var video = document.getElementById('tryonVideo');
        video.srcObject = stream;
        video.style.display = 'block';
        document.getElementById('tryonStart').style.display = 'none';
        document.getElementById('tryonControls').style.display = 'flex';

        // Start AI scanning animation
        startScanAnimation();

        // After 2.5s — show product overlay
        setTimeout(showProductOverlay, 2500);

    } catch(err) {
        setTryonStatus('📷 Camera access denied — try uploading a photo');
        document.getElementById('tryonStatus').style.display = 'block';
        showUploadFallback();
    }
}

function startScanAnimation() {
    var scanLine = document.getElementById('tryonScanLine');
    scanLine.classList.add('scanning');
    setTryonStatus('🤖 AI scanning body position…');
    document.getElementById('tryonStatus').style.display = 'block';

    setTimeout(function() { setTryonStatus('✨ Fitting product…'); }, 1200);
    setTimeout(function() { setTryonStatus('🎯 Try-On ready! Move around to see it fit'); }, 2500);
}

function showProductOverlay() {
    // Get current product image
    var item = window.currentItem || tryonItem;
    if (!item) return;

    var overlay = document.getElementById('tryonProductOverlay');
    var base    = '/Myntra_Clone_Professional/';
    var src     = item.image && item.image.startsWith('http') ? item.image : base + item.image;
    overlay.src = src;
    overlay.classList.add('visible');

    // Show corners
    ['tcTL','tcTR','tcBL','tcBR'].forEach(function(id) {
        document.getElementById(id).classList.add('visible');
    });

    // Stop scan line
    document.getElementById('tryonScanLine').classList.remove('scanning');
}

function setTryonStatus(msg) {
    var el = document.getElementById('tryonStatus');
    if (el) el.textContent = msg;
}

/* ── Upload photo fallback ── */
function showUploadFallback() {
    document.getElementById('tryonStart').style.display = 'none';
    var sec = document.getElementById('tryonUploadSection');
    sec.classList.add('show');
    sec.style.display = 'flex';
    document.getElementById('tryonControls').style.display = 'flex';
}

function handlePhotoUpload(e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(ev) {
        var wrap = document.getElementById('tryonCameraWrap');

        // Show uploaded image as background
        wrap.style.backgroundImage = 'url(' + ev.target.result + ')';
        wrap.style.backgroundSize  = 'cover';
        wrap.style.backgroundPosition = 'center';

        document.getElementById('tryonUploadSection').style.display = 'none';

        // AI overlay animation
        startScanAnimation();
        setTimeout(showProductOverlay, 2500);
    };
    reader.readAsDataURL(file);
}

/* ══════════════════════════════════════
   SNAPSHOT
══════════════════════════════════════ */
function takeSnapshot() {
    var video   = document.getElementById('tryonVideo');
    var overlay = document.getElementById('tryonProductOverlay');
    var canvas  = document.createElement('canvas');

    var w = video.videoWidth  || 480;
    var h = video.videoHeight || 640;
    canvas.width  = w;
    canvas.height = h;

    var ctx = canvas.getContext('2d');

    // Mirror video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -w, 0, w, h);
    ctx.restore();

    // Draw product overlay
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = overlay.src;
    img.onload = function() {
        var pw = w * 0.55;
        var ph = pw * (img.height / img.width);
        var px = (w - pw) / 2;
        var py = (h - ph) / 2;
        ctx.globalAlpha = 0.82;
        ctx.drawImage(img, px, py, pw, ph);
        ctx.globalAlpha = 1;

        var dataUrl = canvas.toDataURL('image/jpeg', .9);
        showSnapPreview(dataUrl);
    };
    img.onerror = function() {
        // No overlay — just save plain snapshot
        var dataUrl = canvas.toDataURL('image/jpeg', .9);
        showSnapPreview(dataUrl);
    };
}

/* ══════════════════════════════════════
   SNAP PREVIEW
══════════════════════════════════════ */
function buildSnapPreview() {
    var el = document.createElement('div');
    el.innerHTML = `
    <div class="snap-preview-overlay" id="snapPreviewOverlay">
        <img id="snapPreviewImg" src="" alt="Your Try-On">
        <div class="snap-actions">
            <button class="snap-download-btn" onclick="downloadSnap()">
                <span class="material-symbols-outlined">download</span> Save
            </button>
            <button class="snap-wa-btn" onclick="shareSnapDirectly()">
                <span class="material-symbols-outlined">share</span> WhatsApp
            </button>
        </div>
        <button class="snap-close-btn" onclick="closeSnapPreview()">Close</button>
    </div>`;
    document.body.appendChild(el);
}

function showSnapPreview(dataUrl) {
    document.getElementById('snapPreviewImg').src = dataUrl;
    document.getElementById('snapPreviewOverlay').classList.add('open');
    window._snapDataUrl = dataUrl;
}

function closeSnapPreview() {
    document.getElementById('snapPreviewOverlay').classList.remove('open');
}

function downloadSnap() {
    var a   = document.createElement('a');
    a.href  = window._snapDataUrl || '';
    a.download = 'myntra-tryon.jpg';
    a.click();
    if (typeof showToast === 'function') showToast('📸 Saved to your device!');
}

function shareSnapDirectly() {
    var item = window.currentItem;
    var text = item
        ? '🛍️ Check out how I look in ' + item.item_name + ' by ' + item.company + '!\n₹' + item.current_price + ' on Myntra Clone 🔥\n' + window.location.href
        : '🛍️ Check out my virtual try-on on Myntra Clone!';
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    if (typeof showToast === 'function') showToast('Opening WhatsApp… 💬');
}

/* ══════════════════════════════════════
   OPEN / CLOSE TRY-ON
══════════════════════════════════════ */
function openTryOn() {
    tryonItem = window.currentItem;
    document.getElementById('tryonOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeTryOn() {
    document.getElementById('tryonOverlay').classList.remove('open');
    document.body.style.overflow = '';
    // Stop camera
    if (tryonStream) {
        tryonStream.getTracks().forEach(function(t) { t.stop(); });
        tryonStream = null;
    }
    // Reset
    var video = document.getElementById('tryonVideo');
    if (video) { video.srcObject = null; video.style.display = 'none'; }
    var overlay = document.getElementById('tryonProductOverlay');
    if (overlay) overlay.classList.remove('visible');
    ['tcTL','tcTR','tcBL','tcBR'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('visible');
    });
    document.getElementById('tryonStart').style.display = 'flex';
    document.getElementById('tryonControls').style.display = 'none';
    document.getElementById('tryonStatus').style.display = 'none';
    document.getElementById('tryonScanLine').classList.remove('scanning');
}

/* ══════════════════════════════════════
   WHATSAPP SHARE PREVIEW
══════════════════════════════════════ */
function buildWAModal() {
    var el = document.createElement('div');
    el.innerHTML = `
    <div class="wa-overlay" id="waOverlay" onclick="closeWAShare(event)">
        <div class="wa-sheet" id="waSheet">
            <div class="wa-sheet-handle"></div>
            <div class="wa-sheet-title">
                <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.571a.75.75 0 00.918.918l5.716-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.506-5.218-1.388l-.374-.216-3.892 1.001 1.001-3.892-.216-.374A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                Share on WhatsApp
            </div>
            <div class="wa-sheet-sub">Preview how it looks before sending</div>

            <!-- WhatsApp bubble preview -->
            <div class="wa-preview-bubble">
                <div class="wa-bubble-sender">You</div>
                <div class="wa-bubble-text" id="waBubbleText"></div>
                <div class="wa-product-card">
                    <img class="wa-product-img" id="waProductImg" src="" alt="">
                    <div class="wa-product-info">
                        <div class="wa-product-brand" id="waProductBrand"></div>
                        <div class="wa-product-name"  id="waProductName"></div>
                        <div>
                            <span class="wa-product-price"    id="waProductPrice"></span>
                            <span class="wa-product-original" id="waProductOriginal"></span>
                            <span class="wa-product-discount" id="waProductDiscount"></span>
                        </div>
                    </div>
                </div>
                <div class="wa-bubble-time" id="waBubbleTime"></div>
            </div>

            <!-- Quick contacts -->
            <div class="wa-contacts-title">Send to</div>
            <div class="wa-contacts">
                ${['👨‍💻','👩‍🦰','🧑‍🤝‍🧑','👨‍👩‍👧','🧑','👩'].map(function(em,i) {
                    var names = ['Best Friend','Mom','College BFF','Family','Rahul','Priya'];
                    var colors = ['#6c3ae8','#ff3f6c','#25d366','#ff905a','#0088cc','#e91e8c'];
                    return '<div class="wa-contact" onclick="sendToContact('+i+')"><div class="wa-contact-avatar" style="background:'+colors[i]+'">'+em+'</div><div class="wa-contact-name">'+names[i]+'</div></div>';
                }).join('')}
            </div>

            <button class="wa-send-btn" onclick="sendWhatsApp()">
                <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.571a.75.75 0 00.918.918l5.716-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.506-5.218-1.388l-.374-.216-3.892 1.001 1.001-3.892-.216-.374A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                Send on WhatsApp
            </button>
            <button class="wa-cancel-btn" onclick="closeWAShare(null)">Cancel</button>
        </div>
    </div>`;
    document.body.appendChild(el);
}

function openWAShare() {
    var item = window.currentItem;
    if (!item) return;

    // Fill bubble text
    var msg = '🛍️ Hey! Check this out on Myntra!\n\n' +
              '👗 ' + item.item_name + '\n' +
              '🏷️ ' + item.company + '\n' +
              '💰 ₹' + item.current_price.toLocaleString() +
              (item.discount_percentage > 0 ? ' (' + item.discount_percentage + '% OFF!)' : '') + '\n' +
              '🔗 ' + window.location.href;

    document.getElementById('waBubbleText').textContent  = msg;

    // Fill product card
    var base = '/Myntra_Clone_Professional/';
    var src  = item.image && item.image.startsWith('http') ? item.image : base + item.image;
    document.getElementById('waProductImg').src          = src;
    document.getElementById('waProductBrand').textContent = item.company;
    document.getElementById('waProductName').textContent  = item.item_name;
    document.getElementById('waProductPrice').textContent = '₹' + item.current_price.toLocaleString();
    if (item.discount_percentage > 0) {
        document.getElementById('waProductOriginal').textContent = '₹' + item.original_price.toLocaleString();
        document.getElementById('waProductDiscount').textContent = item.discount_percentage + '% OFF';
    }

    // Time
    var now = new Date();
    document.getElementById('waBubbleTime').textContent =
        now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

    document.getElementById('waOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeWAShare(e) {
    if (e && e.target !== document.getElementById('waOverlay')) return;
    document.getElementById('waOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

function sendWhatsApp() {
    var item = window.currentItem;
    if (!item) return;
    var text = '🛍️ Hey! Check this out on Myntra!\n\n' +
               '👗 ' + item.item_name + '\n' +
               '🏷️ ' + item.company + '\n' +
               '💰 ₹' + item.current_price.toLocaleString() +
               (item.discount_percentage > 0 ? ' (' + item.discount_percentage + '% OFF!)' : '') + '\n' +
               '🔗 ' + window.location.href;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    closeWAShare(null);
    if (typeof showToast === 'function') showToast('Opening WhatsApp… 💬');
}

function sendToContact(i) {
    sendWhatsApp();
}

function shareSnapToWhatsApp() {
    closeTryOn();
    openWAShare();
}

window.openTryOn         = openTryOn;
window.closeTryOn        = closeTryOn;
window.startCamera       = startCamera;
window.showUploadFallback= showUploadFallback;
window.handlePhotoUpload = handlePhotoUpload;
window.takeSnapshot      = takeSnapshot;
window.downloadSnap      = downloadSnap;
window.shareSnapDirectly = shareSnapDirectly;
window.closeSnapPreview  = closeSnapPreview;
window.openWAShare       = openWAShare;
window.closeWAShare      = closeWAShare;
window.sendWhatsApp      = sendWhatsApp;
window.sendToContact     = sendToContact;
window.shareSnapToWhatsApp = shareSnapToWhatsApp;
