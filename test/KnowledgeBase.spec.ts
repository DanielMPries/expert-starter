import KnowledgeBase from '../src/KnowledgeBase'
import Predicates from './fixtures/predicates'
const data = require('../data/plants.json')

describe('KnowledgeBase', () => {
  it('KnowledgeBase is instantiable', () => {
    expect(new KnowledgeBase(data, null)).toBeInstanceOf(KnowledgeBase)
  })

  test('KnowledgeBase should leverage callbacks and concrete rules', () => {
    let predicates = new Predicates()
    let obj = { class: 'gymnosperm', 'leaf shape': 'scalelike' }
    let kb = new KnowledgeBase(data, predicates)
    let facts = kb.evaluate(obj)
    expect(facts.hasOwnProperty('isPlant')).toBeTruthy()
  })

  test('KnowledgeBase should leverage failed callbacks and concrete rules', () => {
    let predicates = new Predicates()
    let obj = { class: 'gymnosperm', 'leaf shape': 'scalelike' }
    let kb = new KnowledgeBase(data, predicates)
    let facts = kb.evaluate(obj)
    expect(facts.hasOwnProperty('isHuman')).toBeFalsy()
  })
})
