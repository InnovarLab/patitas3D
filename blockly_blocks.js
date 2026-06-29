(function () {
    const COLOR_PATITAS = 110;  
    Blockly.Blocks['patitas_say'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🐾 Decir')
                .appendField(new Blockly.FieldTextInput('Hola, soy Patitas'), 'TEXT');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Patitas dice un texto con voz y mueve la boca');
        }
    };
    Blockly.JavaScript.forBlock['patitas_say'] = function (block) {
        const text = block.getFieldValue('TEXT') || '';
        return `await patitas.say(${JSON.stringify(text)});\n`;
    };
    Blockly.Blocks['patitas_wait'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⏱ Esperar')
                .appendField(new Blockly.FieldNumber(1, 0, 60, 0.1), 'SECONDS')
                .appendField('segundos');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Espera N segundos antes de continuar');
        }
    };
    Blockly.JavaScript.forBlock['patitas_wait'] = function (block) {
        const sec = Number(block.getFieldValue('SECONDS')) || 0;
        return `await patitas.wait(${sec});\n`;
    };
    Blockly.Blocks['patitas_wait_key'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⏸ Esperar tecla')
                .appendField(new Blockly.FieldDropdown([
                    ['Espacio', 'Space'],
                    ['Enter', 'Enter'],
                    ['Cualquiera', 'Any']
                ]), 'KEY');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Suspende la lección hasta que se presione la tecla indicada');
        }
    };
    Blockly.JavaScript.forBlock['patitas_wait_key'] = function (block) {
        const key = block.getFieldValue('KEY');
        return `await patitas.waitKey('${key}');\n`;
    };
    Blockly.Blocks['patitas_move_to'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🚶 Mover Patitas a   X:')
                .appendField(new Blockly.FieldNumber(0, -8, 8, 0.1), 'X')
                .appendField(' Y:')
                .appendField(new Blockly.FieldNumber(0.6, -4, 4, 0.1), 'Y')
                .appendField(' Z:')
                .appendField(new Blockly.FieldNumber(0, -6, 4, 0.1), 'Z')
                .appendField('   en')
                .appendField(new Blockly.FieldNumber(1, 0, 30, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Mueve a Patitas a la posición (X, Y, Z) durante N segundos');
        }
    };
    Blockly.JavaScript.forBlock['patitas_move_to'] = function (block) {
        const x = Number(block.getFieldValue('X'));
        const y = Number(block.getFieldValue('Y'));
        const z = Number(block.getFieldValue('Z'));
        const dur = Number(block.getFieldValue('DUR')) * 1000;
        return `await patitas.moveTo(${x}, ${y}, ${z}, ${dur});\n`;
    };
    const PATITAS_ANIM_LABELS = {
        walking: '🚶 Caminar',
        walk:    '🚶 Caminar',
        running: '🏃 Correr',
        run:     '🏃 Correr',
        dance:   '💃 Bailar',
        waving:  '👋 Saludar',
        wave:    '👋 Saludar',
        jumping: '🤸 Saltar',
        jump:    '🤸 Saltar',
        idle:    '🧍 Quieto',
        sitting: '🪑 Sentado',
        sit:     '🪑 Sentado',
        clap:    '👏 Aplaudir',
        point:   '👉 Señalar',
        agree:   '👍 Asentir',
        present: '🫱 Presentar',
        reverencia: '🙇‍♂️ Saludar (Reverencia)',
        alentar: '🇦🇷 Alentar (Mundial)'
    };
    function buildAnimDropdownOptions() {
        let names = null;
        try {
            if (window.simWindow && Array.isArray(window.simWindow.PATITAS_ANIMATIONS)) {
                names = window.simWindow.PATITAS_ANIMATIONS;
            }
        } catch (e) {   }
        if (!names || names.length === 0) {
            names = ['walking', 'running', 'dance', 'agree', 'present'];
        }
        return names.map(n => {
            const key = String(n).toLowerCase();
            const label = PATITAS_ANIM_LABELS[key]
                || ('🎬 ' + String(n).charAt(0).toUpperCase() + String(n).slice(1));
            return [label, String(n)];
        });
    }
    Blockly.Blocks['patitas_anim'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎭 Animación')
                .appendField(new Blockly.FieldDropdown(buildAnimDropdownOptions), 'NAME');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Cambia la animación del personaje. La lista se actualiza con las animaciones del GLB cargado.');
        }
    };
    Blockly.JavaScript.forBlock['patitas_anim'] = function (block) {
        const name = block.getFieldValue('NAME');
        return `await patitas.playAnim(${JSON.stringify(name)});\n`;
    };
    Blockly.Blocks['patitas_show'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('✨ Aparecer (fade')
                .appendField(new Blockly.FieldNumber(0.6, 0, 5, 0.1), 'DUR')
                .appendField('s)');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Patitas aparece con un efecto de escala');
        }
    };
    Blockly.JavaScript.forBlock['patitas_show'] = function (block) {
        const dur = Number(block.getFieldValue('DUR')) * 1000;
        return `await patitas.show(${dur});\n`;
    };
    Blockly.Blocks['patitas_hide'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('💨 Desaparecer (fade')
                .appendField(new Blockly.FieldNumber(0.6, 0, 5, 0.1), 'DUR')
                .appendField('s)');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Patitas se desvanece');
        }
    };
    Blockly.JavaScript.forBlock['patitas_hide'] = function (block) {
        const dur = Number(block.getFieldValue('DUR')) * 1000;
        return `await patitas.hide(${dur});\n`;
    };
    Blockly.Blocks['patitas_cursor_speed'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('Velocidad del cursor:')
                .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'SPEED')
                .appendField('x');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Cambia la velocidad de las animaciones del cursor falso (1 = normal, 2 = doble, 0.5 = mitad).');
        }
    };
    Blockly.JavaScript.forBlock['patitas_cursor_speed'] = function (block) {
        const speed = Number(block.getFieldValue('SPEED'));
        return `if (sim.setCursorSpeed) sim.setCursorSpeed(${speed});\n`;
    };
    Blockly.Blocks['patitas_quiz'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('📝 Quiz');
            this.appendDummyInput()
                .appendField('Pregunta:')
                .appendField(new Blockly.FieldTextInput('¿Cuál es la respuesta?'), 'QUESTION');
            this.appendDummyInput()
                .appendField('A)')
                .appendField(new Blockly.FieldTextInput('Opción 1'), 'OPT_A');
            this.appendDummyInput()
                .appendField('B)')
                .appendField(new Blockly.FieldTextInput('Opción 2'), 'OPT_B');
            this.appendDummyInput()
                .appendField('C)')
                .appendField(new Blockly.FieldTextInput('Opción 3'), 'OPT_C');
            this.appendDummyInput()
                .appendField('Correcta:')
                .appendField(new Blockly.FieldDropdown([['A', '0'], ['B', '1'], ['C', '2']]), 'CORRECT_IDX');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Crea un quiz interactivo. La lección se pausa hasta que el alumno elija la correcta.');
        }
    };
    Blockly.JavaScript.forBlock['patitas_quiz'] = function (block) {
        const q = block.getFieldValue('QUESTION') || '';
        const a = block.getFieldValue('OPT_A') || '';
        const b = block.getFieldValue('OPT_B') || '';
        const c = block.getFieldValue('OPT_C') || '';
        const idx = Number(block.getFieldValue('CORRECT_IDX'));
        return `await patitas.quiz(${JSON.stringify(q)}, [${JSON.stringify(a)}, ${JSON.stringify(b)}, ${JSON.stringify(c)}], ${idx});\n`;
    };
    Blockly.Blocks['patitas_rotate'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔄 Rotar a')
                .appendField(new Blockly.FieldNumber(0, -360, 360, 1), 'DEG')
                .appendField('° en')
                .appendField(new Blockly.FieldNumber(0.5, 0, 30, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Rota a Patitas sobre su eje Y');
        }
    };
    Blockly.JavaScript.forBlock['patitas_rotate'] = function (block) {
        const deg = Number(block.getFieldValue('DEG'));
        const dur = Number(block.getFieldValue('DUR')) * 1000;
        return `await patitas.rotateTo(${deg}, ${dur});\n`;
    };
    const COLOR_SIM = 210;  
    const LED_COLOR_OPTS = [
        ['rojo',      'rojo'],
        ['amarillo',  'amarillo'],
        ['verde',     'verde'],
        ['azul',      'azul'],
        ['blanco',    'blanco']
    ];
    const WIRE_COLOR_OPTS = [
        ['rojo',      'rojo'],
        ['negro',     'negro'],
        ['azul',      'azul'],
        ['amarillo',  'amarillo'],
        ['verde',     'verde']
    ];
    Blockly.Blocks['sim_wire'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔌 Cable de')
                .appendField(new Blockly.FieldTextInput('A1'),  'A')
                .appendField('a')
                .appendField(new Blockly.FieldTextInput('A10'), 'B')
                .appendField('color')
                .appendField(new Blockly.FieldDropdown(WIRE_COLOR_OPTS), 'COLOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca un cable jumper entre dos coordenadas (ej: A1 a B1)');
        }
    };
    Blockly.JavaScript.forBlock['sim_wire'] = function (block) {
        const a = block.getFieldValue('A') || '';
        const b = block.getFieldValue('B') || '';
        const c = block.getFieldValue('COLOR') || 'rojo';
        return `await sim.connect(${JSON.stringify(a)}, ${JSON.stringify(b)}, ${JSON.stringify(c)});
`;
    };
    Blockly.Blocks['sim_led'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('💡 LED de')
                .appendField(new Blockly.FieldTextInput('A5'),  'A')
                .appendField('(+) a')
                .appendField(new Blockly.FieldTextInput('A10'), 'B')
                .appendField('(-) color')
                .appendField(new Blockly.FieldDropdown(LED_COLOR_OPTS), 'COLOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca un LED. Primera coord = anodo (+), segunda = catodo (-)');
        }
    };
    Blockly.JavaScript.forBlock['sim_led'] = function (block) {
        const a = block.getFieldValue('A') || '';
        const b = block.getFieldValue('B') || '';
        const c = block.getFieldValue('COLOR') || 'rojo';
        return `await sim.place('led', ${JSON.stringify(a)}, ${JSON.stringify(b)}, ${JSON.stringify(c)});
`;
    };
    Blockly.Blocks['sim_resistor'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🛡 Resistencia de')
                .appendField(new Blockly.FieldTextInput('B5'),  'A')
                .appendField('a')
                .appendField(new Blockly.FieldTextInput('B10'), 'B')
                .appendField('valor')
                .appendField(new Blockly.FieldTextInput('220'), 'VAL')
                .appendField('Ω');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca una resistencia. Valor en ohmios (ej: 220, 1k, 10k)');
        }
    };
    Blockly.JavaScript.forBlock['sim_resistor'] = function (block) {
        const a   = block.getFieldValue('A') || '';
        const b   = block.getFieldValue('B') || '';
        const val = block.getFieldValue('VAL') || '220';
        return `await sim.place('resistor', ${JSON.stringify(a)}, ${JSON.stringify(b)}, null, ${JSON.stringify(val)});\n`;
    };
    Blockly.Blocks['sim_ldr'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('☀️ Fotorresistencia (LDR) de')
                .appendField(new Blockly.FieldTextInput('B5'),  'A')
                .appendField('a')
                .appendField(new Blockly.FieldTextInput('B10'), 'B');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca una fotorresistencia. Su valor cambia con la luz ambiental (slider azul).');
        }
    };
    Blockly.JavaScript.forBlock['sim_ldr'] = function (block) {
        const a   = block.getFieldValue('A') || '';
        const b   = block.getFieldValue('B') || '';
        return `await sim.place('ldr', ${JSON.stringify(a)}, ${JSON.stringify(b)});\n`;
    };
    Blockly.Blocks['sim_to_power'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⚡ Conectar fuente')
                .appendField(new Blockly.FieldDropdown([
                    ['VCC (+)', 'VCC'],
                    ['GND (-)', 'GND']
                ]), 'POWER')
                .appendField('a')
                .appendField(new Blockly.FieldTextInput('PS5'), 'COORD')
                .appendField('color')
                .appendField(new Blockly.FieldDropdown(WIRE_COLOR_OPTS), 'COLOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Cable jumper desde un borne de la fuente (VCC o GND) hacia un riel');
        }
    };
    Blockly.JavaScript.forBlock['sim_to_power'] = function (block) {
        const p = block.getFieldValue('POWER') || 'VCC';
        const c = block.getFieldValue('COORD') || '';
        const col = block.getFieldValue('COLOR') || 'rojo';
        return `await sim.connect(${JSON.stringify(p)}, ${JSON.stringify(c)}, ${JSON.stringify(col)});
`;
    };
    Blockly.Blocks['sim_clear'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🧹 Limpiar protoboard');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Borra todos los componentes de la protoboard');
        }
    };
    Blockly.JavaScript.forBlock['sim_clear'] = function (block) {
        return `await sim.clearBoard();
`;
    };
    Blockly.Blocks['sim_start'] = {
        init: function () {
            this.appendDummyInput().appendField('▶ Iniciar simulacion');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Arranca la simulacion: la corriente comienza a fluir por el circuito');
        }
    };
    Blockly.JavaScript.forBlock['sim_start'] = function () {
        return `await sim.simStart();\n`;
    };
    Blockly.Blocks['sim_stop'] = {
        init: function () {
            this.appendDummyInput().appendField('⏹ Detener simulacion');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Detiene la simulacion (los componentes dejan de tener corriente)');
        }
    };
    Blockly.JavaScript.forBlock['sim_stop'] = function () {
        return `await sim.simStop();\n`;
    };
    const TOOL_NAME_OPTS = [
        ['Cable',         'wire'],
        ['LED',           'led'],
        ['Resistencia',   'resistor'],
        ['LDR (Fotorresistencia)', 'ldr'],
        ['Interruptor',   'switch'],
        ['Diodo',         'diode'],
        ['Pulsador',      'pushbutton'],
        ['Capacitor',     'capacitor'],
        ['Inductor',      'inductor'],
        ['Buzzer',        'buzzer'],
        ['Motor',         'motor'],
        ['Potenciometro', 'potentiometer'],
        ['Transistor',    'transistor'],
        ['NE555',         'ne555']
    ];
    const HIGHLIGHT_COLOR_OPTS = [
        ['amarillo',  'amarillo'],
        ['verde',     'verde'],
        ['rojo',      'rojo'],
        ['azul',      'azul'],
        ['naranja',   'naranja'],
        ['cyan',      'cyan']
    ];
    Blockly.Blocks['sim_point_to'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('👆 Apuntar a')
                .appendField(new Blockly.FieldTextInput('A5'), 'COORD');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Mueve el cursor visible a una coordenada (sin clickear)');
        }
    };
    Blockly.JavaScript.forBlock['sim_point_to'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        return `await sim.pointTo(${JSON.stringify(c)});\n`;
    };
    Blockly.Blocks['sim_point_to_tool'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('👆 Apuntar a herramienta')
                .appendField(new Blockly.FieldDropdown(TOOL_NAME_OPTS), 'TOOL');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Mueve el cursor visible a un boton de la sidebar del simulador');
        }
    };
    Blockly.JavaScript.forBlock['sim_point_to_tool'] = function (block) {
        const t = block.getFieldValue('TOOL') || 'led';
        return `await sim.pointToTool(${JSON.stringify(t)});\n`;
    };
    Blockly.Blocks['sim_click'] = {
        init: function () {
            this.appendDummyInput().appendField('👆 Click aqui');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Anima un click (ripple) en la posicion actual del cursor virtual');
        }
    };
    Blockly.JavaScript.forBlock['sim_click'] = function () {
        return `await sim.click();\n`;
    };
    Blockly.Blocks['sim_zoom_to'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎥 Zoom a')
                .appendField(new Blockly.FieldTextInput('A5'), 'COORD')
                .appendField('en')
                .appendField(new Blockly.FieldNumber(1.2, 0.1, 10, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Anima la camara para enfocar una coordenada');
        }
    };
    Blockly.JavaScript.forBlock['sim_zoom_to'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        const d = Number(block.getFieldValue('DUR')) * 1000;
        return `await sim.zoomTo(${JSON.stringify(c)}, ${d});\n`;
    };
    Blockly.Blocks['sim_zoom_range'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎥 Zoom a area')
                .appendField(new Blockly.FieldTextInput('A1'),  'A')
                .appendField('-')
                .appendField(new Blockly.FieldTextInput('J10'), 'B')
                .appendField('en')
                .appendField(new Blockly.FieldNumber(1.5, 0.1, 10, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Anima la camara para enmarcar un area entre dos coordenadas');
        }
    };
    Blockly.JavaScript.forBlock['sim_zoom_range'] = function (block) {
        const a = block.getFieldValue('A') || '';
        const b = block.getFieldValue('B') || '';
        const d = Number(block.getFieldValue('DUR')) * 1000;
        return `await sim.zoomToRange(${JSON.stringify(a)}, ${JSON.stringify(b)}, ${d});\n`;
    };
    Blockly.Blocks['sim_camera_reset'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎥 Resetear camara en')
                .appendField(new Blockly.FieldNumber(1, 0.1, 5, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Vuelve la camara a la vista inicial');
        }
    };
    Blockly.JavaScript.forBlock['sim_camera_reset'] = function (block) {
        const d = Number(block.getFieldValue('DUR')) * 1000;
        return `await sim.cameraReset(${d});\n`;
    };
    Blockly.Blocks['sim_highlight'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('✨ Resaltar')
                .appendField(new Blockly.FieldTextInput('A5'), 'COORD')
                .appendField('a')
                .appendField(new Blockly.FieldTextInput(''), 'COORD_TO')
                .appendField('color')
                .appendField(new Blockly.FieldDropdown(HIGHLIGHT_COLOR_OPTS), 'COLOR')
                .appendField('por')
                .appendField(new Blockly.FieldNumber(1.5, 0.1, 10, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Resalta un hoyo o un rango. Dejar el 2do vacio = resalta solo el 1ro.');
        }
    };
    Blockly.JavaScript.forBlock['sim_highlight'] = function (block) {
        const a   = block.getFieldValue('COORD') || '';
        const b   = block.getFieldValue('COORD_TO') || '';
        const col = block.getFieldValue('COLOR') || 'amarillo';
        const d   = Number(block.getFieldValue('DUR')) * 1000;
        if (!b.trim() || b.trim().toUpperCase() === a.trim().toUpperCase()) {
            return `await sim.highlight(${JSON.stringify(a)}, ${JSON.stringify(col)}, ${d});\n`;
        }
        return `await sim.highlightRange(${JSON.stringify(a)}, ${JSON.stringify(b)}, ${JSON.stringify(col)}, ${d});\n`;
    };
    Blockly.Blocks['sim_spotlight'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔦 Foco en')
                .appendField(new Blockly.FieldTextInput('A5'), 'COORD');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Foco visual sobre un hoyo (resaltado prolongado de 3 s)');
        }
    };
    Blockly.JavaScript.forBlock['sim_spotlight'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        return `await sim.spotlight(${JSON.stringify(c)});\n`;
    };
    Blockly.Blocks['sim_clear_highlights'] = {
        init: function () {
            this.appendDummyInput().appendField('🎬 Quitar realces');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Restaura todos los hoyos resaltados a su color original');
        }
    };
    Blockly.JavaScript.forBlock['sim_clear_highlights'] = function () {
        return `await sim.clearHighlights();\n`;
    };
    Blockly.Blocks['sim_set_light'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('☀️ Ajustar luz a')
                .appendField(new Blockly.FieldNumber(50, 0, 100, 1), 'LEVEL')
                .appendField('% en')
                .appendField(new Blockly.FieldNumber(1.5, 0.1, 10, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Mueve el slider tridimensional de luz ambiental al nivel indicado (0 a 100%) en N segundos');
        }
    };
    Blockly.JavaScript.forBlock['sim_set_light'] = function (block) {
        const lvl = Number(block.getFieldValue('LEVEL'));
        const dur = Number(block.getFieldValue('DUR')) * 1000;
        return `await sim.setLightLevel(${lvl}, ${dur});\n`;
    };
    Blockly.Blocks['sim_camera_zoom'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎥 Camara x')
                .appendField(new Blockly.FieldNumber(1.5, 0.2, 5, 0.1), 'FACTOR')
                .appendField('(>1 aleja, <1 acerca) en')
                .appendField(new Blockly.FieldNumber(0.9, 0.1, 10, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Aleja o acerca la camara manteniendo el mismo punto de mira. 1.5 = aleja 50%, 0.7 = acerca 30%.');
        }
    };
    Blockly.JavaScript.forBlock['sim_camera_zoom'] = function (block) {
        const f = Number(block.getFieldValue('FACTOR')) || 1.5;
        const d = Number(block.getFieldValue('DUR')) * 1000;
        return `await sim.cameraZoom(${f}, ${d});\n`;
    };
    Blockly.Blocks['sim_camera_orbit'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎥 Orbitar yaw')
                .appendField(new Blockly.FieldNumber(45, -360, 360, 5), 'YAW')
                .appendField('° pitch')
                .appendField(new Blockly.FieldNumber(0, -80, 80, 5), 'PITCH')
                .appendField('° en')
                .appendField(new Blockly.FieldNumber(1.2, 0.1, 10, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Rota la camara alrededor del punto de mira. Yaw = giro horizontal, Pitch = subir o bajar la vista.');
        }
    };
    Blockly.JavaScript.forBlock['sim_camera_orbit'] = function (block) {
        const y = Number(block.getFieldValue('YAW')) || 0;
        const p = Number(block.getFieldValue('PITCH')) || 0;
        const d = Number(block.getFieldValue('DUR')) * 1000;
        return `await sim.cameraOrbit(${y}, ${p}, ${d});\n`;
    };
    const CAMERA_VIEW_OPTS = [
        ['vista isometrica', 'iso'],
        ['vista cenital (de arriba)', 'top'],
        ['vista lateral', 'side'],
        ['vista frontal', 'front'],
        ['vista posterior', 'back']
    ];
    Blockly.Blocks['sim_camera_view'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎥 Cambiar a')
                .appendField(new Blockly.FieldDropdown(CAMERA_VIEW_OPTS), 'VIEW')
                .appendField('en')
                .appendField(new Blockly.FieldNumber(1.2, 0.1, 10, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Posiciona la camara en una vista clasica: arriba, lateral, frontal, isometrica o por detras.');
        }
    };
    Blockly.JavaScript.forBlock['sim_camera_view'] = function (block) {
        const v = block.getFieldValue('VIEW') || 'iso';
        const d = Number(block.getFieldValue('DUR')) * 1000;
        return `await sim.cameraView(${JSON.stringify(v)}, ${d});\n`;
    };
    Blockly.Blocks['sim_camera_drone'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🚁 Dron: yaw')
                .appendField(new Blockly.FieldNumber(45, -360, 360, 5), 'YAW')
                .appendField('° pitch')
                .appendField(new Blockly.FieldNumber(15, -80, 80, 5), 'PITCH')
                .appendField('° zoom x')
                .appendField(new Blockly.FieldNumber(1.2, 0.2, 5, 0.1), 'ZOOM')
                .appendField('en')
                .appendField(new Blockly.FieldNumber(1.5, 0.1, 10, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Vuelo de dron: gira y aleja la camara en un solo movimiento fluido.');
        }
    };
    Blockly.JavaScript.forBlock['sim_camera_drone'] = function (block) {
        const y = Number(block.getFieldValue('YAW')) || 0;
        const p = Number(block.getFieldValue('PITCH')) || 0;
        const z = Number(block.getFieldValue('ZOOM')) || 1;
        const d = Number(block.getFieldValue('DUR')) * 1000;
        return `await sim.cameraDrone(${y}, ${p}, ${z}, ${d});\n`;
    };
    const CAP_VALUE_OPTS = [
        ['100 nF', '100nF'],
        ['1 µF',   '1uF'],
        ['10 µF',  '10uF'],
        ['22 µF',  '22uF'],
        ['47 µF',  '47uF'],
        ['100 µF', '100uF'],
        ['220 µF', '220uF'],
        ['470 µF', '470uF'],
        ['1000 µF','1000uF']
    ];
    Blockly.Blocks['sim_capacitor'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('💧 Capacitor entre')
                .appendField(new Blockly.FieldTextInput('J12'), 'A')
                .appendField('y')
                .appendField(new Blockly.FieldTextInput('NS12'), 'B')
                .appendField('de')
                .appendField(new Blockly.FieldDropdown(CAP_VALUE_OPTS), 'VAL');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca un capacitor electrolitico entre dos hoyos. La pata larga (+) va al positivo.');
        }
    };
    Blockly.JavaScript.forBlock['sim_capacitor'] = function (block) {
        const a = block.getFieldValue('A') || '';
        const b = block.getFieldValue('B') || '';
        const v = block.getFieldValue('VAL') || '100uF';
        return `await sim.placeCapacitor(${JSON.stringify(a)}, ${JSON.stringify(b)}, ${JSON.stringify(v)});\n`;
    };
    const IND_VALUE_OPTS = [
        ['1 mH',  '1mH'],
        ['10 mH', '10mH'],
        ['47 mH', '47mH'],
        ['100 mH','100mH'],
        ['1 H',   '1H']
    ];
    Blockly.Blocks['sim_inductor'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🌀 Bobina entre')
                .appendField(new Blockly.FieldTextInput('J12'), 'A')
                .appendField('y')
                .appendField(new Blockly.FieldTextInput('J14'), 'B')
                .appendField('de')
                .appendField(new Blockly.FieldDropdown(IND_VALUE_OPTS), 'VAL');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca una bobina (inductor) entre dos hoyos.');
        }
    };
    Blockly.JavaScript.forBlock['sim_inductor'] = function (block) {
        const a = block.getFieldValue('A') || '';
        const b = block.getFieldValue('B') || '';
        const v = block.getFieldValue('VAL') || '10mH';
        return `await sim.placeInductor(${JSON.stringify(a)}, ${JSON.stringify(b)}, ${JSON.stringify(v)});\n`;
    };
    Blockly.Blocks['sim_diode'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('▶| Diodo 1N4148 entre')
                .appendField(new Blockly.FieldTextInput('J12'), 'A')
                .appendField('y')
                .appendField(new Blockly.FieldTextInput('J14'), 'B');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca un diodo 1N4148 (Vf 0.7V).');
        }
    };
    Blockly.JavaScript.forBlock['sim_diode'] = function (block) {
        const a = block.getFieldValue('A') || '';
        const b = block.getFieldValue('B') || '';
        return `await sim.placeDiode(${JSON.stringify(a)}, ${JSON.stringify(b)});\n`;
    };
    Blockly.Blocks['sim_buzzer'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔊 Buzzer entre')
                .appendField(new Blockly.FieldTextInput('J12'), 'A')
                .appendField('y')
                .appendField(new Blockly.FieldTextInput('NS12'), 'B');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca un zumbador activo. Suena cuando recibe corriente.');
        }
    };
    Blockly.JavaScript.forBlock['sim_buzzer'] = function (block) {
        const a = block.getFieldValue('A') || '';
        const b = block.getFieldValue('B') || '';
        return `await sim.placeBuzzer(${JSON.stringify(a)}, ${JSON.stringify(b)});\n`;
    };
    Blockly.Blocks['sim_motor'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⚙ Motor DC entre')
                .appendField(new Blockly.FieldTextInput('J12'), 'A')
                .appendField('y')
                .appendField(new Blockly.FieldTextInput('NS12'), 'B');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca un motor DC (gira cuando hay corriente).');
        }
    };
    Blockly.JavaScript.forBlock['sim_motor'] = function (block) {
        const a = block.getFieldValue('A') || '';
        const b = block.getFieldValue('B') || '';
        return `await sim.placeMotor(${JSON.stringify(a)}, ${JSON.stringify(b)});\n`;
    };
    const TRANSISTOR_TYPE_OPTS = [
        ['🔺 NPN (BC548)', 'NPN'],
        ['🔻 PNP (BC558)', 'PNP']
    ];
    Blockly.Blocks['sim_transistor'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎚 Transistor')
                .appendField(new Blockly.FieldDropdown(TRANSISTOR_TYPE_OPTS), 'TYPE')
                .appendField('colector en')
                .appendField(new Blockly.FieldTextInput('E14'), 'COLLECTOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca un transistor de 3 patas. Las patas C-B-E quedan de izquierda a derecha en columnas consecutivas: si Colector es E14, Base queda en E15 y Emisor en E16. NPN: corriente Base->Emisor enciende el Colector (BC548, beta=100). PNP: inverso (BC558).');
        }
    };
    Blockly.JavaScript.forBlock['sim_transistor'] = function (block) {
        const t = block.getFieldValue('TYPE') || 'NPN';
        const c = block.getFieldValue('COLLECTOR') || '';
        return `await sim.placeTransistor(${JSON.stringify(c)}, ${JSON.stringify(t)});\n`;
    };
    Blockly.Blocks['sim_switch'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔌 Interruptor entre')
                .appendField(new Blockly.FieldTextInput('J18'), 'A')
                .appendField('y')
                .appendField(new Blockly.FieldTextInput('J16'), 'B');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca un interruptor (switch) de 2 patas entre dos hoyos.');
        }
    };
    Blockly.JavaScript.forBlock['sim_switch'] = function (block) {
        const a = block.getFieldValue('A') || '';
        const b = block.getFieldValue('B') || '';
        return `await sim.placeSwitch(${JSON.stringify(a)}, ${JSON.stringify(b)});\n`;
    };
    Blockly.Blocks['sim_pushbutton'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔘 Pulsador entre')
                .appendField(new Blockly.FieldTextInput('J18'), 'A')
                .appendField('y')
                .appendField(new Blockly.FieldTextInput('J16'), 'B');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Coloca un pulsador (push button) de 2 patas entre dos hoyos.');
        }
    };
    Blockly.JavaScript.forBlock['sim_pushbutton'] = function (block) {
        const a = block.getFieldValue('A') || '';
        const b = block.getFieldValue('B') || '';
        return `await sim.placePushbutton(${JSON.stringify(a)}, ${JSON.stringify(b)});\n`;
    };
    Blockly.Blocks['sim_switch_toggle'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔁 Conmutar interruptor en')
                .appendField(new Blockly.FieldTextInput('J18'), 'COORD');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Alterna el estado ON/OFF del interruptor que pasa por la coordenada.');
        }
    };
    Blockly.JavaScript.forBlock['sim_switch_toggle'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        return `await sim.toggleSwitch(${JSON.stringify(c)});\n`;
    };
    const SWITCH_STATE_OPTS = [
        ['cerrado (ON)', 'ON'],
        ['abierto (OFF)', 'OFF']
    ];
    Blockly.Blocks['sim_switch_set'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔌 Poner interruptor en')
                .appendField(new Blockly.FieldTextInput('J18'), 'COORD')
                .appendField('en')
                .appendField(new Blockly.FieldDropdown(SWITCH_STATE_OPTS), 'STATE');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Setea el interruptor directamente a ON (cerrado) u OFF (abierto).');
        }
    };
    Blockly.JavaScript.forBlock['sim_switch_set'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        const s = block.getFieldValue('STATE') === 'ON' ? 'true' : 'false';
        return `await sim.setSwitch(${JSON.stringify(c)}, ${s});\n`;
    };
    Blockly.Blocks['sim_pushbutton_press'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔘 Presionar pulsador en')
                .appendField(new Blockly.FieldTextInput('J18'), 'COORD')
                .appendField('durante')
                .appendField(new Blockly.FieldNumber(0.5, 0.1, 10, 0.1), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Presiona el pulsador (anima el cap hacia abajo), espera N segundos, y lo suelta.');
        }
    };
    Blockly.JavaScript.forBlock['sim_pushbutton_press'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        const d = Number(block.getFieldValue('DUR')) * 1000;
        return `await sim.pressPushbutton(${JSON.stringify(c)}, ${d});\n`;
    };
    Blockly.Blocks['sim_pushbutton_hold'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔘 Mantener pulsador en')
                .appendField(new Blockly.FieldTextInput('J18'), 'COORD')
                .appendField('presionado');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Mantiene el pulsador presionado hasta que un bloque "Soltar pulsador" lo libere.');
        }
    };
    Blockly.JavaScript.forBlock['sim_pushbutton_hold'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        return `await sim.holdPushbutton(${JSON.stringify(c)});\n`;
    };
    Blockly.Blocks['sim_pushbutton_release'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔘 Soltar pulsador en')
                .appendField(new Blockly.FieldTextInput('J18'), 'COORD');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Libera un pulsador que estaba siendo mantenido presionado.');
        }
    };
    Blockly.JavaScript.forBlock['sim_pushbutton_release'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        return `await sim.releasePushbutton(${JSON.stringify(c)});\n`;
    };
    Blockly.Blocks['sim_remove'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🗑️ Quitar componente en')
                .appendField(new Blockly.FieldTextInput('PS18'), 'COORD');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Borra cualquier componente con un endpoint cerca de la coord. Util para reemplazar un cable por el amperimetro.');
        }
    };
    Blockly.JavaScript.forBlock['sim_remove'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        return `await sim.removeAt(${JSON.stringify(c)});\n`;
    };
    const MULTIMETER_POS_OPTS = [
        ['derecha',          'derecha'],
        ['izquierda',        'izquierda'],
        ['atras',            'atras'],
        ['adelante',         'adelante'],
        ['esquina derecha',  'esquina-der'],
        ['esquina izquierda','esquina-izq'],
        ['posicion inicial', 'home']
    ];
    Blockly.Blocks['sim_move_multimeter'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('📟 Mover multimetro a')
                .appendField(new Blockly.FieldDropdown(MULTIMETER_POS_OPTS), 'POS');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Reposiciona el multimetro 3D para que no tape la protoboard o Patitas.');
        }
    };
    Blockly.JavaScript.forBlock['sim_move_multimeter'] = function (block) {
        const p = block.getFieldValue('POS') || 'derecha';
        return `await sim.moveMultimeter(${JSON.stringify(p)});\n`;
    };
    const MULTIMETER_MODE_OPTS = [
        ['V (voltaje)',     'V'],
        ['A (corriente)',   'A'],
        ['Ohm (resistencia)', 'R'],
        ['Apagado',         'OFF']
    ];
    Blockly.Blocks['sim_use_multimeter'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('📟 Multimetro modo')
                .appendField(new Blockly.FieldDropdown(MULTIMETER_MODE_OPTS), 'MODE');
            this.appendDummyInput()
                .appendField('punta roja en')
                .appendField(new Blockly.FieldTextInput('J16'), 'RED');
            this.appendDummyInput()
                .appendField('punta negra en')
                .appendField(new Blockly.FieldTextInput('NS16'), 'BLACK');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Pone el multimetro entre dos coords y elige V/A/R. El cursor gira el selector y arrastra las puntas. Si ya esta colocado, solo reposiciona.');
        }
    };
    Blockly.JavaScript.forBlock['sim_use_multimeter'] = function (block) {
        const m = block.getFieldValue('MODE') || 'V';
        const r = block.getFieldValue('RED') || '';
        const b = block.getFieldValue('BLACK') || '';
        return `await sim.useMultimeter(${JSON.stringify(m)}, ${JSON.stringify(r)}, ${JSON.stringify(b)});\n`;
    };
    const VOLTAGE_OPTS = [
        ['3.3 V', '3.3V'],
        ['5 V',   '5V'],
        ['9 V',   '9V'],
        ['12 V',  '12V']
    ];
    Blockly.Blocks['sim_set_voltage'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔋 Fuente')
                .appendField(new Blockly.FieldDropdown(VOLTAGE_OPTS), 'VOLT');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_SIM);
            this.setTooltip('Cambia la tension de la fuente de alimentacion. Si la simulacion ya esta corriendo, se recalculan los voltajes y corrientes al instante.');
        }
    };
    Blockly.JavaScript.forBlock['sim_set_voltage'] = function (block) {
        const v = block.getFieldValue('VOLT') || '5V';
        return `await sim.setVoltage(${JSON.stringify(v)});\n`;
    };
    const COLOR_PHYS = 180;  
    const FLOW_DIR_OPTS = [
        ['convencional (+ a -)', 'conventional'],
        ['electron (- a +)',     'electron']
    ];
    const INFO_MODE_OPTS = [
        ['todos (V/I/R/P)', 'all'],
        ['voltaje (V)',     'voltage'],
        ['corriente (I)',   'current'],
        ['resistencia (R)', 'resistance'],
        ['potencia (P)',    'power']
    ];
    Blockly.Blocks['sim_flow_start'] = {
        init: function () {
            this.appendDummyInput().appendField('⚡ Iniciar flujo de electrones');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PHYS);
            this.setTooltip('Activa particulas amarillas que recorren los cables (requiere simulacion iniciada)');
        }
    };
    Blockly.JavaScript.forBlock['sim_flow_start'] = function () {
        return `await sim.startFlow();\n`;
    };
    Blockly.Blocks['sim_flow_stop'] = {
        init: function () {
            this.appendDummyInput().appendField('⚡ Detener flujo');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PHYS);
            this.setTooltip('Apaga las particulas de flujo');
        }
    };
    Blockly.JavaScript.forBlock['sim_flow_stop'] = function () {
        return `await sim.stopFlow();\n`;
    };
    Blockly.Blocks['sim_flow_dir'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🔁 Direccion de flujo')
                .appendField(new Blockly.FieldDropdown(FLOW_DIR_OPTS), 'DIR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PHYS);
            this.setTooltip('Convencional = del + al - (libros de texto). Electron = del - al + (real).');
        }
    };
    Blockly.JavaScript.forBlock['sim_flow_dir'] = function (block) {
        const d = block.getFieldValue('DIR') || 'conventional';
        return `sim.setFlowDirection(${JSON.stringify(d)});\n`;
    };
    Blockly.Blocks['sim_info_show'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('📊 Mostrar')
                .appendField(new Blockly.FieldDropdown(INFO_MODE_OPTS), 'MODE')
                .appendField('en')
                .appendField(new Blockly.FieldTextInput('A5'), 'COORD');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PHYS);
            this.setTooltip('Muestra burbuja con magnitudes sobre el componente. Se actualiza en vivo.');
        }
    };
    Blockly.JavaScript.forBlock['sim_info_show'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        const m = block.getFieldValue('MODE') || 'all';
        return `await sim.showInfo(${JSON.stringify(c)}, ${JSON.stringify(m)});\n`;
    };
    Blockly.Blocks['sim_info_hide'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('📊 Ocultar info en')
                .appendField(new Blockly.FieldTextInput('A5'), 'COORD');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PHYS);
            this.setTooltip('Quita la burbuja de magnitudes del componente');
        }
    };
    Blockly.JavaScript.forBlock['sim_info_hide'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        return `await sim.hideInfo(${JSON.stringify(c)});\n`;
    };
    Blockly.Blocks['sim_info_hide_all'] = {
        init: function () {
            this.appendDummyInput().appendField('🧹 Ocultar todas las info');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PHYS);
            this.setTooltip('Quita todas las burbujas de magnitudes');
        }
    };
    Blockly.JavaScript.forBlock['sim_info_hide_all'] = function () {
        return `await sim.hideAllInfo();\n`;
    };
    Blockly.Blocks['sim_component_speak'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('💬 Componente en')
                .appendField(new Blockly.FieldTextInput('A5'), 'COORD')
                .appendField('dice')
                .appendField(new Blockly.FieldTextInput('¡Hola, soy un LED!'), 'TEXT')
                .appendField('por')
                .appendField(new Blockly.FieldNumber(3, 0.5, 30, 0.5), 'DUR')
                .appendField('s');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PHYS);
            this.setTooltip('Muestra una burbuja con texto custom sobre el componente');
        }
    };
    Blockly.JavaScript.forBlock['sim_component_speak'] = function (block) {
        const c = block.getFieldValue('COORD') || '';
        const t = block.getFieldValue('TEXT') || '';
        const d = Number(block.getFieldValue('DUR')) * 1000;
        return `await sim.componentSpeak(${JSON.stringify(c)}, ${JSON.stringify(t)}, ${d});\n`;
    };
    const COLOR_CALC = 290;  
    const CALC_TAB_OPTS = [
        ['Basica (sumar/restar)', 'basic'],
        ['Ley de Ohm',            'ohm'],
        ['Resistencias paralelo + Kirchhoff', 'parallel'],
        ['LED + Potencia',        'power'],
        ['Divisor de tension',    'divider'],
        ['Inductor (RL)',         'inductor'],
        ['Datos tecnicos',        'data']
    ];
    Blockly.Blocks['calc_open'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🧮 Abrir calculadora pestaña')
                .appendField(new Blockly.FieldDropdown(CALC_TAB_OPTS), 'TAB');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Abre la calculadora electronica del simulador en la pestaña indicada.');
        }
    };
    Blockly.JavaScript.forBlock['calc_open'] = function (block) {
        const t = block.getFieldValue('TAB') || 'basic';
        return `await sim.calcOpen(${JSON.stringify(t)});\n`;
    };
    const CALC_POS_OPTS = [
        ['arriba-derecha',   'top-right'],
        ['arriba-izquierda', 'top-left'],
        ['abajo-derecha',    'bottom-right'],
        ['abajo-izquierda',  'bottom-left'],
        ['centro',           'center']
    ];
    Blockly.Blocks['calc_move'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🧮 Mover calculadora a')
                .appendField(new Blockly.FieldDropdown(CALC_POS_OPTS), 'POS');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Reposiciona la ventana de la calculadora para no tapar otros widgets.');
        }
    };
    Blockly.JavaScript.forBlock['calc_move'] = function (block) {
        const p = block.getFieldValue('POS') || 'bottom-right';
        return `await sim.calcMoveTo(${JSON.stringify(p)});\n`;
    };
    Blockly.Blocks['calc_resize'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🧮 Tamano calculadora ancho')
                .appendField(new Blockly.FieldNumber(380, 240, 1200, 20), 'W')
                .appendField('alto')
                .appendField(new Blockly.FieldNumber(520, 240, 900, 20), 'H')
                .appendField('px');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Cambia el tamano de la ventana de la calculadora en pixeles.');
        }
    };
    Blockly.JavaScript.forBlock['calc_resize'] = function (block) {
        const w = Number(block.getFieldValue('W')) || 380;
        const h = Number(block.getFieldValue('H')) || 520;
        return `await sim.calcResize(${w}, ${h});\n`;
    };
    Blockly.Blocks['calc_close'] = {
        init: function () {
            this.appendDummyInput().appendField('🧮 Cerrar calculadora');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Cierra la ventana de la calculadora.');
        }
    };
    Blockly.JavaScript.forBlock['calc_close'] = function () {
        return `await sim.calcClose();\n`;
    };
    Blockly.Blocks['calc_ohm'] = {
        init: function () {
            this.appendDummyInput().appendField('⚡ Calc Ohm');
            this.appendDummyInput()
                .appendField('V')
                .appendField(new Blockly.FieldTextInput(''), 'V')
                .appendField('volt')
                .appendField('I')
                .appendField(new Blockly.FieldTextInput(''), 'I')
                .appendField('mA')
                .appendField('R')
                .appendField(new Blockly.FieldTextInput(''), 'R')
                .appendField('ohm');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Abre la calculadora en Ley de Ohm. Dejar VACIO el campo que querés que la calculadora calcule.');
        }
    };
    Blockly.JavaScript.forBlock['calc_ohm'] = function (block) {
        const v = (block.getFieldValue('V') || '').trim();
        const i = (block.getFieldValue('I') || '').trim();
        const r = (block.getFieldValue('R') || '').trim();
        const parts = [];
        if (v) parts.push(`v: ${JSON.stringify(v)}`);
        if (i) parts.push(`i: ${JSON.stringify(i)}`);
        if (r) parts.push(`r: ${JSON.stringify(r)}`);
        return `await sim.calcOhm({${parts.join(', ')}});\n`;
    };
    Blockly.Blocks['calc_parallel'] = {
        init: function () {
            this.appendDummyInput().appendField('🔀 Calc Paralelo');
            this.appendDummyInput()
                .appendField('R1')
                .appendField(new Blockly.FieldTextInput(''), 'R1')
                .appendField('R2')
                .appendField(new Blockly.FieldTextInput(''), 'R2')
                .appendField('R3')
                .appendField(new Blockly.FieldTextInput(''), 'R3')
                .appendField('ohm');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Resistencias en paralelo. Req = 1/(1/R1 + 1/R2 + 1/R3). R3 opcional.');
        }
    };
    Blockly.JavaScript.forBlock['calc_parallel'] = function (block) {
        const r1 = (block.getFieldValue('R1') || '').trim();
        const r2 = (block.getFieldValue('R2') || '').trim();
        const r3 = (block.getFieldValue('R3') || '').trim();
        const parts = [];
        if (r1) parts.push(`r1: ${JSON.stringify(r1)}`);
        if (r2) parts.push(`r2: ${JSON.stringify(r2)}`);
        if (r3) parts.push(`r3: ${JSON.stringify(r3)}`);
        return `await sim.calcParallel({${parts.join(', ')}});\n`;
    };
    Blockly.Blocks['calc_kirchhoff'] = {
        init: function () {
            this.appendDummyInput().appendField('➕ Calc Kirchhoff KCL');
            this.appendDummyInput()
                .appendField('I1')
                .appendField(new Blockly.FieldTextInput(''), 'I1')
                .appendField('I2')
                .appendField(new Blockly.FieldTextInput(''), 'I2')
                .appendField('I3')
                .appendField(new Blockly.FieldTextInput(''), 'I3')
                .appendField('mA');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Suma de corrientes en un nodo (Kirchhoff KCL). Mismo panel que paralelo.');
        }
    };
    Blockly.JavaScript.forBlock['calc_kirchhoff'] = function (block) {
        const i1 = (block.getFieldValue('I1') || '').trim();
        const i2 = (block.getFieldValue('I2') || '').trim();
        const i3 = (block.getFieldValue('I3') || '').trim();
        const parts = [];
        if (i1) parts.push(`i1: ${JSON.stringify(i1)}`);
        if (i2) parts.push(`i2: ${JSON.stringify(i2)}`);
        if (i3) parts.push(`i3: ${JSON.stringify(i3)}`);
        return `await sim.calcKirchhoff({${parts.join(', ')}});\n`;
    };
    const CALC_LED_COLOR_OPTS = [
        ['(no elegir)', ''],
        ['🔴 Rojo',     'rojo'],
        ['🟡 Amarillo', 'amarillo'],
        ['🟢 Verde',    'verde'],
        ['🔵 Azul',     'azul'],
        ['⚪ Blanco',   'blanco']
    ];
    Blockly.Blocks['calc_led'] = {
        init: function () {
            this.appendDummyInput().appendField('💡 Calc LED');
            this.appendDummyInput()
                .appendField('Vfuente')
                .appendField(new Blockly.FieldTextInput(''), 'VSRC')
                .appendField('V color')
                .appendField(new Blockly.FieldDropdown(CALC_LED_COLOR_OPTS), 'COLOR')
                .appendField('R circuito')
                .appendField(new Blockly.FieldTextInput(''), 'R')
                .appendField('ohm');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Calculo de R para LED. Dejar R vacia para que la calculadora sugiera el valor minimo.');
        }
    };
    Blockly.JavaScript.forBlock['calc_led'] = function (block) {
        const vsrc  = (block.getFieldValue('VSRC') || '').trim();
        const color = (block.getFieldValue('COLOR') || '').trim();
        const r     = (block.getFieldValue('R') || '').trim();
        const parts = [];
        if (vsrc)  parts.push(`vsrc: ${JSON.stringify(vsrc)}`);
        if (color) parts.push(`color: ${JSON.stringify(color)}`);
        if (r)     parts.push(`r: ${JSON.stringify(r)}`);
        return `await sim.calcLed({${parts.join(', ')}});\n`;
    };
    Blockly.Blocks['calc_power'] = {
        init: function () {
            this.appendDummyInput().appendField('🔋 Calc Potencia');
            this.appendDummyInput()
                .appendField('V')
                .appendField(new Blockly.FieldTextInput(''), 'V')
                .appendField('volt')
                .appendField('I')
                .appendField(new Blockly.FieldTextInput(''), 'I')
                .appendField('mA');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Potencia P = V x I.');
        }
    };
    Blockly.JavaScript.forBlock['calc_power'] = function (block) {
        const v = (block.getFieldValue('V') || '').trim();
        const i = (block.getFieldValue('I') || '').trim();
        const parts = [];
        if (v) parts.push(`v: ${JSON.stringify(v)}`);
        if (i) parts.push(`i: ${JSON.stringify(i)}`);
        return `await sim.calcPower({${parts.join(', ')}});\n`;
    };
    Blockly.Blocks['calc_divider'] = {
        init: function () {
            this.appendDummyInput().appendField('🔻 Calc Divisor de tension');
            this.appendDummyInput()
                .appendField('Vcc')
                .appendField(new Blockly.FieldTextInput(''), 'VCC')
                .appendField('V')
                .appendField('Ra')
                .appendField(new Blockly.FieldTextInput(''), 'RA')
                .appendField('Rb')
                .appendField(new Blockly.FieldTextInput(''), 'RB')
                .appendField('ohm');
            this.appendDummyInput()
                .appendField('R carga')
                .appendField(new Blockly.FieldTextInput(''), 'RL')
                .appendField('ohm  Vled')
                .appendField(new Blockly.FieldTextInput(''), 'VLED')
                .appendField('V');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Divisor de tension puro (Vcc/Ra/Rb) y con carga (Rcarga, Vled).');
        }
    };
    Blockly.JavaScript.forBlock['calc_divider'] = function (block) {
        const vcc  = (block.getFieldValue('VCC')  || '').trim();
        const ra   = (block.getFieldValue('RA')   || '').trim();
        const rb   = (block.getFieldValue('RB')   || '').trim();
        const rl   = (block.getFieldValue('RL')   || '').trim();
        const vled = (block.getFieldValue('VLED') || '').trim();
        const parts = [];
        if (vcc)  parts.push(`vcc: ${JSON.stringify(vcc)}`);
        if (ra)   parts.push(`ra: ${JSON.stringify(ra)}`);
        if (rb)   parts.push(`rb: ${JSON.stringify(rb)}`);
        if (rl)   parts.push(`rl: ${JSON.stringify(rl)}`);
        if (vled) parts.push(`vled: ${JSON.stringify(vled)}`);
        return `await sim.calcDivider({${parts.join(', ')}});\n`;
    };
    Blockly.Blocks['calc_inductor'] = {
        init: function () {
            this.appendDummyInput().appendField('🌀 Abrir calc Inductor (RL, energia)');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Abre la pestaña de constante de tiempo RL, estado estacionario y energia almacenada.');
        }
    };
    Blockly.JavaScript.forBlock['calc_inductor'] = function () {
        return `await sim.calcInductor({});\n`;
    };
    Blockly.Blocks['calc_data'] = {
        init: function () {
            this.appendDummyInput().appendField('📋 Abrir datos tecnicos');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_CALC);
            this.setTooltip('Especificaciones tecnicas de los componentes (LEDs, resistencias, etc).');
        }
    };
    Blockly.JavaScript.forBlock['calc_data'] = function () {
        return `await sim.calcData();\n`;
    };
    const COLOR_NOTES = 45;   
    Blockly.Blocks['notes_write'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('📝 Escribir en pizarra')
                .appendField(new Blockly.FieldTextInput('Ley de Ohm: V = I · R'), 'TEXT');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_NOTES);
            this.setTooltip('Escribe una linea de texto en la pizarra. Se anota debajo de lo anterior.');
        }
    };
    Blockly.JavaScript.forBlock['notes_write'] = function (block) {
        const t = block.getFieldValue('TEXT') || '';
        return `await notes.write(${JSON.stringify(t)});\n`;
    };
    Blockly.Blocks['notes_solve'] = {
        init: function () {
            this.appendDummyInput().appendField('🧮 Resolver paso a paso (LaTeX)');
            this.appendDummyInput()
                .appendField('1)')
                .appendField(new Blockly.FieldTextInput('V = I \\cdot R'), 'STEP1');
            this.appendDummyInput()
                .appendField('2)')
                .appendField(new Blockly.FieldTextInput('9 = I \\cdot 220'), 'STEP2');
            this.appendDummyInput()
                .appendField('3)')
                .appendField(new Blockly.FieldTextInput('I = \\frac{9}{220}'), 'STEP3');
            this.appendDummyInput()
                .appendField('4)')
                .appendField(new Blockly.FieldTextInput(''), 'STEP4');
            this.appendDummyInput()
                .appendField('5)')
                .appendField(new Blockly.FieldTextInput(''), 'STEP5');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_NOTES);
            this.setTooltip('Renderiza hasta 5 pasos con MathJax. Usa LaTeX: \\frac{a}{b}, \\cdot, \\sqrt{x}, ^2, \\pi, \\Omega, etc. Pasos vacios se omiten.');
        }
    };
    Blockly.JavaScript.forBlock['notes_solve'] = function (block) {
        const steps = [];
        for (let i = 1; i <= 5; i++) {
            const s = (block.getFieldValue('STEP' + i) || '').trim();
            if (s) steps.push(s);
        }
        return `await notes.solve(${JSON.stringify(steps)});\n`;
    };
    Blockly.Blocks['notes_equation'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('∑ Ecuacion')
                .appendField(new Blockly.FieldTextInput('I = \\frac{V}{R}'), 'TEX');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_NOTES);
            this.setTooltip('Escribe una sola formula renderizada con MathJax. Usa LaTeX puro (sin $$).');
        }
    };
    Blockly.JavaScript.forBlock['notes_equation'] = function (block) {
        const t = block.getFieldValue('TEX') || '';
        return `await notes.solve([${JSON.stringify(t)}]);\n`;
    };
    Blockly.Blocks['notes_image'] = {
        init: function () {
            this.appendDummyInput().appendField('🖼️ Imagen en pizarra (URL/Ruta)')
                .appendField(new Blockly.FieldTextInput('assets/pcb_wip.jpg'), 'URL');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_NOTES);
            this.setTooltip('Muestra una imagen en la pizarra. Puede ser una URL externa o ruta local.');
        }
    };
    Blockly.JavaScript.forBlock['notes_image'] = function (block) {
        const url = block.getFieldValue('URL');
        return `await notes.image(${JSON.stringify(url)}, "100%");\n`;
    };
    Blockly.Blocks['notes_video'] = {
        init: function () {
            this.appendDummyInput().appendField('🎞️ Video en pizarra (URL/Ruta)')
                .appendField(new Blockly.FieldTextInput('assets/print_3d.mp4'), 'URL');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_NOTES);
            this.setTooltip('Muestra un video (MP4/WebM) en la pizarra con autoplay silenciado.');
        }
    };
    Blockly.JavaScript.forBlock['notes_video'] = function (block) {
        const url = block.getFieldValue('URL');
        return `await notes.video(${JSON.stringify(url)}, "100%", true);\n`;
    };
    Blockly.Blocks['notes_clear'] = {
        init: function () {
            this.appendDummyInput().appendField('🧽 Borrar pizarra');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_NOTES);
            this.setTooltip('Limpia todo el contenido de la pizarra');
        }
    };
    Blockly.JavaScript.forBlock['notes_clear'] = function () {
        return `await notes.clear();\n`;
    };
    Blockly.Blocks['notes_show'] = {
        init: function () {
            this.appendDummyInput().appendField('📋 Mostrar pizarra');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_NOTES);
            this.setTooltip('Abre la pizarra (normalmente aparece sola al primer write/solve).');
        }
    };
    Blockly.JavaScript.forBlock['notes_show'] = function () {
        return `await notes.show();\n`;
    };
    const NOTES_SIZE_OPTS = [
        ['mini (240x280)',     'mini'],
        ['chica (300x360)',    'small'],
        ['normal (360x460)',   'normal'],
        ['grande (480x600)',   'large'],
        ['alta (360x640)',     'tall'],
        ['ancha (600x420)',    'wide'],
        ['enorme (600x700)',   'huge']
    ];
    Blockly.Blocks['notes_size'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('📏 Tamano pizarra')
                .appendField(new Blockly.FieldDropdown(NOTES_SIZE_OPTS), 'SIZE');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_NOTES);
            this.setTooltip('Cambia el tamano de la pizarra. El texto y las formulas se ajustan automaticamente al espacio disponible.');
        }
    };
    Blockly.JavaScript.forBlock['notes_size'] = function (block) {
        const s = block.getFieldValue('SIZE') || 'normal';
        return `await notes.resize(${JSON.stringify(s)});\n`;
    };
    const NOTES_POS_OPTS = [
        ['arriba-derecha',  'top-right'],
        ['arriba-izquierda','top-left'],
        ['abajo-derecha',   'bottom-right'],
        ['abajo-izquierda', 'bottom-left'],
        ['centro',          'center']
    ];
    Blockly.Blocks['notes_move'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🧲 Mover pizarra a')
                .appendField(new Blockly.FieldDropdown(NOTES_POS_OPTS), 'POS');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_NOTES);
            this.setTooltip('Reposiciona la pizarra para no tapar el simulador (multimetro, fuente, etc).');
        }
    };
    Blockly.JavaScript.forBlock['notes_move'] = function (block) {
        const p = block.getFieldValue('POS') || 'top-right';
        return `await notes.moveTo(${JSON.stringify(p)});\n`;
    };
    Blockly.Blocks['notes_hide'] = {
        init: function () {
            this.appendDummyInput().appendField('📋 Ocultar pizarra');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_NOTES);
            this.setTooltip('Cierra la pizarra (sin borrar su contenido).');
        }
    };
    Blockly.JavaScript.forBlock['notes_hide'] = function () {
        return `await notes.hide();\n`;
    };
    Blockly.Blocks['sim_record_start'] = {
        init: function () {
            this.appendDummyInput().appendField('🎥 Iniciar grabacion (pantalla + audio)');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Pide compartir pantalla y audio del navegador. Marca "Compartir audio de la pestania" para grabar la voz de Patitas. Para detener, usa el bloque "Detener grabacion".');
        }
    };
    Blockly.JavaScript.forBlock['sim_record_start'] = function () {
        return `await sim.recordStart();\n`;
    };
    Blockly.Blocks['sim_record_stop'] = {
        init: function () {
            this.appendDummyInput().appendField('■ Detener grabacion');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PATITAS);
            this.setTooltip('Detiene la grabacion y abre un modal con previsualizacion + boton Descargar.');
        }
    };
    Blockly.JavaScript.forBlock['sim_record_stop'] = function () {
        return `await sim.recordStop();\n`;
    };
    const COLOR_PCB = 25;  
    Blockly.Blocks['pcb_say'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🗣️ Patitas dice')
                .appendField(new Blockly.FieldTextInput('¡Mirá tu placa!'), 'TEXT');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PCB);
            this.setTooltip('Patitas habla con burbuja y voz sobre el editor de PCB. Espera a que termine.');
        }
    };
    Blockly.JavaScript.forBlock['pcb_say'] = function (block) {
        return `await pcb.say(${JSON.stringify(block.getFieldValue('TEXT'))});\n`;
    };
    Blockly.Blocks['pcb_open_editor'] = {
        init: function () {
            this.appendDummyInput().appendField('🖨️ Abrir editor de PCB');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PCB);
            this.setTooltip('Abre el editor de PCB con la placa generada desde el circuito actual.');
        }
    };
    Blockly.JavaScript.forBlock['pcb_open_editor'] = function () { return `await pcb.openEditor();\n`; };
    Blockly.Blocks['pcb_auto'] = {
        init: function () {
            this.appendDummyInput().appendField('⚡ Auto-distribuir pistas');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PCB);
            this.setTooltip('Ordena los nodos para minimizar cruces y pistas bajo componentes.');
        }
    };
    Blockly.JavaScript.forBlock['pcb_auto'] = function () { return `await pcb.autoDistribute();\n`; };
    Blockly.Blocks['pcb_point'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('👉 Señalar')
                .appendField(new Blockly.FieldDropdown([
                    ['Ancho', 'ancho'], ['Alto', 'alto'], ['Ancho de pista', 'pista'],
                    ['Auto-distribuir', 'auto'], ['Cartel de cruces', 'cruces'],
                    ['Descargar STL', 'stl'], ['Vista 3D', '3d'], ['Vista Esquema', 'esquema'],
                    ['Nombre', 'nombre']
                ]), 'CTRL');
            this.appendDummyInput().appendField('decir').appendField(new Blockly.FieldTextInput('¡Mirá esto!'), 'TEXT');
            this.appendDummyInput().appendField('por').appendField(new Blockly.FieldNumber(0, 0, 30, 0.5), 'SEC').appendField('seg (0 = fijo)');
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PCB);
            this.setTooltip('Resalta un control del editor y muestra una burbuja de Patitas.');
        }
    };
    Blockly.JavaScript.forBlock['pcb_point'] = function (block) {
        const ctrl = block.getFieldValue('CTRL');
        const text = block.getFieldValue('TEXT');
        const sec = block.getFieldValue('SEC') || 0;
        return `await pcb.point(${JSON.stringify(ctrl)}, ${JSON.stringify(text)}, ${sec});\n`;
    };
    Blockly.Blocks['pcb_clear_point'] = {
        init: function () {
            this.appendDummyInput().appendField('🚫 Quitar señalador');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PCB);
            this.setTooltip('Quita la burbuja y el resaltado del control.');
        }
    };
    Blockly.JavaScript.forBlock['pcb_clear_point'] = function () { return `await pcb.clearPoint();\n`; };
    Blockly.Blocks['pcb_trace_width'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('🎚️ Ancho de pista')
                .appendField(new Blockly.FieldNumber(1, 1, 8, 0.5), 'MM').appendField('mm');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PCB);
            this.setTooltip('Cambia el ancho de las pistas (más ancho = más corriente).');
        }
    };
    Blockly.JavaScript.forBlock['pcb_trace_width'] = function (block) {
        return `await pcb.traceWidth(${block.getFieldValue('MM')});\n`;
    };
    Blockly.Blocks['pcb_wait_zero'] = {
        init: function () {
            this.appendDummyInput()
                .appendField('⏳ Esperar a que el alumno logre 0 cruces (máx')
                .appendField(new Blockly.FieldNumber(180, 5, 600, 5), 'SEC').appendField('seg)');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PCB);
            this.setTooltip('Pausa la lección hasta que la placa quede sin cruces (el alumno arrastra los nodos).');
        }
    };
    Blockly.JavaScript.forBlock['pcb_wait_zero'] = function (block) {
        return `await pcb.waitForZeroCrossings(${block.getFieldValue('SEC') || 180});\n`;
    };
    Blockly.Blocks['pcb_open_3d'] = {
        init: function () {
            this.appendDummyInput().appendField('🧊 Abrir vista 3D');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PCB);
            this.setTooltip('Muestra cómo quedará la placa con los componentes soldados.');
        }
    };
    Blockly.JavaScript.forBlock['pcb_open_3d'] = function () { return `await pcb.open3D();\n`; };
    Blockly.Blocks['pcb_close'] = {
        init: function () {
            this.appendDummyInput().appendField('✖ Cerrar editor de PCB');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_PCB);
            this.setTooltip('Cierra el editor de PCB y vuelve al simulador.');
        }
    };
    Blockly.JavaScript.forBlock['pcb_close'] = function () { return `await pcb.close();\n`; };
    const COLOR_BLK = 280;  
    Blockly.Blocks['blocks_open'] = {
        init: function () {
            this.appendDummyInput().appendField('🧩 Abrir "Programar con Bloques"');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_BLK);
            this.setTooltip('Mueve el cursor al botón y abre el editor de bloques del simulador.');
        }
    };
    Blockly.JavaScript.forBlock['blocks_open'] = function () { return `await blocks.open();\n`; };
    Blockly.Blocks['blocks_say'] = {
        init: function () {
            this.appendDummyInput().appendField('🗣️ Patitas dice')
                .appendField(new Blockly.FieldTextInput('¡Programemos!'), 'TEXT');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_BLK);
            this.setTooltip('Patitas habla con voz y globito sobre el editor de bloques.');
        }
    };
    Blockly.JavaScript.forBlock['blocks_say'] = function (block) { return `await blocks.say(${JSON.stringify(block.getFieldValue('TEXT'))});\n`; };
    Blockly.Blocks['blocks_point'] = {
        init: function () {
            this.appendDummyInput().appendField('👉 Señalar')
                .appendField(new Blockly.FieldDropdown([
                    ['Botón Programar', 'programar'], ['Categoría Control', 'control'],
                    ['Categoría Componentes', 'componentes'], ['Categoría Herramientas', 'herramientas'],
                    ['Categoría Cámara', 'camara'], ['Botón EJECUTAR', 'ejecutar'],
                    ['Botón Grabar', 'grabar'], ['Menú Guardar/Cargar', 'guardar']
                ]), 'TARGET');
            this.appendDummyInput().appendField('decir').appendField(new Blockly.FieldTextInput('¡Mirá!'), 'TEXT');
            this.appendDummyInput().appendField('por').appendField(new Blockly.FieldNumber(0, 0, 30, 0.5), 'SEC').appendField('seg (0 = fijo)');
            this.setInputsInline(true);
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_BLK);
            this.setTooltip('Resalta un botón o categoría del editor de bloques con una burbuja.');
        }
    };
    Blockly.JavaScript.forBlock['blocks_point'] = function (block) {
        const t = block.getFieldValue('TARGET'), txt = block.getFieldValue('TEXT'), sec = block.getFieldValue('SEC') || 0;
        return `await blocks.point(${JSON.stringify(t)}, ${JSON.stringify(txt)}, ${sec});\n`;
    };
    Blockly.Blocks['blocks_clear_point'] = {
        init: function () {
            this.appendDummyInput().appendField('🚫 Quitar señalador');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_BLK);
        }
    };
    Blockly.JavaScript.forBlock['blocks_clear_point'] = function () { return `await blocks.clearPoint();\n`; };
    Blockly.Blocks['blocks_demo'] = {
        init: function () {
            this.appendDummyInput().appendField('📦 Armar ejemplo Fuente + Resistencia + LED');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_BLK);
            this.setTooltip('Carga en el editor un programa de bloques con Fuente, resistencia y LED.');
        }
    };
    Blockly.JavaScript.forBlock['blocks_demo'] = function () { return `await blocks.loadDemo();\n`; };
    Blockly.Blocks['blocks_add_dron'] = {
        init: function () {
            this.appendDummyInput().appendField('🚁 Agregar vuelo de dron');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_BLK);
            this.setTooltip('Agrega al programa el bloque de vuelo de dron (categoría Cámara).');
        }
    };
    Blockly.JavaScript.forBlock['blocks_add_dron'] = function () { return `await blocks.addDron();\n`; };
    Blockly.Blocks['blocks_run'] = {
        init: function () {
            this.appendDummyInput().appendField('▶ Ejecutar programa de bloques');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_BLK);
            this.setTooltip('Aprieta EJECUTAR: arma el circuito en la protoboard y corre el programa.');
        }
    };
    Blockly.JavaScript.forBlock['blocks_run'] = function () { return `await blocks.run();\n`; };
    Blockly.Blocks['blocks_close'] = {
        init: function () {
            this.appendDummyInput().appendField('✖ Cerrar "Programar con Bloques"');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_BLK);
        }
    };
    Blockly.JavaScript.forBlock['blocks_close'] = function () { return `await blocks.close();\n`; };
    Blockly.Blocks['blocks_add_block'] = {
        init: function () {
            const catOptions = [
                ['Control', 'control'],
                ['Componentes/Herramientas', 'componentes'],
                ['Cámara', 'camara'],
                ['Coordenadas', 'coordenadas'],
                ['Operadores', 'operadores'],
                ['Variables', 'variables'],
                ['Mis bloques', 'mis_bloques']
            ];
            const getBlockOptions = function() {
                const block = this.getSourceBlock && this.getSourceBlock();
                const cat = block ? block.getFieldValue('CAT') : 'control';
                const blocksByCategory = {
                    'control': [
                        ['al Ejecutar', 'start_execution'],
                        ['por siempre', 'forever'],
                        ['repetir N veces', 'controls_repeat_ext'],
                        ['si...entonces', 'controls_if'],
                        ['esperar N seg', 'base_delay']
                    ],
                    'componentes': [
                        ['Fuente', 'source_connection'],
                        ['Cable', 'jumper'],
                        ['Resistencia', 'resistor'],
                        ['LDR (Fotorresistencia)', 'ldr'],
                        ['LED', 'led'],
                        ['Interruptor', 'switch'],
                        ['Diodo', 'diode'],
                        ['Pulsador', 'pushbutton'],
                        ['Capacitor', 'capacitor'],
                        ['Bobina', 'inductor'],
                        ['Buzzer', 'buzzer'],
                        ['Motor', 'motor'],
                        ['Potenciómetro', 'potentiometer'],
                        ['Transistor', 'transistor'],
                        ['Hablar', 'component_say'],
                        ['Conectar Multímetro', 'multimeter_connection'],
                        ['Mover Multímetro', 'multimeter_move'],
                        ['Leer Multímetro', 'read_multimeter'],
                        ['Leer estado SW', 'read_switch_state'],
                        ['Leer valor POT', 'read_potentiometer_value'],
                        ['Abrir Calculadora', 'open_calculator'],
                        ['Borrar Componente', 'delete_component'],
                        ['Limpiar Protoboard', 'clear_board']
                    ],
                    'camara': [
                        ['Vuelo Dron', 'cam_drone_flight'],
                        ['Mover a', 'cam_move_to'],
                        ['Rotar Escena', 'cam_rotate_scene'],
                        ['Zoom', 'cam_zoom'],
                        ['Resetear Cámara', 'cam_reset'],
                        ['Iniciar Grabación', 'cam_start_recording'],
                        ['Detener Grabación', 'cam_stop_recording']
                    ],
                    'coordenadas': [
                        ['Coord dinámica', 'coord_dynamic'],
                        ['Letra fija', 'letra_fija'],
                        ['Letra+Nro', 'letra_nro']
                    ],
                    'operadores': [
                        ['Texto', 'text'],
                        ['Unir texto', 'text_join_simple'],
                        ['Número', 'math_number'],
                        ['Aritmética', 'math_arithmetic'],
                        ['Comparación', 'logic_compare'],
                        ['Operación lógica', 'logic_operation'],
                        ['Booleano', 'logic_boolean']
                    ],
                    'variables': [
                        ['Asignar Variable', 'variables_set'],
                        ['Obtener Variable', 'variables_get'],
                        ['Cambiar Variable', 'math_change']
                    ],
                    'mis_bloques': [
                        ['Definir bloque', 'procedures_defnoreturn'],
                        ['Definir (con valor)', 'procedures_defreturn']
                    ]
                };
                return blocksByCategory[cat] || blocksByCategory['control'];
            };
            this.appendDummyInput()
                .appendField('➕ Agregar bloque')
                .appendField(new Blockly.FieldDropdown(catOptions), 'CAT')
                .appendField('→')
                .appendField(new Blockly.FieldDropdown(getBlockOptions), 'BLOCK');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLOR_BLK);
            this.setTooltip('Agrega el bloque seleccionado al lienzo de programación del simulador.');
        },
        onchange: function(event) {
            if (event.type === Blockly.Events.BLOCK_CHANGE && event.blockId === this.id && event.name === 'CAT') {
                const dropdown = this.getField('BLOCK');
                if (dropdown && dropdown.getOptions) {
                    const options = dropdown.getOptions(false);
                    if (options.length > 0) {
                        dropdown.setValue(options[0][1]);
                    }
                }
            }
        }
    };
    Blockly.JavaScript.forBlock['blocks_add_block'] = function(block) {
        const blk = block.getFieldValue('BLOCK');
        return `await blocks.addBlock(${JSON.stringify(blk)});\n`;
    };
    Blockly.Blocks['blocks_exit_container'] = {
        init: function () {
            this.appendDummyInput().appendField('⬆️ Salir del bloque contenedor');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(COLOR_BLK);
            this.setTooltip('Cierra el bloque contenedor activo (Por siempre, Repetir, Si...) para que el próximo bloque se agregue afuera.');
        }
    };
    Blockly.JavaScript.forBlock['blocks_exit_container'] = function(block) {
        return `await blocks.exitContainer();\n`;
    };
    Blockly.Blocks['sim_chatbot_toggle'] = {
        init: function () {
            this.appendDummyInput().appendField('🤖 Abrir/Cerrar Chatbot');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(280);
            this.setTooltip('Abre o cierra la ventana del Chatbot.');
        }
    };
    Blockly.JavaScript.forBlock['sim_chatbot_toggle'] = function () { return `await sim.chatbotToggle();\n`; };
    Blockly.Blocks['sim_chatbot_settings'] = {
        init: function () {
            this.appendDummyInput().appendField('⚙️ Abrir/Cerrar Config Chatbot');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(280);
            this.setTooltip('Abre o cierra el panel de configuración de la API.');
        }
    };
    Blockly.JavaScript.forBlock['sim_chatbot_settings'] = function () { return `await sim.chatbotSettingsToggle();\n`; };
    Blockly.Blocks['sim_chatbot_set_mode'] = {
        init: function () {
            this.appendDummyInput().appendField('🔄 Modo Chatbot')
                .appendField(new Blockly.FieldDropdown([['Guiado', 'guiado'], ['IA', 'ia']]), 'MODE');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(280);
            this.setTooltip('Simula hacer clic en Modo Guiado o Modo IA.');
        }
    };
    Blockly.JavaScript.forBlock['sim_chatbot_set_mode'] = function (block) { return `await sim.chatbotSetMode('${block.getFieldValue('MODE')}');\n`; };
    Blockly.Blocks['sim_chatbot_api_key'] = {
        init: function () {
            this.appendDummyInput().appendField('🔑 Set API Key')
                .appendField(new Blockly.FieldTextInput(''), 'KEY');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(280);
            this.setTooltip('Pega automáticamente la API Key en la configuración.');
        }
    };
    Blockly.JavaScript.forBlock['sim_chatbot_api_key'] = function (block) { return `await sim.chatbotSetApiKey(${JSON.stringify(block.getFieldValue('KEY'))});\n`; };
    Blockly.Blocks['sim_chatbot_model'] = {
        init: function () {
            this.appendDummyInput().appendField('🧠 Set Modelo IA')
                .appendField(new Blockly.FieldTextInput(''), 'MODEL');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(280);
            this.setTooltip('Escribe el modelo de IA a utilizar.');
        }
    };
    Blockly.JavaScript.forBlock['sim_chatbot_model'] = function (block) { return `await sim.chatbotSetModel(${JSON.stringify(block.getFieldValue('MODEL'))});\n`; };
    Blockly.Blocks['sim_chatbot_save'] = {
        init: function () {
            this.appendDummyInput().appendField('💾 Guardar Config IA');
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(280);
            this.setTooltip('Hace clic en Guardar Configuración.');
        }
    };
    Blockly.JavaScript.forBlock['sim_chatbot_save'] = function () { return `await sim.chatbotSaveSettings();\n`; };
    Blockly.Blocks['sim_chatbot_send'] = {
        init: function () {
            this.appendDummyInput().appendField('💬 Escribir en Chat')
                .appendField(new Blockly.FieldTextInput('Hola'), 'MSG');
            this.appendDummyInput().appendField('y Enviar')
                .appendField(new Blockly.FieldCheckbox('TRUE'), 'SEND');
            this.setInputsInline(true);
            this.setPreviousStatement(true, null); this.setNextStatement(true, null);
            this.setColour(280);
            this.setTooltip('Simula el tecleo de un mensaje letra por letra y opcionalmente lo envía.');
        }
    };
    Blockly.JavaScript.forBlock['sim_chatbot_send'] = function (block) {
        return `await sim.chatbotTypeMessage(${JSON.stringify(block.getFieldValue('MSG'))}, ${block.getFieldValue('SEND') === 'TRUE'});\n`;
    };
    window.LESSON_TOOLBOX = `
        <xml id="toolbox" style="display: none">
            <category name="🐾 Patitas" colour="${COLOR_PATITAS}">
                <block type="patitas_say"></block>
                <block type="patitas_wait"></block>
                <block type="patitas_wait_key"></block>
                <block type="patitas_quiz"></block>
                <block type="patitas_move_to"></block>
                <block type="patitas_rotate"></block>
                <block type="patitas_anim"></block>
                <block type="patitas_show"></block>
                <block type="patitas_hide"></block>
                <block type="patitas_cursor_speed"></block>
                <label text="Grabacion" web-class="lessonCatLabel"></label>
                <block type="sim_record_start"></block>
                <block type="sim_record_stop"></block>
            </category>
            <category name="🔌 Simulador" colour="${COLOR_SIM}">
                <label text="Construir" web-class="lessonCatLabel"></label>
                <block type="sim_set_voltage"></block>
                <block type="sim_wire"></block>
                <block type="sim_led"></block>
                <block type="sim_resistor"></block>
                <block type="sim_ldr"></block>
                <block type="sim_set_light"></block>
                <block type="sim_to_power"></block>
                <block type="sim_start"></block>
                <block type="sim_stop"></block>
                <block type="sim_remove"></block>
                <block type="sim_clear"></block>
                <label text="Interruptores y pulsadores" web-class="lessonCatLabel"></label>
                <block type="sim_switch"></block>
                <block type="sim_pushbutton"></block>
                <block type="sim_switch_toggle"></block>
                <block type="sim_switch_set"></block>
                <block type="sim_pushbutton_press"></block>
                <block type="sim_pushbutton_hold"></block>
                <block type="sim_pushbutton_release"></block>
                <label text="Capacitor, bobina, diodo, otros" web-class="lessonCatLabel"></label>
                <block type="sim_capacitor"></block>
                <block type="sim_inductor"></block>
                <block type="sim_diode"></block>
                <block type="sim_buzzer"></block>
                <block type="sim_motor"></block>
                <label text="Transistores" web-class="lessonCatLabel"></label>
                <block type="sim_transistor"></block>
                <label text="Cursor" web-class="lessonCatLabel"></label>
                <block type="sim_point_to"></block>
                <block type="sim_point_to_tool"></block>
                <block type="sim_click"></block>
                <label text="Camara" web-class="lessonCatLabel"></label>
                <block type="sim_zoom_to"></block>
                <block type="sim_zoom_range"></block>
                <block type="sim_camera_view"></block>
                <block type="sim_camera_zoom"></block>
                <block type="sim_camera_orbit"></block>
                <block type="sim_camera_drone"></block>
                <block type="sim_camera_reset"></block>
                <label text="Realces" web-class="lessonCatLabel"></label>
                <block type="sim_highlight"></block>
                <block type="sim_spotlight"></block>
                <block type="sim_clear_highlights"></block>
                <label text="Mediciones" web-class="lessonCatLabel"></label>
                <block type="sim_use_multimeter"></block>
                <block type="sim_move_multimeter"></block>
            </category>
            <category name="🔬 Fisica" colour="${COLOR_PHYS}">
                <label text="Flujo de electrones" web-class="lessonCatLabel"></label>
                <block type="sim_flow_start"></block>
                <block type="sim_flow_stop"></block>
                <block type="sim_flow_dir"></block>
                <label text="Magnitudes" web-class="lessonCatLabel"></label>
                <block type="sim_info_show"></block>
                <block type="sim_info_hide"></block>
                <block type="sim_info_hide_all"></block>
                <label text="Componentes que hablan" web-class="lessonCatLabel"></label>
                <block type="sim_component_speak"></block>
            </category>
            <category name="🧮 Calculadora" colour="${COLOR_CALC}">
                <label text="Abrir / Cerrar" web-class="lessonCatLabel"></label>
                <block type="calc_open"></block>
                <block type="calc_move"></block>
                <block type="calc_resize"></block>
                <block type="calc_close"></block>
                <label text="Leyes" web-class="lessonCatLabel"></label>
                <block type="calc_ohm"></block>
                <block type="calc_parallel"></block>
                <block type="calc_kirchhoff"></block>
                <label text="Componentes" web-class="lessonCatLabel"></label>
                <block type="calc_led"></block>
                <block type="calc_power"></block>
                <block type="calc_divider"></block>
                <block type="calc_inductor"></block>
                <label text="Referencia" web-class="lessonCatLabel"></label>
                <block type="calc_data"></block>
            </category>
            <category name="🤖 Chatbot" colour="280">
                <label text="Ventana" web-class="lessonCatLabel"></label>
                <block type="sim_chatbot_toggle"></block>
                <block type="sim_chatbot_send"></block>
                <label text="Configuración" web-class="lessonCatLabel"></label>
                <block type="sim_chatbot_settings"></block>
                <block type="sim_chatbot_set_mode"></block>
                <block type="sim_chatbot_api_key"></block>
                <block type="sim_chatbot_model"></block>
                <block type="sim_chatbot_save"></block>
            </category>
            <category name="📝 Pizarra" colour="${COLOR_NOTES}">
                <label text="Texto" web-class="lessonCatLabel"></label>
                <block type="notes_write"></block>
                <label text="Matematicas (LaTeX)" web-class="lessonCatLabel"></label>
                <block type="notes_equation"></block>
                <block type="notes_solve"></block>
                <label text="Multimedia" web-class="lessonCatLabel"></label>
                <block type="notes_image"></block>
                <block type="notes_video"></block>
                <label text="Control" web-class="lessonCatLabel"></label>
                <block type="notes_size"></block>
                <block type="notes_move"></block>
                <block type="notes_show"></block>
                <block type="notes_hide"></block>
                <block type="notes_clear"></block>
            </category>
            <category name="🖨️ PCB" colour="${COLOR_PCB}">
                <label text="Editor" web-class="lessonCatLabel"></label>
                <block type="pcb_open_editor"></block>
                <block type="pcb_auto"></block>
                <block type="pcb_close"></block>
                <label text="Guiar al alumno" web-class="lessonCatLabel"></label>
                <block type="pcb_say"></block>
                <block type="pcb_point"></block>
                <block type="pcb_clear_point"></block>
                <block type="pcb_wait_zero"></block>
                <label text="Ajustes y vistas" web-class="lessonCatLabel"></label>
                <block type="pcb_trace_width"></block>
                <block type="pcb_open_3d"></block>
            </category>
            <category name="🧩 Bloques" colour="${COLOR_BLK}">
                <label text="Editor de bloques" web-class="lessonCatLabel"></label>
                <block type="blocks_open"></block>
                <block type="blocks_add_block"></block>
                <block type="blocks_exit_container"></block>
                <block type="blocks_demo"></block>
                <block type="blocks_add_dron"></block>
                <block type="blocks_run"></block>
                <block type="blocks_close"></block>
                <label text="Guiar al alumno" web-class="lessonCatLabel"></label>
                <block type="blocks_say"></block>
                <block type="blocks_point"></block>
                <block type="blocks_clear_point"></block>
            </category>
        </xml>
    `;
    function init() {
        if (typeof Blockly === 'undefined') {
            setTimeout(init, 100);
            return;
        }
        const div = document.getElementById('blockly-div');
        if (!div) return; 
        const ws = Blockly.inject('blockly-div', {
            toolbox: window.LESSON_TOOLBOX,
            renderer: 'thrasos',
            scrollbars: true,
            trashcan: true,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 0.60,
                maxScale: 2,
                minScale: 0.4
            },
            grid: { spacing: 20, length: 3, colour: '#34495e', snap: true },
            theme: Blockly.Themes && Blockly.Themes.Classic ? Blockly.Themes.Classic : undefined
        });
        window.lessonWorkspace = ws;
        console.log('[Blockly] workspace listo, bloques disponibles');
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();