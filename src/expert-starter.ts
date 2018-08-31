import _ from 'lodash'

export interface IKnowledgeItem {
  attribute: string
  value: any
}

export interface IKnowledgeRule {
  premises: Array<IKnowledgeItem>
  conclusion: IKnowledgeItem

  getPremiseAttributes(): string[]
}

export interface IKnowledgeFacts {
  unresolved: Array<string>
}

export class KnowledgeRule implements IKnowledgeRule {
  premises: IKnowledgeItem[]
  conclusion: IKnowledgeItem

  constructor(premises: IKnowledgeItem[], conclusion: IKnowledgeItem) {
    this.premises = premises
    this.conclusion = conclusion
  }

  getPremiseAttributes(): string[] {
    return this.premises.map(premise => premise.attribute)
  }
}

export default class KnowledgeBase {
  rules: Array<IKnowledgeRule>

  constructor(rules: Array<IKnowledgeRule>) {
    this.rules = rules
  }

  public evaluate(item: object): object {
    let facts = this.retrieveFacts(item)

    this.rules.forEach(rule => {
      if (this.isSatisfied(facts, rule.premises)) {
        Object.defineProperty(facts, rule.conclusion.attribute, {
          value: rule.conclusion.value,
          writable: false,
          enumerable: true
        })
      }
    })

    return facts
  }

  private isSatisfied(facts: IKnowledgeFacts, premises: Array<IKnowledgeItem>): boolean {
    return premises.every(premise => {
      if (_.includes(facts.unresolved, premise.attribute)) {
        return false
      }

      return facts[premise.attribute] === premise.value
    })
  }

  private retrieveFacts(item: object): IKnowledgeFacts {
    let facts = {
      unresolved: Array<string>()
    }

    // resolve all of facts from the premises
    this.rules.forEach(rule => {
      rule.premises.forEach(premise => {
        // check for a prior evaluation
        if (
          facts.hasOwnProperty(premise.attribute) ||
          _.includes(facts.unresolved, premise.attribute)
        ) {
          return
        }

        // unresolved premise
        if (!_.hasIn(item, premise.attribute)) {
          facts.unresolved.push(premise.attribute)
          return
        }

        let value = _.get(item, premise.attribute)
        Object.defineProperty(facts, premise.attribute, {
          value: value,
          writable: false,
          enumerable: true
        })
      })
    })

    return facts
  }

  // TODO: the engine should...
  // 1. consume a promise of rules
  // 2. organize the rules such that if a premise is dependent on another conclusion, that rule is executed after dependent conclusion is tested
  //  ? how to detect cyclic dependencies
}
