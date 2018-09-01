import KnowledgeBase from '../src/KnowledgeBase'
import Predicates from './fixtures/predicates'

const data = require('../data/plants.json')

describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('DummyClass is instantiable', () => {
    let obj = { class: 'gymnosperm', 'leaf shape': 'scalelike' }
    let predicates = new Predicates()
    expect(new KnowledgeBase(data, null)).toBeInstanceOf(KnowledgeBase)

    let kb = new KnowledgeBase(data, predicates)
    let facts = kb.evaluate(obj)
    expect(facts.hasOwnProperty('isPlant')).toBeTruthy()
  })
})
