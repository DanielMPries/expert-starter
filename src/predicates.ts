export default class Predicates {
  isPlant(facts: object): boolean {
    return facts.hasOwnProperty('leaf shape')
  }
}
