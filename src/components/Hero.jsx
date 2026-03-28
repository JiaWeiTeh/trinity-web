import { useState } from 'react'
import BubbleDiagram from './BubbleDiagram'
import TimeScrubber from './TimeScrubber'
import PressureBar from './PressureBar'
import Sparkline from './Sparkline'

const captions = {
  energy: 'Energy-driven: hot bubble pressure inflates the shell.',
  transition: 'Transition: thermal energy radiates away.',
  momentum: 'Momentum-driven: photoionised gas pressure and ram pressure sustain expansion.',
}

export default function Hero() {
  const [time, setTime] = useState(1.0)
  const phase = time < 2 ? 'energy' : time < 4 ? 'transition' : 'momentum'

  return (
    <section className="max-w-[900px] mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-12">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Left column: text */}
        <div className="flex-1 max-w-md text-center md:text-left">
          <h1
            className="text-4xl md:text-5xl font-semibold text-ink-primary tracking-wide mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            TRINITY
          </h1>
          <p
            className="text-ink-secondary mb-6"
            style={{ fontFamily: "var(--font-display)", fontSize: 15, lineHeight: 1.6 }}
          >
            Feedback-driven bubble evolution in molecular clouds
          </p>
          <div className="flex gap-4 justify-center md:justify-start" style={{ fontFamily: 'var(--font-ui)' }}>
            <a
              href="#papers"
              className="text-teal underline underline-offset-[3px] decoration-1"
              style={{ fontSize: 13 }}
            >
              Paper I →
            </a>
            <a
              href="https://trinitysf.readthedocs.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal underline underline-offset-[3px] decoration-1"
              style={{ fontSize: 13 }}
            >
              Documentation →
            </a>
          </div>
        </div>

        {/* Right column: bubble + sparkline + pressure bar */}
        <div className="flex-shrink-0 w-[340px]">
          <BubbleDiagram time={time} />
          <div style={{ marginTop: 8 }}>
            <Sparkline time={time} />
          </div>
          <div style={{ marginTop: 8 }}>
            <PressureBar time={time} />
          </div>
        </div>
      </div>

      {/* Phase caption + time scrubber */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <p
          className="text-ink-secondary min-h-[48px] flex items-center justify-center italic"
          style={{ fontFamily: 'var(--font-display)', fontSize: 15, transition: 'opacity 200ms ease' }}
        >
          {captions[phase]}
        </p>
        <div style={{ marginTop: 8 }}>
          <TimeScrubber time={time} onTimeChange={setTime} />
        </div>
      </div>
    </section>
  )
}
