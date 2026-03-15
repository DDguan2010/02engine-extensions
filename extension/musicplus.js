class musicplusExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.audioContext = null;
        this.inputGain = null;
        this.masterGain = null;
        this.reverbNode = null;
        this.reverbSendGain = null;
        this.delayNode = null;
        this.delayFeedback = null;
        this.delayMixGain = null;
        this.chorusDelay = null;
        this.chorusLFO = null;
        this.chorusLFOGain = null;
        this.chorusMixGain = null;
        this.distortionNode = null;
        this.distortionGain = null;
        this.activeSources = [];
        this.activeTimeouts = [];
        this.pendingResolves = [];
        this.analyser = null;
        this.micStream = null;
        this.micSource = null;
        this.micInitialized = false;
        this.micDataArray = null;
        this.micTimeDataArray = null;
        this.pannerNode = null;
        this.metronomeTimer = null;
        this.metronomePlaying = false;
        this.tempo = 60;
        this.swing = 0;
        this.globalFilterFreq = -1;
        this.currentInstrument = 'piano';
        this.pitchOffset = 0;
        this.noiseBuffers = {};
        this.stopped = false;
        this.scoreData = null;
        this.scoreIndex = 0;
        this.scorePlaying = false;
        this.savedScores = {};
        this.scoreLoop = false;
        this.scoreLoopCount = 0;
        this.scoreCurrentLoop = 0;
        this.scoreStartTime = 0;
        this.scorePaused = false;
        this._initAudio();
        this.version1 = 1;
        this.version2 = 2;
        this.version3 = 6;
        this.beta = false;
        this.beta_num = 1;
        this.version = `V${this.version1}.${this.version2}.${this.version3}${this.beta ? ' beta ' + this.beta_num : ''}`;
        this.chords = {
            major: [0, 4, 7],
            minor: [0, 3, 7],
            diminished: [0, 3, 6],
            augmented: [0, 4, 8],
            seventh: [0, 4, 7, 10],
            minor7: [0, 3, 7, 10],
            major7: [0, 4, 7, 11],
            suspended2: [0, 2, 7],
            suspended4: [0, 5, 7],
            sixth: [0, 4, 7, 9],
            minor6: [0, 3, 7, 9],
            ninth: [0, 4, 7, 10, 14],
            minor9: [0, 3, 7, 10, 14],
            major9: [0, 4, 7, 11, 14],
            eleventh: [0, 4, 7, 10, 14, 17],
            thirteenth: [0, 4, 7, 10, 14, 17, 21],
            power: [0, 7],
            add9: [0, 4, 7, 2],
            minorAdd9: [0, 3, 7, 2],
            dominant7b5: [0, 4, 6, 10],
            halfDiminished: [0, 3, 6, 10],
            diminished7: [0, 3, 6, 9]
        };
        this.scales = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            pentatonicMajor: [0, 2, 4, 7, 9],
            pentatonicMinor: [0, 3, 5, 7, 10],
            blues: [0, 3, 5, 6, 7, 10],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            phrygian: [0, 1, 3, 5, 7, 8, 10],
            lydian: [0, 2, 4, 6, 7, 9, 11],
            mixolydian: [0, 2, 4, 5, 7, 9, 10],
            locrian: [0, 1, 3, 5, 6, 8, 10],
            wholeTone: [0, 2, 4, 6, 8, 10],
            chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        };
        this.instruments = {
            piano: {
                name: '钢琴',
                oscillators: [
                    { type: 'triangle', gain: 0.6, detune: 0 },
                    { type: 'sine', gain: 0.4, detune: 0 },
                    { type: 'triangle', gain: 0.15, detune: 1200 }
                ],
                filter: { type: 'lowpass', frequency: 3000, Q: 1 },
                envelope: { attack: 0.005, decay: 0.3, sustain: 0.2, release: 0.8 },
                velocity: 0.8
            },
            electricPiano: {
                name: '电子琴',
                oscillators: [
                    { type: 'sine', gain: 0.5, detune: 0 },
                    { type: 'sine', gain: 0.25, detune: 700 },
                    { type: 'square', gain: 0.1, detune: 0 }
                ],
                filter: { type: 'lowpass', frequency: 2000, Q: 2 },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
                velocity: 0.7
            },
            organ: {
                name: '管风琴',
                oscillators: [
                    { type: 'sawtooth', gain: 0.2, detune: 0 },
                    { type: 'square', gain: 0.2, detune: -2 },
                    { type: 'sawtooth', gain: 0.15, detune: 2 },
                    { type: 'square', gain: 0.1, detune: 701 },
                    { type: 'sawtooth', gain: 0.1, detune: 1202 }
                ],
                filter: { type: 'lowpass', frequency: 4000, Q: 0.5 },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.9, release: 0.3 },
                velocity: 0.6
            },
            harpsichord: {
                name: '羽管键琴',
                oscillators: [
                    { type: 'sawtooth', gain: 0.4, detune: 0 },
                    { type: 'square', gain: 0.3, detune: 5 }
                ],
                filter: { type: 'highpass', frequency: 200, Q: 1 },
                envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.3 },
                velocity: 0.75
            },
            violin: {
                name: '小提琴',
                oscillators: [
                    { type: 'sawtooth', gain: 0.4, detune: 0 },
                    { type: 'sawtooth', gain: 0.2, detune: -5 },
                    { type: 'sine', gain: 0.3, detune: 0 }
                ],
                filter: { type: 'lowpass', frequency: 2000, Q: 2 },
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.4 },
                vibrato: { rate: 6, depth: 10 },
                velocity: 0.7
            },
            cello: {
                name: '大提琴',
                oscillators: [
                    { type: 'sawtooth', gain: 0.5, detune: 0 },
                    { type: 'sine', gain: 0.4, detune: -2 }
                ],
                filter: { type: 'lowpass', frequency: 1200, Q: 1.5 },
                envelope: { attack: 0.15, decay: 0.3, sustain: 0.7, release: 0.5 },
                vibrato: { rate: 5, depth: 8 },
                velocity: 0.8
            },
            guitar: {
                name: '吉他',
                oscillators: [
                    { type: 'sawtooth', gain: 0.5, detune: 0 },
                    { type: 'square', gain: 0.2, detune: 2 },
                    { type: 'triangle', gain: 0.3, detune: -1 }
                ],
                filter: { type: 'lowpass', frequency: 2500, Q: 1 },
                envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.6 },
                velocity: 0.75
            },
            bass: {
                name: '贝斯',
                oscillators: [
                    { type: 'sawtooth', gain: 0.6, detune: 0 },
                    { type: 'square', gain: 0.3, detune: -2 }
                ],
                filter: { type: 'lowpass', frequency: 800, Q: 2 },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.4 },
                velocity: 0.9
            },
            synthBass: {
                name: '合成贝斯',
                oscillators: [
                    { type: 'sawtooth', gain: 0.7, detune: 0 },
                    { type: 'square', gain: 0.3, detune: -5 }
                ],
                filter: { type: 'lowpass', frequency: 600, Q: 3 },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.2 },
                velocity: 0.9
            },
            harp: {
                name: '竖琴',
                oscillators: [
                    { type: 'triangle', gain: 0.5, detune: 0 },
                    { type: 'sine', gain: 0.4, detune: 1200 }
                ],
                filter: { type: 'lowpass', frequency: 3000, Q: 1 },
                envelope: { attack: 0.005, decay: 0.6, sustain: 0.1, release: 1.2 },
                velocity: 0.7
            },
            flute: {
                name: '长笛',
                oscillators: [
                    { type: 'sine', gain: 0.6, detune: 0 },
                    { type: 'sine', gain: 0.3, detune: 2 },
                    { type: 'triangle', gain: 0.1, detune: 0 }
                ],
                filter: { type: 'lowpass', frequency: 1500, Q: 1 },
                envelope: { attack: 0.08, decay: 0.2, sustain: 0.85, release: 0.3 },
                vibrato: { rate: 5, depth: 6 },
                velocity: 0.6
            },
            clarinet: {
                name: '单簧管',
                oscillators: [
                    { type: 'sine', gain: 0.7, detune: 0 },
                    { type: 'sine', gain: 0.2, detune: -3 },
                    { type: 'square', gain: 0.1, detune: 0 }
                ],
                filter: { type: 'lowpass', frequency: 1800, Q: 2 },
                envelope: { attack: 0.06, decay: 0.15, sustain: 0.8, release: 0.25 },
                velocity: 0.65
            },
            saxophone: {
                name: '萨克斯',
                oscillators: [
                    { type: 'sawtooth', gain: 0.5, detune: 0 },
                    { type: 'sawtooth', gain: 0.3, detune: -8 },
                    { type: 'square', gain: 0.2, detune: 3 }
                ],
                filter: { type: 'lowpass', frequency: 1600, Q: 3 },
                envelope: { attack: 0.05, decay: 0.2, sustain: 0.75, release: 0.3 },
                vibrato: { rate: 5.5, depth: 12 },
                velocity: 0.75
            },
            trumpet: {
                name: '小号',
                oscillators: [
                    { type: 'sawtooth', gain: 0.4, detune: 0 },
                    { type: 'square', gain: 0.3, detune: 2 }
                ],
                filter: { type: 'lowpass', frequency: 2200, Q: 2 },
                envelope: { attack: 0.03, decay: 0.2, sustain: 0.8, release: 0.2 },
                vibrato: { rate: 6, depth: 8 },
                velocity: 0.8
            },
            marimba: {
                name: '木琴',
                oscillators: [
                    { type: 'sine', gain: 0.8, detune: 0 },
                    { type: 'sine', gain: 0.3, detune: 1200 }
                ],
                filter: { type: 'lowpass', frequency: 4000, Q: 1 },
                envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
                velocity: 0.8
            },
            xylophone: {
                name: '铁琴',
                oscillators: [
                    { type: 'sine', gain: 0.7, detune: 0 },
                    { type: 'triangle', gain: 0.3, detune: 1500 }
                ],
                filter: { type: 'highpass', frequency: 500, Q: 1 },
                envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
                velocity: 0.75
            },
            synthLead: {
                name: '合成主音',
                oscillators: [
                    { type: 'sawtooth', gain: 0.5, detune: 0 },
                    { type: 'sawtooth', gain: 0.5, detune: 7 }
                ],
                filter: { type: 'lowpass', frequency: 3000, Q: 4 },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.4 },
                filterEnvelope: { attack: 0.1, decay: 0.5, sustain: 0.2, release: 0.5, amount: 2000 },
                velocity: 0.7
            },
            synthPad: {
                name: '合成铺底',
                oscillators: [
                    { type: 'sawtooth', gain: 0.3, detune: -10 },
                    { type: 'sawtooth', gain: 0.3, detune: 10 },
                    { type: 'sine', gain: 0.4, detune: 0 }
                ],
                filter: { type: 'lowpass', frequency: 1500, Q: 2 },
                envelope: { attack: 0.5, decay: 1, sustain: 0.8, release: 2 },
                velocity: 0.6
            }
        };
        this.drums = {
            snare: {
                name: '小军鼓',
                noise: { type: 'white', gain: 0.7, filter: { type: 'highpass', freq: 800 } },
                osc: { type: 'triangle', freq: 180, gain: 0.3 },
                envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 }
            },
            bass: {
                name: '低音鼓',
                osc: { type: 'sine', freq: 60, gain: 1.0, freqSweep: { from: 150, to: 40, time: 0.1 } },
                noise: { type: 'pink', gain: 0.2, filter: { type: 'lowpass', freq: 300 } },
                envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 }
            },
            hihat: {
                name: '踩镲',
                noise: { type: 'white', gain: 0.8, filter: { type: 'highpass', freq: 7000 } },
                envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 }
            },
            crash: {
                name: '吊镲',
                noise: { type: 'white', gain: 0.9, filter: { type: 'highpass', freq: 2000 } },
                envelope: { attack: 0.001, decay: 1.5, sustain: 0.1, release: 2 }
            },
            tom: {
                name: '嗵鼓',
                osc: { type: 'sine', freq: 100, gain: 0.9, freqSweep: { from: 120, to: 80, time: 0.15 } },
                envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.2 }
            },
            rim: {
                name: '边击',
                osc: { type: 'square', freq: 800, gain: 0.5 },
                noise: { type: 'white', gain: 0.3, filter: { type: 'bandpass', freq: 2000, Q: 2 } },
                envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
            },
            clap: {
                name: '拍手',
                noise: { type: 'pink', gain: 0.8, filter: { type: 'bandpass', freq: 1200, Q: 2 } },
                envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
                reverb: 0.3
            }
        };
        this.noteFrequencies = {};
        for (let i = 0; i < 128; i++) {
            this.noteFrequencies[i] = 440 * Math.pow(2, (i - 69) / 12);
        }
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    }
    getInfo() {
        return {
            id: 'musicplus',
            name: '音乐 +',
            blockIconURI: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI0My4xMzYiIGhlaWdodD0iNTQuNjg3MDYiIHZpZXdCb3g9IjAsMCw0My4xMzYsNTQuNjg3MDYiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMTguNDMyLC0xNTIuNjU2NDcpIj48ZyBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBkPSJNMjM4LjQ0NjM2LDE5OS40MTkxNWMwLDQuMDEwNDEgLTQuMTgxODksNy45MjQzNyAtOS4zNDA1Miw3LjkyNDM3Yy01LjE1ODYzLDAgLTkuMzQwNTIsLTMuOTEzOTYgLTkuMzQwNTIsLTcuOTI0MzdjMCwtNC4wMTA0MSA0LjE4MTg5LC03LjYyMzA2IDkuMzQwNTIsLTcuNjIzMDZjMS42MjExNCwwIDMuMTQ1ODIsMC4zMjEwNyA0LjQ3NDU3LDAuODg1ODhjMC4yMjQzLDAuMDk1MzUgMC42NTU2NywwLjMwNjUgMC42NTU2NywwLjMwNjVsMC4yNTg3NCwtMzIuNTA3MjdjMCwwIDYuNjA0NCw1LjE0OTQ3IDcuNzQ3NjIsNy4xMDA0NWMxLjE0MzIzLDEuOTUwOTggNS4zNjM4MSwxNi4yMDg5IDUuMzY5ODcsMTcuODM0NTZjMC4wMDE0NSwwLjM4ODg5IC0yLjgzODkyLC02LjYyMjk4IC01LjkxODY1LC0xMS4wNzYzOWMtMi4zOTc4MSwtMy40NjczMSAtMy4zNzE3MSwtNC4wMDg2MSAtMy4zNzE3MSwtNC4wMDg2MWMwLDAgMC4xMjQ0MywyOC44ODE4OCAwLjEyNDQzLDI5LjA4Nzk1eiIgZmlsbD0iIzM3M2I3NyIvPjxwYXRoIGQ9Ik0yNTAuNzQ1MjcsMTY0LjY2NTY3YzAsMCAtMy45NTI3NCwwLjAzNTI5IC00Ljk2ODkzLDAuMDQ0MzZjLTAuNDQ5NjYsMC4wMDQwMiAtMC45NzI5NywwLjAwODY5IC0wLjk3Mjk3LDAuMDA4Njl2LTUuMTk5MTVsNS45NDE5LC0wLjA1MzA2bDAuMDUzMDUsLTYuMDQ4aDQuOTg2OTVsMC4wNTMwNCw2LjA0OGw1LjcyOTY5LC0wLjA1MzA0djUuMDkzMDVsLTUuNzI5NjgsMC4wNTMwNWwtMC4wNTMwNSw1LjcyOTY4aC01LjA5MzA1eiIgZmlsbD0iIzRhMDUxOSIvPjxwYXRoIGQ9Ik0yMzcuMTEzMDMsMTk3LjI1MjQ5YzAsNC4wMTA0MSAtNC4xODE4OSw3LjkyNDM3IC05LjM0MDUxLDcuOTI0MzdjLTUuMTU4NjMsMCAtOS4zNDA1MiwtMy45MTM5NiAtOS4zNDA1MiwtNy45MjQzN2MwLC00LjAxMDQxIDQuMTgxODksLTcuNjIzMDYgOS4zNDA1MiwtNy42MjMwNmMxLjYyMTE0LDAgMy4xNDU4MiwwLjMyMTA3IDQuNDc0NTYsMC44ODU4OGMwLjIyNDMsMC4wOTUzNSAwLjY1NTY3LDAuMzA2NSAwLjY1NTY3LDAuMzA2NWwwLjI1ODc0LC0zMi41MDcyN2MwLDAgNi42MDQ0LDUuMTQ5NDcgNy43NDc2Miw3LjEwMDQ1YzEuMTQzMjMsMS45NTA5OCA1LjM2MzgsMTYuMjA4OSA1LjM2OTg2LDE3LjgzNDU2YzAuMDAxNDUsMC4zODg4OSAtMi44Mzg5MSwtNi42MjI5OSAtNS45MTg2NSwtMTEuMDc2MzljLTIuMzk3ODEsLTMuNDY3MzEgLTMuMzcxNzEsLTQuMDA4NjEgLTMuMzcxNzEsLTQuMDA4NjFjMCwwIDAuMTI0NDMsMjguODgxODggMC4xMjQ0MywyOS4wODc5NXoiIGZpbGw9IiM3NjdlZmYiLz48cGF0aCBkPSJNMjQ5Ljc2NTUyLDE2My45MDM2NGwtNS45NDE4OSwwLjA1MzA1di01LjE5OTE1bDUuOTQxODksLTAuMDUzMDZsMC4wNTMwNSwtNi4wNDhoNC45ODY5NGwwLjA1MzA1LDYuMDQ4bDUuNzI5NjgsLTAuMDUzMDR2NS4wOTMwNWwtNS43Mjk2OCwwLjA1MzA1bC0wLjA1MzA1LDUuNzI5NjloLTUuMDkzMDV6IiBmaWxsPSIjZWExMDRlIi8+PC9nPjwvZz48L3N2Zz48IS0tcm90YXRpb25DZW50ZXI6MjEuNTY3OTk4MzMzMzMzMzI6MjcuMzQzNTI5MTY2NjY2NjU2LS0+',
            color1: '#0DA57A',
            color2: '#0B8E69',
            color3: '#097A5A',
            blocks: [
                {
                    opcode: 'textversion',
                    blockType: Scratch.BlockType.LABEL,
                    text: this.version
                },
                {
                    opcode: 'textauthor',
                    blockType: Scratch.BlockType.LABEL,
                    text: 'by ChessBrain'
                },
                {
                    opcode: 'textthxs',
                    blockType: Scratch.BlockType.LABEL,
                    text: '特别鸣谢：Qwen AI（给我修 bug）'
                },
                {
                    opcode: 'label1',
                    blockType: Scratch.BlockType.LABEL,
                    text: '———— 音符 ————'
                },
                {
                    opcode: 'playDrum',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '击打 [DRUM] [BEATS] 拍',
                    arguments: {
                        DRUM: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'drumMenu',
                            defaultValue: 'snare'
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.25
                        }
                    }
                },
                {
                    opcode: 'rest',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '休止 [BEATS] 拍',
                    arguments: {
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.25
                        }
                    }
                },
                {
                    opcode: 'playNote',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '演奏音符 [NOTE] [BEATS] 拍',
                    arguments: {
                        NOTE: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 60,
                            menu: 'noteMenu'
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.25
                        }
                    }
                },
                {
                    opcode: 'playNoteName',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '演奏 [NOTE] [OCTAVE] [BEATS] 拍',
                    arguments: {
                        NOTE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'noteNameMenu',
                            defaultValue: 'C'
                        },
                        OCTAVE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 4,
                            menu: 'octaveMenu'
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    }
                },
                {
                    opcode: 'playSequence',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '播放音符序列 [SEQUENCE] 每个音符 [BEATS] 拍',
                    arguments: {
                        SEQUENCE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '60, 62, 64, 65, 67'
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.25
                        }
                    }
                },
                {
                    opcode: 'playSequenceLoop',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '循环播放序列 [SEQUENCE] 每个音符 [BEATS] 拍 循环 [LOOP] 次',
                    arguments: {
                        SEQUENCE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '60, 62, 64'
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.25
                        },
                        LOOP: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    }
                },
                {
                    opcode: 'label2',
                    blockType: Scratch.BlockType.LABEL,
                    text: '———— 和弦 ————'
                },
                {
                    opcode: 'playChord',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '演奏 [ROOT] [OCTAVE] [CHORD] 和弦 [BEATS] 拍',
                    arguments: {
                        ROOT: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'noteNameMenu',
                            defaultValue: 'C'
                        },
                        OCTAVE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 4,
                            menu: 'octaveMenu'
                        },
                        CHORD: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'chordMenu',
                            defaultValue: 'major'
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    }
                },
                {
                    opcode: 'playChordMidi',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '演奏 MIDI [ROOT] [CHORD] 和弦 [BEATS] 拍',
                    arguments: {
                        ROOT: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 60
                        },
                        CHORD: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'chordMenu',
                            defaultValue: 'major'
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    }
                },
                {
                    opcode: 'getChordNotes',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '[ROOT] [CHORD] 和弦音符',
                    arguments: {
                        ROOT: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 60
                        },
                        CHORD: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'chordMenu',
                            defaultValue: 'major'
                        }
                    }
                },
                {
                    opcode: 'playChordProgression',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '播放和弦进行 [PROGRESSION] 每个和弦 [BEATS] 拍',
                    arguments: {
                        PROGRESSION: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '60 major;67 minor;64 major;69 minor'
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'getScaleNotes',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '[ROOT] [SCALE] 音阶音符',
                    arguments: {
                        ROOT: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 60
                        },
                        SCALE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'scaleMenu',
                            defaultValue: 'major'
                        }
                    }
                },
                {
                    opcode: 'playScale',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '演奏 [ROOT] [SCALE] 音阶 每个音符 [BEATS] 拍',
                    arguments: {
                        ROOT: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 60
                        },
                        SCALE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'scaleMenu',
                            defaultValue: 'major'
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.25
                        }
                    }
                },
                {
                    opcode: 'label3',
                    blockType: Scratch.BlockType.LABEL,
                    text: '———— 乐器 ————'
                },
                {
                    opcode: 'setInstrument',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '将乐器设为 [INSTRUMENT]',
                    arguments: {
                        INSTRUMENT: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'instrumentMenu',
                            defaultValue: 'piano'
                        }
                    }
                },
                {
                    opcode: 'setEnvelope',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置包络 起 [ATTACK] 衰 [DECAY] 延 [SUSTAIN] 放 [RELEASE]',
                    arguments: {
                        ATTACK: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.01
                        },
                        DECAY: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.3
                        },
                        SUSTAIN: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.5
                        },
                        RELEASE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    }
                },
                {
                    opcode: 'stopAll',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '💥 停止所有声音'
                },
                {
                    opcode: 'label3_effects',
                    blockType: Scratch.BlockType.LABEL,
                    text: '———— 效果 ————'
                },
                {
                    opcode: 'setTempo',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '将演奏速度设定为 [TEMPO]',
                    arguments: {
                        TEMPO: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 60
                        }
                    }
                },
                {
                    opcode: 'changeTempo',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '将演奏速度增加 [TEMPO]',
                    arguments: {
                        TEMPO: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 20
                        }
                    }
                },
                {
                    opcode: 'getTempo',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '演奏速度',
                    disableMonitor: false
                },
                {
                    opcode: 'setVolume',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '将音量设为 [VOLUME] %',
                    arguments: {
                        VOLUME: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
                {
                    opcode: 'setEffect',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '添加 [EFFECT] 效果 [AMOUNT] %',
                    arguments: {
                        EFFECT: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'effectMenu',
                            defaultValue: 'reverb'
                        },
                        AMOUNT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 30
                        }
                    }
                },
                {
                    opcode: 'setPitch',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置音调偏移 [PITCH] 半音',
                    arguments: {
                        PITCH: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setReverb',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置混响 [AMOUNT] %',
                    arguments: {
                        AMOUNT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 30
                        }
                    }
                },
                {
                    opcode: 'setDelay',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置延迟 反馈 [FEEDBACK]% 时间 [TIME] 秒 混合 [MIX]%',
                    arguments: {
                        FEEDBACK: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        TIME: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.3
                        },
                        MIX: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 30
                        }
                    }
                },
                {
                    opcode: 'setChorus',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置合唱 深度 [DEPTH]% 速率 [RATE] Hz 混合 [MIX]%',
                    arguments: {
                        DEPTH: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        RATE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1.5
                        },
                        MIX: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 30
                        }
                    }
                },
                {
                    opcode: 'setTremolo',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置颤音 深度 [DEPTH]% 速率 [RATE] Hz',
                    arguments: {
                        DEPTH: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        RATE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    }
                },
                {
                    opcode: 'setDistortion',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置失真 [AMOUNT] %',
                    arguments: {
                        AMOUNT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'setGlobalFilter',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置全局滤波器截止 [FREQ] Hz',
                    arguments: {
                        FREQ: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2000
                        }
                    }
                },
                {
                    opcode: 'setSwing',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置摇摆节奏 [SWING] %',
                    arguments: {
                        SWING: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'label4',
                    blockType: Scratch.BlockType.LABEL,
                    text: '———— 装饰音 ————'
                },
                {
                    opcode: 'glideToNote',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '从 [START_NOTE] 滑音到 [NOTE] 持续 [BEATS] 拍',
                    arguments: {
                        NOTE: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 60,
                        },
                        START_NOTE: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 55,
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    }
                },
                {
                    opcode: 'playGraceNote',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '🎵 演奏倚音 [NOTE1] 到 [NOTE2] 时长共 [BEATS] 拍',
                    arguments: {
                        NOTE1: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 58
                        },
                        NOTE2: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 60
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.3
                        }
                    }
                },
                {
                    opcode: 'playFall',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '🎵 演奏跌音 [NOTE] 下滑 [SEMITONES] 半音 时长 [DURATION] 拍',
                    arguments: {
                        NOTE: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 72
                        },
                        SEMITONES: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 7
                        },
                        DURATION: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.8
                        }
                    }
                },
                {
                    opcode: 'playTrill',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '🎵 演奏颤音 [NOTE] 交替 [ALT_NOTE] 速度 [SPEED] 时长 [DURATION] 拍',
                    arguments: {
                        NOTE: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 60
                        },
                        ALT_NOTE: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 62
                        },
                        SPEED: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.1
                        },
                        DURATION: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'arpeggiator',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '琶音演奏 [ROOT] [CHORD] 总时长 [ARPLENGTH] 拍 每个音符 [BEATS] 拍',
                    arguments: {
                        ROOT: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 60,
                            menu: 'noteMenu'
                        },
                        CHORD: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'chordMenu',
                            defaultValue: 'major'
                        },
                        ARPLENGTH: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        BEATS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0.25
                        }
                    }
                },
                {
                    opcode: 'label5',
                    blockType: Scratch.BlockType.LABEL,
                    text: '———— 麦克风 ————'
                },
                {
                    opcode: 'getMicPitchHz',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '🎤 麦克风音高 (Hz)',
                    disableMonitor: false
                },
                {
                    opcode: 'getMicPitchNote',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '🎤 麦克风音高 (音名)',
                    disableMonitor: false
                },
                {
                    opcode: 'getMicVolume',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '🎤 麦克风音量 (0-100)',
                    disableMonitor: false
                },
                {
                    opcode: 'label6',
                    blockType: Scratch.BlockType.LABEL,
                    text: '———— 扩展 ————'
                },
                {
                    opcode: 'setPan',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置声像 [PAN] %',
                    arguments: {
                        PAN: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'startMetronome',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '启动节拍器 音量 [VOLUME] %',
                    arguments: {
                        VOLUME: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'stopMetronome',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '停止节拍器'
                },
                {
                    opcode: 'clearEffects',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '清除所有效果'
                },
                {
                    opcode: 'getIsPlaying',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '是否正在演奏',
                    disableMonitor: false
                },
                {
                    opcode: 'getRandomNote',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '随机音符 [MIN] 到 [MAX]',
                    arguments: {
                        MIN: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 60
                        },
                        MAX: {
                            type: Scratch.ArgumentType.NOTE,
                            defaultValue: 72
                        }
                    }
                },
                {
                    opcode: 'label7',
                    blockType: Scratch.BlockType.LABEL,
                    text: '———— 乐谱 ————'
                },
                {
                    opcode: 'loadScore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '加载乐谱 [SCORE]',
                    arguments: {
                        SCORE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '60-0.5;62-0.5;64-0.5'
                        }
                    }
                },
                {
                    opcode: 'playScore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '播放乐谱',
                    arguments: {
                    }
                },
                {
                    opcode: 'stopScore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '停止播放乐谱',
                    arguments: {
                    }
                },
                {
                    opcode: 'pauseScore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '暂停/继续播放乐谱',
                    arguments: {
                    }
                },
                {
                    opcode: 'getScoreProgress',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '乐谱播放进度 (%)',
                    disableMonitor: false
                },
                {
                    opcode: 'getScoreLength',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '乐谱总音符数',
                    disableMonitor: false
                },
                {
                    opcode: 'getCurrentNote',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '当前演奏音符',
                    disableMonitor: false
                },
                {
                    opcode: 'saveScore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '保存乐谱 名称 [NAME]',
                    arguments: {
                        NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'myscore'
                        }
                    }
                },
                {
                    opcode: 'loadSavedScore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '加载已保存乐谱 [NAME]',
                    arguments: {
                        NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'myscore'
                        }
                    }
                },
                {
                    opcode: 'getScoreNoteCount',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '乐谱 [NAME] 音符数',
                    arguments: {
                        NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'myscore'
                        }
                    }
                },
                {
                    opcode: 'parseScoreLine',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '解析乐谱行 [LINE]',
                    arguments: {
                        LINE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '60-0.5-62-0.5'
                        }
                    }
                },
                {
                    opcode: 'setScoreLoop',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置乐谱循环 [LOOP] 次 (0=无限)',
                    arguments: {
                        LOOP: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'getScoreTime',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '乐谱已播放时间 (秒)',
                    disableMonitor: false
                },
                {
                    opcode: 'seekScore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '跳转到乐谱第 [INDEX] 个音符',
                    arguments: {
                        INDEX: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'exportScore',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '导出乐谱为文本',
                    disableMonitor: false
                },
                {
                    opcode: 'importScoreFile',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '从文件导入乐谱 [FILE]',
                    arguments: {
                        FILE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: ''
                        }
                    }
                },
                {
                    opcode: 'setScoreTempo',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置乐谱演奏速度 [TEMPO]',
                    arguments: {
                        TEMPO: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 60
                        }
                    }
                },
                {
                    opcode: 'getScoreInfo',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '乐谱信息 [INFO]',
                    arguments: {
                        INFO: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'scoreInfoMenu',
                            defaultValue: 'length'
                        }
                    }
                }
            ],
            menus: {
                drumMenu: {
                    acceptReporters: true,
                    items: [
                        { text: '(1) 小军鼓', value: 'snare' },
                        { text: '(2) 低音鼓', value: 'bass' },
                        { text: '(3) 踩镲', value: 'hihat' },
                        { text: '(4) 嗵鼓', value: 'tom' },
                        { text: '(5) 吊镲', value: 'crash' },
                        { text: '(6) 边击', value: 'rim' },
                        { text: '(7) 拍手', value: 'clap' }
                    ]
                },
                instrumentMenu: {
                    acceptReporters: true,
                    items: [
                        { text: '🎹 钢琴', value: 'piano' },
                        { text: '🎹 电子琴', value: 'electricPiano' },
                        { text: '🏛️ 管风琴', value: 'organ' },
                        { text: '🎹 羽管键琴', value: 'harpsichord' },
                        { text: '🎻 小提琴', value: 'violin' },
                        { text: '🎻 大提琴', value: 'cello' },
                        { text: '🎸 吉他', value: 'guitar' },
                        { text: '🎸 贝斯', value: 'bass' },
                        { text: '🎸 合成贝斯', value: 'synthBass' },
                        { text: '🎵 竖琴', value: 'harp' },
                        { text: '🎶 长笛', value: 'flute' },
                        { text: '🎶 单簧管', value: 'clarinet' },
                        { text: '🎷 萨克斯', value: 'saxophone' },
                        { text: '🎺 小号', value: 'trumpet' },
                        { text: '🎼 木琴', value: 'marimba' },
                        { text: '⚡ 合成主音', value: 'synthLead' },
                        { text: '🌊 合成铺底', value: 'synthPad' }
                    ]
                },
                noteMenu: {
                    acceptReporters: true,
                    items: [
                        { text: 'C4', value: '60' },
                        { text: 'D4', value: '62' },
                        { text: 'E4', value: '64' },
                        { text: 'F4', value: '65' },
                        { text: 'G4', value: '67' },
                        { text: 'A4', value: '69' },
                        { text: 'B4', value: '71' },
                        { text: 'C5', value: '72' }
                    ]
                },
                noteNameMenu: {
                    acceptReporters: true,
                    items: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
                },
                octaveMenu: {
                    acceptReporters: true,
                    items: ['2', '3', '4', '5', '6']
                },
                chordMenu: {
                    acceptReporters: true,
                    items: [
                        { text: 'maj', value: 'major' },
                        { text: 'm', value: 'minor' },
                        { text: 'dim', value: 'diminished' },
                        { text: 'aug', value: 'augmented' },
                        { text: '7', value: 'seventh' },
                        { text: 'm7', value: 'minor7' },
                        { text: 'maj7', value: 'major7' },
                        { text: 'sus2', value: 'suspended2' },
                        { text: 'sus4', value: 'suspended4' },
                        { text: '6', value: 'sixth' },
                        { text: 'm6', value: 'minor6' },
                        { text: '9', value: 'ninth' },
                        { text: 'm9', value: 'minor9' },
                        { text: 'maj9', value: 'major9' },
                        { text: '11', value: 'eleventh' },
                        { text: '13', value: 'thirteenth' },
                        { text: '5', value: 'power' },
                        { text: 'add9', value: 'add9' },
                        { text: 'madd9', value: 'minorAdd9' },
                        { text: '7(♭5)', value: 'dominant7b5' },
                        { text: '⁰', value: 'halfDiminished' },
                        { text: 'dim7', value: 'diminished7' }
                    ]
                },
                scaleMenu: {
                    acceptReporters: true,
                    items: [
                        { text: '大调', value: 'major' },
                        { text: '小调', value: 'minor' },
                        { text: '大五声', value: 'pentatonicMajor' },
                        { text: '小五声', value: 'pentatonicMinor' },
                        { text: '蓝调', value: 'blues' },
                        { text: '多利亚', value: 'dorian' },
                        { text: '弗里几亚', value: 'phrygian' },
                        { text: '利底亚', value: 'lydian' },
                        { text: '混合利底亚', value: 'mixolydian' },
                        { text: '洛克里亚', value: 'locrian' },
                        { text: '全音阶', value: 'wholeTone' },
                        { text: '半音阶', value: 'chromatic' }
                    ]
                },
                effectMenu: {
                    acceptReporters: true,
                    items: [
                        { text: '混响', value: 'reverb' },
                        { text: '延迟', value: 'delay' },
                        { text: '合唱', value: 'chorus' },
                        { text: '失真', value: 'distortion' },
                        { text: '颤音', value: 'tremolo' }
                    ]
                },
                scoreInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: '总音符数', value: 'length' },
                        { text: '总时长 (拍)', value: 'duration' },
                        { text: '总时长 (秒)', value: 'seconds' },
                        { text: '当前索引', value: 'index' }
                    ]
                }
            }
        };
    }
    _initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.inputGain = this.audioContext.createGain();
            this.inputGain.gain.value = 0.8;
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.5;
            this.pannerNode = this.audioContext.createStereoPanner();
            this.pannerNode.pan.value = 0;
            this.inputGain.connect(this.masterGain);
            this.masterGain.connect(this.pannerNode);
            this.pannerNode.connect(this.audioContext.destination);
            this._createReverb();
            this._createNoiseBuffers();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            this.micDataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.micTimeDataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.masterGain.connect(this.analyser);
            this._initDistortion();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    _initMic() {
        if (this.micInitialized) return;
        if (!this.audioContext) this._initAudio();
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            this.micStream = stream;
            this.micSource = this.audioContext.createMediaStreamSource(stream);
            this.micSource.connect(this.inputGain);
            this.micInitialized = true;
        }).catch(err => {
            console.warn('Mic access denied or not available', err);
        });
    }
    _createNoiseBuffers() {
        const createBuffer = (type) => {
            const bufferSize = this.audioContext.sampleRate * 2;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                if (type === 'white') {
                    data[i] = Math.random() * 2 - 1;
                } else if (type === 'pink') {
                    data[i] = (Math.random() * 2 - 1 + Math.random() * 2 - 1) / 2;
                }
            }
            return buffer;
        };
        this.noiseBuffers.white = createBuffer('white');
        this.noiseBuffers.pink = createBuffer('pink');
    }
    _createReverb() {
        this.reverbNode = this.audioContext.createConvolver();
        const rate = this.audioContext.sampleRate;
        const length = rate * 2;
        const impulse = this.audioContext.createBuffer(2, length, rate);
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
            }
        }
        this.reverbNode.buffer = impulse;
        this.reverbSendGain = this.audioContext.createGain();
        this.reverbSendGain.gain.value = 0.3;
        this.inputGain.connect(this.reverbSendGain);
        this.reverbSendGain.connect(this.reverbNode);
        this.reverbNode.connect(this.masterGain);
    }
    _initDistortion() {
        this.distortionNode = this.audioContext.createWaveShaper();
        this.distortionGain = this.audioContext.createGain();
        this.distortionNode.connect(this.distortionGain);
        this.distortionGain.connect(this.masterGain);
        this.inputGain.connect(this.distortionNode);
        this.distortionNode.curve = this._makeDistortionCurve(0);
        this.distortionNode.oversample = '4x';
        this.distortionGain.gain.value = 0;
    }
    _makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
    _initDelay() {
        if (!this.delayNode) {
            this.delayNode = this.audioContext.createDelay(1.0);
            this.delayFeedback = this.audioContext.createGain();
            this.delayMixGain = this.audioContext.createGain();
            this.inputGain.connect(this.delayNode);
            this.delayNode.connect(this.delayFeedback);
            this.delayFeedback.connect(this.delayNode);
            this.delayNode.connect(this.delayMixGain);
            this.delayMixGain.connect(this.masterGain);
            this.delayFeedback.gain.value = 0.5;
            this.delayNode.delayTime.value = 0.3;
            this.delayMixGain.gain.value = 0.3;
        }
    }
    _initChorus() {
        if (this.chorusDelay) return;
        const ctx = this.audioContext;
        this.chorusDelay = ctx.createDelay(0.1);
        this.chorusLFO = ctx.createOscillator();
        this.chorusLFOGain = ctx.createGain();
        this.chorusMixGain = ctx.createGain();
        this.chorusLFO.connect(this.chorusLFOGain);
        this.chorusLFOGain.connect(this.chorusDelay.delayTime);
        this.chorusLFO.type = 'sine';
        this.chorusLFO.start();
        this.inputGain.connect(this.chorusDelay);
        this.chorusDelay.connect(this.chorusMixGain);
        this.chorusMixGain.connect(this.masterGain);
        this.chorusDelay.delayTime.value = 0.03;
        this.chorusLFO.frequency.value = 1.5;
        this.chorusLFOGain.gain.value = 0.015;
        this.chorusMixGain.gain.value = 0.4;
    }
    _initTremolo() {
        if (this.tremoloInitialized) return;
        const ctx = this.audioContext;
        this.tremoloGain = ctx.createGain();
        this.tremoloLFO = ctx.createOscillator();
        this.tremoloLFOGain = ctx.createGain();
        this.tremoloLFO.connect(this.tremoloLFOGain);
        this.tremoloLFOGain.connect(this.tremoloGain.gain);
        this.tremoloLFO.type = 'sine';
        this.tremoloLFO.start();
        this.inputGain.disconnect(this.masterGain);
        this.inputGain.connect(this.tremoloGain);
        this.tremoloGain.connect(this.masterGain);
        this.tremoloGain.gain.value = 1;
        this.tremoloLFO.frequency.value = 5;
        this.tremoloLFOGain.gain.value = 0;
        this.tremoloInitialized = true;
    }
    stopAll() {
        this.stopped = true;
        this.scorePlaying = false;
        this.scorePaused = false;
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        this.activeTimeouts.forEach(id => clearTimeout(id));
        this.pendingResolves.forEach(resolve => resolve());
        this.activeTimeouts = [];
        this.pendingResolves = [];
        const sources = this.activeSources.slice();
        sources.forEach(source => {
            try {
                if (source.stop) source.stop(now);
                if (source.disconnect) source.disconnect();
            } catch (e) { }
        });
        this.activeSources = [];
        if (this.masterGain) {
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        }
    }
    parseScoreLine(line) {
        const trimmed = line.trim();
        if (trimmed === '0' || trimmed === '' || trimmed.startsWith('//')) {
            return { notes: [], duration: 0.5, isRest: true, original: trimmed };
        }
        const parts = trimmed.split('-');
        const notes = [];
        let duration = 0.5;
        for (let i = 0; i < parts.length; i += 2) {
            const noteNum = parseInt(parts[i]);
            if (isNaN(noteNum)) continue;
            notes.push(noteNum);
            if (i + 1 < parts.length) {
                const dur = parseFloat(parts[i + 1]);
                if (!isNaN(dur) && dur > 0) {
                    duration = dur;
                }
            }
        }
        if (notes.length === 0) {
            return { notes: [], duration: 0.5, isRest: true, original: trimmed };
        }
        return { notes, duration, isRest: false, original: trimmed };
    }
    parseScoreText(text) {
        const normalized = text.replace(/\n/g, ';');
        const lines = normalized.split(';');
        const score = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length === 0) continue;
            const parsed = this.parseScoreLine(line);
            if (parsed.notes.length > 0 || parsed.isRest) {
                score.push(parsed);
            }
        }
        return score;
    }
    loadScore(args) {
        const scoreText = args.SCORE;
        this.scoreData = this.parseScoreText(scoreText);
        this.scoreIndex = 0;
        this.scoreStartTime = 0;
        this.scoreLoopCount = 0;
        this.scoreCurrentLoop = 0;
        return Promise.resolve();
    }
    async playScore() {
        if (!this.scoreData || this.scoreData.length === 0) {
            return Promise.resolve();
        }
        this._initAudio();
        this.stopped = false;
        this.scorePaused = false;
        this.scorePlaying = true;
        if (this.scoreIndex >= this.scoreData.length) {
            this.scoreIndex = 0;
        }
        this.scoreStartTime = Date.now();
        const totalNotes = this.scoreData.length;
        while (this.scorePlaying && !this.stopped) {
            if (this.scorePaused) {
                await new Promise(resolve => {
                    const checkPause = () => {
                        if (!this.scorePaused) {
                            resolve();
                        } else {
                            setTimeout(checkPause, 100);
                        }
                    };
                    checkPause();
                });
            }
            if (this.scoreIndex >= this.scoreData.length) {
                if (this.scoreLoop) {
                    this.scoreCurrentLoop++;
                    if (this.scoreLoopCount > 0 && this.scoreCurrentLoop >= this.scoreLoopCount) {
                        break;
                    }
                    this.scoreIndex = 0;
                    this.scoreStartTime = Date.now();
                } else {
                    break;
                }
            }
            const event = this.scoreData[this.scoreIndex];
            if (event.isRest) {
                await this.rest({ BEATS: event.duration });
            } else {
                if (event.notes.length === 1) {
                    await this.playNote({ NOTE: event.notes[0], BEATS: event.duration });
                } else {
                    const ctx = this.audioContext;
                    const now = ctx.currentTime;
                    const duration = 60 / this.tempo * event.duration;
                    const promises = event.notes.map((note, idx) => {
                        return this._playNoteAdvanced(note, duration, now + idx * 0.01);
                    });
                    await Promise.all(promises);
                    await new Promise(resolve => {
                        const id = setTimeout(resolve, duration * 1000);
                        this.activeTimeouts.push(id);
                        this.pendingResolves.push(resolve);
                    });
                }
            }
            this.scoreIndex++;
        }
        this.scorePlaying = false;
        if (!this.stopped && this.scoreIndex >= this.scoreData.length) {
            this.scoreIndex = 0;
        }
    }
    stopScore() {
        this.stopped = true;
        this.scorePlaying = false;
        this.scorePaused = false;
        this.scoreIndex = 0;
    }
    pauseScore() {
        if (this.scorePlaying) {
            this.scorePaused = !this.scorePaused;
        }
    }
    getScoreProgress() {
        if (!this.scoreData || this.scoreData.length === 0) return 0;
        return Math.round((this.scoreIndex / this.scoreData.length) * 100);
    }
    getScoreLength() {
        if (!this.scoreData) return 0;
        return this.scoreData.length;
    }
    getCurrentNote() {
        if (!this.scoreData || this.scoreIndex >= this.scoreData.length) return '';
        const event = this.scoreData[this.scoreIndex];
        if (event.isRest) return '休止';
        return event.notes.join(',');
    }
    saveScore(args) {
        const name = args.NAME;
        if (this.scoreData) {
            this.savedScores[name] = JSON.parse(JSON.stringify(this.scoreData));
        }
        return Promise.resolve();
    }
    loadSavedScore(args) {
        const name = args.NAME;
        if (this.savedScores[name]) {
            this.scoreData = JSON.parse(JSON.stringify(this.savedScores[name]));
            this.scoreIndex = 0;
            this.scoreStartTime = 0;
        }
        return Promise.resolve();
    }
    getScoreNoteCount(args) {
        const name = args.NAME;
        if (this.savedScores[name]) {
            let count = 0;
            for (const event of this.savedScores[name]) {
                count += event.notes.length;
            }
            return count;
        }
        return 0;
    }
    setScoreLoop(args) {
        const loop = parseInt(args.LOOP);
        this.scoreLoop = loop > 0;
        this.scoreLoopCount = loop;
        this.scoreCurrentLoop = 0;
    }
    getScoreTime() {
        if (!this.scorePlaying || this.scoreStartTime === 0) return 0;
        return ((Date.now() - this.scoreStartTime) / 1000).toFixed(2);
    }
    seekScore(args) {
        const index = parseInt(args.INDEX);
        if (this.scoreData && index >= 0 && index < this.scoreData.length) {
            this.scoreIndex = index;
            this.scoreStartTime = Date.now();
        }
    }
    exportScore() {
        if (!this.scoreData) return '';
        return this.scoreData.map(event => {
            if (event.isRest) return '0';
            return event.notes.map(n => `${n}-${event.duration}`).join('-');
        }).join(';');
    }
    importScoreFile(args) {
        const fileText = args.FILE;
        if (fileText && fileText.trim().length > 0) {
            this.scoreData = this.parseScoreText(fileText);
            this.scoreIndex = 0;
        }
        return Promise.resolve();
    }
    setScoreTempo(args) {
        this.tempo = Math.max(20, Math.min(500, parseInt(args.TEMPO)));
    }
    getScoreInfo(args) {
        const infoType = args.INFO;
        if (!this.scoreData) return '0';
        switch (infoType) {
            case 'length':
                return this.scoreData.length;
            case 'duration':
                let totalBeats = 0;
                for (const event of this.scoreData) {
                    totalBeats += event.duration;
                }
                return totalBeats.toFixed(2);
            case 'seconds':
                let totalBeats2 = 0;
                for (const event of this.scoreData) {
                    totalBeats2 += event.duration;
                }
                return ((totalBeats2 / this.tempo) * 60).toFixed(2);
            case 'index':
                return this.scoreIndex;
            default:
                return '0';
        }
    }
    playDrum(args) {
        this._initAudio();
        const drumName = args.DRUM;
        const beats = args.BEATS;
        const duration = 60 / this.tempo * beats;
        const drum = this.drums[drumName] || this.drums.snare;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const output = ctx.createGain();
        output.connect(this.inputGain);
        this.activeSources.push(output);
        if (drum.noise) {
            const noise = ctx.createBufferSource();
            this.activeSources.push(noise);
            noise.buffer = this.noiseBuffers[drum.noise.type] || this.noiseBuffers.white;
            const noiseFilter = ctx.createBiquadFilter();
            this.activeSources.push(noiseFilter);
            noiseFilter.type = drum.noise.filter.type;
            noiseFilter.frequency.value = drum.noise.filter.freq;
            if (drum.noise.filter.Q) noiseFilter.Q.value = drum.noise.filter.Q;
            const noiseGain = ctx.createGain();
            this.activeSources.push(noiseGain);
            noiseGain.gain.setValueAtTime(drum.noise.gain, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + drum.envelope.decay);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(output);
            noise.start(now);
            noise.stop(now + drum.envelope.decay + 0.1);
        }
        if (drum.osc) {
            const osc = ctx.createOscillator();
            this.activeSources.push(osc);
            osc.type = drum.osc.type;
            if (drum.osc.freqSweep) {
                osc.frequency.setValueAtTime(drum.osc.freqSweep.from, now);
                osc.frequency.exponentialRampToValueAtTime(drum.osc.freqSweep.to, now + drum.osc.freqSweep.time);
            } else {
                osc.frequency.setValueAtTime(drum.osc.freq, now);
            }
            const oscGain = ctx.createGain();
            this.activeSources.push(oscGain);
            oscGain.gain.setValueAtTime(drum.osc.gain, now);
            oscGain.gain.exponentialRampToValueAtTime(0.01, now + drum.envelope.decay);
            osc.connect(oscGain);
            oscGain.connect(output);
            osc.start(now);
            osc.stop(now + drum.envelope.decay + 0.1);
        }
        output.gain.setValueAtTime(1, now);
        output.gain.exponentialRampToValueAtTime(0.001, now + duration);
        const timeoutId = setTimeout(() => {
            output.disconnect();
            const idx = this.activeSources.indexOf(output);
            if (idx > -1) this.activeSources.splice(idx, 1);
            const tIdx = this.activeTimeouts.indexOf(timeoutId);
            if (tIdx > -1) this.activeTimeouts.splice(tIdx, 1);
        }, duration * 1000);
        this.activeTimeouts.push(timeoutId);
        return new Promise(resolve => {
            const id = setTimeout(resolve, duration * 1000);
            this.activeTimeouts.push(id);
            this.pendingResolves.push(resolve);
        });
    }
    rest(args) {
        const beats = args.BEATS;
        const duration = 60 / this.tempo * beats;
        return new Promise(resolve => {
            const id = setTimeout(resolve, duration * 1000);
            this.activeTimeouts.push(id);
            this.pendingResolves.push(resolve);
        });
    }
    playNote(args) {
        this._initAudio();
        const note = parseInt(args.NOTE);
        const beats = args.BEATS;
        const duration = 60 / this.tempo * beats;
        return this._playNoteAdvanced(note, duration);
    }
    playNoteName(args) {
        this._initAudio();
        const noteIndex = this.noteNames.indexOf(args.NOTE);
        if (noteIndex === -1) return Promise.resolve();
        const octave = parseInt(args.OCTAVE);
        const midiNum = (octave + 1) * 12 + noteIndex;
        const beats = args.BEATS;
        const duration = 60 / this.tempo * beats;
        return this._playNoteAdvanced(midiNum, duration);
    }
    playChord(args) {
        this._initAudio();
        const noteIndex = this.noteNames.indexOf(args.ROOT);
        if (noteIndex === -1) return Promise.resolve();
        const octave = args.OCTAVE;
        const rootMidi = (octave + 1) * 12 + noteIndex;
        const chordType = args.CHORD;
        const beats = args.BEATS;
        const duration = 60 / this.tempo * beats;
        return this._playChordAdvanced(rootMidi, chordType, duration);
    }
    playChordMidi(args) {
        this._initAudio();
        const rootMidi = parseInt(args.ROOT);
        const chordType = args.CHORD;
        const beats = args.BEATS;
        const duration = 60 / this.tempo * beats;
        return this._playChordAdvanced(rootMidi, chordType, duration);
    }
    _playChordAdvanced(rootMidi, chordType, duration) {
        const intervals = this.chords[chordType] || this.chords.major;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const promises = intervals.map((interval, index) => {
            const midiNum = rootMidi + interval;
            if (midiNum < 0 || midiNum > 127) return Promise.resolve();
            const stagger = index * 0.015;
            return this._playNoteAdvanced(midiNum, duration, now + stagger);
        });
        return Promise.all(promises).then(() => {
            return new Promise(resolve => {
                const id = setTimeout(resolve, duration * 1000);
                this.activeTimeouts.push(id);
                this.pendingResolves.push(resolve);
            });
        });
    }
    _playNoteAdvanced(midiNum, duration, startTime = null) {
        const ctx = this.audioContext;
        const now = startTime || ctx.currentTime;
        const inst = this.instruments[this.currentInstrument] || this.instruments.piano;
        const baseFreq = this.noteFrequencies[midiNum] || 440;
        const freq = baseFreq * Math.pow(2, this.pitchOffset / 12);
        const noteGain = ctx.createGain();
        noteGain.connect(this.inputGain);
        this.activeSources.push(noteGain);
        const velocity = inst.velocity || 0.7;
        const env = inst.envelope;
        const safeDecay = Math.min(env.decay, duration * 0.8);
        const safeRelease = Math.min(env.release, duration * 0.2);
        const sustainTime = Math.max(0, duration - safeDecay - safeRelease);
        inst.oscillators.forEach(oscConfig => {
            const osc = ctx.createOscillator();
            this.activeSources.push(osc);
            osc.type = oscConfig.type;
            osc.frequency.setValueAtTime(freq, now);
            if (oscConfig.detune !== 0) {
                osc.detune.setValueAtTime(oscConfig.detune, now);
            }
            const filter = ctx.createBiquadFilter();
            this.activeSources.push(filter);
            filter.type = inst.filter.type;
            const filterFreq = this.globalFilterFreq > 0 ? this.globalFilterFreq : inst.filter.frequency;
            filter.frequency.setValueAtTime(filterFreq, now);
            filter.Q.value = inst.filter.Q || 1;
            if (inst.filterEnvelope) {
                const fe = inst.filterEnvelope;
                filter.frequency.linearRampToValueAtTime(filterFreq + fe.amount, now + fe.attack);
                filter.frequency.exponentialRampToValueAtTime(filterFreq + fe.sustain * fe.amount, now + fe.attack + fe.decay);
            }
            const gain = ctx.createGain();
            this.activeSources.push(gain);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(oscConfig.gain * velocity, now + env.attack);
            gain.gain.exponentialRampToValueAtTime(oscConfig.gain * velocity * env.sustain, now + env.attack + safeDecay);
            if (sustainTime > 0) {
                gain.gain.setValueAtTime(oscConfig.gain * velocity * env.sustain, now + env.attack + safeDecay + sustainTime);
            }
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            if (inst.vibrato && duration > 0.3) {
                const vibrato = ctx.createOscillator();
                this.activeSources.push(vibrato);
                vibrato.frequency.value = inst.vibrato.rate;
                const vibratoGain = ctx.createGain();
                this.activeSources.push(vibratoGain);
                vibratoGain.gain.value = inst.vibrato.depth;
                vibrato.connect(vibratoGain);
                vibratoGain.connect(osc.frequency);
                vibrato.start(now + 0.1);
                vibrato.stop(now + duration);
            }
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(noteGain);
            osc.start(now);
            osc.stop(now + duration + 0.1);
            const cleanupTime = (duration + 0.2) * 1000;
            const timeoutId = setTimeout(() => {
                try {
                    osc.disconnect();
                    filter.disconnect();
                    gain.disconnect();
                    noteGain.disconnect();
                    if (inst.vibrato && duration > 0.3) {
                        vibrato.disconnect();
                        vibratoGain.disconnect();
                    }
                    [osc, filter, gain, noteGain].forEach(node => {
                        const idx = this.activeSources.indexOf(node);
                        if (idx > -1) this.activeSources.splice(idx, 1);
                    });
                    const tIdx = this.activeTimeouts.indexOf(timeoutId);
                    if (tIdx > -1) this.activeTimeouts.splice(tIdx, 1);
                } catch (e) { }
            }, cleanupTime);
            this.activeTimeouts.push(timeoutId);
        });
        return new Promise(resolve => {
            const id = setTimeout(resolve, duration * 1000);
            this.activeTimeouts.push(id);
            this.pendingResolves.push(resolve);
        });
    }
    setInstrument(args) {
        if (this.instruments[args.INSTRUMENT]) {
            this.currentInstrument = args.INSTRUMENT;
        }
    }
    setEnvelope(args) {
        const inst = this.instruments[this.currentInstrument];
        if (inst) {
            inst.envelope.attack = Math.max(0, parseFloat(args.ATTACK));
            inst.envelope.decay = Math.max(0, parseFloat(args.DECAY));
            inst.envelope.sustain = Math.max(0, Math.min(1, parseFloat(args.SUSTAIN)));
            inst.envelope.release = Math.max(0, parseFloat(args.RELEASE));
        }
    }
    setTempo(args) {
        this.tempo = Math.max(20, Math.min(500, args.TEMPO));
    }
    changeTempo(args) {
        this.tempo = Math.max(20, Math.min(500, this.tempo + args.TEMPO));
    }
    getTempo() {
        return this.tempo;
    }
    setVolume(args) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, args.VOLUME / 100));
        }
    }
    setEffect(args) {
        const effect = args.EFFECT;
        const amount = args.AMOUNT;
        if (effect === 'reverb') this.setReverb({ AMOUNT: amount });
        else if (effect === 'delay') this.setDelay({ FEEDBACK: 50, TIME: 0.3, MIX: amount });
        else if (effect === 'chorus') this.setChorus({ DEPTH: 50, RATE: 1.5, MIX: amount });
        else if (effect === 'distortion') this.setDistortion({ AMOUNT: amount });
        else if (effect === 'tremolo') this.setTremolo({ DEPTH: amount, RATE: 5 });
    }
    setPitch(args) {
        const pitch = Math.max(-12, Math.min(12, parseInt(args.PITCH)));
        this.pitchOffset = pitch || 0;
    }
    glideToNote(args) {
        this._initAudio();
        const targetNote = parseInt(args.NOTE);
        const beats = args.BEATS;
        const duration = 60 / this.tempo * beats;
        const startNote = args.START_NOTE ? parseInt(args.START_NOTE) : targetNote - 5;
        return this._glideBetweenNotes(startNote, targetNote, duration);
    }
    _glideBetweenNotes(startNote, endNote, duration) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const inst = this.instruments[this.currentInstrument] || this.instruments.piano;
        const baseStartFreq = this.noteFrequencies[startNote] || 440;
        const baseEndFreq = this.noteFrequencies[endNote] || 440;
        const startFreq = baseStartFreq * Math.pow(2, this.pitchOffset / 12);
        const endFreq = baseEndFreq * Math.pow(2, this.pitchOffset / 12);
        const totalDuration = duration;
        const noteGain = ctx.createGain();
        noteGain.connect(this.inputGain);
        this.activeSources.push(noteGain);
        inst.oscillators.forEach(oscConfig => {
            const osc = ctx.createOscillator();
            this.activeSources.push(osc);
            osc.type = oscConfig.type;
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + totalDuration);
            const filter = ctx.createBiquadFilter();
            this.activeSources.push(filter);
            filter.type = inst.filter.type;
            const filterFreq = this.globalFilterFreq > 0 ? this.globalFilterFreq : inst.filter.frequency;
            filter.frequency.setValueAtTime(filterFreq, now);
            filter.Q.value = inst.filter.Q || 1;
            const gain = ctx.createGain();
            this.activeSources.push(gain);
            const env = inst.envelope;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(oscConfig.gain * inst.velocity, now + env.attack);
            gain.gain.exponentialRampToValueAtTime(oscConfig.gain * inst.velocity * env.sustain, now + env.attack + env.decay);
            gain.gain.setValueAtTime(oscConfig.gain * inst.velocity * env.sustain, now + totalDuration - env.release);
            gain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(noteGain);
            osc.start(now);
            osc.stop(now + totalDuration + 0.1);
        });
        return new Promise(resolve => {
            const id = setTimeout(resolve, totalDuration * 1000);
            this.activeTimeouts.push(id);
            this.pendingResolves.push(resolve);
        });
    }
    arpeggiator(args) {
        this._initAudio();
        this.stopped = false;
        const root = parseInt(args.ROOT);
        const chordType = args.CHORD;
        const beatsPerNote = parseFloat(args.BEATS);
        const arpBeats = parseFloat(args.ARPLENGTH);
        if (beatsPerNote <= 0) return Promise.resolve();
        const durationPerNote = (beatsPerNote / this.tempo) * 60;
        const totalArpDuration = (arpBeats / this.tempo) * 60;
        const intervals = this.chords[chordType] || this.chords.major;
        const notes = intervals.map(interval => root + interval);
        const noteCount = Math.floor(totalArpDuration / durationPerNote);
        const playArpSequence = async () => {
            for (let i = 0; i < noteCount; i++) {
                if (this.stopped) break;
                const noteIndex = i % notes.length;
                const swingOffset = (this.swing > 0 && i % 2 === 1) ? (durationPerNote * this.swing / 100) : 0;
                await this._playNoteAdvanced(notes[noteIndex], durationPerNote * 0.8);
                await new Promise(resolve => {
                    const id = setTimeout(() => {
                        if (!this.stopped) resolve();
                    }, (durationPerNote + swingOffset) * 1000);
                    this.activeTimeouts.push(id);
                    this.pendingResolves.push(resolve);
                });
            }
        };
        return playArpSequence();
    }
    playSequence(args) {
        this._initAudio();
        this.stopped = false;
        const sequenceStr = args.SEQUENCE;
        const beats = parseFloat(args.BEATS);
        const sequence = sequenceStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        const playSeq = async () => {
            for (let i = 0; i < sequence.length; i++) {
                if (this.stopped) break;
                const note = sequence[i];
                await this.playNote({ NOTE: note, BEATS: beats });
                if (this.swing > 0 && i % 2 === 1) {
                    const swingDelay = (60 / this.tempo * beats) * (this.swing / 100);
                    await new Promise(resolve => {
                        const id = setTimeout(() => {
                            if (!this.stopped) resolve();
                        }, swingDelay * 1000);
                        this.activeTimeouts.push(id);
                        this.pendingResolves.push(resolve);
                    });
                }
            }
        };
        return playSeq();
    }
    playSequenceLoop(args) {
        this._initAudio();
        this.stopped = false;
        const sequenceStr = args.SEQUENCE;
        const beats = parseFloat(args.BEATS);
        const loopCount = parseInt(args.LOOP);
        const sequence = sequenceStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        const playSeq = async () => {
            for (let l = 0; l < loopCount; l++) {
                if (this.stopped) break;
                for (let i = 0; i < sequence.length; i++) {
                    if (this.stopped) break;
                    const note = sequence[i];
                    await this.playNote({ NOTE: note, BEATS: beats });
                    if (this.swing > 0 && i % 2 === 1) {
                        const swingDelay = (60 / this.tempo * beats) * (this.swing / 100);
                        await new Promise(resolve => {
                            const id = setTimeout(() => {
                                if (!this.stopped) resolve();
                            }, swingDelay * 1000);
                            this.activeTimeouts.push(id);
                            this.pendingResolves.push(resolve);
                        });
                    }
                }
            }
        };
        return playSeq();
    }
    playChordProgression(args) {
        this._initAudio();
        this.stopped = false;
        const progressionStr = args.PROGRESSION;
        const beats = parseFloat(args.BEATS);
        const chords = progressionStr.split(';');
        const playProg = async () => {
            for (const chordDesc of chords) {
                if (this.stopped) break;
                const parts = chordDesc.trim().split(/\s+/);
                if (parts.length < 2) continue;
                const root = parts[0];
                const type = parts[1];
                const rootNote = isNaN(parseInt(root)) ? this._noteNameToMidi(root) : parseInt(root);
                if (rootNote === undefined) continue;
                await this.playChordMidi({ ROOT: rootNote, CHORD: type, BEATS: beats });
            }
        };
        return playProg();
    }
    _noteNameToMidi(noteName) {
        const match = noteName.match(/([A-G]#?)(\d+)/);
        if (!match) return undefined;
        const base = match[1];
        const octave = parseInt(match[2]);
        if (!this.noteNames.includes(base)) return undefined;
        const noteIndex = this.noteNames.indexOf(base);
        return (octave + 1) * 12 + noteIndex;
    }
    setReverb(args) {
        const amount = Math.max(0, Math.min(100, parseInt(args.AMOUNT))) / 100;
        if (this.reverbSendGain) {
            this.reverbSendGain.gain.value = amount;
        }
    }
    setDelay(args) {
        this._initDelay();
        const feedback = Math.max(0, Math.min(90, parseInt(args.FEEDBACK))) / 100;
        const mix = Math.max(0, Math.min(100, parseInt(args.MIX))) / 100;
        const time = Math.max(0.01, Math.min(1, parseFloat(args.TIME)));
        if (this.delayFeedback) this.delayFeedback.gain.value = feedback;
        if (this.delayNode) this.delayNode.delayTime.value = time;
        if (this.delayMixGain) this.delayMixGain.gain.value = mix;
    }
    setChorus(args) {
        this._initChorus();
        const depth = Math.max(0, Math.min(100, parseInt(args.DEPTH))) / 100;
        const rate = Math.max(0.1, Math.min(10, parseFloat(args.RATE)));
        const mix = Math.max(0, Math.min(100, parseInt(args.MIX))) / 100;
        if (this.chorusLFO) this.chorusLFO.frequency.value = rate;
        if (this.chorusLFOGain) this.chorusLFOGain.gain.value = depth * 0.05;
        if (this.chorusMixGain) this.chorusMixGain.gain.value = mix;
    }
    setTremolo(args) {
        this._initTremolo();
        const depth = Math.max(0, Math.min(100, parseInt(args.DEPTH))) / 100;
        const rate = Math.max(0.1, Math.min(20, parseFloat(args.RATE)));
        if (this.tremoloLFO) this.tremoloLFO.frequency.value = rate;
        if (this.tremoloLFOGain) this.tremoloLFOGain.gain.value = depth * 0.5;
    }
    setDistortion(args) {
        this._initDistortion();
        const amount = Math.max(0, Math.min(100, parseInt(args.AMOUNT)));
        if (this.distortionNode) {
            this.distortionNode.curve = this._makeDistortionCurve(amount);
        }
        if (this.distortionGain) {
            this.distortionGain.gain.value = amount > 0 ? 1 - (amount / 200) : 0;
        }
    }
    setGlobalFilter(args) {
        const freq = parseInt(args.FREQ);
        this.globalFilterFreq = freq > 0 ? freq : -1;
    }
    setSwing(args) {
        this.swing = Math.max(0, Math.min(100, parseInt(args.SWING)));
    }
    playGraceNote(args) {
        this._initAudio();
        const note1 = parseInt(args.NOTE1);
        const note2 = parseInt(args.NOTE2);
        const beats = Math.max(0.25, parseFloat(args.BEATS));
        const duration = 60 / this.tempo * beats;
        return this._playGraceNoteAdvanced(note1, note2, duration);
    }
    _playGraceNoteAdvanced(note1, note2, duration) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const inst = this.instruments[this.currentInstrument] || this.instruments.piano;
        const baseFreq1 = this.noteFrequencies[note1] || 440;
        const baseFreq2 = this.noteFrequencies[note2] || 440;
        const startFreq = baseFreq1 * Math.pow(2, this.pitchOffset / 12);
        const endFreq = baseFreq2 * Math.pow(2, this.pitchOffset / 12);
        const noteGain = ctx.createGain();
        noteGain.connect(this.inputGain);
        this.activeSources.push(noteGain);
        const velocity = inst.velocity || 0.7;
        const env = inst.envelope;
        inst.oscillators.forEach(oscConfig => {
            const osc = ctx.createOscillator();
            this.activeSources.push(osc);
            osc.type = oscConfig.type;
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.linearRampToValueAtTime(endFreq, now + duration * 0.9);
            const filter = ctx.createBiquadFilter();
            this.activeSources.push(filter);
            filter.type = inst.filter.type;
            const filterFreq = this.globalFilterFreq > 0 ? this.globalFilterFreq : inst.filter.frequency;
            filter.frequency.setValueAtTime(filterFreq, now);
            filter.Q.value = inst.filter.Q || 1;
            const gain = ctx.createGain();
            this.activeSources.push(gain);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(oscConfig.gain * velocity, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(noteGain);
            osc.start(now);
            osc.stop(now + duration + 0.1);
        });
        return new Promise(resolve => {
            const id = setTimeout(resolve, duration * 1000);
            this.activeTimeouts.push(id);
            this.pendingResolves.push(resolve);
        });
    }
    playFall(args) {
        this._initAudio();
        const note = parseInt(args.NOTE);
        const semitones = Math.max(1, parseInt(args.SEMITONES));
        const duration = Math.max(0.5, parseFloat(args.DURATION));
        return this._playFallAdvanced(note, semitones, duration);
    }
    _playFallAdvanced(note, semitones, duration) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const inst = this.instruments[this.currentInstrument] || this.instruments.piano;
        const baseFreq = this.noteFrequencies[note] || 440;
        const startFreq = baseFreq * Math.pow(2, this.pitchOffset / 12);
        const endFreq = startFreq * Math.pow(2, -semitones / 12);
        const noteGain = ctx.createGain();
        noteGain.connect(this.inputGain);
        this.activeSources.push(noteGain);
        const velocity = inst.velocity || 0.7;
        const env = inst.envelope;
        const fallStartTime = now + (duration * 0.5);
        inst.oscillators.forEach(oscConfig => {
            const osc = ctx.createOscillator();
            this.activeSources.push(osc);
            osc.type = oscConfig.type;
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.setValueAtTime(startFreq, fallStartTime);
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
            const filter = ctx.createBiquadFilter();
            this.activeSources.push(filter);
            filter.type = inst.filter.type;
            const filterFreq = this.globalFilterFreq > 0 ? this.globalFilterFreq : inst.filter.frequency;
            filter.frequency.setValueAtTime(filterFreq, now);
            filter.Q.value = inst.filter.Q || 1;
            const gain = ctx.createGain();
            this.activeSources.push(gain);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(oscConfig.gain * velocity, now + env.attack);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(noteGain);
            osc.start(now);
            osc.stop(now + duration + 0.1);
        });
        return new Promise(resolve => {
            const id = setTimeout(resolve, duration * 1000);
            this.activeTimeouts.push(id);
            this.pendingResolves.push(resolve);
        });
    }
    playTrill(args) {
        this._initAudio();
        this.stopped = false;
        const note1 = parseInt(args.NOTE);
        const note2 = parseInt(args.ALT_NOTE);
        const speed = Math.max(0.05, parseFloat(args.SPEED));
        const duration = Math.max(0.2, parseFloat(args.DURATION));
        const totalBeats = 60 / this.tempo * duration;
        const cycles = Math.floor(totalBeats / (speed * 2));
        const playTrillSeq = async () => {
            for (let i = 0; i < cycles; i++) {
                if (this.stopped) break;
                await this._playNoteAdvanced(note1, speed * 0.8);
                await new Promise(r => {
                    const id = setTimeout(() => {
                        if (!this.stopped) r();
                    }, speed * 1000);
                    this.activeTimeouts.push(id);
                    this.pendingResolves.push(r);
                });
                if (this.stopped) break;
                await this._playNoteAdvanced(note2, speed * 0.8);
                await new Promise(r => {
                    const id = setTimeout(() => {
                        if (!this.stopped) r();
                    }, speed * 1000);
                    this.activeTimeouts.push(id);
                    this.pendingResolves.push(r);
                });
            }
        };
        return playTrillSeq();
    }
    getChordNotes(args) {
        const root = parseInt(args.ROOT);
        const chordType = args.CHORD;
        const intervals = this.chords[chordType] || this.chords.major;
        const notes = intervals.map(interval => root + interval);
        return notes.join(',');
    }
    getScaleNotes(args) {
        const root = parseInt(args.ROOT);
        const scaleType = args.SCALE;
        const intervals = this.scales[scaleType] || this.scales.major;
        const notes = intervals.map(interval => root + interval);
        return notes.join(',');
    }
    playScale(args) {
        this._initAudio();
        this.stopped = false;
        const root = parseInt(args.ROOT);
        const scaleType = args.SCALE;
        const beats = parseFloat(args.BEATS);
        const intervals = this.scales[scaleType] || this.scales.major;
        const notes = intervals.map(interval => root + interval);
        const playScaleSeq = async () => {
            for (const note of notes) {
                if (this.stopped) break;
                await this.playNote({ NOTE: note, BEATS: beats });
            }
        };
        return playScaleSeq();
    }
    getMicPitchHz() {
        this._initAudio();
        this._initMic();
        if (!this.analyser || !this.micInitialized) return 0;
        this.analyser.getByteFrequencyData(this.micDataArray);
        const bufferLength = this.micDataArray.length;
        let maxIndex = 0;
        let maxValue = 0;
        const sampleRate = this.audioContext.sampleRate;
        const startBin = Math.floor(50 / (sampleRate / bufferLength));
        const endBin = Math.floor(5000 / (sampleRate / bufferLength));
        for (let i = startBin; i < Math.min(endBin, bufferLength); i++) {
            if (this.micDataArray[i] > maxValue) {
                maxValue = this.micDataArray[i];
                maxIndex = i;
            }
        }
        if (maxValue < 15) return 0;
        const frequency = maxIndex * (sampleRate / bufferLength);
        return Math.round(frequency);
    }
    getMicPitchNote() {
        const freq = this.getMicPitchHz();
        if (freq === 0) return '';
        const noteNum = 12 * (Math.log(freq / 440) / Math.log(2)) + 69;
        const roundedNote = Math.round(noteNum);
        if (roundedNote < 0 || roundedNote > 127) return '';
        const noteName = this.noteNames[roundedNote % 12];
        const octave = Math.floor(roundedNote / 12) - 1;
        return `${noteName}${octave}`;
    }
    getMicVolume() {
        this._initAudio();
        this._initMic();
        if (!this.analyser || !this.micInitialized) return 0;
        this.analyser.getByteTimeDomainData(this.micTimeDataArray);
        let sum = 0;
        for (let i = 0; i < this.micTimeDataArray.length; i++) {
            const x = (this.micTimeDataArray[i] - 128) / 128;
            sum += x * x;
        }
        const rms = Math.sqrt(sum / this.micTimeDataArray.length);
        const volume = Math.min(100, Math.round(rms * 300));
        return volume;
    }
    setPan(args) {
        this._initAudio();
        const pan = Math.max(-100, Math.min(100, parseInt(args.PAN))) / 100;
        if (this.pannerNode) {
            this.pannerNode.pan.value = pan;
        }
    }
    _playClick(volume) {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.inputGain);
        osc.frequency.value = 1000;
        const vol = Math.max(0, Math.min(100, volume)) / 100;
        gain.gain.setValueAtTime(vol * 0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    }
    startMetronome(args) {
        if (this.metronomePlaying) return;
        this._initAudio();
        this.metronomePlaying = true;
        const volume = args.VOLUME;
        const interval = (60 / this.tempo) * 1000;
        const playClick = () => {
            if (!this.metronomePlaying) return;
            this._playClick(volume);
            this.metronomeTimer = setTimeout(playClick, interval);
        };
        playClick();
    }
    stopMetronome() {
        this.metronomePlaying = false;
        if (this.metronomeTimer) {
            clearTimeout(this.metronomeTimer);
            this.metronomeTimer = null;
        }
    }
    clearEffects() {
        this.setReverb({ AMOUNT: 0 });
        this.setDelay({ FEEDBACK: 0, TIME: 0.3, MIX: 0 });
        this.setChorus({ DEPTH: 0, RATE: 1.5, MIX: 0 });
        this.setTremolo({ DEPTH: 0, RATE: 5 });
        this.setDistortion({ AMOUNT: 0 });
        this.setGlobalFilter({ FREQ: -1 });
        this.setPitch({ PITCH: 0 });
        if (this.pannerNode) this.pannerNode.pan.value = 0;
    }
    getIsPlaying() {
        return this.activeSources.length > 0;
    }
    getRandomNote(args) {
        const min = parseInt(args.MIN);
        const max = parseInt(args.MAX);
        if (min > max) return max;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
Scratch.extensions.register(new musicplusExtension());
