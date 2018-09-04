import _ from 'lodash'
import IKnowledgeItem from './IknowledgeItem'
import IKnowledgeRule from './IKnowledgeRule'
import IKnowledgeFacts from './IKnowledgeFacts'
import { EventEmitter } from 'events'

export default class KnowledgeBase extends EventEmitter {
  rules: Array<IKnowledgeRule>
  predicates: object
  emitOnSatisfied: boolean = true
  emitOnUnsatisfied: boolean = true
  emitOnUnresolved: boolean = true

  constructor(rules: Array<IKnowledgeRule>, predicates: object, emitOnSatisfied?: boolean) {
    super()
    this.rules = rules
    this.predicates = predicates
    this.emitOnSatisfied = true
    this.emitOnUnsatisfied = true
    this.emitOnUnresolved = true
  }

  /**
   * Evaluates the item against the rules in the knowledgebase and returns an object of facts
   * from the evaluated rules
   * @param item the item to inspect
   */
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

  /**
   * Tests a premise against a fact to determine if the premise is satisfied
   * @param facts the facts object to inspect
   * @param premise the premise to test
   */
  private isConcretePremiseSatisfied(facts: IKnowledgeFacts, premise: IKnowledgeItem) {
    return facts[premise.attribute] === premise.value
  }

  /**
   * Test a callback premise against a fact object to determine if the premise is satisfied
   * @param facts the facts object to inspect
   * @param premise the premise to test
   */
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
      if (this.emitOnUnresolved) {
        this.emit('unresolved', premise)
      }

      return
    }

    // compare the predicate to its value if it has one to allow for not toggling
    if (premise.value) {
      return callback(facts) === premise.value
    }

    return callback(facts)
  }

  /**
   * Tests every premise in the premises collection against the facts to determined if the premises are satisfied
   * @param facts The facts object to insepect
   * @param premises the premises collection to test
   */
  private isSatisfied(facts: IKnowledgeFacts, premises: Array<IKnowledgeItem>): boolean {
    let returnValue = premises.every(premise => {
      if (_.includes(facts.unresolved, premise.attribute)) {
        return false
      }

      return premise.callback
        ? this.isCallbackPremiseSatisfied(facts, premise)
        : this.isConcretePremiseSatisfied(facts, premise)
    })

    // emit event if applicable
    if (returnValue && this.emitOnSatisfied) {
      this.emit('satisfied', premises)
    }

    if (!returnValue && this.emitOnUnsatisfied) {
      this.emit('unsatisfied', premises)
    }

    return returnValue
  }

  /**
   * Retrieves a set of facts from concrete premises (i.e. non callback premises)
   * @param item the item to inspect
   */
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
