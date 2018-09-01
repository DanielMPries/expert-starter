export default class Predicates {
  isPlant(facts: object): boolean {
    return facts.hasOwnProperty('leaf shape')
  }

  isHuman(facts: object): boolean {
    return facts.hasOwnProperty('social security number')
  }
}
