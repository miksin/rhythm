// src/lib/metronome.ts
export class Metronome {
  private ctx: AudioContext | null = null
  private schedulerTimer: ReturnType<typeof setTimeout> | null = null
  private nextBeatTime = 0
  private beatCounter = 0

  private readonly LOOKAHEAD = 0.1  // seconds to look ahead
  private readonly INTERVAL = 25    // ms between scheduler runs

  bpm = 80

  start(bpm: number, onBeat: (beat: number) => void): void {
    this.stop()
    this.ctx = new AudioContext()
    this.bpm = bpm
    this.beatCounter = 0
    this.nextBeatTime = this.ctx.currentTime

    const schedule = () => {
      const beatDuration = 60 / this.bpm

      while (this.nextBeatTime < this.ctx!.currentTime + this.LOOKAHEAD) {
        this.scheduleClick(this.nextBeatTime)

        const beat = this.beatCounter % 16
        const delayMs = Math.max(0, (this.nextBeatTime - this.ctx!.currentTime) * 1000)
        setTimeout(() => onBeat(beat), delayMs)

        this.beatCounter++
        this.nextBeatTime += beatDuration
      }

      this.schedulerTimer = setTimeout(schedule, this.INTERVAL)
    }

    schedule()
  }

  stop(): void {
    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer)
      this.schedulerTimer = null
    }
    this.ctx?.close()
    this.ctx = null
    this.beatCounter = 0
  }

  private scheduleClick(time: number): void {
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.type = 'sine'
    osc.frequency.value = 880

    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(0.4, time + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055)

    osc.start(time)
    osc.stop(time + 0.06)
  }
}
