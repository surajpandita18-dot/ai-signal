import type { Toolbox as ToolboxType } from '@/lib/content-model'

export default function Toolbox({ data }: { data: ToolboxType }) {
  if (!data) return null
  return (
    <div className="toolbox">
      <p className="tool" dangerouslySetInnerHTML={{ __html: data.tool_html }} />
      <span className="try" dangerouslySetInnerHTML={{ __html: data.try_html }} />
    </div>
  )
}
