(function () {
    const PVT_VERSION = 'v3.20-multi-anim';
    const FALLBACK_VISEME_NAMES = ['Neutral','A','E','I','O','U','M','F','S','Rest'];
    if (typeof window.PVT_MOUTH_AMPLITUDE !== 'number') window.PVT_MOUTH_AMPLITUDE = 2.8;
    console.log("Iniciando Patitas Video Tutor 3D " + PVT_VERSION + "...");
    if (typeof window.PVT_JAW_SCALE !== 'number') window.PVT_JAW_SCALE = 0.5;
    if (typeof window.PVT_JAW_SIGN  !== 'number') window.PVT_JAW_SIGN  = -1;
    if (!window.PVT_JAW_AXIS) window.PVT_JAW_AXIS = 'x';
    if (typeof window.PVT_USE_JAW_BONE !== 'boolean') window.PVT_USE_JAW_BONE = true;
    if (typeof window.PVT_MS_PER_CHAR !== 'number') window.PVT_MS_PER_CHAR = 100;
    const GLB_BASE = 'Tutor Patitas 3D/';
    const MODEL_PATHS = {
        mandibula: 'Patitas_Mandibula_Multi.glb',
        dance:     GLB_BASE + 'Meshy_AI_Cheerful_Red_Beacon_M_biped_Animation_All_Night_Dance_withSkin.glb',
        walk:      GLB_BASE + 'Meshy_AI_Cheerful_Red_Beacon_M_biped_Animation_Walking_withSkin.glb',
        run:       GLB_BASE + 'Meshy_AI_Cheerful_Red_Beacon_M_biped_Animation_Running_withSkin.glb'
    };
    window.PATITAS_GLB_MODELS = MODEL_PATHS;
    function loadScript(src, cb) {
        const s = document.createElement('script');
        s.src = src; s.onload = cb;
        document.head.appendChild(s);
    }
    function checkDependencies() {
        if (typeof THREE === 'undefined') {
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', checkDependencies);
            return;
        }
        if (!THREE.GLTFLoader) {
            loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', checkDependencies);
            return;
        }
        initVideoTutor();
    }
    checkDependencies();
    function makeDraggable(element, handle) {
        let isDragging = false, startX, startY, initX, initY;
        handle.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.id === 'pvt-close') return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            const rect = element.getBoundingClientRect();
            initX = rect.left; initY = rect.top;
            element.style.bottom = 'auto'; element.style.right = 'auto';
            element.style.left = initX + 'px'; element.style.top = initY + 'px';
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            element.style.left = (initX + e.clientX - startX) + 'px';
            element.style.top  = (initY + e.clientY - startY) + 'px';
        });
        window.addEventListener('mouseup', () => { isDragging = false; });
    }
    const VISEME_NAMES = ['Neutral', 'A', 'E', 'I', 'O', 'U', 'M', 'F', 'S', 'Rest'];
    const LETTER_TO_VISEME = (() => {
        const m = {};
        'aáä'.split('').forEach(c => m[c] = 'A');
        'eéë'.split('').forEach(c => m[c] = 'E');
        'iíï'.split('').forEach(c => m[c] = 'I');
        'oóö'.split('').forEach(c => m[c] = 'O');
        'uúü'.split('').forEach(c => m[c] = 'U');
        'mbp'.split('').forEach(c => m[c] = 'M');
        'fv'.split('').forEach(c => m[c] = 'F');
        'szxc'.split('').forEach(c => m[c] = 'S');
        'lndtrñ'.split('').forEach(c => m[c] = 'I');  
        'gjkqhwy'.split('').forEach(c => m[c] = 'A'); 
        return m;
    })();
    function buildVisemeQueue(text, mode) {
        const clean = (text || '').toLowerCase();
        let mappedCount = 0;
        for (let i = 0; i < clean.length; i++) {
            if (LETTER_TO_VISEME[clean[i]]) mappedCount++;
        }
        const msPerChar = (typeof window.PVT_MS_PER_CHAR === 'number') ? window.PVT_MS_PER_CHAR : 100;
        const estimatedAudioMs = clean.length * msPerChar;
        const baseStep = (mode === 'fast') ? 55 : 65;
        const STEP = mappedCount > 0
            ? Math.min(300, Math.max(baseStep, estimatedAudioMs / mappedCount))
            : baseStep;
        const SPACE = STEP * 0.5;
        const COMMA = STEP * 2.0;
        const queue = [];
        let t = 0;
        for (let i = 0; i < clean.length; i++) {
            const ch = clean[i];
            if (ch === ' ') { t += SPACE; continue; }
            if (',;:'.includes(ch))   { t += COMMA / 2; continue; }
            if ('.!?'.includes(ch))   { t += COMMA; continue; }
            const v = LETTER_TO_VISEME[ch];
            if (!v) continue;
            if (queue.length && queue[queue.length - 1].viseme === v) {
                queue[queue.length - 1].endTime = t + STEP;
            } else {
                queue.push({ viseme: v, startTime: t, endTime: t + STEP, charIndex: i });
            }
            t += STEP;
        }
        queue.push({ viseme: 'Rest', startTime: t, endTime: t + STEP });
        return queue;
    }
    function initVideoTutor() {
        ['video-tutor-panel', 'video-tutor-stage', 'video-tutor-hint'].forEach(id => {
            const old = document.getElementById(id);
            if (old) old.remove();
        });
        const panelContainer = document.createElement('div');
        panelContainer.id = 'video-tutor-panel';
        Object.assign(panelContainer.style, {
            position: 'fixed', top: '420px', left: '15px',
            zIndex: '100001', fontFamily: 'sans-serif',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
        });
        document.body.appendChild(panelContainer);
        const miniBtn = document.createElement('div');
        miniBtn.innerHTML = '⚙️ Control';
        Object.assign(miniBtn.style, {
            background: 'rgba(30,30,30,0.5)',
            border: '1px solid rgba(241,196,15,0.3)',
            borderRadius: '20px', padding: '6px 14px',
            cursor: 'pointer', fontSize: '0.75rem',
            color: 'rgba(241,196,15,0.8)', fontWeight: 'bold',
            backdropFilter: 'blur(4px)', transition: 'all 0.3s ease', userSelect: 'none'
        });
        miniBtn.onmouseover = () => {
            miniBtn.style.background = 'rgba(241,196,15,0.15)';
            miniBtn.style.borderColor = 'rgba(241,196,15,0.6)';
            miniBtn.style.transform = 'scale(1.05)';
        };
        miniBtn.onmouseout = () => {
            miniBtn.style.background = 'rgba(30,30,30,0.5)';
            miniBtn.style.borderColor = 'rgba(241,196,15,0.3)';
            miniBtn.style.transform = 'scale(1)';
        };
        panelContainer.appendChild(miniBtn);
        const panel = document.createElement('div');
        Object.assign(panel.style, {
            width: '320px', background: 'rgba(44,62,80,0.92)',
            borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            marginTop: '10px', display: 'none', flexDirection: 'column',
            maxHeight: '80vh', overflowY: 'auto'
        });
        panelContainer.appendChild(panel);
        let isPanelOpen = false;
        miniBtn.onclick = () => {
            isPanelOpen = !isPanelOpen;
            panel.style.display = isPanelOpen ? 'flex' : 'none';
        };
        const pHeader = document.createElement('div');
        Object.assign(pHeader.style, {
            padding: '8px', background: '#2c3e50', color: 'white',
            fontSize: '12px', cursor: 'move',
            borderTopLeftRadius: '8px', borderTopRightRadius: '8px',
            display: 'flex', justifyContent: 'space-between'
        });
        pHeader.innerHTML = '<span>Arrastrar Panel</span><span id="pvt-close" style="cursor:pointer;color:#e74c3c;font-weight:bold;">X (Cerrar todo)</span>';
        panel.appendChild(pHeader);
        const pContent = document.createElement('div');
        Object.assign(pContent.style, {
            padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px'
        });
        panel.appendChild(pContent);
        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, { display: 'flex', flexWrap: 'wrap', gap: '5px' });
        pContent.appendChild(btnContainer);
        const routines = [
            { name: "LED",            msg: "Hoy armaremos nuestro primer circuito para encender un LED. Recuerda conectar la resistencia." },
            { name: "Corriente",      msg: "Para medir la corriente, debes conectar el amperímetro en serie con el componente." },
            { name: "Paralelo",       msg: "En un circuito en paralelo, el voltaje es el mismo en todas las ramas. ¡Pruébalo!" },
            { name: "Despedida",      msg: "Excelente trabajo. Nos vemos en el próximo desafío." },
            { name: "Saludar (Voz)",  msg: "Bienvenido a Patitas, un simulador de electrónica genial.", voice: true },
            { name: "Probar Lip-sync",msg: "Hola, soy Patitas. Voy a hablar sobre electrónica, transistores y circuitos en serie y paralelo.", voice: true }
        ];
        routines.forEach(r => {
            const b = document.createElement('button');
            b.innerText = r.name;
            Object.assign(b.style, {
                padding: '5px 8px', cursor: 'pointer', fontSize: '11px',
                background: r.voice ? '#e74c3c' : '#f1c40f',
                color: r.voice ? 'white' : '#2c3e50',
                fontWeight: 'bold', border: 'none', borderRadius: '4px',
                transition: 'transform 0.1s'
            });
            b.onmousedown = () => b.style.transform = 'scale(0.95)';
            b.onmouseup   = () => b.style.transform = 'scale(1)';
            b.onclick = () => r.voice ? speakWithAnimation(r.msg) : showBubble(r.msg);
            btnContainer.appendChild(b);
        });
        const animTitle = document.createElement('div');
        animTitle.innerText = 'Modelos / animaciones:';
        Object.assign(animTitle.style, { color: 'white', fontSize: '12px', marginTop: '5px' });
        pContent.appendChild(animTitle);
        const animContainer = document.createElement('div');
        Object.assign(animContainer.style, { display: 'flex', flexWrap: 'wrap', gap: '5px' });
        pContent.appendChild(animContainer);
        [
            { name: "Mandíbula★", key: "mandibula" },
            { name: "Bailar",     key: "dance"     },
            { name: "Caminar",    key: "walk"      },
            { name: "Correr",     key: "run"       },
            { name: "Acordar",    anim: "agree"    },
            { name: "Presentar",  anim: "present"  },
            { name: "Reverencia", anim: "reverencia" },
            { name: "Alentar",    anim: "alentar"  }
        ].forEach(a => {
            const b = document.createElement('button');
            b.innerText = a.name;
            const isMain = a.key === 'mandibula';
            const isAnim = !!a.anim;
            Object.assign(b.style, {
                padding: '4px 8px', cursor: 'pointer', fontSize: '11px',
                background: isMain ? '#27ae60' : (isAnim ? '#2980b9' : '#8e44ad'),
                color: 'white', fontWeight: 'bold',
                border: 'none', borderRadius: '4px', transition: 'transform 0.1s'
            });
            b.title = isMain ? 'Con shape keys de lip-sync' : (isAnim ? 'Animación del GLB' : 'Modelo externo');
            b.onmousedown = () => b.style.transform = 'scale(0.95)';
            b.onmouseup   = () => b.style.transform = 'scale(1)';
            if (isAnim) {
                b.onclick = () => {
                    if (a.anim === 'reverencia') { window.patitasBow && window.patitasBow(); return; }
                    if (a.anim === 'alentar')    { window.patitasCheer && window.patitasCheer(); return; }
                    window.patitasPlayAnimation && window.patitasPlayAnimation(a.anim);
                };
            } else {
                b.onclick = () => loadModel(MODEL_PATHS[a.key]);
            }
            animContainer.appendChild(b);
        });
        const tfTitle = document.createElement('div');
        tfTitle.innerText = 'Modelo: posición / rotación / escala';
        Object.assign(tfTitle.style, { color: 'white', fontSize: '12px', marginTop: '5px' });
        pContent.appendChild(tfTitle);
        function makeSlider(parent, label, min, max, step, value, onChange) {
            const row = document.createElement('div');
            Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '6px' });
            const lab = document.createElement('span');
            lab.innerText = label;
            Object.assign(lab.style, { color: '#ecf0f1', fontSize: '11px', width: '32px' });
            const inp = document.createElement('input');
            inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = value;
            inp.style.flex = '1';
            const num = document.createElement('span');
            num.innerText = (+value).toFixed(2);
            Object.assign(num.style, { color: '#bdc3c7', fontSize: '10px', width: '40px', textAlign: 'right' });
            inp.oninput = () => { num.innerText = (+inp.value).toFixed(2); onChange(+inp.value); };
            row.appendChild(lab); row.appendChild(inp); row.appendChild(num);
            parent.appendChild(row);
            return inp;
        }
        const sliderX  = makeSlider(pContent, 'X',  -8,   8,   0.05, 0,   v => { if (currentModel) currentModel.position.x = v; });
        const sliderY  = makeSlider(pContent, 'Y',  -4,   4,   0.05, 0.6, v => { if (currentModel) { currentModel.position.y = v; baseY = v; } });
        const sliderZ  = makeSlider(pContent, 'Z',  -6,   4,   0.05, 0,   v => { if (currentModel) currentModel.position.z = v; });
        const sliderRY = makeSlider(pContent, '↻', -180, 180,  1,    0,   v => { if (currentModel) currentModel.rotation.y = v * Math.PI / 180; });
        const sliderS  = makeSlider(pContent, 'Esc',0.2,  4,   0.05, 1,   v => { if (currentModel) currentModel.scale.set(v, v, v); });
        const resetBtn = document.createElement('button');
        resetBtn.innerText = '↺ Reset posición';
        Object.assign(resetBtn.style, {
            padding: '5px 10px', cursor: 'pointer', fontSize: '11px',
            background: '#16a085', color: 'white', fontWeight: 'bold',
            border: 'none', borderRadius: '4px'
        });
        resetBtn.onclick = resetTransform;
        pContent.appendChild(resetBtn);
        const visemeTitle = document.createElement('div');
        visemeTitle.innerHTML = 'Probar viseme manual <span style="opacity:.6">(forzar shape key)</span>';
        Object.assign(visemeTitle.style, { color: 'white', fontSize: '11px', marginTop: '5px' });
        pContent.appendChild(visemeTitle);
        const visemeRow = document.createElement('div');
        Object.assign(visemeRow.style, { display: 'flex', flexWrap: 'wrap', gap: '4px' });
        pContent.appendChild(visemeRow);
        VISEME_NAMES.forEach(v => {
            const b = document.createElement('button');
            b.innerText = v;
            Object.assign(b.style, {
                padding: '3px 7px', cursor: 'pointer', fontSize: '10px',
                background: '#34495e', color: '#ecf0f1', border: '1px solid #7f8c8d',
                borderRadius: '4px', fontWeight: 'bold'
            });
            b.onclick = () => { manualViseme = v; };
            visemeRow.appendChild(b);
        });
        const autoBtn = document.createElement('button');
        autoBtn.innerText = 'AUTO';
        Object.assign(autoBtn.style, {
            padding: '3px 7px', cursor: 'pointer', fontSize: '10px',
            background: '#27ae60', color: 'white', border: 'none',
            borderRadius: '4px', fontWeight: 'bold'
        });
        autoBtn.onclick = () => { manualViseme = null; };
        visemeRow.appendChild(autoBtn);
        const customContainer = document.createElement('div');
        Object.assign(customContainer.style, { display: 'flex', gap: '5px', marginTop: '6px' });
        const customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.placeholder = 'Mensaje personalizado...';
        Object.assign(customInput.style, {
            flex: '1', fontSize: '12px', padding: '4px 6px', borderRadius: '4px',
            border: '1px solid #7f8c8d', background: '#34495e', color: 'white'
        });
        const speakBtn = document.createElement('button');
        speakBtn.innerText = 'Hablar';
        Object.assign(speakBtn.style, {
            padding: '4px 10px', cursor: 'pointer', fontSize: '12px',
            background: '#2ecc71', color: 'white', fontWeight: 'bold',
            border: 'none', borderRadius: '4px'
        });
        speakBtn.onclick = () => {
            if (customInput.value.trim() !== '') {
                speakWithAnimation(customInput.value);
                customInput.value = '';
            }
        };
        customContainer.appendChild(customInput);
        customContainer.appendChild(speakBtn);
        pContent.appendChild(customContainer);
        makeDraggable(panelContainer, pHeader);
        document.getElementById('pvt-close').onclick = () => {
            panelContainer.remove();
            stage.remove();
            hint.remove();
            bubble.remove();
            window.patitasVideoTutorLoaded = false;
            window.__patitasShouldRender = false;
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
        const stage = document.createElement('div');
        stage.id = 'video-tutor-stage';
        Object.assign(stage.style, {
            position: 'fixed', left: '0', top: '0',
            width: '100vw', height: '100vh',
            zIndex: '99999', background: 'transparent', pointerEvents: 'none'
        });
        document.body.appendChild(stage);
        const hint = document.createElement('div');
        hint.id = 'video-tutor-hint';
        hint.innerHTML = 'Modo Patitas activo • Alt+arrastre mueve • Alt+Shift rota • Alt+rueda escala • Alt+clic der resetea • Ctrl+Alt+P ocultar/mostrar';
        Object.assign(hint.style, {
            position: 'fixed', bottom: '20px', left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(231,76,60,0.92)', color: 'white',
            padding: '8px 16px', borderRadius: '20px',
            fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 'bold',
            zIndex: '100002', display: 'none', pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        });
        document.body.appendChild(hint);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 1.5, 5);
        camera.lookAt(0, 1, 0);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.pointerEvents = 'none';
        stage.appendChild(renderer.domElement);
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        scene.add(new THREE.AmbientLight(0xffffff, 0.85));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 8, 5);
        scene.add(dirLight);
        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        hemi.position.set(0, 20, 0);
        scene.add(hemi);
        let mixer = null;
        let actionsMap = {};
        let currentAction = null;
        let currentActionName = null;
        const clock = new THREE.Clock();
        let currentModel = null;
        let headBone = null, spineBone = null, jawBone = null;
        let lastHeadOffset = { x: 0, y: 0, z: 0 };
        let lastSpineOffset = { x: 0 };
        let bowT0 = 0;
        let cheerT0 = 0;
        let baseY = 0.6;
        let morphMeshes = [];      
        let _usingGlbMorphs = false; 
        let manualViseme = null;
        let currentViseme = 'Neutral';
        let currentJawOffset = 0;  
        let jawBaseQuat = null;    
        let isSpeaking = false;
        let speakingT0 = 0;
        let visemeQueue = [];
        let speakSafetyTimeout = null;
        const loader = new THREE.GLTFLoader();
        function findRigPieces(root) {
            headBone = null; spineBone = null; jawBone = null;
            morphMeshes = [];
            root.traverse(node => {
                if (node.isBone || node.type === 'Bone') {
                    const n = (node.name || '').toLowerCase();
                    if (!headBone  && n === 'head')                                 headBone = node;
                    if (!jawBone   && n === 'jaw')                                  jawBone = node;
                    if (!spineBone && (n === 'spine02' || n === 'spine2'))          spineBone = node;
                }
                if (node.isMesh) {
                    if (node.morphTargetInfluences && node.morphTargetDictionary) {
                        morphMeshes.push({ mesh: node, dict: node.morphTargetDictionary });
                    } else if ((node.name || '').toLowerCase().includes('char')) {
                        const dict = {};
                        const infl = [];
                        FALLBACK_VISEME_NAMES.forEach((nm, i) => { dict[nm] = i; infl.push(0); });
                        node.morphTargetDictionary = dict;
                        node.morphTargetInfluences = infl;
                        morphMeshes.push({ mesh: node, dict: dict });
                        console.log('[Patitas] slots de morph creados en', node.name);
                    }
                }
            });
            if (!headBone) {
                root.traverse(node => {
                    if (headBone) return;
                    if ((node.isBone || node.type === 'Bone') && (node.name || '').toLowerCase().includes('head')) {
                        headBone = node;
                    }
                });
            }
            console.log('[Patitas] headBone =', headBone && headBone.name,
                        ' spineBone =', spineBone && spineBone.name,
                        ' jawBone =', jawBone && jawBone.name,
                        ' morphMeshes =', morphMeshes.length);
            if (morphMeshes.length) {
                morphMeshes.forEach(mm => console.log('   morphs en', mm.mesh.name, '=', Object.keys(mm.dict)));
            } else {
                console.warn('[Patitas] Este modelo NO tiene shape keys. Lip-sync deshabilitado (solo head-bob).');
            }
        }
        function syncSlidersFromModel() {
            if (!currentModel) return;
            sliderX.value  = currentModel.position.x.toFixed(2);
            sliderY.value  = currentModel.position.y.toFixed(2);
            sliderZ.value  = currentModel.position.z.toFixed(2);
            sliderRY.value = (currentModel.rotation.y * 180 / Math.PI).toFixed(0);
            sliderS.value  = currentModel.scale.x.toFixed(2);
            [sliderX, sliderY, sliderZ, sliderRY, sliderS].forEach(s => s.dispatchEvent(new Event('input')));
        }
        function applyModel(gltf, prev) {
            currentModel = gltf.scene;
            if (prev) {
                currentModel.position.copy(prev.position);
                currentModel.rotation.copy(prev.rotation);
                currentModel.scale.copy(prev.scale);
            } else {
                currentModel.position.set(0, baseY, 0);
                currentModel.scale.set(1, 1, 1);
            }
            findRigPieces(currentModel);
            if (jawBone) {
                jawBaseQuat = jawBone.quaternion.clone();
            } else {
                jawBaseQuat = null;
            }
            scene.add(currentModel);
            populateMorphTargets();
            manualViseme = null;
            isSpeaking = false;
            currentViseme = 'Neutral';
            currentJawOffset = 0;
            morphMeshes.forEach(mm => {
                for (let i = 0; i < mm.mesh.morphTargetInfluences.length; i++) {
                    mm.mesh.morphTargetInfluences[i] = 0;
                }
            });
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(currentModel);
                actionsMap = {};
                gltf.animations.forEach(clip => {
                    clip.tracks = clip.tracks.filter(t => !/jaw/i.test(t.name));
                    const action = mixer.clipAction(clip);
                    action.setLoop(THREE.LoopRepeat, Infinity);
                    actionsMap[clip.name] = action;
                });
                window.PATITAS_ANIMATIONS = Object.keys(actionsMap);
                window.PATITAS_ANIMATIONS.push('reverencia', 'alentar');
                console.log('[Patitas] Animaciones disponibles:', window.PATITAS_ANIMATIONS);
                let initialName = 'walking';
                if (!actionsMap[initialName]) initialName = window.PATITAS_ANIMATIONS[0];
                currentAction = actionsMap[initialName];
                currentActionName = initialName;
                currentAction.play();
                console.log('[Patitas] Animación inicial:', initialName);
            } else {
                actionsMap = {};
                window.PATITAS_ANIMATIONS = [];
                currentAction = null;
                currentActionName = null;
            }
            syncSlidersFromModel();
        }
        function loadModel(src) {
            if (!src) return;
            const prev = currentModel ? {
                position: currentModel.position.clone(),
                rotation: currentModel.rotation.clone(),
                scale:    currentModel.scale.clone()
            } : null;
            if (currentModel) { scene.remove(currentModel); currentModel = null; }
            if (mixer) { mixer.stopAllAction(); mixer = null; }
            morphMeshes = [];
            headBone = null; spineBone = null; jawBone = null;
            let url = src;
            if (window.location.protocol !== 'file:') {
                const cacheBust = src.includes('?') ? '&' : '?';
                url += cacheBust + 'v=' + Date.now();
            }
            loader.load(
                url,
                gltf => applyModel(gltf, prev),
                undefined,
                err => console.warn('[Patitas] Error cargando', url, err)
            );
        }
        window.patitasLoadModel = loadModel;
        window.patitasBow = function() {
            bowT0 = performance.now();
        };
        window.patitasCheer = function() {
            cheerT0 = performance.now();
        };
        window.patitasPlayAnimation = function (name, fadeMs) {
            fadeMs = (typeof fadeMs === 'number') ? fadeMs : 400;
            if (!actionsMap || !actionsMap[name]) {
                console.warn('[Patitas] Animación no encontrada:', name,
                             '— Disponibles:', Object.keys(actionsMap || {}));
                return false;
            }
            const newAction = actionsMap[name];
            if (newAction === currentAction) return true;
            newAction.reset();
            newAction.setEffectiveTimeScale(1);
            newAction.setEffectiveWeight(1);
            newAction.play();
            if (currentAction) {
                currentAction.crossFadeTo(newAction, fadeMs / 1000, false);
            }
            currentAction = newAction;
            currentActionName = name;
            console.log('[Patitas] crossfade →', name);
            return true;
        };
        window.patitasCurrentAnimation = function () { return currentActionName; };
        window.patitasGetTransform = function() {
            if (!currentModel) return { x: 0, y: 0, z: 0, rotY: 0 };
            return {
                x: currentModel.position.x,
                y: currentModel.position.y,
                z: currentModel.position.z,
                rotY: currentModel.rotation.y
            };
        };
        let transformAnimId = null;
        window.patitasSetTransform = function(x, y, z, rotY, durationMs) {
            if (!currentModel) return;
            if (transformAnimId) cancelAnimationFrame(transformAnimId);
            if (!durationMs || durationMs <= 0) {
                currentModel.position.set(x, y, z);
                currentModel.rotation.y = rotY;
                return;
            }
            const startX = currentModel.position.x;
            const startY = currentModel.position.y;
            const startZ = currentModel.position.z;
            const startRotY = currentModel.rotation.y;
            const startTime = performance.now();
            function animateTransform(now) {
                const t = Math.min(1, (now - startTime) / durationMs);
                const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                currentModel.position.set(
                    startX + (x - startX) * ease,
                    startY + (y - startY) * ease,
                    startZ + (z - startZ) * ease
                );
                currentModel.rotation.y = startRotY + (rotY - startRotY) * ease;
                if (t < 1) {
                    transformAnimId = requestAnimationFrame(animateTransform);
                }
            }
            transformAnimId = requestAnimationFrame(animateTransform);
        };
        loadModel(MODEL_PATHS.mandibula);
        const bubble = document.createElement('div');
        Object.assign(bubble.style, {
            position: 'fixed', left: '50%', bottom: '40px', top: 'auto',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.65)', color: '#ffffff',
            padding: '12px 24px', borderRadius: '8px',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            fontSize: '26px', maxWidth: '80%', textAlign: 'center',
            display: 'none', 
            boxShadow: '0 0 15px rgba(255,255,255,0.6), 0 0 20px rgba(241, 196, 15, 0.4)',
            textShadow: '0 0 10px rgba(255,255,255,0.8)',
            pointerEvents: 'none', zIndex: '200000',
            fontWeight: 'bold'
        });
        document.body.appendChild(bubble);
        let hideBubbleTimeout = null;
        function showBubble(text) {
            bubble.innerHTML = text;
            bubble.style.display = 'block';
            clearTimeout(hideBubbleTimeout);
            hideBubbleTimeout = setTimeout(() => { bubble.style.display = 'none'; }, 6000);
        }
        window.patitasVideoTutorSpeak = showBubble;
        function stopSpeaking() {
            isSpeaking = false;
            visemeQueue = [];
            if (speakSafetyTimeout) { clearTimeout(speakSafetyTimeout); speakSafetyTimeout = null; }
        }
        function speakWithAnimation(text, opts = { showSubtitle: true }) {
            if (opts.showSubtitle) {
                showBubble(text);
            }
            if (speakSafetyTimeout) { clearTimeout(speakSafetyTimeout); speakSafetyTimeout = null; }
            visemeQueue = buildVisemeQueue(text, 'tts');
            const lastT = visemeQueue.length ? visemeQueue[visemeQueue.length - 1].endTime : 1500;
            isSpeaking = true;
            speakingT0 = performance.now();
            return new Promise(resolve => {
                let finished = false;
                const finish = () => {
                    if (finished) return;
                    finished = true;
                    stopSpeaking();
                    resolve();
                };
                if (!window.speechSynthesis) {
                    speakSafetyTimeout = setTimeout(finish, lastT + 300);
                    return;
                }
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(text.toLowerCase());
                u.lang = 'es-ES';
                u.pitch = 1.3;
                u.rate = 1.0;
                u.onstart = () => {
                    isSpeaking = true;
                };
                u.onboundary = (ev) => {
                    if (typeof ev.charIndex !== 'number') return;
                    let target = null;
                    for (let i = 0; i < visemeQueue.length; i++) {
                        if (visemeQueue[i].charIndex !== undefined && visemeQueue[i].charIndex >= ev.charIndex) {
                            target = visemeQueue[i]; break;
                        }
                    }
                    if (!target) return;
                    speakingT0 = performance.now() - target.startTime;
                };
                u.onend   = finish;
                u.onerror = finish;
                window.speechSynthesis.speak(u);
                const safetyMs = Math.max(lastT, text.length * 130) + 1500;
                speakSafetyTimeout = setTimeout(finish, safetyMs);
            });
        }
        window.patitasVideoTutorVoice = speakWithAnimation;
        let altDown = false, shiftDown = false, dragging = false;
        const dragStart = { x: 0, y: 0 };
        const modelStart = new THREE.Vector3();
        let rotStart = 0;
        function setManipMode(on) {
            stage.style.pointerEvents = on ? 'auto' : 'none';
            renderer.domElement.style.pointerEvents = on ? 'auto' : 'none';
            renderer.domElement.style.cursor = on ? (dragging ? 'grabbing' : 'grab') : 'default';
            hint.style.display = on ? 'block' : 'none';
        }
        let patitasVisible = true;
        function _handleKeyDown(e) {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
                patitasVisible = !patitasVisible;
                stage.style.display = patitasVisible ? 'block' : 'none';
                if (typeof bubble !== 'undefined') bubble.style.visibility = patitasVisible ? 'visible' : 'hidden';
                return;
            }
            if (e.key === 'Alt' || e.altKey) {
                if (!altDown) { altDown = true; setManipMode(true); }
            }
            if (e.key === 'Shift') shiftDown = true;
            if (e.key === 'Escape' && altDown) { altDown = false; setManipMode(false); }
        }
        function _handleKeyUp(e) {
            if (e.key === 'Alt') { altDown = false; dragging = false; setManipMode(false); }
            if (e.key === 'Shift') shiftDown = false;
        }
        function _handleBlur() {
            altDown = false; shiftDown = false; dragging = false; setManipMode(false);
        }
        window.addEventListener('keydown', _handleKeyDown);
        window.addEventListener('keyup', _handleKeyUp);
        window.addEventListener('blur', _handleBlur);
        try {
            if (window.parent && window.parent !== window) {
                window.parent.addEventListener('keydown', _handleKeyDown);
                window.parent.addEventListener('keyup', _handleKeyUp);
                window.parent.addEventListener('blur', _handleBlur);
            }
        } catch(err) {   }
        function pxToWorld(dx, dy) {
            const dist = camera.position.distanceTo(
                currentModel ? currentModel.position : new THREE.Vector3(0, 1, 0)
            );
            const vFov = camera.fov * Math.PI / 180;
            const worldHeight = 2 * Math.tan(vFov / 2) * dist;
            const worldWidth = worldHeight * camera.aspect;
            return {
                x:  (dx / window.innerWidth)  * worldWidth,
                y: -(dy / window.innerHeight) * worldHeight
            };
        }
        renderer.domElement.addEventListener('mousedown', e => {
            if (!altDown || !currentModel) return;
            if (e.button === 2) { resetTransform(); e.preventDefault(); return; }
            dragging = true;
            dragStart.x = e.clientX; dragStart.y = e.clientY;
            modelStart.copy(currentModel.position);
            rotStart = currentModel.rotation.y;
            renderer.domElement.style.cursor = 'grabbing';
            e.preventDefault();
        });
        window.addEventListener('mousemove', e => {
            if (!dragging || !currentModel) return;
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            if (shiftDown) {
                currentModel.rotation.y = rotStart + dx * Math.PI / 720;
            } else {
                const w = pxToWorld(dx, dy);
                currentModel.position.x = modelStart.x + w.x;
                currentModel.position.y = modelStart.y + w.y;
            }
            syncSlidersFromModel();
        });
        window.addEventListener('mouseup', () => {
            dragging = false;
            if (altDown) renderer.domElement.style.cursor = 'grab';
        });
        renderer.domElement.addEventListener('wheel', e => {
            if (!altDown || !currentModel) return;
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.95 : 1.05;
            const ns = Math.min(4, Math.max(0.2, currentModel.scale.x * factor));
            currentModel.scale.set(ns, ns, ns);
            syncSlidersFromModel();
        }, { passive: false });
        renderer.domElement.addEventListener('contextmenu', e => {
            if (altDown) e.preventDefault();
        });
        function resetTransform() {
            if (!currentModel) return;
            currentModel.position.set(0, baseY, 0);
            currentModel.rotation.set(0, 0, 0);
            currentModel.scale.set(1, 1, 1);
            syncSlidersFromModel();
        }
        window.patitasSetViseme = function (name) {
            if (!name || name === 'AUTO') { manualViseme = null; console.log('[Patitas] viseme = AUTO'); return; }
            if (VISEME_NAMES.indexOf(name) === -1) {
                console.warn('[Patitas] viseme desconocido. Válidos:', VISEME_NAMES);
                return;
            }
            manualViseme = name;
            console.log('[Patitas] manualViseme =', name);
        };
        window.patitasTestJaw = function (amount, axis, sign) {
            if (typeof amount === 'number') window.PVT_JAW_SCALE = amount;
            if (typeof axis === 'string')   window.PVT_JAW_AXIS  = axis;
            if (typeof sign === 'number')   window.PVT_JAW_SIGN  = sign;
            manualViseme = 'A';
            console.log('[Patitas] Jaw test: scale=' + window.PVT_JAW_SCALE +
                        ' axis=' + (window.PVT_JAW_AXIS || 'x') +
                        ' sign=' + (window.PVT_JAW_SIGN || 1));
        };
        window.patitasJawDirect = function (axis, value) {
            if (!jawBone) { console.warn('no jawBone'); return; }
            if (!['x','y','z'].includes(axis)) return;
            if (typeof value !== 'number') value = -0.3;
            window.PVT_JAW_AXIS = axis;
            window.PVT_JAW_SIGN = (value < 0) ? -1 : 1;
            window.PVT_JAW_SCALE = Math.abs(value) / 0.60;
            manualViseme = 'A';
            console.log('[Patitas] JawDirect: axis=' + axis + ' value=' + value +
                        '  scale=' + window.PVT_JAW_SCALE.toFixed(3) +
                        ' sign=' + window.PVT_JAW_SIGN);
        };
        window.patitasPauseAnim = function () {
            if (mixer) mixer.timeScale = 0;
            console.log('[Patitas] animación pausada');
        };
        window.patitasResumeAnim = function () {
            if (mixer) mixer.timeScale = 1;
            console.log('[Patitas] animación reanudada');
        };
        window.patitasJawTest = function (rx, ry, rz, ms) {
            if (!jawBone || !jawBaseQuat) { console.warn('no jawBone/base'); return; }
            const euler = new THREE.Euler(rx || 0, ry || 0, rz || 0, 'XYZ');
            const offQuat = new THREE.Quaternion().setFromEuler(euler);
            jawBone.quaternion.copy(jawBaseQuat).multiply(offQuat);
            window._patitasJawTestActive = true;
            setTimeout(() => {
                window._patitasJawTestActive = false;
                console.log('[Patitas] Jaw test terminado');
            }, ms || 4000);
            console.log('[Patitas] Jaw test LOCAL: euler=(' + (rx||0) + ',' + (ry||0) + ',' + (rz||0) + ')');
        };
        window.patitasJawTestWorld = function (axis, angle, ms) {
            if (!jawBone || !jawBaseQuat) { console.warn('no jawBone/base'); return; }
            const worldAxis = new THREE.Vector3(
                axis === 'x' ? 1 : 0,
                axis === 'y' ? 1 : 0,
                axis === 'z' ? 1 : 0
            );
            const worldRot = new THREE.Quaternion().setFromAxisAngle(worldAxis, angle || 0);
            const parent = jawBone.parent;
            if (parent) {
                parent.updateMatrixWorld(true);
                const parentWorldQuat = new THREE.Quaternion();
                parent.getWorldQuaternion(parentWorldQuat);
                const localRot = parentWorldQuat.clone().invert()
                    .multiply(worldRot)
                    .multiply(parentWorldQuat);
                jawBone.quaternion.copy(localRot).multiply(jawBaseQuat);
            } else {
                jawBone.quaternion.copy(worldRot).multiply(jawBaseQuat);
            }
            window._patitasJawTestActive = true;
            setTimeout(() => {
                window._patitasJawTestActive = false;
                console.log('[Patitas] Jaw test terminado');
            }, ms || 4000);
            console.log('[Patitas] Jaw test WORLD: axis=' + axis + ' angle=' + angle);
        };
        window.patitasGetJaw = function () { return jawBone; };
        window.patitasSetMouthAmplitude = function (amp) {
            if (typeof amp !== 'number') { console.warn('amp debe ser número'); return; }
            window.PVT_MOUTH_AMPLITUDE = Math.max(0, Math.min(10, amp));
            console.log('[Patitas] Amplitud:', window.PVT_MOUTH_AMPLITUDE, '/10');
        };
        window.patitasJawInfo = function () {
            if (!jawBone) return;
            jawBone.updateMatrixWorld(true);
            const pos = new THREE.Vector3();
            const quat = new THREE.Quaternion();
            const scl = new THREE.Vector3();
            jawBone.matrixWorld.decompose(pos, quat, scl);
            const xWorld = new THREE.Vector3(1,0,0).applyQuaternion(quat);
            const yWorld = new THREE.Vector3(0,1,0).applyQuaternion(quat);
            const zWorld = new THREE.Vector3(0,0,1).applyQuaternion(quat);
            console.log('[Patitas] Jaw world pos:', pos.toArray().map(n=>n.toFixed(3)));
            console.log('[Patitas] Jaw world quat:', quat.toArray().map(n=>n.toFixed(3)));
            console.log('[Patitas] eje X local en world:', xWorld.toArray().map(n=>n.toFixed(3)));
            console.log('[Patitas] eje Y local en world:', yWorld.toArray().map(n=>n.toFixed(3)));
            console.log('[Patitas] eje Z local en world:', zWorld.toArray().map(n=>n.toFixed(3)));
            if (currentModel) {
                console.log('[Patitas] currentModel rotation Y (deg):',
                    (currentModel.rotation.y * 180 / Math.PI).toFixed(1));
            }
        };
        window.patitasJawTestVec = function (vx, vy, vz, angle, ms) {
            if (!jawBone || !jawBaseQuat) { return; }
            const worldAxis = new THREE.Vector3(vx, vy, vz).normalize();
            const worldRot = new THREE.Quaternion().setFromAxisAngle(worldAxis, angle || 0);
            const parent = jawBone.parent;
            if (parent) {
                parent.updateMatrixWorld(true);
                const parentWorldQuat = new THREE.Quaternion();
                parent.getWorldQuaternion(parentWorldQuat);
                const localRot = parentWorldQuat.clone().invert()
                    .multiply(worldRot)
                    .multiply(parentWorldQuat);
                jawBone.quaternion.copy(localRot).multiply(jawBaseQuat);
            }
            window._patitasJawTestActive = true;
            setTimeout(() => { window._patitasJawTestActive = false; }, ms || 4000);
            console.log('[Patitas] Jaw test VEC: axis=(' + vx + ',' + vy + ',' + vz +
                        ') angle=' + angle);
        };
        window.patitasMouthState = function () {
            const st = {
                version: PVT_VERSION,
                isSpeaking,
                manualViseme,
                currentViseme,
                morphMeshes: morphMeshes.map(mm => ({
                    mesh: mm.mesh.name,
                    keys: Object.keys(mm.dict),
                    influences: Array.from(mm.mesh.morphTargetInfluences || [])
                })),
                headBone: headBone && headBone.name,
                jawBone:  jawBone && jawBone.name
            };
            console.log('[Patitas] state:', st);
            return st;
        };
        window.__patitasShouldRender = true;
        const tmpVec = new THREE.Vector3();
        function pickViseme() {
            if (manualViseme) return manualViseme;
            if (!isSpeaking)  return 'Neutral';
            const elapsed = performance.now() - speakingT0;
            let cur = 'Rest';
            for (let i = 0; i < visemeQueue.length; i++) {
                if (visemeQueue[i].startTime <= elapsed) cur = visemeQueue[i].viseme;
                else break;
            }
            return cur;
        }
        function populateMorphTargets() {
            if (!morphMeshes.length) return;
            const mm = morphMeshes[0];
            const mesh = mm.mesh;
            const geo = mesh.geometry;
            const positions = geo.attributes.position;
            if (!positions) return;
            let patchGlb = false;
            const _mp = geo.morphAttributes && geo.morphAttributes.position;
            if (_mp && _mp.length) {
                let _real = false;
                for (let t = 0; t < _mp.length && !_real; t++) {
                    const a = _mp[t] && _mp[t].array;
                    if (!a) continue;
                    for (let i = 0; i < a.length; i++) { if (Math.abs(a[i]) > 1e-6) { _real = true; break; } }
                }
                if (_real) {
                    _usingGlbMorphs = true;
                    console.log('[Patitas] usando shape keys del GLB (visemes esculpidos) — parcheando labio central');
                    patchGlb = true;
                }
            }
            mesh.updateMatrixWorld(true);
            const tempVec = new THREE.Vector3();
            const tempNormal = new THREE.Vector3();
            const normalAttr = geo.attributes.normal;
            const normalMat = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
            const candidates = [];  
            for (let i = 0; i < positions.count; i++) {
                tempVec.set(positions.getX(i), positions.getY(i), positions.getZ(i));
                tempVec.applyMatrix4(mesh.matrixWorld);
                if (tempVec.y >= 0.95 && tempVec.y <= 1.03 &&
                    tempVec.z > 0.15 && tempVec.z < 0.85 &&
                    Math.abs(tempVec.x) < 0.42) {
                    if (normalAttr) {
                        tempNormal.set(normalAttr.getX(i), normalAttr.getY(i), normalAttr.getZ(i));
                        tempNormal.applyMatrix3(normalMat).normalize();
                        if (tempNormal.y > 0.3) continue;
                    }
                    const yw = Math.max(0.4, 1.0 - Math.abs(tempVec.y - 0.99) / 0.05);
                    const xw = Math.max(0.5, 1.0 - (Math.abs(tempVec.x) / 0.42) * 0.5);
                    candidates.push({ idx: i, w: yw * xw });
                }
            }
            console.log('[Patitas] vertices del labio inferior detectados:', candidates.length);
            if (patchGlb) {
                const patchArray = (visemeName, dy) => {
                    const idx = mm.dict[visemeName];
                    if (idx === undefined || !_mp[idx]) return;
                    const arr = _mp[idx].array;
                    candidates.forEach(c => {
                        arr[c.idx * 3 + 1] += dy * c.w;
                    });
                    _mp[idx].needsUpdate = true;
                };
                patchArray('A', -0.020);
                patchArray('O', -0.025);
                patchArray('E', -0.014);
                patchArray('U', -0.018);
                return;
            }
            if (!geo.morphAttributes.position) geo.morphAttributes.position = [];
            const numVerts = positions.count;
            const AMP = 10.0;
            const VISEMES = {
                'Neutral': { dy: 0.0,        dz: 0.0,         dx_s: 0.0       },
                'A':       { dy: -0.06*AMP,  dz: 0.0,         dx_s: 0.0       },
                'O':       { dy: -0.045*AMP, dz: 0.005*AMP,   dx_s: -0.30*AMP },
                'E':       { dy: -0.025*AMP, dz: 0.0,         dx_s: 0.15*AMP  },
                'I':       { dy: -0.012*AMP, dz: 0.0,         dx_s: 0.20*AMP  },
                'U':       { dy: -0.025*AMP, dz: 0.005*AMP,   dx_s: -0.40*AMP },
                'M':       { dy: 0.005*AMP,  dz: 0.0,         dx_s: 0.0       },
                'F':       { dy: -0.005*AMP, dz: 0.008*AMP,   dx_s: 0.0       },
                'S':       { dy: -0.008*AMP, dz: 0.0,         dx_s: 0.15*AMP  },
                'Rest':    { dy: -0.005*AMP, dz: 0.0,         dx_s: 0.0       }
            };
            const meshScale = new THREE.Vector3();
            mesh.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), meshScale);
            Object.keys(VISEMES).forEach(name => {
                const morphIdx = mm.dict[name];
                if (morphIdx === undefined) return;
                let attr = geo.morphAttributes.position[morphIdx];
                if (!attr || attr.count !== numVerts) {
                    attr = new THREE.BufferAttribute(new Float32Array(numVerts * 3), 3);
                    geo.morphAttributes.position[morphIdx] = attr;
                }
                const arr = attr.array;
                for (let i = 0; i < arr.length; i++) arr[i] = 0;
                const v = VISEMES[name];
                candidates.forEach(c => {
                    tempVec.set(positions.getX(c.idx), positions.getY(c.idx), positions.getZ(c.idx));
                    tempVec.applyMatrix4(mesh.matrixWorld);
                    const worldX = tempVec.x;
                    const offX = (worldX * v.dx_s * c.w) / meshScale.x;
                    const offY = (v.dy * c.w) / meshScale.y;
                    const offZ = (v.dz * c.w) / meshScale.z;
                    arr[c.idx * 3 + 0] = offX;
                    arr[c.idx * 3 + 1] = offY;
                    arr[c.idx * 3 + 2] = offZ;
                });
                attr.needsUpdate = true;
            });
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => { m.morphTargets = true; m.needsUpdate = true; });
                } else {
                    mesh.material.morphTargets = true;
                    mesh.material.needsUpdate = true;
                }
            }
            console.log('[Patitas] Morphs poblados desde JS:', Object.keys(VISEMES).join(', '));
        }
        if (!window.PVT_VISEME_SCALE) {
            window.PVT_VISEME_SCALE = {
                'O': 0.50,   
                'U': 0.70    
            };
        }
        function applyMorphTargets(targetName, lerpFactor) {
            const amp = (typeof window.PVT_MOUTH_AMPLITUDE === 'number')
                ? window.PVT_MOUTH_AMPLITUDE : 3.0;
            const maxInfluence = _usingGlbMorphs
                ? Math.max(0, Math.min(6.0, amp / 0.7))
                : Math.max(0, Math.min(6.0, amp / 4));
            const vScale = (window.PVT_VISEME_SCALE && window.PVT_VISEME_SCALE[targetName] !== undefined)
                ? window.PVT_VISEME_SCALE[targetName] : 1.0;
            for (let m = 0; m < morphMeshes.length; m++) {
                const mm = morphMeshes[m];
                const idx = mm.dict[targetName];
                const infl = mm.mesh.morphTargetInfluences;
                for (let i = 0; i < infl.length; i++) {
                    const want = (i === idx) ? maxInfluence * vScale : 0.0;
                    infl[i] += (want - infl[i]) * lerpFactor;
                }
            }
        }
        function animate() {
            if (!window.__patitasShouldRender) return;
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            if (headBone) {
                headBone.rotation.x -= lastHeadOffset.x;
                headBone.rotation.y -= lastHeadOffset.y;
                headBone.rotation.z -= lastHeadOffset.z;
            }
            if (spineBone) {
                spineBone.rotation.x -= lastSpineOffset.x;
            }
            if (mixer) mixer.update(delta);
            const vis = pickViseme();
            currentViseme = vis;
            if (morphMeshes.length) {
                const lerpF = isSpeaking ? 0.45 : 0.25;
                applyMorphTargets(vis, lerpF);
            }
            if (jawBone) {
                let targetOffset = 0;
                const visForJaw = manualViseme || vis;
                if (manualViseme || isSpeaking) {
                    switch (visForJaw) {
                        case 'A': targetOffset = 0.60; break;
                        case 'O': targetOffset = 0.50; break;
                        case 'E': targetOffset = 0.35; break;
                        case 'U': targetOffset = 0.35; break;
                        case 'I': targetOffset = 0.20; break;
                        case 'F': targetOffset = 0.15; break;
                        case 'S': targetOffset = 0.18; break;
                        case 'M': targetOffset = 0.00; break;
                        default:  targetOffset = 0.05;
                    }
                }
                currentJawOffset += (targetOffset - currentJawOffset) * 0.30;
                if (Math.abs(currentJawOffset) < 0.001) currentJawOffset = 0;
                const scale = (typeof window.PVT_JAW_SCALE === 'number') ? window.PVT_JAW_SCALE : 1.0;
                const axis  = (window.PVT_JAW_AXIS === 'y' || window.PVT_JAW_AXIS === 'z') ? window.PVT_JAW_AXIS : 'x';
                const sign  = (typeof window.PVT_JAW_SIGN === 'number') ? window.PVT_JAW_SIGN : 1;
                if (window._patitasJawTestActive) {   }
                else if (window.PVT_USE_JAW_BONE && jawBaseQuat) {
                    const angle = currentJawOffset * scale * sign;
                    if (angle === 0) {
                        jawBone.quaternion.copy(jawBaseQuat);
                    } else {
                        const worldAxis = new THREE.Vector3(
                            axis === 'x' ? 1 : 0,
                            axis === 'y' ? 1 : 0,
                            axis === 'z' ? 1 : 0
                        );
                        const worldRot = new THREE.Quaternion().setFromAxisAngle(worldAxis, angle);
                        const parent = jawBone.parent;
                        if (parent) {
                            parent.updateMatrixWorld(true);
                            const parentWorldQuat = new THREE.Quaternion();
                            parent.getWorldQuaternion(parentWorldQuat);
                            const localRot = parentWorldQuat.clone().invert()
                                .multiply(worldRot)
                                .multiply(parentWorldQuat);
                            jawBone.quaternion.copy(localRot).multiply(jawBaseQuat);
                        } else {
                            jawBone.quaternion.copy(worldRot).multiply(jawBaseQuat);
                        }
                    }
                }
            }
            lastHeadOffset = { x: 0, y: 0, z: 0 };
            lastSpineOffset = { x: 0 };
            let bowSpine = 0;
            let bowHead = 0;
            if (bowT0 > 0) {
                const tBow = (performance.now() - bowT0) / 1000;
                const duration = 2.0; 
                if (tBow < duration) {
                    const curve = Math.sin((tBow / duration) * Math.PI);
                    bowSpine = curve * 0.7; 
                    bowHead = curve * 0.4;  
                } else {
                    bowT0 = 0;
                }
            }
            let cheerSpine = 0;
            let cheerHead = 0;
            let cheerY = 0;
            if (cheerT0 > 0) {
                const tCheer = (performance.now() - cheerT0) / 1000;
                const duration = 3.0; 
                if (tCheer < duration) {
                    const hop = Math.abs(Math.sin(tCheer * Math.PI * 2.5));
                    cheerY = hop * 0.08;
                    cheerSpine = Math.sin(tCheer * Math.PI * 5) * 0.2;
                    cheerHead = Math.sin(tCheer * Math.PI * 10) * 0.2;
                } else {
                    cheerT0 = 0;
                }
            }
            if (currentModel) {
                currentModel.position.y = baseY + cheerY;
            }
            if (isSpeaking) {
                const t = (performance.now() - speakingT0) / 1000;
                lastHeadOffset.x = Math.sin(t * 8.0) * 0.020 + bowHead + cheerHead;
                lastHeadOffset.y = Math.sin(t * 3.3) * 0.012;
                lastHeadOffset.z = Math.sin(t * 5.7) * 0.005;
                lastSpineOffset.x = Math.sin(t * 4.0) * 0.008 + bowSpine;
                lastSpineOffset.z = cheerSpine;
            } else {
                lastHeadOffset.x = bowHead + cheerHead;
                lastSpineOffset.x = bowSpine;
                lastSpineOffset.z = cheerSpine;
            }
            if (headBone) {
                headBone.rotation.x += lastHeadOffset.x;
                headBone.rotation.y += lastHeadOffset.y;
                headBone.rotation.z += lastHeadOffset.z;
            }
            if (spineBone) {
                spineBone.rotation.x += lastSpineOffset.x;
                if (lastSpineOffset.z) spineBone.rotation.z += lastSpineOffset.z;
            }
            renderer.render(scene, camera);
        }
        animate();
    }
})();