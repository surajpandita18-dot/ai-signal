import type { SoWhat as SoWhatType } from '@/lib/content-model'
import LensTrackPicker from '@/components/interactive/LensTrackPicker'

export default function SoWhat({ rotation_note, lenses }: SoWhatType) {
  return (
    <>
      <div className="rotation-note">
        This week&apos;s deep lens: <b>{rotation_note.primary}</b>. Next week:{' '}
        {rotation_note.next}. <span>{rotation_note.aside}</span>
      </div>
      <LensTrackPicker
        primaryLabel={rotation_note.primary}
        labels={lenses.map((l) => l.label)}
      >
        {lenses.map((lens, i) => (
          <div
            key={i}
            data-lens-i={i}
            className={`lens${lens.is_primary ? ' primary' : ''}`}
          >
            <div className="who">
              {lens.label}
              <small>{lens.caption}</small>
            </div>
            <p
              dangerouslySetInnerHTML={{
                __html: `${lens.body_html}<span class="act">${lens.action}</span>`,
              }}
            />
          </div>
        ))}
      </LensTrackPicker>
    </>
  )
}
