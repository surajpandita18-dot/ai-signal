import type { SoWhat as SoWhatType } from '@/lib/content-model'

export default function SoWhat({ rotation_note, lenses }: SoWhatType) {
  return (
    <>
      <div className="rotation-note">
        This week&apos;s deep lens: <b>{rotation_note.primary}</b>. Next week:{' '}
        {rotation_note.next}. <span>{rotation_note.aside}</span>
      </div>
      {lenses.map((lens, i) => (
        <div key={i} className={`lens${lens.is_primary ? ' primary' : ''}`}>
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
    </>
  )
}
