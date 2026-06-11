import type { Poll as PollType } from '@/lib/content-model'
import PollClient from '@/components/interactive/PollClient'

type Props = PollType & { issueId: string }

export default function Poll({ issueId, question, options }: Props) {
  return <PollClient issueId={issueId} question={question} options={options} />
}
