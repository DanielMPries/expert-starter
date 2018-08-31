export default class Predicates {
  isPlant(facts: object): boolean {
    return facts.hasOwnProperty('leaf shape')
  }

  isNotPlant(facts: object): boolean {
    return facts.hasOwnProperty('appendages')
  }
}
