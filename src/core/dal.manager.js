class DalManager {
  constructor (dependencies) {
    this._dal = require(`${dependencies.root}/src/dal/queryConstructor.dal`)
  }

  get types () {
    return {
      string: {
        name: 'string',
        default: '',
        sqlType: 'TEXT'
      },
      number: {
        name: 'number',
        default: 0,
        sqlType: 'INTEGER'
      },
      array: {
        name: 'array',
        default: [],
        sqlType: 'ARRAY'
      },
      object: {
        name: 'object',
        default: {},
        sqlType: 'jsonb'
      },
      timestamp: {
        name: 'date',
        default: (new Date()).getTime() + '',
        sqlType: 'timestamptz'
      },
      date: {
        name: 'date',
        default: new Date(),
        sqlType: 'DATE'
      },
      boolean: {
        name: 'boolean',
        default: false,
        sqlType: 'BOOLEAN'
      },
      serial: {
        name: 'serial',
        default: '',
        sqlType: 'SERIAL'
      },
      bigserial: {
        name: 'bigserial',
        default: '',
        sqlType: 'BIGSERIAL'
      },
      macaddr: {
        name: 'macaddr',
        default: '',
        sqlType: 'macaddr'
      },
      inet: {
        name: 'inet',
        default: '0.0.0.0',
        sqlType: 'inet'
      },
      tsquery: {
        name: 'tsquery',
        default: '',
        sqlType: 'tsquery'
      },
      tsvector: {
        name: 'tsvector',
        default: '',
        sqlType: 'tsvector'
      },
      xml: {
        name: 'xml',
        default: '',
        sqlType: 'xml'
      }
    }
  }

  queryBuilder ({
    path = '',
    query = '',
    namespace = '',
    table = '',
    properties = '',
    values = '',
    condition = '',
    payload = ''
  }) {
    if (!path || !query) {
      return {
        success: false,
        message: 'Include a path and query to continue'
      }
    }

    let _query = this._dal[path][query]

    _query = _query
      .replace('{{NAMESPACE}}', namespace)
      .replace('{{TABLE}}', table)
      .replace('{{PROPERTIES}}', properties)
      .replace('{{VALUES}}', values)
      .replace('{{CONDITION}}', condition)
      .replace('{{PAYLOAD}}', payload)

    return _query
  }
}

DalManager.statuses = {
  inactive: { id: 1, name: 'inactive', title: 'Inactive' },
  active: { id: 2, name: 'active', title: 'Active' },
  deleted: { id: 3, name: 'deleted', title: 'Deleted' }
}

module.exports = { DalManager }