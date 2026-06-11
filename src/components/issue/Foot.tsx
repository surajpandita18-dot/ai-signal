type FootProps = {
  replyPrompt: string
  nextIssue: string
}

export default function Foot({ replyPrompt, nextIssue }: FootProps) {
  return (
    <div className="foot">
      <span>{replyPrompt}</span>
      <span>{nextIssue}</span>
    </div>
  )
}
