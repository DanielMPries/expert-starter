import IKnowledgeItem from './IknowledgeItem'

export default interface IKnowledgeRule {
  premises: Array<IKnowledgeItem>
  conclusion: IKnowledgeItem

  getPremiseAttributes(): string[]
}
