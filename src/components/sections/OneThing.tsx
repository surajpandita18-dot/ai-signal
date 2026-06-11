import type { OneThing as OneThingType } from '@/lib/content-model'

export default function OneThing({ head, lede_html, skip_list }: OneThingType) {
  return (
    <>
      <h2 className="head">{head}</h2>
      <p className="lede" dangerouslySetInnerHTML={{ __html: lede_html }} />
      <div className="stamp">
        <b>{skip_list.title}</b>
        <p>{skip_list.body}</p>
      </div>
    </>
  )
}
