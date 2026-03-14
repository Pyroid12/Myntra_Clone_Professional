/* ============================================================
   MYNTRA CLONE — tryon.js
   Virtual Try-On — Real AR body tracking using TensorFlow.js
   Product overlays ON the person's actual body via pose detection
   ============================================================ */

var tryonStream   = null;
var tryonItem     = null;
var detector      = null;
var animFrameId   = null;
var tryonReady    = false;

/* ══════════════════════════════════════
   INJECT BUTTONS
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
    var attempts = 0;
    function tryInject() {
        var wrap = document.querySelector('.pd-cta-buttons');
        if (wrap) {
            injectTryOnButtons(wrap);
        } else if (attempts++ < 15) {
            setTimeout(tryInject, 300);
        }
    }
    setTimeout(tryInject, 400);
    buildTryOnModal();
    buildWAModal();
    buildSnapPreview();
});

function injectTryOnButtons(ctaWrap) {
    if (document.querySelector('.tryon-btn')) return; // already injected

    // Try-On button above CTA
    var tryBtn       = document.createElement('button');
    tryBtn.className = 'tryon-btn';
    tryBtn.innerHTML = '<span class="material-symbols-outlined">auto_fix_high</span> Virtual Try-On (AI)';
    tryBtn.onclick   = openTryOn;
    ctaWrap.parentNode.insertBefore(tryBtn, ctaWrap);

    // WhatsApp Share button below CTA
    var waBtn       = document.createElement('button');
    waBtn.className = 'whatsapp-share-btn';
    waBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#fff;flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.571a.75.75 0 00.918.918l5.716-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.506-5.218-1.388l-.374-.216-3.892 1.001 1.001-3.892-.216-.374A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg> Share on WhatsApp';
    waBtn.onclick = openWAShare;
    if (ctaWrap.nextSibling) {
        ctaWrap.parentNode.insertBefore(waBtn, ctaWrap.nextSibling);
    } else {
        ctaWrap.parentNode.appendChild(waBtn);
    }
}

/* ══════════════════════════════════════
   BUILD MODAL HTML
══════════════════════════════════════ */
function buildTryOnModal() {
    var el   = document.createElement('div');
    el.innerHTML = `
    <div class="tryon-overlay" id="tryonOverlay">
      <div class="tryon-modal">

        <div class="tryon-header">
          <div class="tryon-header-left">
            <span class="material-symbols-outlined">auto_fix_high</span>
            <div>
              <h3>Virtual Try-On</h3>
              <p>AI body tracking • Product fits to YOUR body</p>
            </div>
          </div>
          <button class="tryon-close" onclick="closeTryOn()">✕</button>
        </div>

        <!-- Camera view -->
        <div class="tryon-camera-wrap" id="tryonCameraWrap">

          <!-- Start screen -->
          <div class="tryon-start" id="tryonStart">
            <div class="tryon-start-icon">🪄</div>
            <h4>Real AR Try-On</h4>
            <p>AI detects your body in real time and places the product <strong>on you</strong> — not just floating on screen.</p>
            <button class="tryon-start-btn" id="tryonStartCamBtn" onclick="startCamera()">
              <span class="material-symbols-outlined">videocam</span>
              Start Camera
            </button>
            <button class="tryon-upload-text-btn" onclick="showUploadFallback()">
              No camera? Upload a photo
            </button>
          </div>

          <!-- Loading AI model -->
          <div class="tryon-loading" id="tryonLoading" style="display:none">
            <div class="tryon-loading-spinner"></div>
            <div class="tryon-loading-text" id="tryonLoadingText">Loading AI model…</div>
            <div class="tryon-loading-sub">This takes ~5 seconds, only once</div>
          </div>

          <!-- Live camera + canvas overlay -->
          <video id="tryonVideo" autoplay playsinline muted style="display:none"></video>
          <canvas id="tryonCanvas" style="display:none"></canvas>

          <!-- Status bar -->
          <div class="tryon-status-bar" id="tryonStatusBar" style="display:none">
            <span id="tryonStatusText">🤖 Detecting body…</span>
          </div>

          <!-- Upload fallback -->
          <div class="tryon-upload-wrap" id="tryonUploadWrap" style="display:none">
            <label class="tryon-upload-label" for="tryonFileInput">
              <span class="material-symbols-outlined">upload_file</span>
              <span>Tap to upload your photo</span>
              <span class="tryon-upload-hint">JPG / PNG</span>
            </label>
            <input type="file" id="tryonFileInput" accept="image/*" style="display:none" onchange="handlePhotoUpload(event)">
          </div>

        </div>

        <!-- Controls -->
        <div class="tryon-controls" id="tryonControls" style="display:none">
          <button class="tryon-snap-btn" onclick="takeSnapshot()">
            <span class="material-symbols-outlined">photo_camera</span> Snapshot
          </button>
          <button class="tryon-wa-ctrl-btn" onclick="shareSnapToWhatsApp()">
            <span class="material-symbols-outlined">share</span> Share Look
          </button>
        </div>

      </div>
    </div>`;
    document.body.appendChild(el);
}

/* ══════════════════════════════════════
   CAMERA START
══════════════════════════════════════ */
async function startCamera() {
    document.getElementById('tryonStart').style.display   = 'none';
    document.getElementById('tryonLoading').style.display = 'flex';
    setLoadingText('Starting camera…');

    try {
        tryonStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });

        var video      = document.getElementById('tryonVideo');
        video.srcObject = tryonStream;
        await video.play();

        setLoadingText('Loading AI body tracker…');
        await loadPoseDetector();

        // Show canvas
        var canvas      = document.getElementById('tryonCanvas');
        canvas.width    = video.videoWidth  || 640;
        canvas.height   = video.videoHeight || 480;
        video.style.display   = 'none'; // hide raw video — canvas shows everything
        canvas.style.display  = 'block';
        document.getElementById('tryonLoading').style.display   = 'none';
        document.getElementById('tryonStatusBar').style.display = 'block';
        document.getElementById('tryonControls').style.display  = 'flex';

        tryonReady = true;
        renderLoop();

    } catch (err) {
        console.error('Camera error:', err);
        document.getElementById('tryonLoading').style.display = 'none';
        setStatus('📷 Camera denied — upload a photo instead');
        document.getElementById('tryonStatusBar').style.display = 'block';
        showUploadFallback();
    }
}

/* ══════════════════════════════════════
   LOAD TENSORFLOW POSE DETECTOR
══════════════════════════════════════ */
async function loadPoseDetector() {
    if (detector) return; // already loaded

    // Load TF.js + MoveNet dynamically
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.11.0/dist/tf-core.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.11.0/dist/tf-backend-webgl.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js');

    setLoadingText('Initialising body tracker…');
    await window.tf.ready();

    detector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet,
        { modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
    setLoadingText('Ready!');
}

function loadScript(src) {
    return new Promise(function(resolve, reject) {
        if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
        var s    = document.createElement('script');
        s.src    = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

/* ══════════════════════════════════════
   RENDER LOOP — draw video + product on body
══════════════════════════════════════ */
var productImg = new Image();
productImg.crossOrigin = 'anonymous';

function renderLoop() {
    if (!tryonReady) return;
    animFrameId = requestAnimationFrame(renderLoop);

    var video  = document.getElementById('tryonVideo');
    var canvas = document.getElementById('tryonCanvas');
    var ctx    = canvas.getContext('2d');

    // Match canvas size to video
    if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
    }

    // Draw mirrored video frame
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Detect pose every 3 frames for performance
    renderLoop._frame = (renderLoop._frame || 0) + 1;
    if (renderLoop._frame % 3 === 0) {
        detectAndDraw(video, canvas, ctx);
    }
}

async function detectAndDraw(video, canvas, ctx) {
    if (!detector) return;
    try {
        var poses = await detector.estimatePoses(video);
        if (poses && poses.length > 0) {
            drawProductOnBody(poses[0].keypoints, canvas, ctx);
        } else {
            setStatus('🕺 Step back so your full body is visible');
        }
    } catch(e) { /* silent */ }
}

/* ══════════════════════════════════════
   DRAW PRODUCT ON BODY
   Uses shoulder keypoints to position + size the product
══════════════════════════════════════ */
function drawProductOnBody(keypoints, canvas, ctx) {
    // Get key body points (MoveNet keypoint indices)
    var leftShoulder  = keypoints[5];
    var rightShoulder = keypoints[6];
    var leftHip       = keypoints[11];
    var rightHip      = keypoints[12];

    // Need shoulders with decent confidence
    if (!leftShoulder || !rightShoulder ||
        leftShoulder.score < 0.3 || rightShoulder.score < 0.3) {
        setStatus('👕 Point camera at your upper body');
        return;
    }

    var item    = window.currentItem || tryonItem;
    var cat     = item ? item.category : 'women';

    // Mirror X coordinates (because we flipped canvas)
    var lsx = canvas.width - leftShoulder.x;
    var rsx = canvas.width - rightShoulder.x;
    var lsy = leftShoulder.y;
    var rsy = rightShoulder.y;

    // Shoulder width → determines product width
    var shoulderWidth = Math.abs(rsx - lsx);
    var centerX       = (lsx + rsx) / 2;
    var shoulderY     = (lsy + rsy) / 2;

    // Hip position for length calculation
    var lhx = leftHip  && leftHip.score  > 0.3 ? canvas.width - leftHip.x  : centerX - shoulderWidth;
    var rhx = rightHip && rightHip.score > 0.3 ? canvas.width - rightHip.x : centerX + shoulderWidth;
    var lhy = leftHip  && leftHip.score  > 0.3 ? leftHip.y  : shoulderY + shoulderWidth * 1.2;
    var rhy = rightHip && rightHip.score > 0.3 ? rightHip.y : shoulderY + shoulderWidth * 1.2;
    var hipY = (lhy + rhy) / 2;

    // ── Product sizing based on category ──
    var prodW, prodH, prodX, prodY;

    if (cat === 'jewellery') {
        // Necklace/earring — small, near neck/face
        var neck = keypoints[0]; // nose as reference
        if (neck && neck.score > 0.3) {
            var neckX = canvas.width - neck.x;
            prodW = shoulderWidth * 0.7;
            prodH = prodW * 1.0;
            prodX = neckX - prodW / 2;
            prodY = neck.y + 10;
        } else {
            prodW = shoulderWidth * 0.7;
            prodH = prodW;
            prodX = centerX - prodW / 2;
            prodY = shoulderY - prodW * 0.3;
        }
    } else if (cat === 'men' && item && item.item_name.toLowerCase().includes('shoe')) {
        // Shoes — near feet (bottom of frame)
        prodW = shoulderWidth * 1.0;
        prodH = prodW * 0.6;
        prodX = centerX - prodW / 2;
        prodY = canvas.height - prodH - 20;
    } else if (cat === 'beauty') {
        // Beauty — show near face/hand
        var nose = keypoints[0];
        var refX = nose && nose.score > 0.3 ? canvas.width - nose.x : centerX;
        var refY = nose && nose.score > 0.3 ? nose.y : shoulderY - 60;
        prodW = shoulderWidth * 0.5;
        prodH = prodW * 1.3;
        prodX = refX + shoulderWidth * 0.3;
        prodY = refY - prodH * 0.2;
    } else {
        // Default: clothing (tops, dresses, kurtas, shirts)
        // Width = 1.4x shoulder width for natural look
        prodW = shoulderWidth * 1.45;
        // Height = shoulder to hip * 1.15 for coverage
        prodH = (hipY - shoulderY) * 1.15;
        if (prodH < prodW * 0.8) prodH = prodW * 1.1; // minimum height
        prodX = centerX - prodW / 2;
        prodY = shoulderY - (prodH * 0.08); // slight upward offset
    }

    // ── Draw product image on canvas ──
    if (productImg.src && productImg.complete && productImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.88;
        ctx.drawImage(productImg, prodX, prodY, prodW, prodH);
        ctx.globalAlpha = 1.0;
        ctx.restore();
        setStatus('✨ Try-On live! Move around freely');
    } else {
        // Load product image
        loadProductImage(item);
        setStatus('⏳ Loading product image…');
    }

    // Debug: draw skeleton dots (comment out in production)
    // drawSkeleton(keypoints, canvas, ctx);
}

function loadProductImage(item) {
    if (!item) return;
    var base = '/Myntra_Clone_Professional/';
    var src  = item.image && item.image.startsWith('http') ? item.image : base + item.image;
    if (productImg.src !== src) {
        productImg.src = src;
    }
}

/* ══════════════════════════════════════
   PHOTO UPLOAD FALLBACK
══════════════════════════════════════ */
function showUploadFallback() {
    document.getElementById('tryonStart').style.display    = 'none';
    document.getElementById('tryonLoading').style.display  = 'none';
    document.getElementById('tryonUploadWrap').style.display = 'flex';
    document.getElementById('tryonControls').style.display  = 'flex';
}

function handlePhotoUpload(e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = async function(ev) {
        // Show uploaded image on canvas
        var canvas = document.getElementById('tryonCanvas');
        var ctx    = canvas.getContext('2d');
        var img    = new Image();
        img.onload = async function() {
            canvas.width  = img.width;
            canvas.height = img.height;
            canvas.style.display = 'block';
            document.getElementById('tryonUploadWrap').style.display = 'none';
            document.getElementById('tryonStatusBar').style.display  = 'block';
            document.getElementById('tryonControls').style.display   = 'flex';

            setStatus('🤖 Loading AI model…');

            try {
                document.getElementById('tryonLoading').style.display = 'flex';
                setLoadingText('Analysing your photo…');
                await loadPoseDetector();
                document.getElementById('tryonLoading').style.display = 'none';

                // Detect pose on static image
                var poses = await detector.estimatePoses(img);
                ctx.drawImage(img, 0, 0);

                if (poses && poses.length > 0) {
                    drawProductOnBody(poses[0].keypoints, canvas, ctx);
                } else {
                    // No pose detected — fallback overlay at centre
                    fallbackOverlay(canvas, ctx);
                    setStatus('💡 Stand straight facing the camera for best results');
                }
            } catch(err) {
                document.getElementById('tryonLoading').style.display = 'none';
                ctx.drawImage(img, 0, 0);
                fallbackOverlay(canvas, ctx);
                setStatus('✨ Try-On applied!');
            }
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function fallbackOverlay(canvas, ctx) {
    // Centre overlay when no pose detected
    var item = window.currentItem || tryonItem;
    if (!item || !productImg.complete) return;
    var w = canvas.width  * 0.5;
    var h = canvas.height * 0.65;
    var x = (canvas.width  - w) / 2;
    var y = canvas.height  * 0.18;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(productImg, x, y, w, h);
    ctx.globalAlpha = 1;
}

/* ══════════════════════════════════════
   SNAPSHOT
══════════════════════════════════════ */
function takeSnapshot() {
    var canvas  = document.getElementById('tryonCanvas');
    var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    showSnapPreview(dataUrl);
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function setStatus(msg) {
    var el = document.getElementById('tryonStatusText');
    if (el) el.textContent = msg;
}
function setLoadingText(msg) {
    var el = document.getElementById('tryonLoadingText');
    if (el) el.textContent = msg;
}

/* ══════════════════════════════════════
   OPEN / CLOSE
══════════════════════════════════════ */
function openTryOn() {
    tryonItem = window.currentItem;
    // Pre-load product image
    loadProductImage(tryonItem);
    document.getElementById('tryonOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeTryOn() {
    tryonReady = false;
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    if (tryonStream) { tryonStream.getTracks().forEach(function(t) { t.stop(); }); tryonStream = null; }

    var video  = document.getElementById('tryonVideo');
    var canvas = document.getElementById('tryonCanvas');
    if (video)  { video.srcObject = null; video.style.display = 'none'; }
    if (canvas) { canvas.style.display = 'none'; }

    // Reset UI
    document.getElementById('tryonStart').style.display       = 'flex';
    document.getElementById('tryonLoading').style.display     = 'none';
    document.getElementById('tryonStatusBar').style.display   = 'none';
    document.getElementById('tryonControls').style.display    = 'none';
    document.getElementById('tryonUploadWrap').style.display  = 'none';
    document.getElementById('tryonOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

/* ══════════════════════════════════════
   SNAPSHOT PREVIEW
══════════════════════════════════════ */
function buildSnapPreview() {
    var el = document.createElement('div');
    el.innerHTML = `
    <div class="snap-preview-overlay" id="snapPreviewOverlay">
        <p style="color:#fff;font-size:13px;margin-bottom:10px;opacity:.7">Your Try-On Look</p>
        <img id="snapPreviewImg" src="" alt="Try-On Snapshot" style="max-width:300px;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.5)">
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
    var a = document.createElement('a');
    a.href = window._snapDataUrl || '';
    a.download = 'myntra-tryon.jpg';
    a.click();
    if (typeof showToast === 'function') showToast('📸 Saved to your device!');
}
function shareSnapDirectly() {
    var item = window.currentItem;
    var text = item
        ? '🛍️ Check how I look in ' + item.item_name + ' by ' + item.company + '!\n₹' + item.current_price + ' on Myntra Clone\n' + window.location.href
        : '🛍️ Check my virtual try-on on Myntra Clone!';
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

/* ══════════════════════════════════════
   WHATSAPP SHARE MODAL
══════════════════════════════════════ */
function buildWAModal() {
    var el = document.createElement('div');
    el.innerHTML = `
    <div class="wa-overlay" id="waOverlay" onclick="closeWAShare(event)">
        <div class="wa-sheet" id="waSheet">
            <div class="wa-sheet-handle"></div>
            <div class="wa-sheet-title">
                <svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.571a.75.75 0 00.918.918l5.716-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.506-5.218-1.388l-.374-.216-3.892 1.001 1.001-3.892-.216-.374A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                Share on WhatsApp
            </div>
            <div class="wa-sheet-sub">Preview before sending</div>
            <div class="wa-preview-bubble">
                <div class="wa-bubble-sender">You</div>
                <div class="wa-bubble-text" id="waBubbleText"></div>
                <div class="wa-product-card">
                    <img class="wa-product-img" id="waProductImg" src="" alt="">
                    <div class="wa-product-info">
                        <div class="wa-product-brand"    id="waProductBrand"></div>
                        <div class="wa-product-name"     id="waProductName"></div>
                        <div>
                            <span class="wa-product-price"    id="waProductPrice"></span>
                            <span class="wa-product-original" id="waProductOriginal"></span>
                            <span class="wa-product-discount" id="waProductDiscount"></span>
                        </div>
                    </div>
                </div>
                <div class="wa-bubble-time" id="waBubbleTime"></div>
            </div>
            <button class="wa-send-btn" onclick="sendWhatsApp()">
                <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.571a.75.75 0 00.918.918l5.716-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.506-5.218-1.388l-.374-.216-3.892 1.001 1.001-3.892-.216-.374A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
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
    var msg = '🛍️ Hey! Check this out on Myntra!\n\n👗 ' + item.item_name + '\n🏷️ ' + item.company + '\n💰 ₹' + item.current_price.toLocaleString() + (item.discount_percentage > 0 ? ' (' + item.discount_percentage + '% OFF!)' : '') + '\n🔗 ' + window.location.href;
    document.getElementById('waBubbleText').textContent   = msg;
    var base = '/Myntra_Clone_Professional/';
    document.getElementById('waProductImg').src           = item.image && item.image.startsWith('http') ? item.image : base + item.image;
    document.getElementById('waProductBrand').textContent = item.company;
    document.getElementById('waProductName').textContent  = item.item_name;
    document.getElementById('waProductPrice').textContent = '₹' + item.current_price.toLocaleString();
    if (item.discount_percentage > 0) {
        document.getElementById('waProductOriginal').textContent = '₹' + item.original_price.toLocaleString();
        document.getElementById('waProductDiscount').textContent = item.discount_percentage + '% OFF';
    }
    var now = new Date();
    document.getElementById('waBubbleTime').textContent = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
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
    var text = '🛍️ Hey! Check this out on Myntra!\n\n👗 ' + item.item_name + '\n🏷️ ' + item.company + '\n💰 ₹' + item.current_price.toLocaleString() + (item.discount_percentage > 0 ? ' (' + item.discount_percentage + '% OFF!)' : '') + '\n🔗 ' + window.location.href;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    closeWAShare(null);
    if (typeof showToast === 'function') showToast('Opening WhatsApp… 💬');
}
function shareSnapToWhatsApp() { closeTryOn(); openWAShare(); }

/* Expose globals */
window.openTryOn          = openTryOn;
window.closeTryOn         = closeTryOn;
window.startCamera        = startCamera;
window.showUploadFallback = showUploadFallback;
window.handlePhotoUpload  = handlePhotoUpload;
window.takeSnapshot       = takeSnapshot;
window.downloadSnap       = downloadSnap;
window.shareSnapDirectly  = shareSnapDirectly;
window.closeSnapPreview   = closeSnapPreview;
window.openWAShare        = openWAShare;
window.closeWAShare       = closeWAShare;
window.sendWhatsApp       = sendWhatsApp;
window.shareSnapToWhatsApp= shareSnapToWhatsApp;
