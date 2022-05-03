const baseModel = require('../base/base.model')

class TemplateModel extends baseModel {
  constructor (args, dependencies) {
    if (!args || !dependencies) {
      throw new Error('Required args and dependencies to build this entity')
    }

    super(dependencies)
    this.dependencies = dependencies

    const timestamp = (new Date()).getTime() + ''

    /* Base */
    this.last_modification = { value: timestamp, type: dependencies.dal.types.timestamp }
    this.id = { value: args.id, type: dependencies.dal.types.bigserial, isPK: true }
    this.date_creation = { value: timestamp, type: dependencies.dal.types.timestamp }
    this.last_user_modification = { value: args.user_id, type: dependencies.dal.types.object }
    this.status = { value: args.status || TemplateModel.statuses.active, type: dependencies.dal.types.object }

    /* Custom fields */
    this.name = { value: args.name, type: dependencies.dal.types.string }
  }

  // Return entity sanitized
  get sanitized () {
    return {
      id: this.id.value || this.id.type.default,
      name: this.name.value || this.name.type.default
    }
  }

  get get () {
    return {
      id: this.id.value || this.id.type.default,
      date_creation: this.date_creation.value || this.date_creation.type.default,
      last_modification: this.last_modification.value || this.last_modification.type.default,
      last_user_modification: this.last_user_modification.value || this.last_user_modification.type.default,
      status: this.status.value || this.status.type.default,
      name: this.name.value || this.name.type.default
    }
  }
}

TemplateModel.statuses = {
  inactive: { id: 1, name: 'inactive', title: 'Inactive' },
  active: { id: 2, name: 'active', title: 'Active' },
  deleted: { id: 3, name: 'deleted', title: 'Deleted' }
}

module.exports = TemplateModel
