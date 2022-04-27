const baseModel = require('../base/base.model')

class BotModel extends baseModel {
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
    this.status = { value: args.status || BotModel.statuses.active, type: dependencies.dal.types.object }

    /* Custom fields */
    this.name = { value: args.name, type: dependencies.dal.types.string }
    this.isDefault = { value: args.isDefault, type: dependencies.dal.types.string }
    this.behavior = { value: args.behavior, type: dependencies.dal.types.string }
    this.platform = { value: args.platform, type: dependencies.dal.types.string }
    this.triggers = { value: args.triggers, type: dependencies.dal.types.object }
    this.intents = { value: args.intents, type: dependencies.dal.types.object }
  }

  // Return entity sanitized
  get sanitized () {
    return {
      id: this.id.value || this.id.type.default,
      name: this.name.value || this.name.type.default,
      isDefault: this.isDefault.value || this.isDefault.type.default,
      behavior: this.behavior.value || this.behavior.type.default,
      platform: this.platform.value || this.platform.type.default,
      triggers: this.triggers.value || this.triggers.type.default,
      intents: this.intents.value || this.intents.type.default
    }
  }

  get get () {
    return {
      id: this.id.value || this.id.type.default,
      date_creation: this.date_creation.value || this.date_creation.type.default,
      last_modification: this.last_modification.value || this.last_modification.type.default,
      last_user_modification: this.last_user_modification.value || this.last_user_modification.type.default,
      status: this.status.value || this.status.type.default,
      name: this.name.value || this.name.type.default,
      isDefault: this.isDefault.value || this.isDefault.type.default,
      behavior: this.behavior.value || this.behavior.type.default,
      platform: this.platform.value || this.platform.type.default,
      triggers: this.triggers.value || this.triggers.type.default,
      intents: this.intents.value || this.intents.type.default
    }
  }
}

BotModel.statuses = {
  inactive: { id: 1, name: 'inactive', title: 'Inactive' },
  active: { id: 2, name: 'active', title: 'Active' },
  deleted: { id: 3, name: 'deleted', title: 'Deleted' }
}

module.exports = BotModel