import IKnowledgeRule from './IKnowledgeRule'
import IKnowledgeItem from './IknowledgeItem'

export default class KnowledgeRule implements IKnowledgeRule {
  premises: Array<IKnowledgeItem>
  conclusion: IKnowledgeItem

  constructor(premises: IKnowledgeItem[], conclusion: IKnowledgeItem) {
    this.premises = premises
    this.conclusion = conclusion
  }

  getPremiseAttributes(): string[] {
    return this.premises.map(premise => premise.attribute)
  }
}
