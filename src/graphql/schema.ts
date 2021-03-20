import {
  makeSchema,
} from 'nexus'

import { join } from 'path'

import * as types from './objectTypes'

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(__dirname, '..', 'nexus-typegen.ts'), // 2
    schema: join(__dirname, '..', 'schema.graphql'), // 3
  },
})
