import _ from 'lodash'
import IKnowledgeItem from './IknowledgeItem'
import IKnowledgeRule from './IKnowledgeRule'
import IKnowledgeFacts from './IKnowledgeFacts'

export default class KnowledgeBase {
  rules: Array<IKnowledgeRule>
  predicates: object

  constructor(rules: Array<IKnowledgeRule>, predicates: object) {
    this.rules = rules
    this.predicates = predicates
  }

  public evaluate(item: object): object {
    let facts = this.retrieveFacts(item)

    this.rules.forEach(rule => {
      if (this.isSatisfied(facts, rule.premises)) {
        // TODO: deal with callbacks without a value
        Object.defineProperty(facts, rule.conclusion.attribute, {
          value: rule.conclusion.value,
          writable: false,
          enumerable: true
        })
      }
    })

    return facts
  }

  private isConcretePremiseSatisfied(facts: IKnowledgeFacts, premise: IKnowledgeItem) {
    return facts[premise.attribute] === premise.value
  }

  private isCallbackPremiseSatisfied(facts: IKnowledgeFacts, premise: IKnowledgeItem) {
    if (!premise.callback) {
      return
    }

    // check for undefined predicate
    if (!_.hasIn(this.predicates, premise.callback)) {
      facts.unresolved.push(premise.attribute)
      return
    }

    // check that the callback is a function
    let callback = _.get(this.predicates, premise.callback)
    if (!_.isFunction(callback)) {
      facts.unresolved.push(premise.attribute)
      return
    }

    // compare the predicate to its value if it has one to allow for not toggling
    if (premise.value) {
      return callback(facts) === premise.value
    }

    return callback(facts)
  }

  private isSatisfied(facts: IKnowledgeFacts, premises: Array<IKnowledgeItem>): boolean {
    return premises.every(premise => {
      if (_.includes(facts.unresolved, premise.attribute)) {
        return false
      }

      return premise.callback
        ? this.isCallbackPremiseSatisfied(facts, premise)
        : this.isConcretePremiseSatisfied(facts, premise)
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
        if (!_.hasIn(item, premise.attribute) && !premise.callback) {
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
}
