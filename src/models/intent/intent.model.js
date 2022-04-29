const baseModel = require('../base/base.model')

class IntentModel extends baseModel {
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
    this.status = { value: args.status || IntentModel.statuses.active, type: dependencies.dal.types.object }

    /* Custom fields */
    this.key = { value: args.key, type: dependencies.dal.types.string }
    this.scope = { value: args.scope, type: dependencies.dal.types.string }
    this.service = { value: args.service, type: dependencies.dal.types.string }
    this.botId = { value: args.key, type: dependencies.dal.types.string }
    this.actionId = { value: args.actionId, type: dependencies.dal.types.string }
  }

  // Return entity sanitized
  get sanitized () {
    return {
      id: this.id.value || this.id.type.default,
      scope: this.scope.value || this.scope.type.default,
      service: this.service.value || this.service.type.default,
      key: this.key.value || this.key.type.default,
      botId: this.botId.value || this.botId.type.default,
      actionId: this.actionId.value || this.actionId.type.default
    }
  }

  get get () {
    return {
      id: this.id.value || this.id.type.default,
      date_creation: this.date_creation.value || this.date_creation.type.default,
      last_modification: this.last_modification.value || this.last_modification.type.default,
      last_user_modification: this.last_user_modification.value || this.last_user_modification.type.default,
      status: this.status.value || this.status.type.default,
      scope: this.scope.value || this.scope.type.default,
      service: this.service.value || this.service.type.default,
      key: this.key.value || this.key.type.default,
      botId: this.botId.value || this.botId.type.default,
      actionId: this.actionId.value || this.actionId.type.default
    }
  }
}

IntentModel.statuses = {
  inactive: { id: 1, name: 'inactive', title: 'Inactive' },
  active: { id: 2, name: 'active', title: 'Active' },
  deleted: { id: 3, name: 'deleted', title: 'Deleted' }
}

module.exports = IntentModel