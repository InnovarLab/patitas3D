(function () {
    const VERSION = 'actor-api-v1.1-multi-anim';
    console.log('[PatitasActor] cargando ' + VERSION);
    function waitForCore(timeout) {
        timeout = timeout || 30000;
        const t0 = performance.now();
        return new Promise((resolve, reject) => {
            (function poll() {
                if (typeof window.patitasVideoTutorVoice === 'function' &&
                    typeof window.patitasLoadModel === 'function') {
                    resolve(true);
                    return;
                }
                if (performance.now() - t0 > timeout) {
                    reject(new Error('Timeout esperando patitas_video_tutor.js'));
                    return;
                }
                setTimeout(poll, 100);
            })();
        });
    }
    function ensureVisible() {
        if (typeof window.patitasSetVisible === 'function') {
            window.patitasSetVisible(true);
        }
        if (typeof window.patitasGetScale === 'function' && typeof window.patitasSetScale === 'function') {
            try { if (window.patitasGetScale() < 0.05) window.patitasSetScale(1, 0); } catch (e) {}
        }
    }
    function findModel() {
        const panel = document.getElementById('video-tutor-panel');
        if (!panel) return null;
        const ranges = panel.querySelectorAll('input[type="range"]');
        if (ranges.length < 5) return null;
        if (ranges[4].min !== '0') ranges[4].min = '0';
        return {
            sliderX: ranges[0],
            sliderY: ranges[1],
            sliderZ: ranges[2],
            sliderR: ranges[3],
            sliderS: ranges[4]
        };
    }
    function animateSlider(slider, targetValue, durationMs) {
        if (!slider) return Promise.resolve();
        return new Promise(resolve => {
            const startValue = parseFloat(slider.value);
            const startTime = performance.now();
            function step() {
                const elapsed = performance.now() - startTime;
                const t = Math.min(1, elapsed / durationMs);
                const eased = 0.5 - 0.5 * Math.cos(t * Math.PI);
                const v = startValue + (targetValue - startValue) * eased;
                slider.value = v.toFixed(3);
                slider.dispatchEvent(new Event('input', { bubbles: true }));
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            }
            requestAnimationFrame(step);
        });
    }
    const patitas = {
        VERSION: VERSION,
        ready() {
            return waitForCore().then(() => new Promise(r => setTimeout(r, 500)));
        },
        say(text, opts) {
            ensureVisible();
            return new Promise(resolve => {
                const fn = window.patitasVideoTutorVoice;
                if (typeof fn === 'function') {
                    const r = fn(text);
                    if (r && typeof r.then === 'function') { r.then(resolve); return; }
                    setTimeout(resolve, Math.max(1200, text.length * 90));
                    return;
                }
                setTimeout(resolve, Math.max(800, text.length * 80));
            });
        },
        quiz(question, options, correctIdx) {
            return new Promise(resolve => {
                if (typeof window.patitasVideoTutorQuiz === 'function') {
                    window.patitasVideoTutorQuiz(question, options, correctIdx, resolve);
                } else {
                    console.warn('[PatitasActor] patitasVideoTutorQuiz no encontrado, saltando quiz.');
                    resolve();
                }
            });
        },
        wait(seconds) {
            ensureVisible();
            return new Promise(r => setTimeout(r, seconds * 1000));
        },
        waitKey(keyName) {
            return new Promise(resolve => {
                const handler = (e) => {
                    if (keyName === 'Any' || e.code === keyName) {
                        window.removeEventListener('keydown', handler);
                        try { if (window.parent && window.parent !== window) window.parent.removeEventListener('keydown', handler); } catch(err){}
                        resolve();
                    }
                };
                window.addEventListener('keydown', handler);
                try { if (window.parent && window.parent !== window) window.parent.addEventListener('keydown', handler); } catch(err){}
            });
        },
        moveTo(x, y, z, durationMs) {
            ensureVisible();
            durationMs = durationMs || 1000;
            if (typeof window.patitasSetTransform === 'function' && typeof window.patitasGetTransform === 'function') {
                const c = window.patitasGetTransform();
                const nx = (typeof x === 'number') ? x : c.x;
                const ny = (typeof y === 'number') ? y : c.y;
                const nz = (typeof z === 'number') ? z : c.z;
                window.patitasSetTransform(nx, ny, nz, c.rotY, durationMs);
                return new Promise(r => setTimeout(r, durationMs));
            }
            const m = findModel();
            if (!m) return Promise.resolve();
            return Promise.all([
                (typeof x === 'number') ? animateSlider(m.sliderX, x, durationMs) : Promise.resolve(),
                (typeof y === 'number') ? animateSlider(m.sliderY, y, durationMs) : Promise.resolve(),
                (typeof z === 'number') ? animateSlider(m.sliderZ, z, durationMs) : Promise.resolve()
            ]);
        },
        rotateTo(deg, durationMs) {
            ensureVisible();
            durationMs = durationMs || 1000;
            if (typeof window.patitasSetTransform === 'function' && typeof window.patitasGetTransform === 'function') {
                const c = window.patitasGetTransform();
                window.patitasSetTransform(c.x, c.y, c.z, (deg || 0) * Math.PI / 180, durationMs);
                return new Promise(r => setTimeout(r, durationMs));
            }
            const m = findModel();
            if (!m) return Promise.resolve();
            return animateSlider(m.sliderR, deg, durationMs);
        },
        scaleTo(s, durationMs) {
            ensureVisible();
            durationMs = durationMs || 600;
            if (typeof window.patitasSetScale === 'function') {
                window.patitasSetScale(s, durationMs);
                return new Promise(r => setTimeout(r, durationMs));
            }
            const m = findModel();
            if (!m) return Promise.resolve();
            return animateSlider(m.sliderS, s, durationMs);
        },
        show(fadeMs) {
            ensureVisible();
            fadeMs = fadeMs || 600;
            if (typeof window.patitasSetScale === 'function') {
                window.patitasSetScale(1, fadeMs);
                return new Promise(r => setTimeout(r, fadeMs));
            }
            const m = findModel();
            if (!m) return Promise.resolve();
            return animateSlider(m.sliderS, 1, fadeMs);
        },
        hide(fadeMs) {
            fadeMs = fadeMs || 600;
            if (typeof window.patitasSetScale === 'function') {
                window.patitasSetScale(0, fadeMs);
                return new Promise(r => setTimeout(r, fadeMs));
            }
            const m = findModel();
            if (!m) return Promise.resolve();
            return animateSlider(m.sliderS, 0, fadeMs);
        },
        playAnim(name, fadeMs) {
            ensureVisible();
            return new Promise(resolve => {
                if (!name) { resolve(false); return; }
                if (name === 'reverencia') {
                    if (typeof window.patitasBow === 'function') window.patitasBow();
                    setTimeout(() => resolve(true), 2000);
                    return;
                }
                if (name === 'alentar') {
                    if (typeof window.patitasCheer === 'function') window.patitasCheer();
                    setTimeout(() => resolve(true), 3000);
                    return;
                }
                const aliases = { walk: 'walking', run: 'running' };
                const actual = aliases[name] || name;
                if (typeof window.patitasPlayAnimation === 'function') {
                    const ok = window.patitasPlayAnimation(actual, fadeMs);
                    setTimeout(() => resolve(ok), (fadeMs || 400) + 50);
                    return;
                }
                const map = window.PATITAS_GLB_MODELS || {};
                const url = map[name];
                if (url && window.patitasLoadModel) {
                    window.patitasLoadModel(url);
                    setTimeout(resolve, 1500);
                } else {
                    resolve(false);
                }
            });
        },
        listAnimations() {
            return window.PATITAS_ANIMATIONS || [];
        },
        stopSpeak() {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            return Promise.resolve();
        }
    };
    window.patitas = patitas;
    console.log('[PatitasActor] window.patitas disponible — animaciones:', window.PATITAS_ANIMATIONS || '(aún no cargadas)');
    const _sleep = (ms) => new Promise(r => setTimeout(r, ms));
    async function _waitFor(cond, timeoutMs, stepMs) {
        const t0 = performance.now();
        while (performance.now() - t0 < (timeoutMs || 5000)) {
            try { if (cond()) return true; } catch (e) { }
            await _sleep(stepMs || 200);
        }
        return false;
    }
    const PCB = () => window.patitasPCB;
    const pcb = {
        async openEditor() {
            if (PCB() && PCB().isOpen()) return true;
            try {
                if (window.sim && window.sim.pointToTool) {
                    const choreo = (async () => {
                        await window.sim.pointToTool('pcb');
                        if (window.sim.click) await window.sim.click();
                    })();
                    await Promise.race([choreo, _sleep(2500)]);
                }
            } catch (e) { }
            if (window.openPCBExportModal) window.openPCBExportModal();
            await _waitFor(() => document.getElementById('pcb-modal'), 3000, 100);
            const modal = document.getElementById('pcb-modal');
            if (modal) {
                const b = Array.prototype.slice.call(modal.querySelectorAll('button'))
                    .find(x => /Editar Circuito/i.test(x.textContent || ''));
                if (b) b.click();
            } else if (PCB() && PCB().openEditor) {
                PCB().openEditor();
            }
            return await _waitFor(() => PCB() && PCB().isOpen(), 6000, 200);
        },
        async autoDistribute() {
            if (!PCB() || !PCB().isOpen()) return -1;
            const c = PCB().autoDistribute();
            await _sleep(350);
            return c;
        },
        async crossings() { return PCB() ? PCB().getCrossings() : -1; },
        async say(text) {
            if (PCB() && PCB().say) {
                const r = PCB().say(text);
                if (r && typeof r.then === 'function') { await r; }
                else { await _sleep(Math.max(1200, (text || '').length * 90)); }
            } else if (window.patitas && window.patitas.say) {
                await window.patitas.say(text);
            }
            return true;
        },
        async hideSay() { if (PCB() && PCB().hideSay) PCB().hideSay(); return true; },
        async point(key, text, seconds) {
            if (PCB()) PCB().point(key, text || '', seconds ? seconds * 1000 : 0);
            return true;
        },
        async clearPoint() { if (PCB()) PCB().clearPoint(); return true; },
        async traceWidth(v) { if (PCB()) PCB().setTraceWidth(v); return true; },
        async boardSize(w, h) { if (PCB()) { if (w) PCB().setWidth(w); if (h) PCB().setHeight(h); } return true; },
        async open3D() { if (PCB()) PCB().open3D(); return true; },
        async openSchematic() { if (PCB()) PCB().openSchematic(); return true; },
        async waitForZeroCrossings(timeoutSeconds) {
            const lim = (timeoutSeconds || 180) * 1000;
            return await _waitFor(() => PCB() && PCB().isOpen() && PCB().getCrossings() === 0, lim, 400);
        },
        async close() { if (PCB()) PCB().close(); return true; }
    };
    window.pcb = pcb;
    console.log('[PatitasActor] window.pcb (API de lecciones PCB) disponible');
    let _bgGuideEl = null, _bgTimer = null, _bgStagePrevZ = null;
    function _bgStageRaise(on) {
        const st = document.getElementById('video-tutor-stage');
        if (!st) return;
        if (on) { if (_bgStagePrevZ === null) _bgStagePrevZ = st.style.zIndex; st.style.zIndex = '100004'; }
        else { st.style.zIndex = (_bgStagePrevZ !== null ? _bgStagePrevZ : '99999'); _bgStagePrevZ = null; }
    }
    function _bgFind(key) {
        const ID = { programar: 'tool-blockly', guardar: 'fileMenuBtn', ejemplos: 'examplesMenuBtn' };
        if (ID[key]) { const e = document.getElementById(ID[key]); if (e) return e; }
        const ui = document.getElementById('blocklyUI');
        if (key === 'ejecutar' || key === 'detener') {
            const t = key === 'ejecutar' ? 'EJECUTAR' : 'DETENER';
            return ui ? Array.prototype.slice.call(ui.querySelectorAll('button')).find(b => (b.textContent || '').trim().toUpperCase().indexOf(t) >= 0) : null;
        }
        if (key === 'grabar') {
            return Array.prototype.slice.call(document.querySelectorAll('button')).find(b => /grabar/i.test(b.getAttribute('title') || ''));
        }
        const CATS = { control: 'Control', componentes: 'Componentes', herramientas: 'Herramientas', camara: 'Cámara' };
        if (CATS[key]) {
            return Array.prototype.slice.call(document.querySelectorAll('.blocklyTreeRow,.blocklyToolboxCategory,.blocklyTreeLabel'))
                .find(r => (r.textContent || '').trim() === CATS[key] || (r.textContent || '').trim().indexOf(CATS[key]) >= 0);
        }
        return document.getElementById(key);
    }
    function _bgClear() {
        if (_bgTimer) { clearTimeout(_bgTimer); _bgTimer = null; }
        const b = document.getElementById('bg-guide-bubble'); if (b) b.remove();
        if (_bgGuideEl) { _bgGuideEl.style.outline = ''; _bgGuideEl.style.boxShadow = ''; _bgGuideEl = null; }
    }
    function _bgPoint(key, text, ms) {
        _bgClear();
        const el = _bgFind(key); if (!el) return false;
        try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { }
        el.style.outline = '3px solid #f1c40f'; el.style.boxShadow = '0 0 14px #f1c40f';
        _bgGuideEl = el;
        const place = () => {
            if (!text) return;
            let b = document.getElementById('bg-guide-bubble');
            if (!b) {
                b = document.createElement('div'); b.id = 'bg-guide-bubble';
                Object.assign(b.style, {
                    position: 'fixed', maxWidth: '240px', background: '#161b22', color: '#fff',
                    border: '1px solid #f1c40f', borderRadius: '8px', padding: '8px 11px',
                    fontSize: '12px', lineHeight: '1.4', zIndex: '100006',
                    boxShadow: '0 4px 14px rgba(0,0,0,.5)', pointerEvents: 'none'
                });
                document.body.appendChild(b);
            }
            b.textContent = text;
            const r = el.getBoundingClientRect();
            b.style.left = Math.max(6, Math.min(window.innerWidth - 250, r.left)) + 'px';
            b.style.top = (r.bottom + 8) + 'px';
        };
        place(); setTimeout(place, 420);
        if (ms && ms > 0) _bgTimer = setTimeout(_bgClear, ms);
        return true;
    }
    const _ws = () => (window.Blockly && Blockly.getMainWorkspace ? Blockly.getMainWorkspace() : null);
    const _ideOpen = () => { const ui = document.getElementById('blocklyUI'); return !!(ui && ui.style.display !== 'none' && _ws()); };
    const blocks = {
        async open() {
            if (_ideOpen()) { _bgStageRaise(true); return true; }
            try {
                if (window.sim && window.sim.pointToTool) {
                    await Promise.race([
                        (async () => { await window.sim.pointToTool('blockly'); if (window.sim.click) await window.sim.click(); })(),
                        _sleep(2500)
                    ]);
                }
            } catch (e) { }
            if (window.startBlockly) window.startBlockly();
            const ok = await _waitFor(() => document.getElementById('blocklyDiv') && _ws(), 5000, 200);
            _bgStageRaise(true);
            return ok;
        },
        async say(text) {
            if (window.patitasVideoTutorVoice) { try { return await window.patitasVideoTutorVoice(text); } catch (e) { } }
            return true;
        },
        async point(key, text, seconds) { _bgPoint(key, text || '', seconds ? seconds * 1000 : 0); return true; },
        async clearPoint() { _bgClear(); return true; },
        async loadDemo() {
            if (window.loadExample) window.loadExample('series_led');
            await _sleep(500);
            return true;
        },
        async addDron() {
            return this.addBlock('cam_drone_flight');
        },
        async addBlock(blockType) {
            try {
                const ws = _ws(); if (!ws) return false;
                if (blockType === 'start_execution') {
                    const b = ws.newBlock(blockType);
                    if (b.initSvg) b.initSvg();
                    if (b.render) b.render();
                    await _sleep(300);
                    return true;
                }
                const start = ws.getAllBlocks(false).find(b => b.type === 'start_execution'); if (!start) return false;
                function getInsertionConnection(b) {
                    if (!b._patitasClosedDO) {
                        const stmtInput = b.getInput('DO') || b.getInput('DO0');
                        if (stmtInput) {
                            const child = stmtInput.connection.targetBlock();
                            if (!child) return stmtInput.connection;
                            const deepConnection = getInsertionConnection(child);
                            if (deepConnection) return deepConnection;
                        }
                    }
                    if (!b._patitasClosedELSE) {
                        const elseInput = b.getInput('ELSE');
                        if (elseInput) {
                            const child = elseInput.connection.targetBlock();
                            if (!child) return elseInput.connection;
                            const deepConnection = getInsertionConnection(child);
                            if (deepConnection) return deepConnection;
                        }
                    }
                    if (b.nextConnection) {
                        const next = b.getNextBlock();
                        if (next) return getInsertionConnection(next);
                        return b.nextConnection;
                    }
                    return null;
                }
                const targetConnection = getInsertionConnection(start);
                const toolboxXml = document.getElementById('toolbox');
                let blockXmlNode = null;
                let categoryName = null;
                if (toolboxXml) {
                    const blocks = toolboxXml.querySelectorAll(`block[type="${blockType}"]`);
                    if (blocks.length > 0) {
                        blockXmlNode = blocks[0];
                        const catNode = blockXmlNode.closest('category');
                        if (catNode) {
                            categoryName = catNode.getAttribute('name');
                        }
                    }
                }
                console.log(`[blocks.addBlock] Solicitado blockType: ${blockType}, categoryName: ${categoryName}`);
                let simObj = window.sim || (window.parent && window.parent.sim) || null;
                if (simObj && simObj.moveCursorTo && categoryName) {
                    try {
                        console.log(`[blocks.addBlock] Animando inserción. Categoría detectada: ${categoryName}`);
                        if (simObj.cursorShow) await simObj.cursorShow();
                        const cats = Array.from(document.querySelectorAll('.blocklyTreeRow, .blocklyToolboxCategory, .blocklyTreeLabel'));
                        const catEl = cats.find(r => (r.textContent || '').indexOf(categoryName) >= 0);
                        if (catEl) {
                            console.log(`[blocks.addBlock] Categoría encontrada en UI. Posicionando cursor...`);
                            const rCat = catEl.getBoundingClientRect();
                            await simObj.moveCursorTo(rCat.left + rCat.width / 2, rCat.top + rCat.height / 2, 700);
                            if (simObj.click) await simObj.click();
                            try {
                                catEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                                catEl.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                                catEl.click();
                                const tb = ws.getToolbox && ws.getToolbox();
                                if (tb && tb.getToolboxItems) {
                                    const items = tb.getToolboxItems();
                                    const match = items.find(i => i.getName && i.getName() === categoryName);
                                    if (match) tb.setSelectedItem(match);
                                }
                            } catch(e) {}
                            await _sleep(600); 
                            const flyout = (ws.getToolbox && ws.getToolbox()) ? ws.getToolbox().getFlyout() : (ws.flyout_ || ws.toolbox_.flyout_);
                            const flyoutWs = flyout ? (flyout.getWorkspace ? flyout.getWorkspace() : flyout.workspace_) : null;
                            if (flyoutWs) {
                                const allBlocks = flyoutWs.getAllBlocks(false);
                                console.log(`[blocks.addBlock] Bloques en flyout: ${allBlocks.length}`);
                                const fb = allBlocks.find(b => b.type === blockType);
                                if (fb && fb.getSvgRoot()) {
                                    console.log(`[blocks.addBlock] Bloque encontrado en flyout. Arrastrando...`);
                                    const rBlock = fb.getSvgRoot().getBoundingClientRect();
                                    await simObj.moveCursorTo(rBlock.left + rBlock.width / 2, rBlock.top + rBlock.height / 2, 600);
                                    if (simObj.click) await simObj.click();
                                    if (simObj.attachToCursor) {
                                        const svgGhost = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                                        svgGhost.setAttribute("class", "blocklySvg");
                                        svgGhost.style.overflow = "visible";
                                        svgGhost.style.position = "absolute";
                                        svgGhost.style.top = "15px"; 
                                        svgGhost.style.left = "15px";
                                        svgGhost.style.pointerEvents = "none";
                                        svgGhost.style.zIndex = "999999";
                                        const scale = ws.scale || 0.7;
                                        svgGhost.style.transform = `scale(${scale})`;
                                        svgGhost.style.transformOrigin = "top left";
                                        const clone = fb.getSvgRoot().cloneNode(true);
                                        clone.removeAttribute("transform"); 
                                        svgGhost.appendChild(clone);
                                        simObj.attachToCursor(svgGhost);
                                    }
                                    if (window.Blockly && Blockly.hideChaff) Blockly.hideChaff();
                                    else if (ws.getToolbox && ws.getToolbox()) ws.getToolbox().clearSelection();
                                    if (targetConnection) {
                                        const tb = targetConnection.getSourceBlock();
                                        const tr = tb.getSvgRoot().getBoundingClientRect();
                                        await simObj.moveCursorTo(tr.left + 50, tr.bottom, 800);
                                    } else {
                                        const ui = document.getElementById('blocklyUI');
                                        const ur = ui.getBoundingClientRect();
                                        await simObj.moveCursorTo(ur.left + ur.width / 2, ur.top + ur.height / 2, 800);
                                    }
                                    if (simObj.click) await simObj.click();
                                    if (simObj.clearCursorAttachments) {
                                        simObj.clearCursorAttachments();
                                    }
                                } else {
                                    console.warn(`[blocks.addBlock] No se encontró el bloque ${blockType} en el flyout.`);
                                }
                            } else {
                                console.warn(`[blocks.addBlock] No se pudo obtener el workspace del flyout.`);
                            }
                        } else {
                            console.warn(`[blocks.addBlock] Categoría ${categoryName} no encontrada en UI.`);
                        }
                        if (simObj.cursorHide) await simObj.cursorHide();
                    } catch(errAnim) { console.warn('Error en animacion addBlock', errAnim); }
                }
                let newB = null;
                if (blockXmlNode && Blockly.Xml && Blockly.Xml.domToBlock) {
                    newB = Blockly.Xml.domToBlock(blockXmlNode, ws);
                } else {
                    newB = ws.newBlock(blockType);
                    if (newB.initSvg) newB.initSvg();
                }
                if (newB.previousConnection) {
                    if (targetConnection) {
                        targetConnection.connect(newB.previousConnection);
                    }
                } else {
                    newB.moveBy(start.getRelativeToSurfaceXY().x + 200, start.getRelativeToSurfaceXY().y + 50);
                }
                if (newB.render) newB.render();
                await _sleep(300);
                return true;
            } catch (e) { console.warn('[blocks.addBlock]', e); return false; }
        },
        async exitContainer() {
            try {
                const ws = _ws(); if (!ws) return false;
                const start = ws.getAllBlocks(false).find(b => b.type === 'start_execution'); if (!start) return false;
                function closeDeepest(b) {
                    if (!b._patitasClosedDO) {
                        const doInput = b.getInput('DO') || b.getInput('DO0');
                        if (doInput) {
                            const child = doInput.connection.targetBlock();
                            if (!child) {
                                b._patitasClosedDO = true;
                                return true;
                            }
                            if (closeDeepest(child)) return true;
                            b._patitasClosedDO = true;
                            return true;
                        }
                    }
                    if (!b._patitasClosedELSE) {
                        const elseInput = b.getInput('ELSE');
                        if (elseInput) {
                            const child = elseInput.connection.targetBlock();
                            if (!child) {
                                b._patitasClosedELSE = true;
                                return true;
                            }
                            if (closeDeepest(child)) return true;
                            b._patitasClosedELSE = true;
                            return true;
                        }
                    }
                    if (b.nextConnection) {
                        const next = b.getNextBlock();
                        if (next) return closeDeepest(next);
                    }
                    return false;
                }
                closeDeepest(start);
                await _sleep(100);
                return true;
            } catch(e) { console.warn('[blocks.exitContainer]', e); return false; }
        },
        async run() { if (window.runBlocks) window.runBlocks(); await _sleep(300); return true; },
        async close() { _bgClear(); _bgStageRaise(false); if (window.closeBlockly) window.closeBlockly(); return true; }
    };
    window.blocks = blocks;
    console.log('[PatitasActor] window.blocks (tutor IDE de bloques) disponible');

    function _installQuizPatch() {
        window.patitasVideoTutorQuiz = function (question, options, correctIdx, resolve) {
            const bubble = document.getElementById('patitas-edu-bubble');
            if (!bubble) { if (resolve) resolve(); return; }

            let html = question + '<div class="patitas-quiz-options">';
            options.forEach(function (opt, idx) {
                html += '<button class="patitas-quiz-btn" data-quiz-idx="' + idx + '">' + opt + '</button>';
            });
            html += '</div>';
            bubble.innerHTML = html;
            bubble.style.display = 'block';
            bubble.style.pointerEvents = 'auto';

            if (!bubble._quizClickGuard) {
                ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend']
                    .forEach(function (ev) { bubble.addEventListener(ev, function (e) { e.stopPropagation(); }, false); });
                bubble._quizClickGuard = true;
            }

            const finish = function () { bubble.style.display = 'none'; if (resolve) resolve(); };

            bubble.querySelectorAll('.patitas-quiz-btn').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const selected = parseInt(btn.getAttribute('data-quiz-idx'), 10);
                    if (selected === correctIdx) {
                        bubble.querySelectorAll('.patitas-quiz-btn').forEach(function (b) { b.disabled = true; });
                        if (typeof window.patitasVideoTutorVoice === 'function')
                            window.patitasVideoTutorVoice('¡Excelente! Muy bien.', { showSubtitle: false });
                        setTimeout(finish, 1500);
                    } else {
                        bubble.style.animation = 'none';
                        void bubble.offsetWidth;
                        bubble.style.animation = 'bubblePop 0.3s ease-out';
                        if (typeof window.patitasVideoTutorVoice === 'function')
                            window.patitasVideoTutorVoice('Mmm... ¡casi! Intenta de nuevo.', { showSubtitle: false });
                    }
                });
            });

            if (typeof window.patitasVideoTutorVoice === 'function') {
                window.patitasVideoTutorVoice(question + '. ' + options.join('. '), { showSubtitle: false });
            }
        };
    }
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', _installQuizPatch);
    } else {
        _installQuizPatch();
    }
})();