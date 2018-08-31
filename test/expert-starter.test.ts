import KnowledgeBase from '../src/expert-starter'
const data = require('../data/plants.json')

describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('DummyClass is instantiable', () => {
    let obj = { class: 'gymnosperm', 'leaf shape': 'scalelike' }

    expect(new KnowledgeBase(data)).toBeInstanceOf(KnowledgeBase)

    let kb = new KnowledgeBase(data)
    let facts = kb.evaluate(obj)
    console.log(JSON.stringify(facts, undefined, '\t'))
  })
})
