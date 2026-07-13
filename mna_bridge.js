// mna_bridge.js — puente entre simulador_final.html y el motor MNA en WASM.
// Carga mna.wasm y expone window.solveWithMNA_WASM con la MISMA firma que
// solveWithMNA(nodesObj, components, dt, opts). Devuelve true/false como el
// motor JS, o null si el circuito requiere caminos que el WASM v1 no cubre
// (flags legacy) — en ese caso el caller debe usar el motor JS.
//
// INTEGRACIÓN (pendiente, se hace cuando el smoke test dé verde):
//   1. <script defer src="mna_bridge.js?v=1.0"></script> en el <head>.
//   2. En simulador_final.html, reemplazar las 3 llamadas directas
//      `solveWithMNA(...)` (l. ~15443, ~17003, ~17032) por `_mnaDispatch(...)`:
//        function _mnaDispatch(nodesObj, components, dt, opts) {
//          if (window.solveWithMNA_WASM && window.PATITAS_WASM !== false) {
//            const r = window.solveWithMNA_WASM(nodesObj, components, dt, opts);
//            if (r !== null) return r;
//          }
//          return solveWithMNA(nodesObj, components, dt, opts);
//        }
//   3. Copiar mna.wasm y wasm_exec.js junto al HTML y sumarlos al build.
(function () {
  'use strict';
  let ready = false;

  async function init() {
    try {
      if (typeof Go === 'undefined') {
        console.warn('[mna-wasm] wasm_exec.js no cargado — motor JS activo');
        return;
      }
      const go = new Go();
      let instance;
      try {
        const resp = await fetch('mna.wasm?v=1.0');
        ({ instance } = await WebAssembly.instantiateStreaming(resp, go.importObject));
      } catch (eStream) {
        // Servidores sin MIME application/wasm: caemos a arrayBuffer.
        const buf = await (await fetch('mna.wasm?v=1.0')).arrayBuffer();
        ({ instance } = await WebAssembly.instantiate(buf, go.importObject));
      }
      go.run(instance);
      ready = typeof patitasMnaSolve === 'function';
      window.PATITAS_WASM_READY = ready;
      window.PATITAS_WASM_VERSION = (typeof patitasMnaVersion !== 'undefined') ? patitasMnaVersion : '?';
      console.log('[mna-wasm] listo:', window.PATITAS_WASM_VERSION);
    } catch (e) {
      window.PATITAS_WASM_READY = false;
      console.warn('[mna-wasm] no disponible, motor JS activo:', e.message);
    }
  }
  window.PATITAS_WASM_READY = false; // se pone true recién si init() tiene éxito
  init();

  function eligible(components) {
    // El WASM v1 implementa solo los caminos default (EM + Shockley).
    if (window.USE_EBERS_MOLL === false || window.USE_SHOCKLEY_DIODES === false) return false;
    for (const c of components) {
      // Astables: con Ebers-Moll la oscilación es física (no depende de la heurística
      // _astableForced, que el solver EM ya ignora). Se dejan pasar al WASM solo si
      // PATITAS_WASM_ASTABLE está activo (opt-in de prueba). En producción se siguen
      // resolviendo en JS hasta validar paridad en varios equipos.
      if (c._astableForced && !window.PATITAS_WASM_ASTABLE) return false;
      if (c.isTransistorCE && !(isFinite(c.Is) && c.Is > 0 && isFinite(c.beta) && c.beta > 0
        && isFinite(c.betaR) && c.betaR > 0)) return false;
    }
    return true;
  }

  window.solveWithMNA_WASM = function (nodesObj, components, dt, opts) {
    if (!ready || !eligible(components)) return null;
    opts = opts || {};
    if (typeof dt !== 'number' || !isFinite(dt) || dt <= 0) dt = (window._currentDt || (1 / 60));

    // Mismo criterio de integrador que el motor JS (cap/inductor).
    const useTustin = (window.USE_TUSTIN !== false)
      && (typeof window._eventCountdown === 'number') && (window._eventCountdown <= 0);
    let vsup = 9;
    try {
      const raw = (typeof powerSupply !== 'undefined' && powerSupply.value) ? powerSupply.value : 9;
      const p = (typeof raw === 'string') ? parseFloat(raw) : raw;
      if (isFinite(p) && p > 0) vsup = p;
    } catch (e) { /* default 9 */ }

    // pairId: transistor_be y transistor_ce comparten el mesh (obj).
    const objIds = new Map();
    let nextPair = 0;
    const pairOf = (c) => {
      if (!c.obj) return 0;
      if (!objIds.has(c.obj)) objIds.set(c.obj, ++nextPair);
      return objIds.get(c.obj);
    };

    const input = {
      dt, dcInit: !!opts.dcInit, freezeTransient: !!opts.freezeTransient,
      useTustin, gmin: (typeof window.MNA_GMIN === 'number' && isFinite(window.MNA_GMIN)
        && window.MNA_GMIN > 0) ? window.MNA_GMIN : 0,
      vsup,
      nodes: Object.values(nodesObj).map(n => ({
        id: n.id, fixed: !!n.fixed, voltage: n.voltage || 0, isSource: !!n.isSource,
      })),
      comps: components.map(c => {
        const ud = (c.obj && c.obj.userData) ? c.obj.userData : {};
        const st = {};
        if (isFinite(ud.Vd_prev)) st.vdPrev = ud.Vd_prev;
        if (isFinite(ud.Vbe_prev)) st.vbePrev = ud.Vbe_prev;
        if (isFinite(ud.Vbc_prev)) st.vbcPrev = ud.Vbc_prev;
        if (isFinite(ud.Vprev)) st.vprev = ud.Vprev;
        if (isFinite(ud.iPrev)) st.iPrev = ud.iPrev;
        return {
          type: c.type, a: c.a, b: c.b, R: c.R || 0, vDrop: c.vDrop || 0,
          C: c.C || 0, L: c.L || 0, astableForced: c._astableForced || '',
          isDiode: !!c.isDiode, isTransistorCE: !!c.isTransistorCE, isNE555Out: !!c.isNE555Out,
          outputVoltage: c.outputVoltage || 0,
          Is: c.Is || 0, eta: c.eta || 0, beta: c.beta || 0, betaR: c.betaR || 0,
          etaBJT: c.etaBJT || 0,
          baseNode: c.baseNode || '', collectorNode: c.collectorNode || '',
          emitterNode: c.emitterNode || '', subType: c.transistorSubType || '',
          pairId: (c.isTransistorCE || c.type === 'transistor_be') ? pairOf(c) : 0,
          state: st,
        };
      }),
    };

    let out;
    try {
      out = JSON.parse(patitasMnaSolve(JSON.stringify(input)));
    } catch (e) {
      console.warn('[mna-wasm] error, cayendo a JS:', e.message);
      return null;
    }
    if (out.error) {
      console.warn('[mna-wasm] ' + out.error);
      return null;
    }

    // ── Writeback idéntico al del motor JS ──
    for (const n of Object.values(nodesObj)) {
      if (!n.fixed && out.voltages[n.id] !== undefined) n.voltage = out.voltages[n.id];
    }
    components.forEach((c, i) => {
      const oc = out.comps[i];
      c.current = oc.current;
      const ud = (c.obj && c.obj.userData) ? c.obj.userData : null;
      if (c.isTransistorCE) {
        c.operatingMode = oc.mode;
        c.Ib = oc.ib;
        c.Vce = oc.vce;
        if (ud) {
          ud.operatingMode = oc.mode; ud.Ib = oc.ib; ud.Ic = oc.current; ud.Vce = oc.vce;
          ud.Vbe_prev = oc.state.vbePrev; ud.Vbc_prev = oc.state.vbcPrev;
          // Para la UI EM: Vbe/Vbc medidos
          const isPNP = c.transistorSubType === 'PNP';
          const vB = nodesObj[c.baseNode] ? nodesObj[c.baseNode].voltage : 0;
          const vC = nodesObj[c.collectorNode || c.a] ? nodesObj[c.collectorNode || c.a].voltage : 0;
          const vE = nodesObj[c.emitterNode || c.b] ? nodesObj[c.emitterNode || c.b].voltage : 0;
          ud.Vbe = isPNP ? (vE - vB) : (vB - vE);
          ud.Vbc = isPNP ? (vC - vB) : (vB - vC);
        }
      } else if (c.isDiode && ud) {
        ud.Vd_prev = oc.state.vdPrev;
      } else if (c.type === 'capacitor' && ud) {
        c._integrator = useTustin ? 'tustin' : 'be';
        if (!opts.freezeTransient) {
          ud.Vprev = oc.state.vprev; ud.Vcap = oc.state.vprev;
          ud.iPrev = oc.state.iPrev; ud.lastCurrent = oc.current;
          ud.charge = oc.charge;
        }
      } else if (c.type === 'inductor' && ud) {
        c._integrator = useTustin ? 'tustin' : 'be';
        ud.lastCurrent = oc.current;
        if (!opts.freezeTransient) {
          ud.iPrev = oc.state.iPrev; ud.iCurr = oc.state.iPrev; ud.Vprev = oc.state.vprev;
        }
      }
    });
    return out.ok;
  };
})();
