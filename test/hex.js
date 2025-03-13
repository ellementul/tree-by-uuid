import test from 'ava'

import { Hex } from '../src/hex.js'

test("double transform", t => {
    const string = "0ea5"
    const bytes = Hex.decode(string)
    
    t.deepEqual(bytes, [14, 165])
    t.is(Hex.encode(bytes), string)
})