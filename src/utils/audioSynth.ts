/**
 * Web Audio API ambient sound generator & notification chimes
 * Runs 100% client-side without requiring external audio assets.
 */

class FocusAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private currentSourceNodes: AudioNode[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentType: string = 'off';

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public stop() {
    this.currentSourceNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    });
    this.currentSourceNodes = [];
    this.isPlaying = false;
    this.currentType = 'off';
  }

  public playSoundtrack(type: 'rain' | 'white_noise' | 'binaural' | 'waves', volume: number = 0.3) {
    this.initContext();
    if (!this.ctx) return;

    this.stop();
    this.isPlaying = true;
    this.currentType = type;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (type === 'white_noise') {
      this.playWhiteNoise(this.gainNode);
    } else if (type === 'rain') {
      this.playRain(this.gainNode);
    } else if (type === 'binaural') {
      this.playBinauralBeats(this.gainNode);
    } else if (type === 'waves') {
      this.playOceanWaves(this.gainNode);
    }
  }

  private playWhiteNoise(masterGain: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Filter to make it softer brown/pink noise
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();

    this.currentSourceNodes.push(whiteNoise, filter);
  }

  private playRain(masterGain: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // boost
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(masterGain);
    rainSource.start();

    this.currentSourceNodes.push(rainSource, filter);
  }

  private playBinauralBeats(masterGain: GainNode) {
    if (!this.ctx) return;
    // 200 Hz base carrier, 210 Hz right channel => 10 Hz Alpha focus beat
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscR.type = 'sine';
    oscL.frequency.setValueAtTime(196, this.ctx.currentTime); // G3
    oscR.frequency.setValueAtTime(206, this.ctx.currentTime); // 10Hz difference (Alpha focus)

    const merger = this.ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    merger.connect(filter);
    filter.connect(masterGain);

    oscL.start();
    oscR.start();

    this.currentSourceNodes.push(oscL, oscR, merger, filter);
  }

  private playOceanWaves(masterGain: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    // LFO to modulate wave surge
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second wave cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(masterGain);

    lfo.start();
    noise.start();

    this.currentSourceNodes.push(noise, filter, lfo, lfoGain);
  }

  public playChime() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C Major chord
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 2.1);
    });
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentType: this.currentType,
    };
  }
}

export const audioSynth = new FocusAudioSynthesizer();
